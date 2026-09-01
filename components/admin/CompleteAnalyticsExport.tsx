"use client";
import {
  useAnalyticsRange,
} from "@/lib/useAnalyticsRange";

import {
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type RangeDays =
  | 7
  | 30
  | 90;

type TrendStatus =
  | "up"
  | "down"
  | "same"
  | "new";

/* =========================================================
   OVERVIEW TYPES
========================================================= */

type ComparisonMetric = {
  current: number;

  previous: number;

  changePercent:
    | number
    | null;

  trend:
    | TrendStatus;
};

type TrafficItem = {
  date: string;

  views: number;

  articleViews: number;

  bookViews: number;

  downloads: number;

  newUsers: number;
};

type TopArticle = {
  _id?: string;

  title: string;

  slug: string;

  category?: string;

  views?: number;
};

type TopBook = {
  _id?: string;

  title: string;

  slug: string;

  category?: string;

  views?: number;
};

type TopDownloadedBook = {
  _id?: string;

  title: string;

  slug: string;

  category?: string;

  downloads?: number;
};

type TopSavedItem = {
  itemType:
    | "article"
    | "book";

  title: string;

  slug: string;

  category?: string;

  saves: number;
};

type OverviewAnalytics = {
  success: boolean;

  range?: {
    days: number;

    startDate: string;

    endDate: string;
  };

  totals?: {
    users?: number;

    articles?: number;

    books?: number;

    bookmarks?: number;

    history?: number;

    messages?: number;

    views?: number;

    articleViews?: number;

    bookViews?: number;

    downloads?: number;

    uniqueVisitors?: number;

    uniqueDownloaders?: number;

    newUsers?: number;
  };

  summary?: {
    users?: number;

    articles?: number;

    books?: number;

    bookmarks?: number;

    history?: number;

    messages?: number;

    views?: number;

    articleViews?: number;

    bookViews?: number;

    downloads?: number;

    uniqueVisitors?: number;

    uniqueDownloaders?: number;

    newUsers?: number;
  };

  comparison?: {
    previousRange?: {
      startDate: string;

      endDate: string;
    };

    views?: ComparisonMetric;

    uniqueVisitors?: ComparisonMetric;

    downloads?: ComparisonMetric;

    uniqueDownloaders?: ComparisonMetric;

    articleViews?: ComparisonMetric;

    bookViews?: ComparisonMetric;

    newUsers?: ComparisonMetric;
  };

  traffic?: TrafficItem[];

  topArticles?: TopArticle[];

  topBooks?: TopBook[];

  topDownloadedBooks?:
    TopDownloadedBook[];

  topSaved?: TopSavedItem[];
};

/* =========================================================
   CATEGORY TYPES
========================================================= */

type CategoryItem = {
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

type CategoryAnalytics = {
  success: boolean;

  range: {
    days: number;

    startDate: string;

    endDate: string;
  };

  summary: {
    categories: number;

    views: number;

    articleViews: number;

    bookViews: number;

    downloads: number;

    bookmarks: number;

    totalContent: number;

    articles: number;

    resources: number;
  };

  categories:
    CategoryItem[];
};

/* =========================================================
   TRENDING TYPES
========================================================= */

type TrendingContentItem = {
  rank: number;

  itemType:
    | "article"
    | "book";

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

type TrendingAnalytics = {
  success: boolean;

  range: {
    days: number;

    startDate: string;

    endDate: string;

    previousStartDate: string;

    previousEndDate: string;
  };

  summary: {
    trackedContent: number;

    risingContent: number;

    decliningContent: number;

    views: number;

    downloads: number;

    trendingCategories: number;
  };

  trendingContent:
    TrendingContentItem[];

  trendingCategories:
    TrendingCategoryItem[];
};

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
  trend?: TrendStatus
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
  value:
    | number
    | null
    | undefined
) {
  if (
    value === null
  ) {
    return "New";
  }

  if (
    value === undefined
  ) {
    return "";
  }

  return `${value}%`;
}

function dateOnly(
  value?: string
) {
  if (!value) {
    return "";
  }

  return value.slice(
    0,
    10
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CompleteAnalyticsExport() {
const [
  days,
  setDays,
] =
  useAnalyticsRange(
    30
  );

  const [
    exporting,
    setExporting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =====================================================
     EXPORT
  ===================================================== */

  async function exportCompleteReport() {
    try {
      setExporting(
        true
      );

      setError(
        ""
      );

      /* =================================================
         FETCH ALL ANALYTICS
      ================================================= */

      const [
        overviewResponse,
        categoryResponse,
        trendingResponse,
      ] =
        await Promise.all([
          fetch(
            `/api/admin/analytics?days=${days}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          ),

          fetch(
            `/api/admin/analytics/categories?days=${days}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          ),

          fetch(
            `/api/admin/analytics/trending?days=${days}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          ),
        ]);

      if (
        !overviewResponse.ok
      ) {
        throw new Error(
          "Unable to load overview analytics."
        );
      }

      if (
        !categoryResponse.ok
      ) {
        throw new Error(
          "Unable to load category analytics."
        );
      }

      if (
        !trendingResponse.ok
      ) {
        throw new Error(
          "Unable to load trending analytics."
        );
      }

      const overview =
        (await overviewResponse.json()) as
          OverviewAnalytics;

      const categories =
        (await categoryResponse.json()) as
          CategoryAnalytics;

      const trending =
        (await trendingResponse.json()) as
          TrendingAnalytics;

      /* =================================================
         SAFE DATA
      ================================================= */

      const overviewSummary =
        overview.summary ??
        overview.totals ??
        {};

      const traffic =
        overview.traffic ??
        [];

      const topArticles =
        overview.topArticles ??
        [];

      const topBooks =
        overview.topBooks ??
        [];

      const topDownloadedBooks =
        overview.topDownloadedBooks ??
        [];

      const topSaved =
        overview.topSaved ??
        [];

      const categoryItems =
        categories.categories ??
        [];

      const trendingContent =
        trending.trendingContent ??
        [];

      const trendingCategories =
        trending.trendingCategories ??
        [];

      /* =================================================
         CSV
      ================================================= */

      const rows:
        string[] = [];

      /* =================================================
         REPORT HEADER
      ================================================= */

      rows.push(
        csvRow([
          "PETROHUB COMPLETE ANALYTICS REPORT",
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
          "Generated At",
          new Date().toISOString(),
        ])
      );

      rows.push(
        csvRow([
          "Current Period Start",
          dateOnly(
            categories.range
              ?.startDate ??
              trending.range
                ?.startDate
          ),
        ])
      );

      rows.push(
        csvRow([
          "Current Period End",
          dateOnly(
            categories.range
              ?.endDate ??
              trending.range
                ?.endDate
          ),
        ])
      );

      rows.push("");

      /* =================================================
         SECTION 1
         PLATFORM OVERVIEW
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 1 - PLATFORM OVERVIEW",
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
          "Users",
          overviewSummary.users ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Published Articles",
          overviewSummary.articles ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Library Resources",
          overviewSummary.books ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Bookmarks",
          overviewSummary.bookmarks ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Reading History Records",
          overviewSummary.history ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Contact Messages",
          overviewSummary.messages ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Tracked Views",
          overviewSummary.views ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Article Views",
          overviewSummary.articleViews ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Library Views",
          overviewSummary.bookViews ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Downloads",
          overviewSummary.downloads ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Unique Visitors",
          overviewSummary.uniqueVisitors ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "Unique Downloaders",
          overviewSummary.uniqueDownloaders ??
            0,
        ])
      );

      rows.push(
        csvRow([
          "New Users",
          overviewSummary.newUsers ??
            0,
        ])
      );

      rows.push("");

      /* =================================================
         SECTION 2
         PERIOD COMPARISON
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 2 - CURRENT VS PREVIOUS PERIOD",
        ])
      );

      rows.push(
        csvRow([
          "Metric",
          "Current",
          "Previous",
          "Change",
          "Trend",
        ])
      );

      const comparison =
        overview.comparison;

      if (comparison) {
        const metrics: {
          label: string;

          value?:
            ComparisonMetric;
        }[] = [
          {
            label:
              "Views",

            value:
              comparison.views,
          },

          {
            label:
              "Unique Visitors",

            value:
              comparison.uniqueVisitors,
          },

          {
            label:
              "Downloads",

            value:
              comparison.downloads,
          },

          {
            label:
              "Unique Downloaders",

            value:
              comparison.uniqueDownloaders,
          },

          {
            label:
              "Article Views",

            value:
              comparison.articleViews,
          },

          {
            label:
              "Library Views",

            value:
              comparison.bookViews,
          },

          {
            label:
              "New Users",

            value:
              comparison.newUsers,
          },
        ];

        for (
          const metric of
          metrics
        ) {
          if (
            !metric.value
          ) {
            continue;
          }

          rows.push(
            csvRow([
              metric.label,

              metric.value.current,

              metric.value.previous,

              growthLabel(
                metric.value
                  .changePercent
              ),

              trendLabel(
                metric.value
                  .trend
              ),
            ])
          );
        }
      }

      rows.push("");

      /* =================================================
         SECTION 3
         DAILY TRAFFIC
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 3 - DAILY ANALYTICS",
        ])
      );

      rows.push(
        csvRow([
          "Date",
          "Views",
          "Article Views",
          "Library Views",
          "Downloads",
          "New Users",
        ])
      );

      for (
        const item of
        traffic
      ) {
        rows.push(
          csvRow([
            item.date,

            item.views,

            item.articleViews,

            item.bookViews,

            item.downloads,

            item.newUsers,
          ])
        );
      }

      rows.push("");

      /* =================================================
         SECTION 4
         TOP ARTICLES
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 4 - TOP ARTICLES",
        ])
      );

      rows.push(
        csvRow([
          "Rank",
          "Title",
          "Category",
          "Views",
          "Slug",
        ])
      );

      topArticles.forEach(
        (
          article,
          index
        ) => {
          rows.push(
            csvRow([
              index + 1,

              article.title,

              article.category ??
                "",

              article.views ??
                0,

              article.slug,
            ])
          );
        }
      );

      rows.push("");

      /* =================================================
         SECTION 5
         TOP LIBRARY RESOURCES
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 5 - TOP LIBRARY RESOURCES",
        ])
      );

      rows.push(
        csvRow([
          "Rank",
          "Title",
          "Category",
          "Views",
          "Slug",
        ])
      );

      topBooks.forEach(
        (
          book,
          index
        ) => {
          rows.push(
            csvRow([
              index + 1,

              book.title,

              book.category ??
                "",

              book.views ??
                0,

              book.slug,
            ])
          );
        }
      );

      rows.push("");

      /* =================================================
         SECTION 6
         TOP DOWNLOADS
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 6 - TOP DOWNLOADED RESOURCES",
        ])
      );

      rows.push(
        csvRow([
          "Rank",
          "Title",
          "Category",
          "Downloads",
          "Slug",
        ])
      );

      topDownloadedBooks.forEach(
        (
          book,
          index
        ) => {
          rows.push(
            csvRow([
              index + 1,

              book.title,

              book.category ??
                "",

              book.downloads ??
                0,

              book.slug,
            ])
          );
        }
      );

      rows.push("");

      /* =================================================
         SECTION 7
         MOST SAVED
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 7 - MOST SAVED CONTENT",
        ])
      );

      rows.push(
        csvRow([
          "Rank",
          "Title",
          "Type",
          "Category",
          "Saves",
          "Slug",
        ])
      );

      topSaved.forEach(
        (
          item,
          index
        ) => {
          rows.push(
            csvRow([
              index + 1,

              item.title,

              item.itemType ===
              "article"
                ? "Article"
                : "Library",

              item.category ??
                "",

              item.saves,

              item.slug,
            ])
          );
        }
      );

      rows.push("");

      /* =================================================
         SECTION 8
         CATEGORY SUMMARY
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 8 - CATEGORY SUMMARY",
        ])
      );

      rows.push(
        csvRow([
          "Categories",
          categories.summary
            .categories,
        ])
      );

      rows.push(
        csvRow([
          "Articles",
          categories.summary
            .articles,
        ])
      );

      rows.push(
        csvRow([
          "Resources",
          categories.summary
            .resources,
        ])
      );

      rows.push(
        csvRow([
          "Total Published Content",
          categories.summary
            .totalContent,
        ])
      );

      rows.push(
        csvRow([
          "Views",
          categories.summary
            .views,
        ])
      );

      rows.push(
        csvRow([
          "Downloads",
          categories.summary
            .downloads,
        ])
      );

      rows.push(
        csvRow([
          "New Saves",
          categories.summary
            .bookmarks,
        ])
      );

      rows.push("");

      /* =================================================
         SECTION 9
         CATEGORY BREAKDOWN
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 9 - CATEGORY PERFORMANCE",
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

      categoryItems.forEach(
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

      /* =================================================
         SECTION 10
         TRENDING SUMMARY
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 10 - TRENDING SUMMARY",
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
          "Active Content",
          trending.summary
            .trackedContent,
        ])
      );

      rows.push(
        csvRow([
          "Rising / New Content",
          trending.summary
            .risingContent,
        ])
      );

      rows.push(
        csvRow([
          "Declining Content",
          trending.summary
            .decliningContent,
        ])
      );

      rows.push(
        csvRow([
          "Current Views",
          trending.summary
            .views,
        ])
      );

      rows.push(
        csvRow([
          "Current Downloads",
          trending.summary
            .downloads,
        ])
      );

      rows.push(
        csvRow([
          "Active Trending Categories",
          trending.summary
            .trendingCategories,
        ])
      );

      rows.push("");

      /* =================================================
         SECTION 11
         TRENDING CONTENT
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 11 - TRENDING CONTENT",
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

      /* =================================================
         SECTION 12
         TRENDING CATEGORIES
      ================================================= */

      rows.push(
        csvRow([
          "SECTION 12 - TRENDING CATEGORIES",
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

      /* =================================================
         REPORT NOTES
      ================================================= */

      rows.push(
        csvRow([
          "REPORT NOTES",
        ])
      );

      rows.push(
        csvRow([
          "Category Engagement Score",
          "Views x 1 + Downloads x 3 + Saves x 2",
        ])
      );

      rows.push(
        csvRow([
          "Trending Engagement",
          "Views x 1 + Downloads x 3",
        ])
      );

      rows.push(
        csvRow([
          "Trending Comparison",
          "Selected reporting period compared with the immediately preceding equal calendar period.",
        ])
      );

      rows.push(
        csvRow([
          "Analytics History",
          "Historical event analytics only includes activity recorded after PetroHub event tracking was enabled.",
        ])
      );

      /* =================================================
         DOWNLOAD FILE
      ================================================= */

      const csv =
        `\uFEFF${rows.join(
          "\r\n"
        )}`;

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const today =
        new Date()
          .toISOString()
          .slice(
            0,
            10
          );

      const filename =
        `petrohub-complete-analytics-${days}-days-${today}.csv`;

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href =
        url;

      anchor.download =
        filename;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        url
      );
    } catch (
      err
    ) {
      console.error(
        "Complete analytics export error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to export complete analytics report."
      );
    } finally {
      setExporting(
        false
      );
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="mb-12 overflow-hidden rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-slate-900 to-slate-900">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-green-500/30 bg-green-500/10 text-2xl">
              📑
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-400">
                Complete Report
              </p>

              <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                Export All Analytics
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Export Overview,
                daily traffic,
                comparisons, top
                content, downloads,
                saves, category
                performance and
                trending analytics
                into one consolidated
                CSV report.
              </p>
            </div>
          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
              {(
                [
                  7,
                  30,
                  90,
                ] as RangeDays[]
              ).map(
                (
                  value
                ) => (
                  <button
                    key={
                      value
                    }
                    type="button"
                    onClick={() =>
                      setDays(
                        value
                      )
                    }
                    disabled={
                      exporting
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      days ===
                      value
                        ? "bg-green-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {value} Days
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={
                exportCompleteReport
              }
              disabled={
                exporting
              }
              className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={
                  exporting
                    ? "animate-spin"
                    : ""
                }
              >
                {exporting
                  ? "↻"
                  : "↓"}
              </span>

              {exporting
                ? "Preparing Report..."
                : "Export Complete CSV"}
            </button>
          </div>
        </div>

        {/* =================================================
            REPORT CONTENT TAGS
        ================================================= */}

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "Platform Overview",
            "Daily Traffic",
            "Period Comparison",
            "Top Articles",
            "Top Resources",
            "Downloads",
            "Most Saved",
            "Categories",
            "Trending Content",
            "Trending Categories",
          ].map(
            (label) => (
              <span
                key={
                  label
                }
                className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[11px] font-semibold text-slate-400"
              >
                ✓ {label}
              </span>
            )
          )}
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-semibold text-red-400">
              Export failed
            </p>

            <p className="mt-1 text-xs leading-5 text-red-300">
              {error}
            </p>
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-slate-600">
          The report uses the
          selected reporting period
          consistently across all
          three analytics APIs.
        </p>
      </div>
    </section>
  );
}