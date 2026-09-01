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

import User from "@/models/User";
import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

import {
  BookmarkModel,
} from "@/models/Bookmark";

import {
  ReadingHistoryModel,
} from "@/models/ReadingHistory";

import {
  AnalyticsEventModel,
} from "@/models/AnalyticsEvent";

import {
  ContactMessageModel,
} from "@/models/ContactMessage";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

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

type ContentEventAggregate = {
  _id:
    mongoose.Types.ObjectId;

  count: number;
};

type PeriodEventTotals = {
  views: number;

  articleViews: number;

  bookViews: number;

  downloads: number;
};

type TrendType =
  | "up"
  | "down"
  | "same"
  | "new";

type ComparisonMetric = {
  current: number;

  previous: number;

  changePercent:
    | number
    | null;

  trend:
    TrendType;
};

type LeanArticle = {
  _id:
    mongoose.Types.ObjectId;

  title: string;

  slug: string;

  category?: string;
};

type LeanBook = {
  _id:
    mongoose.Types.ObjectId;

  title: string;

  slug: string;

  category?: string;

  contentType?: string;

  downloads?: number;
};

type RawSavedItem = {
  _id: {
    itemType:
      | "article"
      | "book";

    itemId:
      mongoose.Types.ObjectId;
  };

  saves: number;
};

type TopArticle = {
  _id: string;

  title: string;

  slug: string;

  category?: string;

  views: number;
};

type TopBook = {
  _id: string;

  title: string;

  slug: string;

  category?: string;

  contentType?: string;

  views: number;

  downloads: number;
};

type TopDownloadedBook = {
  _id: string;

  title: string;

  slug: string;

  category?: string;

  contentType?: string;

  periodDownloads: number;

  totalDownloads: number;
};

type TopSavedItem = {
  itemType:
    | "article"
    | "book";

  itemId: string;

  title: string;

  slug: string;

  category?: string;

  contentType?: string;

  saves: number;
};

/* =========================================================
   DATE HELPERS
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

function getPreviousStartDate(
  currentStartDate: Date,
  days: number
) {
  const date =
    new Date(
      currentStartDate
    );

  date.setUTCDate(
    date.getUTCDate() -
      days
  );

  return date;
}

function getPreviousEndDate(
  currentStartDate: Date
) {
  return new Date(
    currentStartDate.getTime() -
      1
  );
}

function formatDateKey(
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
   COMPARISON
========================================================= */

function createComparison(
  current: number,
  previous: number
): ComparisonMetric {
  if (
    previous === 0 &&
    current > 0
  ) {
    return {
      current,

      previous,

      changePercent:
        null,

      trend:
        "new",
    };
  }

  if (
    previous === 0 &&
    current === 0
  ) {
    return {
      current,

      previous,

      changePercent:
        0,

      trend:
        "same",
    };
  }

  const percentage =
    ((current -
      previous) /
      previous) *
    100;

  const rounded =
    Math.round(
      percentage *
        10
    ) / 10;

  let trend:
    TrendType =
    "same";

  if (
    rounded > 0
  ) {
    trend = "up";
  } else if (
    rounded < 0
  ) {
    trend = "down";
  }

  return {
    current,

    previous,

    changePercent:
      rounded,

    trend,
  };
}

/* =========================================================
   PERIOD TOTALS
========================================================= */

async function getPeriodEventTotals(
  startDate: Date,
  endDate: Date
): Promise<PeriodEventTotals> {
  const result =
    await AnalyticsEventModel.aggregate(
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
            _id: null,

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
      ]
    );

  return {
    views:
      Number(
        result[0]
          ?.views ?? 0
      ),

    articleViews:
      Number(
        result[0]
          ?.articleViews ??
          0
      ),

    bookViews:
      Number(
        result[0]
          ?.bookViews ??
          0
      ),

    downloads:
      Number(
        result[0]
          ?.downloads ??
          0
      ),
  };
}

/* =========================================================
   UNIQUE VISITORS
========================================================= */

async function getUniqueVisitors(
  startDate: Date,
  endDate: Date
) {
  const result =
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

  return Number(
    result[0]
      ?.total ?? 0
  );
}

/* =========================================================
   UNIQUE DOWNLOADERS
========================================================= */

async function getUniqueDownloaders(
  startDate: Date,
  endDate: Date
) {
  const result =
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

  return Number(
    result[0]
      ?.total ?? 0
  );
}

/* =========================================================
   LOGGED IN VIEWERS
========================================================= */

