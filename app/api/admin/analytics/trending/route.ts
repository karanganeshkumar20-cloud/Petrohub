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

type TrendStatus =
  | "up"
  | "down"
  | "same"
  | "new";

type RawEventAggregate = {
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
};

type ContentAccumulator = {
  itemType:
    ItemType;

  itemId: string;

  title: string;

  slug: string;

  category: string;

  contentType?: string;

  currentViews: number;

  previousViews: number;

  currentDownloads: number;

  previousDownloads: number;
};

type TrendingContentItem = {
  rank: number;

  itemType:
    ItemType;

  itemId: string;

  title: string;

  slug: string;

  category: string;

  contentType?: string;

  views: number;

  previousViews: number;

  downloads: number;

  previousDownloads: number;

  currentEngagement: number;

  previousEngagement: number;

  growthPercent:
    | number
    | null;

  trend:
    TrendStatus;

  momentumScore: number;
};

type CategoryAccumulator = {
  category: string;

  currentViews: number;

  previousViews: number;

  currentDownloads: number;

  previousDownloads: number;

  activeContent: number;
};

type TrendingCategoryItem = {
  rank: number;

  category: string;

  views: number;

  previousViews: number;

  downloads: number;

  previousDownloads: number;

  currentEngagement: number;

  previousEngagement: number;

  growthPercent:
    | number
    | null;

  trend:
    TrendStatus;

  momentumScore: number;

  activeContent: number;
};

/* =========================================================
   RANGE HELPERS
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

/* =========================================================
   CATEGORY
========================================================= */

function cleanCategory(
  value?: string
) {
  const category =
    value?.trim();

  return (
    category ||
    "Uncategorized"
  );
}

/* =========================================================
   TREND CALCULATION
========================================================= */

function calculateTrend(
  current: number,
  previous: number
) {
  if (
    current === 0 &&
    previous === 0
  ) {
    return {
      trend:
        "same" as const,

      growthPercent:
        0,
    };
  }

  if (
    current > 0 &&
    previous === 0
  ) {
    return {
      trend:
        "new" as const,

      growthPercent:
        null,
    };
  }

  const change =
    ((current -
      previous) /
      previous) *
    100;

  const rounded =
    Math.round(
      change * 10
    ) / 10;

  if (
    rounded > 0
  ) {
    return {
      trend:
        "up" as const,

      growthPercent:
        rounded,
    };
  }

  if (
    rounded < 0
  ) {
    return {
      trend:
        "down" as const,

      growthPercent:
        rounded,
    };
  }

  return {
    trend:
      "same" as const,

    growthPercent:
      0,
  };
}

/* =========================================================
   MOMENTUM SCORE
========================================================= */

function calculateMomentumScore(
  current: number,
  previous: number
) {
  if (
    current <= 0
  ) {
    return 0;
  }

  /*
    A trending item should have
    current activity plus growth.

    If previous period had zero
    activity, treat it as new
    momentum without generating
    an infinite percentage.
  */

  let multiplier =
    1;

  if (
    previous === 0
  ) {
    multiplier =
      2;
  } else {
    const ratio =
      current /
      previous;

    multiplier =
      Math.min(
        Math.max(
          ratio,
          0.5
        ),
        3
      );
  }

  return (
    Math.round(
      current *
        multiplier *
        10
    ) / 10
  );
}

/* =========================================================
   PERIOD EVENTS
========================================================= */

