import mongoose from "mongoose";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/lib/admin";

import {
  connectDB,
} from "@/lib/mongodb";

import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

import {
  BookmarkModel,
} from "@/models/Bookmark";

import {
  AnalyticsEventModel,
} from "@/models/AnalyticsEvent";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type ItemType =
  | "article"
  | "book";

type EventType =
  | "view"
  | "download";

type CategoryContentDocument = {
  _id:
    mongoose.Types.ObjectId;

  category?: string;
};

type CategoryEventAggregate = {
  _id: {
    itemType:
      ItemType;

    itemId:
      mongoose.Types.ObjectId;

    eventType:
      EventType;
  };

  count: number;
};

type CategoryBookmarkAggregate = {
  _id: {
    itemType:
      ItemType;

    itemId:
      mongoose.Types.ObjectId;
  };

  count: number;
};

type CategoryStats = {
  category: string;

  articles: number;

  resources: number;

  totalContent: number;

  views: number;

  articleViews: number;

  bookViews: number;

  downloads: number;

  bookmarks: number;

  score: number;
};

/* =========================================================
   RANGE
========================================================= */

function getDays(
  value: string | null
) {
  const parsed =
    Number(value);

  if (
    parsed === 7 ||
    parsed === 30 ||
    parsed === 90
  ) {
    return parsed;
  }

  return 30;
}

function getStartDate(
  days: number
) {
  const date =
    new Date();

  date.setUTCHours(
    0,
    0,
    0,
    0
  );

  date.setUTCDate(
    date.getUTCDate() -
      (days - 1)
  );

  return date;
}

/* =========================================================
   CATEGORY HELPERS
========================================================= */

function cleanCategory(
  value?: string
) {
  const category =
    value?.trim();

  if (!category) {
    return "Uncategorized";
  }

  return category;
}

function categoryKey(
  value?: string
) {
  return cleanCategory(
    value
  ).toLowerCase();
}

/* =========================================================
   CSV HELPERS
========================================================= */

function escapeCSV(
  value:
    | string
    | number
    | null
    | undefined
) {
  const text =
    String(
      value ?? ""
    );

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replace(
      /"/g,
      '""'
    )}"`;
  }

  return text;
}

function csvRow(
  values: (
    | string
    | number
    | null
    | undefined
  )[]
) {
  return values
    .map(
      escapeCSV
    )
    .join(",");
}

