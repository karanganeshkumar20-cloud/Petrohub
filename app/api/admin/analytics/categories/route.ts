import {
  NextRequest,
  NextResponse,
} from "next/server";

import mongoose from "mongoose";

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

type CategoryAccumulator = {
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
       CONTENT -> CATEGORY MAP
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
        CategoryAccumulator
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
        CategoryAccumulator =
        {
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
       ARTICLE COUNTS
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
       RESOURCE COUNTS
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
       SELECTED-PERIOD EVENTS
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

    /* =====================================================
       FOLD EVENTS INTO CATEGORIES
    ===================================================== */

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

      /*
        Ignore deleted, draft or
        unpublished content.
      */

      if (!category) {
        continue;
      }

      const stats =
        ensureCategory(
          category
        );

      /* =====================
         VIEWS
      ===================== */

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

      /* =====================
         DOWNLOADS
      ===================== */

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
       BOOKMARKS CREATED IN SELECTED PERIOD
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
      /*
        Simple engagement score.

        1 view       = 1 point
        1 download   = 3 points
        1 bookmark   = 2 points

        Downloads / saves receive
        more weight because they
        represent stronger intent.
      */

      stats.score =
        stats.views +
        stats.downloads *
          3 +
        stats.bookmarks *
          2;
    }

    /* =====================================================
       SORT CATEGORIES
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

          totals.totalContent +=
            category.totalContent;

          totals.articles +=
            category.articles;

          totals.resources +=
            category.resources;

          return totals;
        },
        {
          views: 0,

          articleViews: 0,

          bookViews: 0,

          downloads: 0,

          bookmarks: 0,

          totalContent: 0,

          articles: 0,

          resources: 0,
        }
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      range: {
        days,

        startDate:
          startDate.toISOString(),

        endDate:
          endDate.toISOString(),
      },

      summary: {
        categories:
          categories.length,

        ...summary,
      },

      categories,
    });
  } catch (error) {
    console.error(
      "Category analytics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load category analytics",
      },
      {
        status: 500,
      }
    );
  }
}