async function getPeriodEvents(
  startDate: Date,
  endDate: Date
) {
  return (
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
      RawEventAggregate[]
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
       CURRENT + PREVIOUS EVENTS
    ===================================================== */

    const [
      currentEvents,
      previousEvents,
    ] =
      await Promise.all([
        getPeriodEvents(
          startDate,
          endDate
        ),

        getPeriodEvents(
          previousStartDate,
          previousEndDate
        ),
      ]);

    /* =====================================================
       GET ALL CONTENT IDS
    ===================================================== */

    const articleIdSet =
      new Set<string>();

    const bookIdSet =
      new Set<string>();

    const allEvents = [
      ...currentEvents,
      ...previousEvents,
    ];

    for (
      const event of
      allEvents
    ) {
      const id =
        String(
          event._id
            .itemId
        );

      if (
        event._id
          .itemType ===
        "article"
      ) {
        articleIdSet.add(
          id
        );
      }

      if (
        event._id
          .itemType ===
        "book"
      ) {
        bookIdSet.add(
          id
        );
      }
    }

    const articleIds =
      Array.from(
        articleIdSet
      )
        .filter(
          (
            id
          ) =>
            mongoose.Types.ObjectId.isValid(
              id
            )
        )
        .map(
          (
            id
          ) =>
            new mongoose.Types.ObjectId(
              id
            )
        );

    const bookIds =
      Array.from(
        bookIdSet
      )
        .filter(
          (
            id
          ) =>
            mongoose.Types.ObjectId.isValid(
              id
            )
        )
        .map(
          (
            id
          ) =>
            new mongoose.Types.ObjectId(
              id
            )
        );

    /* =====================================================
       HYDRATE PUBLISHED CONTENT
    ===================================================== */

    const [
      articleDocuments,
      bookDocuments,
    ] =
      await Promise.all([
        Article.find({
          _id: {
            $in:
              articleIds,
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
              bookIds,
          },

          status:
            "Published",
        })
          .select(
            "_id title slug category contentType"
          )
          .lean(),
      ]);

    const articles =
      articleDocuments as unknown as
        LeanArticle[];

    const books =
      bookDocuments as unknown as
        LeanBook[];

    /* =====================================================
       CONTENT MAP
    ===================================================== */

    const contentMap =
      new Map<
        string,
        ContentAccumulator
      >();

    for (
      const article of
      articles
    ) {
      const id =
        String(
          article._id
        );

      contentMap.set(
        `article:${id}`,
        {
          itemType:
            "article",

          itemId:
            id,

          title:
            article.title,

          slug:
            article.slug,

          category:
            cleanCategory(
              article.category
            ),

          currentViews:
            0,

          previousViews:
            0,

          currentDownloads:
            0,

          previousDownloads:
            0,
        }
      );
    }

    for (
      const book of
      books
    ) {
      const id =
        String(
          book._id
        );

      contentMap.set(
        `book:${id}`,
        {
          itemType:
            "book",

          itemId:
            id,

          title:
            book.title,

          slug:
            book.slug,

          category:
            cleanCategory(
              book.category
            ),

          contentType:
            book.contentType,

          currentViews:
            0,

          previousViews:
            0,

          currentDownloads:
            0,

          previousDownloads:
            0,
        }
      );
    }

    /* =====================================================
       CURRENT EVENTS
    ===================================================== */

    for (
      const event of
      currentEvents
    ) {
      const key =
        `${event._id.itemType}:${String(
          event._id
            .itemId
        )}`;

      const content =
        contentMap.get(
          key
        );

      if (!content) {
        continue;
      }

      if (
        event._id
          .eventType ===
        "view"
      ) {
        content.currentViews +=
          event.count;
      }

      if (
        event._id
          .eventType ===
          "download" &&
        event._id
          .itemType ===
          "book"
      ) {
        content.currentDownloads +=
          event.count;
      }
    }

    /* =====================================================
       PREVIOUS EVENTS
    ===================================================== */

    for (
      const event of
      previousEvents
    ) {
      const key =
        `${event._id.itemType}:${String(
          event._id
            .itemId
        )}`;

      const content =
        contentMap.get(
          key
        );

      if (!content) {
        continue;
      }

      if (
        event._id
          .eventType ===
        "view"
      ) {
        content.previousViews +=
          event.count;
      }

      if (
        event._id
          .eventType ===
          "download" &&
        event._id
          .itemType ===
          "book"
      ) {
        content.previousDownloads +=
          event.count;
      }
    }

    /* =====================================================
       TRENDING CONTENT
    ===================================================== */

    const trendingContentWithoutRank:
      Omit<
        TrendingContentItem,
        "rank"
      >[] = [];

    for (
      const content of
      contentMap.values()
    ) {
      /*
        Download gets stronger
        engagement weight.
      */

      const currentEngagement =
        content.currentViews +
        content.currentDownloads *
          3;

      const previousEngagement =
        content.previousViews +
        content.previousDownloads *
          3;

      if (
        currentEngagement ===
        0
      ) {
        continue;
      }

      const {
        trend,
        growthPercent,
      } =
        calculateTrend(
          currentEngagement,
          previousEngagement
        );

      const momentumScore =
        calculateMomentumScore(
          currentEngagement,
          previousEngagement
        );

      trendingContentWithoutRank.push(
        {
          itemType:
            content.itemType,

          itemId:
            content.itemId,

          title:
            content.title,

          slug:
            content.slug,

          category:
            content.category,

          contentType:
            content.contentType,

          views:
            content.currentViews,

          previousViews:
            content.previousViews,

          downloads:
            content.currentDownloads,

          previousDownloads:
            content.previousDownloads,

          currentEngagement,

          previousEngagement,

          growthPercent,

          trend,

          momentumScore,
        }
      );
    }

    trendingContentWithoutRank.sort(
      (
        first,
        second
      ) => {
        if (
          second.momentumScore !==
          first.momentumScore
        ) {
          return (
            second.momentumScore -
            first.momentumScore
          );
        }

        return (
          second.currentEngagement -
          first.currentEngagement
        );
      }
    );

    const trendingContent:
      TrendingContentItem[] =
      trendingContentWithoutRank
        .slice(
          0,
          15
        )
        .map(
          (
            item,
            index
          ) => ({
            ...item,

            rank:
              index + 1,
          })
        );

    /* =====================================================
       CATEGORY AGGREGATION
    ===================================================== */

    const categoryMap =
      new Map<
        string,
        CategoryAccumulator
      >();

    for (
      const content of
      contentMap.values()
    ) {
      const category =
        content.category;

      const key =
        category.toLowerCase();

      let stats =
        categoryMap.get(
          key
        );

      if (!stats) {
        stats = {
          category,

          currentViews:
            0,

          previousViews:
            0,

          currentDownloads:
            0,

          previousDownloads:
            0,

          activeContent:
            0,
        };

        categoryMap.set(
          key,
          stats
        );
      }

      stats.currentViews +=
        content.currentViews;

      stats.previousViews +=
        content.previousViews;

      stats.currentDownloads +=
        content.currentDownloads;

      stats.previousDownloads +=
        content.previousDownloads;

      if (
        content.currentViews >
          0 ||
        content.currentDownloads >
          0
      ) {
        stats.activeContent +=
          1;
      }
    }

    /* =====================================================
       TRENDING CATEGORIES
    ===================================================== */

    const trendingCategoriesWithoutRank:
      Omit<
        TrendingCategoryItem,
        "rank"
      >[] = [];

    for (
      const category of
      categoryMap.values()
    ) {
      const currentEngagement =
        category.currentViews +
        category.currentDownloads *
          3;

      const previousEngagement =
        category.previousViews +
        category.previousDownloads *
          3;

      if (
        currentEngagement ===
        0
      ) {
        continue;
      }

      const {
        trend,
        growthPercent,
      } =
        calculateTrend(
          currentEngagement,
          previousEngagement
        );

      const momentumScore =
        calculateMomentumScore(
          currentEngagement,
          previousEngagement
        );

      trendingCategoriesWithoutRank.push(
        {
          category:
            category.category,

          views:
            category.currentViews,

          previousViews:
            category.previousViews,

          downloads:
            category.currentDownloads,

          previousDownloads:
            category.previousDownloads,

          currentEngagement,

          previousEngagement,

          growthPercent,

          trend,

          momentumScore,

          activeContent:
            category.activeContent,
        }
      );
    }

    trendingCategoriesWithoutRank.sort(
      (
        first,
        second
      ) => {
        if (
          second.momentumScore !==
          first.momentumScore
        ) {
          return (
            second.momentumScore -
            first.momentumScore
          );
        }

        return (
          second.currentEngagement -
          first.currentEngagement
        );
      }
    );

    const trendingCategories:
      TrendingCategoryItem[] =
      trendingCategoriesWithoutRank
        .slice(
          0,
          10
        )
        .map(
          (
            item,
            index
          ) => ({
            ...item,

            rank:
              index + 1,
          })
        );

    /* =====================================================
       SUMMARY
    ===================================================== */

    const totalCurrentViews =
      trendingContentWithoutRank.reduce(
        (
          total,
          item
        ) =>
          total +
          item.views,
        0
      );

    const totalCurrentDownloads =
      trendingContentWithoutRank.reduce(
        (
          total,
          item
        ) =>
          total +
          item.downloads,
        0
      );

    const risingContent =
      trendingContentWithoutRank.filter(
        (
          item
        ) =>
          item.trend ===
            "up" ||
          item.trend ===
            "new"
      ).length;

    const decliningContent =
      trendingContentWithoutRank.filter(
        (
          item
        ) =>
          item.trend ===
          "down"
      ).length;

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

        previousStartDate:
          previousStartDate.toISOString(),

        previousEndDate:
          previousEndDate.toISOString(),
      },

      summary: {
        trackedContent:
          trendingContentWithoutRank.length,

        risingContent,

        decliningContent,

        views:
          totalCurrentViews,

        downloads:
          totalCurrentDownloads,

        trendingCategories:
          trendingCategories.length,
      },

      trendingContent,

      trendingCategories,
    });
  } catch (error) {
    console.error(
      "Trending analytics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load trending analytics",
      },
      {
        status: 500,
      }
    );
  }
}