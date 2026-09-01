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
    itemType: ItemType;

    itemId:
      mongoose.Types.ObjectId;

    eventType: EventType;
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
  itemType: ItemType;

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

  itemType: ItemType;

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

function formatDate(
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
   TREND
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
   MOMENTUM
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
   EVENTS
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

function trendLabel(
  trend: TrendStatus
) {
  if (
    trend === "up"
  ) {
    return "Growing";
  }

  if (
    trend === "down"
  ) {
    return "Declining";
  }

  if (
    trend === "new"
  ) {
    return "New Activity";
  }

  return "No Change";
}

function growthLabel(
  growth:
    | number
    | null
) {
  if (
    growth === null
  ) {
    return "New";
  }

  return `${growth}%`;
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
       EVENT DATA
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
       IDS
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
       CONTENT
    ===================================================== */

    const [
      rawArticles,
      rawBooks,
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
      rawArticles as unknown as
        LeanArticle[];

    const books =
      rawBooks as unknown as
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

    const contentWithoutRank:
      Omit<
        TrendingContentItem,
        "rank"
      >[] = [];

    for (
      const content of
      contentMap.values()
    ) {
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

      contentWithoutRank.push(
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

    contentWithoutRank.sort(
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
      contentWithoutRank.map(
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
       CATEGORY MAP
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

    const categoriesWithoutRank:
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

      categoriesWithoutRank.push(
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

    categoriesWithoutRank.sort(
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
      categoriesWithoutRank.map(
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

    const currentViews =
      trendingContent.reduce(
        (
          total,
          item
        ) =>
          total +
          item.views,
        0
      );

    const previousViews =
      trendingContent.reduce(
        (
          total,
          item
        ) =>
          total +
          item.previousViews,
        0
      );

    const currentDownloads =
      trendingContent.reduce(
        (
          total,
          item
        ) =>
          total +
          item.downloads,
        0
      );

    const previousDownloads =
      trendingContent.reduce(
        (
          total,
          item
        ) =>
          total +
          item.previousDownloads,
        0
      );

    const risingContent =
      trendingContent.filter(
        (
          item
        ) =>
          item.trend ===
            "up" ||
          item.trend ===
            "new"
      ).length;

    const decliningContent =
      trendingContent.filter(
        (
          item
        ) =>
          item.trend ===
          "down"
      ).length;

    /* =====================================================
       CSV
    ===================================================== */

    const rows:
      string[] = [];

    rows.push(
      csvRow([
        "PetroHub Trending Analytics Report",
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
        "Current Period",
        `${formatDate(
          startDate
        )} to ${formatDate(
          endDate
        )}`,
      ])
    );

    rows.push(
      csvRow([
        "Previous Period",
        `${formatDate(
          previousStartDate
        )} to ${formatDate(
          previousEndDate
        )}`,
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
        "Current",
        "Previous",
      ])
    );

    rows.push(
      csvRow([
        "Views",
        currentViews,
        previousViews,
      ])
    );

    rows.push(
      csvRow([
        "Downloads",
        currentDownloads,
        previousDownloads,
      ])
    );

    rows.push(
      csvRow([
        "Active Content",
        trendingContent.length,
        "",
      ])
    );

    rows.push(
      csvRow([
        "Rising / New Content",
        risingContent,
        "",
      ])
    );

    rows.push(
      csvRow([
        "Declining Content",
        decliningContent,
        "",
      ])
    );

    rows.push(
      csvRow([
        "Active Categories",
        trendingCategories.length,
        "",
      ])
    );

    rows.push("");

    /* =========================
       CONTENT
    ========================= */

    rows.push(
      csvRow([
        "TRENDING CONTENT",
      ])
    );

    rows.push(
      csvRow([
        "Rank",
        "Title",
        "Type",
        "Category",
        "Current Views",
        "Previous Views",
        "Current Downloads",
        "Previous Downloads",
        "Current Engagement",
        "Previous Engagement",
        "Growth",
        "Trend",
        "Momentum Score",
        "Slug",
      ])
    );

    for (
      const item of
      trendingContent
    ) {
      rows.push(
        csvRow([
          item.rank,

          item.title,

          item.itemType ===
          "article"
            ? "Article"
            : "Library",

          item.category,

          item.views,

          item.previousViews,

          item.downloads,

          item.previousDownloads,

          item.currentEngagement,

          item.previousEngagement,

          growthLabel(
            item.growthPercent
          ),

          trendLabel(
            item.trend
          ),

          item.momentumScore,

          item.slug,
        ])
      );
    }

    rows.push("");

    /* =========================
       CATEGORIES
    ========================= */

    rows.push(
      csvRow([
        "TRENDING CATEGORIES",
      ])
    );

    rows.push(
      csvRow([
        "Rank",
        "Category",
        "Active Content",
        "Current Views",
        "Previous Views",
        "Current Downloads",
        "Previous Downloads",
        "Current Engagement",
        "Previous Engagement",
        "Growth",
        "Trend",
        "Momentum Score",
      ])
    );

    for (
      const category of
      trendingCategories
    ) {
      rows.push(
        csvRow([
          category.rank,

          category.category,

          category.activeContent,

          category.views,

          category.previousViews,

          category.downloads,

          category.previousDownloads,

          category.currentEngagement,

          category.previousEngagement,

          growthLabel(
            category.growthPercent
          ),

          trendLabel(
            category.trend
          ),

          category.momentumScore,
        ])
      );
    }

    rows.push("");

    rows.push(
      csvRow([
        "Engagement Formula",
        "Views x 1 + Downloads x 3",
      ])
    );

    rows.push(
      csvRow([
        "Note",
        "Trend compares the selected period with the immediately preceding equal calendar period.",
      ])
    );

    rows.push(
      csvRow([
        "Note",
        "New Activity means current engagement exists while the previous period recorded zero engagement.",
      ])
    );

    /* =====================================================
       DOWNLOAD
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
      `petrohub-trending-analytics-${days}-days-${today}.csv`;

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
      "Trending analytics CSV export error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to export trending analytics",
      },
      {
        status: 500,
      }
    );
  }
}