function formatReportDate(
  date: Date
) {
  return date
    .toISOString()
    .slice(
      0,
      10
    );
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    /* =========================
       ADMIN CHECK
    ========================= */

    const admin =
      await requireAdmin();

    if (
      !admin.authorized
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            admin.message,
        },
        {
          status:
            admin.status,
        }
      );
    }

    await connectDB();

    /* =========================
       RANGE
    ========================= */

    const days =
      getDays(
        request.nextUrl
          .searchParams
          .get("days")
      );

    const startDate =
      getStartDate(
        days
      );

    const endDate =
      new Date();

    /* =====================================================
       PUBLISHED CONTENT
    ===================================================== */

    const [
      rawArticles,
      rawBooks,
    ] =
      await Promise.all([
        Article.find({
          status:
            "Published",
        })
          .select(
            "_id category"
          )
          .lean(),

        BookModel.find({
          status:
            "Published",
        })
          .select(
            "_id category"
          )
          .lean(),
      ]);

    const articles =
      rawArticles as unknown as
        CategoryContentDocument[];

    const books =
      rawBooks as unknown as
        CategoryContentDocument[];

    /* =====================================================
       MAPS
    ===================================================== */

    const articleCategoryMap =
      new Map<
        string,
        string
      >();

    const bookCategoryMap =
      new Map<
        string,
        string
      >();

    const categoryMap =
      new Map<
        string,
        CategoryStats
      >();

    function ensureCategory(
      categoryValue?: string
    ) {
      const category =
        cleanCategory(
          categoryValue
        );

      const key =
        categoryKey(
          category
        );

      const existing =
        categoryMap.get(
          key
        );

      if (existing) {
        return existing;
      }

      const created:
        CategoryStats = {
          category,

          articles: 0,

          resources: 0,

          totalContent: 0,

          views: 0,

          articleViews: 0,

          bookViews: 0,

          downloads: 0,

          bookmarks: 0,

          score: 0,
        };

      categoryMap.set(
        key,
        created
      );

      return created;
    }

    /* =====================================================
       ARTICLES
    ===================================================== */

    for (
      const article of
      articles
    ) {
      const category =
        cleanCategory(
          article.category
        );

      articleCategoryMap.set(
        String(
          article._id
        ),
        category
      );

      const stats =
        ensureCategory(
          category
        );

      stats.articles +=
        1;

      stats.totalContent +=
        1;
    }

    /* =====================================================
       BOOKS
    ===================================================== */

    for (
      const book of
      books
    ) {
      const category =
        cleanCategory(
          book.category
        );

      bookCategoryMap.set(
        String(
          book._id
        ),
        category
      );

      const stats =
        ensureCategory(
          category
        );

      stats.resources +=
        1;

      stats.totalContent +=
        1;
    }

    /* =====================================================
       ANALYTICS EVENTS
    ===================================================== */

    const eventData =
      (await AnalyticsEventModel.aggregate(
        [
          {
            $match: {
              eventType: {
                $in: [
                  "view",
                  "download",
                ],
              },

              occurredAt: {
                $gte:
                  startDate,

                $lte:
                  endDate,
              },
            },
          },

          {
            $group: {
              _id: {
                itemType:
                  "$itemType",

                itemId:
                  "$itemId",

                eventType:
                  "$eventType",
              },

              count: {
                $sum: 1,
              },
            },
          },
        ]
      )) as
        CategoryEventAggregate[];

    for (
      const event of
      eventData
    ) {
      const itemId =
        String(
          event._id
            .itemId
        );

      let category:
        string | undefined;

      if (
        event._id
          .itemType ===
        "article"
      ) {
        category =
          articleCategoryMap.get(
            itemId
          );
      } else {
        category =
          bookCategoryMap.get(
            itemId
          );
      }

      if (!category) {
        continue;
      }

      const stats =
        ensureCategory(
          category
        );

      if (
        event._id
          .eventType ===
        "view"
      ) {
        stats.views +=
          event.count;

        if (
          event._id
            .itemType ===
          "article"
        ) {
          stats.articleViews +=
            event.count;
        } else {
          stats.bookViews +=
            event.count;
        }
      }

      if (
        event._id
          .eventType ===
          "download" &&
        event._id
          .itemType ===
          "book"
      ) {
        stats.downloads +=
          event.count;
      }
    }

    /* =====================================================
       BOOKMARKS
    ===================================================== */

    const bookmarkData =
      (await BookmarkModel.aggregate(
        [
          {
            $match: {
              createdAt: {
                $gte:
                  startDate,

                $lte:
                  endDate,
              },
            },
          },

          {
            $group: {
              _id: {
                itemType:
                  "$itemType",

                itemId:
                  "$itemId",
              },

              count: {
                $sum: 1,
              },
            },
          },
        ]
      )) as
        CategoryBookmarkAggregate[];

    for (
      const bookmark of
      bookmarkData
    ) {
      const itemId =
        String(
          bookmark._id
            .itemId
        );

      let category:
        string | undefined;

      if (
        bookmark._id
          .itemType ===
        "article"
      ) {
        category =
          articleCategoryMap.get(
            itemId
          );
      } else {
        category =
          bookCategoryMap.get(
            itemId
          );
      }

      if (!category) {
        continue;
      }

      const stats =
        ensureCategory(
          category
        );

      stats.bookmarks +=
        bookmark.count;
    }

    /* =====================================================
       SCORE
    ===================================================== */

    for (
      const stats of
      categoryMap.values()
    ) {
      stats.score =
        stats.views +
        stats.downloads *
          3 +
        stats.bookmarks *
          2;
    }

    /* =====================================================
       SORT
    ===================================================== */

    const categories =
      Array.from(
        categoryMap.values()
      ).sort(
        (
          first,
          second
        ) => {
          if (
            second.score !==
            first.score
          ) {
            return (
              second.score -
              first.score
            );
          }

          if (
            second.views !==
            first.views
          ) {
            return (
              second.views -
              first.views
            );
          }

          return (
            second.totalContent -
            first.totalContent
          );
        }
      );

    /* =====================================================
       SUMMARY
    ===================================================== */

    const summary =
      categories.reduce(
        (
          totals,
          category
        ) => {
          totals.articles +=
            category.articles;

          totals.resources +=
            category.resources;

          totals.totalContent +=
            category.totalContent;

          totals.views +=
            category.views;

          totals.articleViews +=
            category.articleViews;

          totals.bookViews +=
            category.bookViews;

          totals.downloads +=
            category.downloads;

          totals.bookmarks +=
            category.bookmarks;

          return totals;
        },
        {
          articles: 0,

          resources: 0,

          totalContent: 0,

          views: 0,

          articleViews: 0,

          bookViews: 0,

          downloads: 0,

          bookmarks: 0,
        }
      );

    /* =====================================================
       BUILD CSV
    ===================================================== */

    const rows:
      string[] = [];

    rows.push(
      csvRow([
        "PetroHub Category Analytics Report",
      ])
    );

    rows.push(
      csvRow([
        "Reporting Period",
        `${days} Days`,
      ])
    );

    rows.push(
      csvRow([
        "Start Date",
        formatReportDate(
          startDate
        ),
      ])
    );

    rows.push(
      csvRow([
        "End Date",
        formatReportDate(
          endDate
        ),
      ])
    );

    rows.push(
      csvRow([
        "Generated At",
        new Date().toISOString(),
      ])
    );

    rows.push("");

    /* =========================
       SUMMARY
    ========================= */

    rows.push(
      csvRow([
        "SUMMARY",
      ])
    );

    rows.push(
      csvRow([
        "Metric",
        "Value",
      ])
    );

    rows.push(
      csvRow([
        "Categories",
        categories.length,
      ])
    );

    rows.push(
      csvRow([
        "Published Articles",
        summary.articles,
      ])
    );

    rows.push(
      csvRow([
        "Published Resources",
        summary.resources,
      ])
    );

    rows.push(
      csvRow([
        "Total Published Content",
        summary.totalContent,
      ])
    );

    rows.push(
      csvRow([
        "Views",
        summary.views,
      ])
    );

    rows.push(
      csvRow([
        "Article Views",
        summary.articleViews,
      ])
    );

    rows.push(
      csvRow([
        "Library Views",
        summary.bookViews,
      ])
    );

    rows.push(
      csvRow([
        "Downloads",
        summary.downloads,
      ])
    );

    rows.push(
      csvRow([
        "New Saves",
        summary.bookmarks,
      ])
    );

    rows.push("");

    /* =========================
       CATEGORY DATA
    ========================= */

    rows.push(
      csvRow([
        "CATEGORY BREAKDOWN",
      ])
    );

    rows.push(
      csvRow([
        "Rank",
        "Category",
        "Articles",
        "Resources",
        "Total Content",
        "Views",
        "Article Views",
        "Library Views",
        "Downloads",
        "New Saves",
        "Engagement Score",
      ])
    );

    categories.forEach(
      (
        category,
        index
      ) => {
        rows.push(
          csvRow([
            index + 1,

            category.category,

            category.articles,

            category.resources,

            category.totalContent,

            category.views,

            category.articleViews,

            category.bookViews,

            category.downloads,

            category.bookmarks,

            category.score,
          ])
        );
      }
    );

    rows.push("");

    rows.push(
      csvRow([
        "Engagement Score Formula",
        "Views x 1 + Downloads x 3 + Saves x 2",
      ])
    );

    rows.push(
      csvRow([
        "Note",
        "Published content counts are current totals. Views, downloads and saves use the selected reporting period.",
      ])
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    const csv =
      `\uFEFF${rows.join(
        "\r\n"
      )}`;

    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );

    const filename =
      `petrohub-category-analytics-${days}-days-${today}.csv`;

    return new NextResponse(
      csv,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/csv; charset=utf-8",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma:
            "no-cache",
        },
      }
    );
  } catch (error) {
    console.error(
      "Category analytics CSV export error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to export category analytics",
      },
      {
        status: 500,
      }
    );
  }
}