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

import User from "@/models/User";
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type TrafficAggregate = {
  _id: string;

  views: number;

  articleViews: number;

  bookViews: number;

  downloads: number;
};

type UserAggregate = {
  _id: string;

  newUsers: number;
};

type DownloadAggregate = {
  _id: unknown;

  downloads: number;
};

type ExportBook = {
  _id: unknown;

  title?: string;

  slug?: string;

  category?: string;

  contentType?: string;

  downloads?: number;
};

/* =========================================================
   HELPERS
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

function formatDateKey(
  date: Date
) {
  return date
    .toISOString()
    .slice(0, 10);
}

function csvCell(
  value:
    | string
    | number
    | boolean
    | null
    | undefined
) {
  const text =
    String(
      value ?? ""
    );

  return `"${text.replace(
    /"/g,
    '""'
  )}"`;
}

function buildCsv(
  rows:
    (
      | string
      | number
      | boolean
      | null
      | undefined
    )[][]
) {
  return rows
    .map(
      (row) =>
        row
          .map(
            csvCell
          )
          .join(",")
    )
    .join("\r\n");
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
       DATE RANGE
    ========================= */

    const days =
      getDays(
        request.nextUrl.searchParams.get(
          "days"
        )
      );

    const startDate =
      getStartDate(
        days
      );

    const endDate =
      new Date();

    /* =====================================================
       BASIC PLATFORM DATA
    ===================================================== */

    const [
      totalUsers,
      activeUsers,
      blockedUsers,

      newUsers,

      totalArticles,
      publishedArticles,
      draftArticles,

      totalBooks,
      publishedBooks,
      draftBooks,

      totalBookmarks,
    ] =
      await Promise.all([
        User.countDocuments(),

        User.countDocuments({
          isBlocked: {
            $ne: true,
          },
        }),

        User.countDocuments({
          isBlocked: true,
        }),

        User.countDocuments({
          createdAt: {
            $gte:
              startDate,

            $lte:
              endDate,
          },
        }),

        Article.countDocuments(),

        Article.countDocuments({
          status:
            "Published",
        }),

        Article.countDocuments({
          status:
            "Draft",
        }),

        BookModel.countDocuments(),

        BookModel.countDocuments({
          status:
            "Published",
        }),

        BookModel.countDocuments({
          status:
            "Draft",
        }),

        BookmarkModel.countDocuments(),
      ]);

    /* =====================================================
       ALL-TIME ARTICLE VIEWS
    ===================================================== */

    const articleStats =
      await Article.aggregate([
        {
          $group: {
            _id: null,

            views: {
              $sum: {
                $ifNull: [
                  "$views",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const totalArticleViews =
      Number(
        articleStats[0]
          ?.views ?? 0
      );

    /* =====================================================
       ALL-TIME LIBRARY DATA
    ===================================================== */

    const bookStats =
      await BookModel.aggregate([
        {
          $group: {
            _id: null,

            views: {
              $sum: {
                $ifNull: [
                  "$views",
                  0,
                ],
              },
            },

            downloads: {
              $sum: {
                $ifNull: [
                  "$downloads",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const totalBookViews =
      Number(
        bookStats[0]
          ?.views ?? 0
      );

    const totalDownloads =
      Number(
        bookStats[0]
          ?.downloads ?? 0
      );

    const totalViews =
      totalArticleViews +
      totalBookViews;

    /* =====================================================
       DAILY ANALYTICS
    ===================================================== */

    const rawTraffic =
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
                $dateToString: {
                  format:
                    "%Y-%m-%d",

                  date:
                    "$occurredAt",

                  timezone:
                    "UTC",
                },
              },

              views: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$eventType",
                        "view",
                      ],
                    },

                    1,

                    0,
                  ],
                },
              },

              articleViews: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        {
                          $eq: [
                            "$eventType",
                            "view",
                          ],
                        },

                        {
                          $eq: [
                            "$itemType",
                            "article",
                          ],
                        },
                      ],
                    },

                    1,

                    0,
                  ],
                },
              },

              bookViews: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        {
                          $eq: [
                            "$eventType",
                            "view",
                          ],
                        },

                        {
                          $eq: [
                            "$itemType",
                            "book",
                          ],
                        },
                      ],
                    },

                    1,

                    0,
                  ],
                },
              },

              downloads: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        {
                          $eq: [
                            "$eventType",
                            "download",
                          ],
                        },

                        {
                          $eq: [
                            "$itemType",
                            "book",
                          ],
                        },
                      ],
                    },

                    1,

                    0,
                  ],
                },
              },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },
        ]
      )) as
        TrafficAggregate[];

    /* =====================================================
       NEW USERS PER DAY
    ===================================================== */

    const rawNewUsers =
      (await User.aggregate([
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
              $dateToString: {
                format:
                  "%Y-%m-%d",

                date:
                  "$createdAt",

                timezone:
                  "UTC",
              },
            },

            newUsers: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ])) as
        UserAggregate[];

    const trafficMap =
      new Map(
        rawTraffic.map(
          (item) => [
            item._id,
            item,
          ]
        )
      );

    const userMap =
      new Map(
        rawNewUsers.map(
          (item) => [
            item._id,
            item.newUsers,
          ]
        )
      );

    const traffic: {
      date: string;

      views: number;

      articleViews: number;

      bookViews: number;

      downloads: number;

      newUsers: number;
    }[] = [];

    for (
      let index = 0;
      index < days;
      index++
    ) {
      const date =
        new Date(
          startDate
        );

      date.setUTCDate(
        startDate.getUTCDate() +
          index
      );

      const key =
        formatDateKey(
          date
        );

      const item =
        trafficMap.get(
          key
        );

      traffic.push({
        date: key,

        views:
          item?.views ??
          0,

        articleViews:
          item?.articleViews ??
          0,

        bookViews:
          item?.bookViews ??
          0,

        downloads:
          item?.downloads ??
          0,

        newUsers:
          userMap.get(
            key
          ) ?? 0,
      });
    }

    /* =====================================================
       PERIOD TOTALS
    ===================================================== */

    const periodViews =
      traffic.reduce(
        (
          total,
          item
        ) =>
          total +
          item.views,

        0
      );

    const periodArticleViews =
      traffic.reduce(
        (
          total,
          item
        ) =>
          total +
          item.articleViews,

        0
      );

    const periodBookViews =
      traffic.reduce(
        (
          total,
          item
        ) =>
          total +
          item.bookViews,

        0
      );

    const periodDownloads =
      traffic.reduce(
        (
          total,
          item
        ) =>
          total +
          item.downloads,

        0
      );

    /* =====================================================
       UNIQUE VISITORS
    ===================================================== */

    const uniqueVisitorResult =
      await AnalyticsEventModel.aggregate(
        [
          {
            $match: {
              eventType:
                "view",

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
              _id:
                "$visitorId",
            },
          },

          {
            $count:
              "total",
          },
        ]
      );

    const uniqueVisitors =
      Number(
        uniqueVisitorResult[0]
          ?.total ?? 0
      );

    /* =====================================================
       UNIQUE DOWNLOADERS
    ===================================================== */

    const uniqueDownloaderResult =
      await AnalyticsEventModel.aggregate(
        [
          {
            $match: {
              eventType:
                "download",

              itemType:
                "book",

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
              _id:
                "$visitorId",
            },
          },

          {
            $count:
              "total",
          },
        ]
      );

    const uniqueDownloaders =
      Number(
        uniqueDownloaderResult[0]
          ?.total ?? 0
      );

    /* =====================================================
       TOP DOWNLOADED BOOKS
    ===================================================== */

    const rawTopDownloads =
      (await AnalyticsEventModel.aggregate(
        [
          {
            $match: {
              eventType:
                "download",

              itemType:
                "book",

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
              _id:
                "$itemId",

              downloads: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              downloads: -1,
            },
          },

          {
            $limit: 10,
          },
        ]
      )) as
        DownloadAggregate[];

    const topDownloadIds =
      rawTopDownloads.map(
        (item) =>
          item._id
      );

    const bookDocuments =
      (await BookModel.find({
        _id: {
          $in:
            topDownloadIds,
        },

        status:
          "Published",
      })
        .select(
          "_id title slug category contentType downloads"
        )
        .lean()) as
        ExportBook[];

    const bookMap =
      new Map(
        bookDocuments.map(
          (book) => [
            String(
              book._id
            ),

            book,
          ]
        )
      );

    const topDownloadedBooks =
      rawTopDownloads
        .map(
          (
            item
          ) => {
            const book =
              bookMap.get(
                String(
                  item._id
                )
              );

            if (!book) {
              return null;
            }

            return {
              title:
                book.title ??
                "",

              slug:
                book.slug ??
                "",

              category:
                book.category ??
                "",

              contentType:
                book.contentType ??
                "",

              periodDownloads:
                Number(
                  item.downloads ??
                    0
                ),

              totalDownloads:
                Number(
                  book.downloads ??
                    0
                ),
            };
          }
        )
        .filter(
          (
            item
          ): item is NonNullable<
            typeof item
          > =>
            item !==
            null
        );

    /* =====================================================
       CSV ROWS
    ===================================================== */

    const rows: (
      | string
      | number
      | boolean
      | null
      | undefined
    )[][] = [];

    /* =========================
       REPORT TITLE
    ========================= */

    rows.push([
      "PetroHub Analytics Report",
    ]);

    rows.push([
      "Reporting Period",
      `${days} Days`,
    ]);

    rows.push([
      "Start Date",
      startDate.toISOString(),
    ]);

    rows.push([
      "End Date",
      endDate.toISOString(),
    ]);

    rows.push([]);

    /* =========================
       PERIOD SUMMARY
    ========================= */

    rows.push([
      "PERIOD SUMMARY",
    ]);

    rows.push([
      "Metric",
      "Value",
    ]);

    rows.push([
      "Views",
      periodViews,
    ]);

    rows.push([
      "Article Views",
      periodArticleViews,
    ]);

    rows.push([
      "Library Views",
      periodBookViews,
    ]);

    rows.push([
      "Downloads",
      periodDownloads,
    ]);

    rows.push([
      "Unique Visitors",
      uniqueVisitors,
    ]);

    rows.push([
      "Unique Downloaders",
      uniqueDownloaders,
    ]);

    rows.push([
      "New Users",
      newUsers,
    ]);

    rows.push([]);

    /* =========================
       ALL-TIME SUMMARY
    ========================= */

    rows.push([
      "ALL-TIME PLATFORM SUMMARY",
    ]);

    rows.push([
      "Metric",
      "Value",
    ]);

    rows.push([
      "Total Users",
      totalUsers,
    ]);

    rows.push([
      "Active Users",
      activeUsers,
    ]);

    rows.push([
      "Blocked Users",
      blockedUsers,
    ]);

    rows.push([
      "Total Articles",
      totalArticles,
    ]);

    rows.push([
      "Published Articles",
      publishedArticles,
    ]);

    rows.push([
      "Draft Articles",
      draftArticles,
    ]);

    rows.push([
      "Total Library Resources",
      totalBooks,
    ]);

    rows.push([
      "Published Library Resources",
      publishedBooks,
    ]);

    rows.push([
      "Draft Library Resources",
      draftBooks,
    ]);

    rows.push([
      "Total Article Views",
      totalArticleViews,
    ]);

    rows.push([
      "Total Library Views",
      totalBookViews,
    ]);

    rows.push([
      "Total Views",
      totalViews,
    ]);

    rows.push([
      "Total Downloads",
      totalDownloads,
    ]);

    rows.push([
      "Total Bookmarks",
      totalBookmarks,
    ]);

    rows.push([]);

    /* =========================
       DAILY DATA
    ========================= */

    rows.push([
      "DAILY ANALYTICS",
    ]);

    rows.push([
      "Date",
      "Views",
      "Article Views",
      "Library Views",
      "Downloads",
      "New Users",
    ]);

    for (
      const item of traffic
    ) {
      rows.push([
        item.date,
        item.views,
        item.articleViews,
        item.bookViews,
        item.downloads,
        item.newUsers,
      ]);
    }

    rows.push([]);

    /* =========================
       TOP DOWNLOADS
    ========================= */

    rows.push([
      "TOP DOWNLOADED RESOURCES",
    ]);

    rows.push([
      "Rank",
      "Title",
      "Category",
      "Content Type",
      "Period Downloads",
      "All-Time Downloads",
      "PetroHub Path",
    ]);

    if (
      topDownloadedBooks.length ===
      0
    ) {
      rows.push([
        "",
        "No download analytics recorded yet",
      ]);
    } else {
      topDownloadedBooks.forEach(
        (
          book,
          index
        ) => {
          rows.push([
            index + 1,

            book.title,

            book.category,

            book.contentType,

            book.periodDownloads,

            book.totalDownloads,

            `/library/${book.slug}`,
          ]);
        }
      );
    }

    /* =====================================================
       CREATE CSV
    ===================================================== */

    const csv =
      buildCsv(
        rows
      );

    /*
      UTF-8 BOM helps Excel
      correctly recognise UTF-8.
    */

    const output =
      `\uFEFF${csv}`;

    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );

    const fileName =
      `petrohub-analytics-${days}-days-${today}.csv`;

    return new NextResponse(
      output,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/csv; charset=utf-8",

          "Content-Disposition":
            `attachment; filename="${fileName}"`,

          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Analytics CSV export error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to export analytics",
      },
      {
        status: 500,
      }
    );
  }
}