async function getLoggedInViewers(
  startDate: Date,
  endDate: Date
) {
  const result =
    await AnalyticsEventModel.aggregate(
      [
        {
          $match: {
            eventType:
              "view",

            userId: {
              $ne: null,
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
            _id:
              "$userId",
          },
        },

        {
          $count:
            "total",
        },
      ]
    );

  return Number(
    result[0]
      ?.total ?? 0
  );
}

/* =========================================================
   LOGGED IN DOWNLOADERS
========================================================= */

async function getLoggedInDownloaders(
  startDate: Date,
  endDate: Date
) {
  const result =
    await AnalyticsEventModel.aggregate(
      [
        {
          $match: {
            eventType:
              "download",

            itemType:
              "book",

            userId: {
              $ne: null,
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
            _id:
              "$userId",
          },
        },

        {
          $count:
            "total",
        },
      ]
    );

  return Number(
    result[0]
      ?.total ?? 0
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
       ADMIN
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

    const previousStartDate =
      getPreviousStartDate(
        startDate,
        days
      );

    const previousEndDate =
      getPreviousEndDate(
        startDate
      );

    /* =====================================================
       PLATFORM COUNTS
    ===================================================== */

    const [
      totalUsers,
      activeUsers,
      blockedUsers,

      totalArticles,
      publishedArticles,
      draftArticles,

      totalBooks,
      publishedBooks,
      draftBooks,

      totalBookmarks,
      totalHistory,

      totalMessages,
      unreadMessages,

      newUsersInPeriod,
      previousNewUsers,
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

        ReadingHistoryModel.countDocuments(),

        ContactMessageModel.countDocuments(),

        ContactMessageModel.countDocuments({
          status:
            "Unread",
        }),

        User.countDocuments({
          createdAt: {
            $gte:
              startDate,

            $lte:
              endDate,
          },
        }),

        User.countDocuments({
          createdAt: {
            $gte:
              previousStartDate,

            $lte:
              previousEndDate,
          },
        }),
      ]);

    /* =====================================================
       ALL TIME ARTICLE VIEWS
    ===================================================== */

    const articleViewResult =
      await Article.aggregate([
        {
          $group: {
            _id: null,

            total: {
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
        articleViewResult[0]
          ?.total ?? 0
      );

    /* =====================================================
       ALL TIME BOOK STATS
    ===================================================== */

    const bookStatsResult =
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
        bookStatsResult[0]
          ?.views ?? 0
      );

    const totalDownloads =
      Number(
        bookStatsResult[0]
          ?.downloads ?? 0
      );

    const totalViews =
      totalArticleViews +
      totalBookViews;

    /* =====================================================
       CURRENT + PREVIOUS
    ===================================================== */

    const [
      currentTotals,
      previousTotals,

      uniqueVisitors,
      previousUniqueVisitors,

      uniqueDownloaders,
      previousUniqueDownloaders,

      loggedInViewers,
      loggedInDownloaders,
    ] =
      await Promise.all([
        getPeriodEventTotals(
          startDate,
          endDate
        ),

        getPeriodEventTotals(
          previousStartDate,
          previousEndDate
        ),

        getUniqueVisitors(
          startDate,
          endDate
        ),

        getUniqueVisitors(
          previousStartDate,
          previousEndDate
        ),

        getUniqueDownloaders(
          startDate,
          endDate
        ),

        getUniqueDownloaders(
          previousStartDate,
          previousEndDate
        ),

        getLoggedInViewers(
          startDate,
          endDate
        ),

        getLoggedInDownloaders(
          startDate,
          endDate
        ),
      ]);

    /* =====================================================
       DAILY TRAFFIC
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
       DAILY USERS
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
      new Map<
        string,
        TrafficAggregate
      >();

    for (
      const item of
      rawTraffic
    ) {
      trafficMap.set(
        item._id,
        item
      );
    }

    const userMap =
      new Map<
        string,
        number
      >();

    for (
      const item of
      rawNewUsers
    ) {
      userMap.set(
        item._id,
        item.newUsers
      );
    }

    const traffic = [];

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

      const dateKey =
        formatDateKey(
          date
        );

      const item =
        trafficMap.get(
          dateKey
        );

      traffic.push({
        date:
          dateKey,

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
            dateKey
          ) ?? 0,
      });
    }

    /* =====================================================
       COMPARISON
    ===================================================== */

    const comparison = {
      previousRange: {
        startDate:
          previousStartDate.toISOString(),

        endDate:
          previousEndDate.toISOString(),
      },

      views:
        createComparison(
          currentTotals.views,
          previousTotals.views
        ),

      uniqueVisitors:
        createComparison(
          uniqueVisitors,
          previousUniqueVisitors
        ),

      downloads:
        createComparison(
          currentTotals.downloads,
          previousTotals.downloads
        ),

      uniqueDownloaders:
        createComparison(
          uniqueDownloaders,
          previousUniqueDownloaders
        ),

      articleViews:
        createComparison(
          currentTotals.articleViews,
          previousTotals.articleViews
        ),

      bookViews:
        createComparison(
          currentTotals.bookViews,
          previousTotals.bookViews
        ),

      newUsers:
        createComparison(
          newUsersInPeriod,
          previousNewUsers
        ),
    };

    /* =====================================================
       TOP ARTICLES
    ===================================================== */

    const topArticleEvents =
      (await AnalyticsEventModel.aggregate(
        [
          {
            $match: {
              eventType:
                "view",

              itemType:
                "article",

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

              count: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              count: -1,
            },
          },

          {
            $limit: 5,
          },
        ]
      )) as
        ContentEventAggregate[];

    const topArticleIds =
      topArticleEvents.map(
        (item) =>
          item._id
      );

    const topArticleDocuments =
      (await Article.find({
        _id: {
          $in:
            topArticleIds,
        },

        status:
          "Published",
      })
        .select(
          "_id title slug category"
        )
        .lean()) as unknown as
        LeanArticle[];

    const articleMap =
      new Map<
        string,
        LeanArticle
      >();

    for (
      const article of
      topArticleDocuments
    ) {
      articleMap.set(
        String(
          article._id
        ),
        article
      );
    }

    const topArticles:
      TopArticle[] = [];

    for (
      const event of
      topArticleEvents
    ) {
      const article =
        articleMap.get(
          String(
            event._id
          )
        );

      if (!article) {
        continue;
      }

      topArticles.push({
        _id:
          String(
            article._id
          ),

        title:
          article.title,

        slug:
          article.slug,

        category:
          article.category,

        views:
          event.count,
      });
    }

    /* =====================================================
       TOP BOOKS
    ===================================================== */

    const topBookEvents =
      (await AnalyticsEventModel.aggregate(
        [
          {
            $match: {
              eventType:
                "view",

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

              count: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              count: -1,
            },
          },

          {
            $limit: 5,
          },
        ]
      )) as
        ContentEventAggregate[];

    const topBookIds =
      topBookEvents.map(
        (item) =>
          item._id
      );

    const topBookDocuments =
      (await BookModel.find({
        _id: {
          $in:
            topBookIds,
        },

        status:
          "Published",
      })
        .select(
          "_id title slug category contentType downloads"
        )
        .lean()) as unknown as
        LeanBook[];

    const bookMap =
      new Map<
        string,
        LeanBook
      >();

    for (
      const book of
      topBookDocuments
    ) {
      bookMap.set(
        String(
          book._id
        ),
        book
      );
    }

    const topBooks:
      TopBook[] = [];

    for (
      const event of
      topBookEvents
    ) {
      const book =
        bookMap.get(
          String(
            event._id
          )
        );

      if (!book) {
        continue;
      }

      topBooks.push({
        _id:
          String(
            book._id
          ),

        title:
          book.title,

        slug:
          book.slug,

        category:
          book.category,

        contentType:
          book.contentType,

        views:
          event.count,

        downloads:
          Number(
            book.downloads ??
              0
          ),
      });
    }

    /* =====================================================
       TOP DOWNLOADS
    ===================================================== */

    const topDownloadEvents =
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

              count: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              count: -1,
            },
          },

          {
            $limit: 10,
          },
        ]
      )) as
        ContentEventAggregate[];

    const topDownloadIds =
      topDownloadEvents.map(
        (item) =>
          item._id
      );

    const downloadedDocuments =
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
        .lean()) as unknown as
        LeanBook[];

    const downloadBookMap =
      new Map<
        string,
        LeanBook
      >();

    for (
      const book of
      downloadedDocuments
    ) {
      downloadBookMap.set(
        String(
          book._id
        ),
        book
      );
    }

    const topDownloadedBooks:
      TopDownloadedBook[] =
      [];

    for (
      const event of
      topDownloadEvents
    ) {
      const book =
        downloadBookMap.get(
          String(
            event._id
          )
        );

      if (!book) {
        continue;
      }

      topDownloadedBooks.push(
        {
          _id:
            String(
              book._id
            ),

          title:
            book.title,

          slug:
            book.slug,

          category:
            book.category,

          contentType:
            book.contentType,

          periodDownloads:
            event.count,

          totalDownloads:
            Number(
              book.downloads ??
                0
            ),
        }
      );
    }

    /* =====================================================
       MOST SAVED
    ===================================================== */

    const rawTopSaved =
      (await BookmarkModel.aggregate(
        [
          {
            $group: {
              _id: {
                itemType:
                  "$itemType",

                itemId:
                  "$itemId",
              },

              saves: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              saves: -1,
            },
          },

          {
            $limit: 10,
          },
        ]
      )) as
        RawSavedItem[];

    const savedArticleIds:
      mongoose.Types.ObjectId[] =
      [];

    const savedBookIds:
      mongoose.Types.ObjectId[] =
      [];

    for (
      const item of
      rawTopSaved
    ) {
      if (
        item._id
          .itemType ===
        "article"
      ) {
        savedArticleIds.push(
          item._id
            .itemId
        );
      }

      if (
        item._id
          .itemType ===
        "book"
      ) {
        savedBookIds.push(
          item._id
            .itemId
        );
      }
    }

    const [
      savedArticleDocuments,
      savedBookDocuments,
    ] =
      await Promise.all([
        Article.find({
          _id: {
            $in:
              savedArticleIds,
          },

          status:
            "Published",
        })
          .select(
            "_id title slug category"
          )
          .lean(),

        BookModel.find({
          _id: {
            $in:
              savedBookIds,
          },

          status:
            "Published",
        })
          .select(
            "_id title slug category contentType"
          )
          .lean(),
      ]);

    const typedSavedArticles =
      savedArticleDocuments as unknown as
        LeanArticle[];

    const typedSavedBooks =
      savedBookDocuments as unknown as
        LeanBook[];

    const savedArticleMap =
      new Map<
        string,
        LeanArticle
      >();

    const savedBookMap =
      new Map<
        string,
        LeanBook
      >();

    for (
      const article of
      typedSavedArticles
    ) {
      savedArticleMap.set(
        String(
          article._id
        ),
        article
      );
    }

    for (
      const book of
      typedSavedBooks
    ) {
      savedBookMap.set(
        String(
          book._id
        ),
        book
      );
    }

    const topSaved:
      TopSavedItem[] =
      [];

    for (
      const item of
      rawTopSaved
    ) {
      const itemId =
        String(
          item._id
            .itemId
        );

      if (
        item._id
          .itemType ===
        "article"
      ) {
        const article =
          savedArticleMap.get(
            itemId
          );

        if (!article) {
          continue;
        }

        topSaved.push({
          itemType:
            "article",

          itemId,

          title:
            article.title,

          slug:
            article.slug,

          category:
            article.category,

          saves:
            Number(
              item.saves ??
                0
            ),
        });

        continue;
      }

      const book =
        savedBookMap.get(
          itemId
        );

      if (!book) {
        continue;
      }

      topSaved.push({
        itemType:
          "book",

        itemId,

        title:
          book.title,

        slug:
          book.slug,

        category:
          book.category,

        contentType:
          book.contentType,

        saves:
          Number(
            item.saves ??
              0
          ),
      });
    }

    /* =====================================================
       RECENT USERS
    ===================================================== */

    const recentUsers =
      await User.find()
        .select(
          "_id name email role isBlocked createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean();

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

      comparison,

      period: {
        views:
          currentTotals.views,

        articleViews:
          currentTotals.articleViews,

        bookViews:
          currentTotals.bookViews,

        downloads:
          currentTotals.downloads,

        uniqueVisitors,

        loggedInViewers,

        uniqueDownloaders,

        loggedInDownloaders,

        newUsers:
          newUsersInPeriod,
      },

      traffic,

      users: {
        total:
          totalUsers,

        active:
          activeUsers,

        blocked:
          blockedUsers,
      },

      articles: {
        total:
          totalArticles,

        published:
          publishedArticles,

        drafts:
          draftArticles,

        views:
          totalArticleViews,
      },

      books: {
        total:
          totalBooks,

        published:
          publishedBooks,

        drafts:
          draftBooks,

        views:
          totalBookViews,

        downloads:
          totalDownloads,
      },

      engagement: {
        totalViews,

        bookmarks:
          totalBookmarks,

        historyRecords:
          totalHistory,
      },

      messages: {
        total:
          totalMessages,

        unread:
          unreadMessages,
      },

      topArticles,

      topBooks,

      topDownloadedBooks,

      topSaved,

      recentUsers:
        JSON.parse(
          JSON.stringify(
            recentUsers
          )
        ),
    });
  } catch (error) {
    console.error(
      "Admin analytics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load analytics",
      },
      {
        status: 500,
      }
    );
  }
}