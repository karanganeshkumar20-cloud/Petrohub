"use client";

import Link from "next/link";
import {
  useAnalyticsRange,
} from "@/lib/useAnalyticsRange";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type RangeDays =
  | 7
  | 30
  | 90;

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

type InsightType =
  | "positive"
  | "warning"
  | "info";

type AnalyticsInsight = {
  id: string;

  type:
    InsightType;

  title: string;

  message: string;

  metric?: string;

  actionUrl?: string;

  actionLabel?: string;
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

type RecentUser = {
  _id: string;

  name: string;

  email: string;

  role: string;

  isBlocked?: boolean;

  createdAt?: string;
};

type AnalyticsData = {
  success: boolean;

  range: {
    days: number;

    startDate: string;

    endDate: string;
  };

  comparison: {
    previousRange: {
      startDate: string;

      endDate: string;
    };

    views:
      ComparisonMetric;

    uniqueVisitors:
      ComparisonMetric;

    downloads:
      ComparisonMetric;

    uniqueDownloaders:
      ComparisonMetric;

    newUsers:
      ComparisonMetric;

    articleViews:
      ComparisonMetric;

    bookViews:
      ComparisonMetric;
  };

  period: {
    views: number;

    articleViews: number;

    bookViews: number;

    downloads: number;

    uniqueVisitors: number;

    loggedInViewers: number;

    uniqueDownloaders: number;

    loggedInDownloaders: number;

    newUsers: number;
  };

  traffic:
    TrafficItem[];

  users: {
    total: number;

    active: number;

    blocked: number;
  };

  articles: {
    total: number;

    published: number;

    drafts: number;

    views: number;
  };

  books: {
    total: number;

    published: number;

    drafts: number;

    views: number;

    downloads: number;
  };

  engagement: {
    totalViews: number;

    bookmarks: number;

    historyRecords: number;
  };

  messages: {
    total: number;

    unread: number;
  };

  topArticles:
    TopArticle[];

  topBooks:
    TopBook[];

  topDownloadedBooks:
    TopDownloadedBook[];

  topSaved:
    TopSavedItem[];

  recentUsers:
    RecentUser[];
};

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(
  value?: number
) {
  return Number(
    value ?? 0
  ).toLocaleString(
    "en-IN"
  );
}

function formatDate(
  value: string
) {
  const date =
    new Date(
      `${value}T00:00:00Z`
    );

  return date.toLocaleDateString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",
    }
  );
}

function formatFullDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
}

/* =========================================================
   SMART INSIGHTS
========================================================= */

function buildInsights(
  data: AnalyticsData,
  days: number
): AnalyticsInsight[] {
  const insights:
    AnalyticsInsight[] = [];

  const comparison =
    data.comparison;

  const topArticles =
    data.topArticles ??
    [];

  const topBooks =
    data.topBooks ??
    [];

  const topDownloadedBooks =
    data.topDownloadedBooks ??
    [];

  const topSaved =
    data.topSaved ??
    [];

  /* =========================
     TRAFFIC
  ========================= */

  if (
    comparison.views
      .trend === "up"
  ) {
    insights.push({
      id:
        "traffic-growth",

      type:
        "positive",

      title:
        "Traffic is growing",

      message:
        `Views increased by ${Math.abs(
          comparison.views
            .changePercent ??
            0
        )}% compared with the previous ${days}-day period.`,

      metric:
        `${formatNumber(
          data.period.views
        )} views`,
    });
  } else if (
    comparison.views
      .trend === "down"
  ) {
    insights.push({
      id:
        "traffic-decline",

      type:
        "warning",

      title:
        "Traffic has decreased",

      message:
        `Views decreased by ${Math.abs(
          comparison.views
            .changePercent ??
            0
        )}% compared with the previous ${days}-day period.`,

      metric:
        `${formatNumber(
          data.period.views
        )} views`,

      actionUrl:
        "/admin/articles",

      actionLabel:
        "Review Articles",
    });
  } else if (
    comparison.views
      .trend === "new"
  ) {
    insights.push({
      id:
        "new-traffic",

      type:
        "info",

      title:
        "New traffic activity",

      message:
        `PetroHub recorded ${formatNumber(
          data.period.views
        )} tracked views while the previous period had no tracked views.`,

      metric:
        `${formatNumber(
          data.period.views
        )} views`,
    });
  }

  /* =========================
     VISITORS
  ========================= */

  if (
    comparison.uniqueVisitors
      .trend === "up"
  ) {
    insights.push({
      id:
        "visitor-growth",

      type:
        "positive",

      title:
        "Audience reach increased",

      message:
        `Unique visitors increased by ${Math.abs(
          comparison
            .uniqueVisitors
            .changePercent ??
            0
        )}% compared with the previous period.`,

      metric:
        `${formatNumber(
          data.period
            .uniqueVisitors
        )} visitors`,
    });
  }

  if (
    comparison.uniqueVisitors
      .trend === "down"
  ) {
    insights.push({
      id:
        "visitor-decline",

      type:
        "warning",

      title:
        "Audience reach declined",

      message:
        `Unique visitors decreased by ${Math.abs(
          comparison
            .uniqueVisitors
            .changePercent ??
            0
        )}% compared with the previous period.`,

      metric:
        `${formatNumber(
          data.period
            .uniqueVisitors
        )} visitors`,
    });
  }

  /* =========================
     DOWNLOADS
  ========================= */

  if (
    comparison.downloads
      .trend === "up"
  ) {
    insights.push({
      id:
        "download-growth",

      type:
        "positive",

      title:
        "Downloads are growing",

      message:
        `Resource downloads increased by ${Math.abs(
          comparison.downloads
            .changePercent ??
            0
        )}% compared with the previous period.`,

      metric:
        `${formatNumber(
          data.period
            .downloads
        )} downloads`,

      actionUrl:
        "/admin/books",

      actionLabel:
        "Manage Library",
    });
  }

  if (
    comparison.downloads
      .trend === "down"
  ) {
    insights.push({
      id:
        "download-decline",

      type:
        "warning",

      title:
        "Downloads decreased",

      message:
        `Downloads decreased by ${Math.abs(
          comparison.downloads
            .changePercent ??
            0
        )}% compared with the previous period.`,

      metric:
        `${formatNumber(
          data.period
            .downloads
        )} downloads`,

      actionUrl:
        "/admin/books",

      actionLabel:
        "Review Library",
    });
  }

  /* =========================
     USER REGISTRATIONS
  ========================= */

  if (
    comparison.newUsers
      .trend === "up"
  ) {
    insights.push({
      id:
        "registration-growth",

      type:
        "positive",

      title:
        "Registrations are growing",

      message:
        `New registrations increased by ${Math.abs(
          comparison.newUsers
            .changePercent ??
            0
        )}% compared with the previous period.`,

      metric:
        `${formatNumber(
          data.period
            .newUsers
        )} new users`,

      actionUrl:
        "/admin/users",

      actionLabel:
        "View Users",
    });
  }

  if (
    comparison.newUsers
      .trend === "down"
  ) {
    insights.push({
      id:
        "registration-decline",

      type:
        "info",

      title:
        "Registration growth slowed",

      message:
        `New registrations decreased by ${Math.abs(
          comparison.newUsers
            .changePercent ??
            0
        )}% compared with the previous period.`,

      metric:
        `${formatNumber(
          data.period
            .newUsers
        )} new users`,
    });
  }

  /* =========================
     TOP ARTICLE
  ========================= */

  if (
    topArticles.length >
    0
  ) {
    const article =
      topArticles[0];

    insights.push({
      id:
        "top-article",

      type:
        "info",

      title:
        "Top-performing article",

      message:
        `"${article.title}" is the most viewed article in the selected period.`,

      metric:
        `${formatNumber(
          article.views
        )} views`,

      actionUrl:
        `/articles/${article.slug}`,

      actionLabel:
        "View Article",
    });
  }

  /* =========================
     TOP RESOURCE
  ========================= */

  if (
    topBooks.length >
    0
  ) {
    const book =
      topBooks[0];

    insights.push({
      id:
        "top-resource",

      type:
        "info",

      title:
        "Most viewed library resource",

      message:
        `"${book.title}" received the most library views during the selected period.`,

      metric:
        `${formatNumber(
          book.views
        )} views`,

      actionUrl:
        `/library/${book.slug}`,

      actionLabel:
        "View Resource",
    });
  }

  /* =========================
     TOP DOWNLOAD
  ========================= */

  if (
    topDownloadedBooks.length >
    0
  ) {
    const book =
      topDownloadedBooks[0];

    insights.push({
      id:
        "top-download",

      type:
        "positive",

      title:
        "Most downloaded resource",

      message:
        `"${book.title}" is currently leading resource downloads.`,

      metric:
        `${formatNumber(
          book.periodDownloads
        )} downloads`,

      actionUrl:
        `/library/${book.slug}`,

      actionLabel:
        "View Resource",
    });
  }

  /* =========================
     MOST SAVED
  ========================= */

  if (
    topSaved.length >
    0
  ) {
    const saved =
      topSaved[0];

    insights.push({
      id:
        "most-saved",

      type:
        "info",

      title:
        "Most saved content",

      message:
        `"${saved.title}" currently has the highest number of bookmarks.`,

      metric:
        `${formatNumber(
          saved.saves
        )} saves`,

      actionUrl:
        saved.itemType ===
        "article"
          ? `/articles/${saved.slug}`
          : `/library/${saved.slug}`,

      actionLabel:
        "View Content",
    });
  }

  /* =========================
     DOWNLOAD CONVERSION
  ========================= */

  if (
    data.period
      .uniqueVisitors >
      0
  ) {
    const conversion =
      Math.round(
        (data.period
          .uniqueDownloaders /
          data.period
            .uniqueVisitors) *
          1000
      ) / 10;

    insights.push({
      id:
        "download-conversion",

      type:
        conversion >= 20
          ? "positive"
          : "info",

      title:
        "Visitor-to-download conversion",

      message:
        `${conversion}% of unique visitors downloaded at least one library resource during the selected period.`,

      metric:
        `${conversion}% conversion`,
    });
  }

  /* =========================
     ZERO DATA
  ========================= */

  if (
    data.period.views ===
      0 &&
    data.period.downloads ===
      0 &&
    data.period
      .uniqueVisitors ===
      0
  ) {
    insights.push({
      id:
        "collecting-data",

      type:
        "info",

      title:
        "Analytics is collecting data",

      message:
        "No tracked activity is available for this period yet. New views and downloads will appear automatically.",

      actionUrl:
        "/",

      actionLabel:
        "Open Website",
    });
  }

  return insights.slice(
    0,
    8
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;

  value: number;

  subtitle?: string;

  icon?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {formatNumber(
              value
            )}
          </p>
        </div>

        {icon && (
          <span className="text-2xl">
            {icon}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   COMPARISON CARD
========================================================= */

function ComparisonCard({
  title,
  metric,
  icon,
}: {
  title: string;

  metric:
    ComparisonMetric;

  icon?: string;
}) {
  let trendText =
    "No change";

  let trendClass =
    "border-slate-700 bg-slate-800 text-slate-400";

  if (
    metric.trend ===
    "up"
  ) {
    trendText =
      `↑ ${Math.abs(
        metric.changePercent ??
          0
      )}%`;

    trendClass =
      "border-green-500/30 bg-green-500/10 text-green-400";
  }

  if (
    metric.trend ===
    "down"
  ) {
    trendText =
      `↓ ${Math.abs(
        metric.changePercent ??
          0
      )}%`;

    trendClass =
      "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (
    metric.trend ===
    "new"
  ) {
    trendText =
      "New activity";

    trendClass =
      "border-blue-500/30 bg-blue-500/10 text-blue-400";
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {formatNumber(
              metric.current
            )}
          </p>
        </div>

        {icon && (
          <span className="text-xl">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${trendClass}`}
        >
          {trendText}
        </span>

        <span className="text-xs text-slate-500">
          Previous:{" "}
          <span className="font-semibold text-slate-300">
            {formatNumber(
              metric.previous
            )}
          </span>
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   INSIGHT CARD
========================================================= */

function InsightCard({
  insight,
}: {
  insight:
    AnalyticsInsight;
}) {
  let cardClass =
    "border-blue-500/20 bg-blue-500/5";

  let badgeClass =
    "bg-blue-500/10 text-blue-400";

  let label =
    "Insight";

  let icon =
    "ℹ";

  if (
    insight.type ===
    "positive"
  ) {
    cardClass =
      "border-green-500/20 bg-green-500/5";

    badgeClass =
      "bg-green-500/10 text-green-400";

    label =
      "Positive";

    icon =
      "↗";
  }

  if (
    insight.type ===
    "warning"
  ) {
    cardClass =
      "border-yellow-500/20 bg-yellow-500/5";

    badgeClass =
      "bg-yellow-500/10 text-yellow-400";

    label =
      "Watch";

    icon =
      "⚠";
  }

  return (
    <div
      className={`rounded-2xl border p-5 ${cardClass}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-lg text-white">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
            >
              {label}
            </span>

            {insight.metric && (
              <span className="text-xs font-semibold text-slate-400">
                {
                  insight.metric
                }
              </span>
            )}
          </div>

          <h3 className="mt-3 font-bold text-white">
            {
              insight.title
            }
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {
              insight.message
            }
          </p>

          {insight.actionUrl &&
            insight.actionLabel && (
              <Link
                href={
                  insight.actionUrl
                }
                className="mt-4 inline-flex text-sm font-semibold text-orange-400 hover:text-orange-300"
              >
                {
                  insight.actionLabel
                }{" "}
                →
              </Link>
            )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TRAFFIC CHART
========================================================= */

function TrafficChart({
  traffic,
}: {
  traffic:
    TrafficItem[];
}) {
  const safeTraffic =
    traffic ?? [];

  const maxActivity =
    useMemo(() => {
      if (
        safeTraffic.length ===
        0
      ) {
        return 1;
      }

      return Math.max(
        ...safeTraffic.map(
          (item) =>
            Math.max(
              item.views,
              item.downloads
            )
        ),

        1
      );
    }, [safeTraffic]);

  const visibleLabels =
    safeTraffic.length <= 7
      ? safeTraffic.length
      : safeTraffic.length <= 30
        ? 6
        : 7;

  const labelInterval =
    Math.max(
      1,

      Math.floor(
        safeTraffic.length /
          Math.max(
            visibleLabels,
            1
          )
      )
    );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Traffic
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            Daily Activity
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Views and PDF
            downloads recorded
            during the selected
            period.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500" />

            Views
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-500" />

            Downloads
          </div>
        </div>
      </div>

      {safeTraffic.length ===
      0 ? (
        <div className="mt-8 flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500">
          No analytics data
          available yet.
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto pb-3">
            <div
              className="flex min-w-[720px] items-end gap-2"
              style={{
                height:
                  "280px",
              }}
            >
              {safeTraffic.map(
                (
                  item,
                  index
                ) => {
                  const viewHeight =
                    Math.max(
                      item.views >
                        0
                        ? 4
                        : 1,

                      (item.views /
                        maxActivity) *
                        100
                    );

                  const downloadHeight =
                    Math.max(
                      item.downloads >
                        0
                        ? 4
                        : 1,

                      (item.downloads /
                        maxActivity) *
                        100
                    );

                  return (
                    <div
                      key={
                        item.date
                      }
                      className="group relative flex h-full min-w-[22px] flex-1 items-end justify-center gap-1"
                    >
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 hidden w-44 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs shadow-2xl group-hover:block">
                        <p className="font-bold text-white">
                          {formatDate(
                            item.date
                          )}
                        </p>

                        <div className="mt-3 space-y-1.5">
                          <p className="text-slate-400">
                            Views:{" "}
                            <span className="font-semibold text-orange-400">
                              {
                                item.views
                              }
                            </span>
                          </p>

                          <p className="text-slate-400">
                            Article Views:{" "}
                            <span className="font-semibold text-blue-400">
                              {
                                item.articleViews
                              }
                            </span>
                          </p>

                          <p className="text-slate-400">
                            Library Views:{" "}
                            <span className="font-semibold text-green-400">
                              {
                                item.bookViews
                              }
                            </span>
                          </p>

                          <p className="text-slate-400">
                            Downloads:{" "}
                            <span className="font-semibold text-purple-400">
                              {
                                item.downloads
                              }
                            </span>
                          </p>

                          <p className="text-slate-400">
                            New Users:{" "}
                            <span className="font-semibold text-white">
                              {
                                item.newUsers
                              }
                            </span>
                          </p>
                        </div>
                      </div>

                      <div
                        className="w-[45%] rounded-t-md bg-orange-500 transition group-hover:bg-orange-400"
                        style={{
                          height:
                            `${viewHeight}%`,
                        }}
                      />

                      <div
                        className="w-[45%] rounded-t-md bg-purple-500 transition group-hover:bg-purple-400"
                        style={{
                          height:
                            `${downloadHeight}%`,
                        }}
                      />

                      {(index %
                        labelInterval ===
                        0 ||
                        index ===
                          safeTraffic.length -
                            1) && (
                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-600">
                          {formatDate(
                            item.date
                          )}
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Hover over each day
            to see detailed
            activity.
          </div>
        </>
      )}
    </section>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  title,
  items,
}: {
  title: string;

  items: {
    label: string;

    value: number;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-bold text-white">
        {title}
      </h3>

      <div className="mt-5 space-y-4">
        {items.map(
          (item) => (
            <div
              key={
                item.label
              }
              className="flex items-center justify-between gap-5"
            >
              <span className="text-sm text-slate-400">
                {
                  item.label
                }
              </span>

              <span className="font-bold text-white">
                {formatNumber(
                  item.value
                )}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function AnalyticsDashboard() {
const [
  days,
  setDays,
] =
  useAnalyticsRange(
    30
  );
  const [
    data,
    setData,
  ] =
    useState<AnalyticsData | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const exportUrl =
    `/api/admin/analytics/export?days=${days}`;

  /* =====================================================
     FETCH
  ===================================================== */

  const loadAnalytics =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          const response =
            await fetch(
              `/api/admin/analytics?days=${days}`,
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            );

          const result =
            (await response.json()) as
              AnalyticsData & {
                message?: string;
              };

          if (
            !response.ok
          ) {
            throw new Error(
              result.message ||
                "Unable to load analytics"
            );
          }

          setData(
            result
          );
        } catch (
          err
        ) {
          console.error(
            "Analytics load error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load analytics"
          );
        } finally {
          setLoading(
            false
          );
        }
      },

      [days]
    );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  /* =====================================================
     CLIENT-SIDE INSIGHTS
  ===================================================== */

  const insights =
    useMemo(() => {
      if (!data) {
        return [];
      }

      return buildInsights(
        data,
        days
      );
    }, [
      data,
      days,
    ]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading &&
    !data
  ) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-orange-500" />

        <p className="mt-4 text-slate-400">
          Loading PetroHub
          analytics...
        </p>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (
    error &&
    !data
  ) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="font-bold text-red-400">
          Unable to load
          analytics
        </h2>

        <p className="mt-2 text-sm text-red-300">
          {error}
        </p>

        <button
          type="button"
          onClick={
            loadAnalytics
          }
          className="mt-5 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const topArticles =
    data.topArticles ??
    [];

  const topBooks =
    data.topBooks ??
    [];

  const topDownloadedBooks =
    data.topDownloadedBooks ??
    [];

  const topSaved =
    data.topSaved ??
    [];

  const recentUsers =
    data.recentUsers ??
    [];

  const traffic =
    data.traffic ??
    [];

  return (
    <div className="space-y-10">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
            Analytics Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Monitor traffic,
            growth, downloads,
            users and content
            engagement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            ← Dashboard
          </Link>

          <a
            href={
              exportUrl
            }
            className="inline-flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400 hover:bg-green-500/20"
          >
            ↓ Export CSV
          </a>

          <button
            type="button"
            onClick={
              loadAnalytics
            }
            disabled={
              loading
            }
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      {/* =================================================
          RANGE
      ================================================= */}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Reporting Period
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Analytics,
            comparison and smart
            insights use the
            selected period.
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
          {(
            [
              7,
              30,
              90,
            ] as RangeDays[]
          ).map(
            (value) => (
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
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  days ===
                  value
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {value} Days
              </button>
            )
          )}
        </div>
      </section>

      {/* =================================================
          SELECTED PERIOD
      ================================================= */}

      <section>
        <div className="mb-5">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Selected Period
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Last {days} Days
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Traffic Views"
            value={
              data.period.views
            }
            icon="👁"
          />

          <StatCard
            title="Unique Visitors"
            value={
              data.period
                .uniqueVisitors
            }
            icon="🌐"
          />

          <StatCard
            title="Downloads"
            value={
              data.period
                .downloads
            }
            icon="⬇️"
          />

          <StatCard
            title="Unique Downloaders"
            value={
              data.period
                .uniqueDownloaders
            }
            icon="📥"
          />

          <StatCard
            title="Article Views"
            value={
              data.period
                .articleViews
            }
            icon="📝"
          />

          <StatCard
            title="Library Views"
            value={
              data.period
                .bookViews
            }
            icon="📚"
          />

          <StatCard
            title="Logged-in Viewers"
            value={
              data.period
                .loggedInViewers
            }
            subtitle={`${formatNumber(
              data.period
                .loggedInDownloaders
            )} logged-in downloaders`}
            icon="👤"
          />

          <StatCard
            title="New Users"
            value={
              data.period
                .newUsers
            }
            icon="✨"
          />
        </div>
      </section>

      {/* =================================================
          SMART INSIGHTS
      ================================================= */}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Smart Insights
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              What the Data Is
              Telling You
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Automatic observations
              based on your traffic,
              downloads, users and
              content performance.
            </p>
          </div>

          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            {insights.length}{" "}
            Insights
          </span>
        </div>

        {insights.length ===
        0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-sm text-slate-500">
            More analytics data
            is needed before
            insights can be
            generated.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {insights.map(
              (insight) => (
                <InsightCard
                  key={
                    insight.id
                  }
                  insight={
                    insight
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          COMPARISON
      ================================================= */}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-blue-400">
              Growth
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Performance vs
              Previous Period
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Last {days} days
              compared with the
              previous {days} days.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-500">
            Previous period:{" "}
            <span className="font-semibold text-slate-300">
              {formatFullDate(
                data.comparison
                  .previousRange
                  .startDate
              )}
            </span>

            {" → "}

            <span className="font-semibold text-slate-300">
              {formatFullDate(
                data.comparison
                  .previousRange
                  .endDate
              )}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ComparisonCard
            title="Views"
            metric={
              data.comparison
                .views
            }
            icon="👁"
          />

          <ComparisonCard
            title="Unique Visitors"
            metric={
              data.comparison
                .uniqueVisitors
            }
            icon="🌐"
          />

          <ComparisonCard
            title="Downloads"
            metric={
              data.comparison
                .downloads
            }
            icon="⬇️"
          />

          <ComparisonCard
            title="Unique Downloaders"
            metric={
              data.comparison
                .uniqueDownloaders
            }
            icon="📥"
          />

          <ComparisonCard
            title="Article Views"
            metric={
              data.comparison
                .articleViews
            }
            icon="📝"
          />

          <ComparisonCard
            title="Library Views"
            metric={
              data.comparison
                .bookViews
            }
            icon="📚"
          />

          <ComparisonCard
            title="New Users"
            metric={
              data.comparison
                .newUsers
            }
            icon="✨"
          />
        </div>
      </section>

      {/* =================================================
          CHART
      ================================================= */}

      <TrafficChart
        traffic={
          traffic
        }
      />

      {/* =================================================
          ALL TIME
      ================================================= */}

      <section>
        <div className="mb-5">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Platform
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            All-Time Overview
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={
              data.users.total
            }
            subtitle={`${formatNumber(
              data.users.active
            )} active • ${formatNumber(
              data.users.blocked
            )} blocked`}
            icon="👥"
          />

          <StatCard
            title="Articles"
            value={
              data.articles
                .total
            }
            subtitle={`${formatNumber(
              data.articles
                .published
            )} published • ${formatNumber(
              data.articles
                .drafts
            )} drafts`}
            icon="📝"
          />

          <StatCard
            title="Library Resources"
            value={
              data.books.total
            }
            subtitle={`${formatNumber(
              data.books.published
            )} published • ${formatNumber(
              data.books.drafts
            )} drafts`}
            icon="📚"
          />

          <StatCard
            title="Total Views"
            value={
              data.engagement
                .totalViews
            }
            icon="👁"
          />
        </div>
      </section>

      {/* =================================================
          ENGAGEMENT
      ================================================= */}

      <section>
        <h2 className="mb-5 text-2xl font-bold text-white">
          Engagement
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Bookmarks"
            value={
              data.engagement
                .bookmarks
            }
            icon="⭐"
          />

          <StatCard
            title="Reading History"
            value={
              data.engagement
                .historyRecords
            }
            icon="📖"
          />

          <StatCard
            title="All-Time Downloads"
            value={
              data.books
                .downloads
            }
            icon="⬇️"
          />

          <StatCard
            title="Unread Messages"
            value={
              data.messages
                .unread
            }
            subtitle={`${formatNumber(
              data.messages
                .total
            )} total messages`}
            icon="✉️"
          />
        </div>
      </section>

      {/* =================================================
          TOP CONTENT
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Articles
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            Top Articles
          </h2>

          <p className="mt-2 text-xs text-slate-500">
            Most viewed during
            the last {days} days.
          </p>

          <div className="mt-6 space-y-4">
            {topArticles.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
                No article traffic
                recorded yet.
              </div>
            ) : (
              topArticles.map(
                (
                  article,
                  index
                ) => (
                  <div
                    key={
                      article._id
                    }
                    className="flex items-center justify-between gap-5 border-b border-slate-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-orange-500">
                        #
                        {index +
                          1}
                      </p>

                      <Link
                        href={`/articles/${article.slug}`}
                        className="mt-1 block truncate font-semibold text-white hover:text-orange-400"
                      >
                        {
                          article.title
                        }
                      </Link>

                      <p className="mt-1 text-xs text-slate-500">
                        {article.category ||
                          "Article"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-bold text-white">
                        {formatNumber(
                          article.views
                        )}
                      </p>

                      <p className="text-xs text-slate-500">
                        views
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Library
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            Top Resources
          </h2>

          <p className="mt-2 text-xs text-slate-500">
            Most viewed during
            the last {days} days.
          </p>

          <div className="mt-6 space-y-4">
            {topBooks.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
                No library traffic
                recorded yet.
              </div>
            ) : (
              topBooks.map(
                (
                  book,
                  index
                ) => (
                  <div
                    key={
                      book._id
                    }
                    className="flex items-center justify-between gap-5 border-b border-slate-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-orange-500">
                        #
                        {index +
                          1}
                      </p>

                      <Link
                        href={`/library/${book.slug}`}
                        className="mt-1 block truncate font-semibold text-white hover:text-orange-400"
                      >
                        {
                          book.title
                        }
                      </Link>

                      <p className="mt-1 text-xs text-slate-500">
                        {book.category ||
                          book.contentType ||
                          "Resource"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-bold text-white">
                        {formatNumber(
                          book.views
                        )}
                      </p>

                      <p className="text-xs text-slate-500">
                        views
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          TOP DOWNLOADS
      ================================================= */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-purple-400">
              Downloads
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Top Downloaded
              Resources
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Most downloaded
              resources during
              the last {days} days.
            </p>
          </div>

          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300">
            ↓{" "}
            {formatNumber(
              data.period
                .downloads
            )}{" "}
            downloads
          </span>
        </div>

        {topDownloadedBooks.length ===
        0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            No downloads
            recorded yet.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[750px] text-left">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Rank
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Resource
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-right text-xs uppercase text-slate-500">
                    Period
                  </th>

                  <th className="px-5 py-4 text-right text-xs uppercase text-slate-500">
                    All-Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {topDownloadedBooks.map(
                  (
                    book,
                    index
                  ) => (
                    <tr
                      key={
                        book._id
                      }
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4 font-bold text-purple-400">
                        #
                        {index +
                          1}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/library/${book.slug}`}
                          className="font-semibold text-white hover:text-orange-400"
                        >
                          {
                            book.title
                          }
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {book.category ||
                          "-"}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-purple-300">
                        {formatNumber(
                          book.periodDownloads
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-slate-300">
                        {formatNumber(
                          book.totalDownloads
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          MOST SAVED
      ================================================= */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Engagement
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Most Saved Content
            </h2>
          </div>

          <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-400">
            ⭐{" "}
            {formatNumber(
              data.engagement
                .bookmarks
            )}{" "}
            saves
          </span>
        </div>

        {topSaved.length ===
        0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            No bookmarks
            recorded yet.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[750px] text-left">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Rank
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Content
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-right text-xs uppercase text-slate-500">
                    Saves
                  </th>
                </tr>
              </thead>

              <tbody>
                {topSaved.map(
                  (
                    item,
                    index
                  ) => {
                    const href =
                      item.itemType ===
                      "article"
                        ? `/articles/${item.slug}`
                        : `/library/${item.slug}`;

                    return (
                      <tr
                        key={`${item.itemType}-${item.itemId}`}
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4 font-bold text-orange-500">
                          #
                          {index +
                            1}
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={
                              href
                            }
                            className="font-semibold text-white hover:text-orange-400"
                          >
                            {
                              item.title
                            }
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.itemType ===
                              "article"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-green-500/10 text-green-400"
                            }`}
                          >
                            {item.itemType ===
                            "article"
                              ? "Article"
                              : "Library"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {item.category ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-white">
                          {formatNumber(
                            item.saves
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          STATUS
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-3">
        <StatusCard
          title="Users"
          items={[
            {
              label:
                "Active Users",

              value:
                data.users
                  .active,
            },

            {
              label:
                "Blocked Users",

              value:
                data.users
                  .blocked,
            },

            {
              label:
                "Total Users",

              value:
                data.users
                  .total,
            },
          ]}
        />

        <StatusCard
          title="Articles"
          items={[
            {
              label:
                "Published",

              value:
                data.articles
                  .published,
            },

            {
              label:
                "Drafts",

              value:
                data.articles
                  .drafts,
            },

            {
              label:
                "All-Time Views",

              value:
                data.articles
                  .views,
            },
          ]}
        />

        <StatusCard
          title="Library"
          items={[
            {
              label:
                "Published",

              value:
                data.books
                  .published,
            },

            {
              label:
                "All-Time Views",

              value:
                data.books
                  .views,
            },

            {
              label:
                "All-Time Downloads",

              value:
                data.books
                  .downloads,
            },
          ]}
        />
      </section>

      {/* =================================================
          RECENT USERS
      ================================================= */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Community
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Recent Users
            </h2>
          </div>

          <Link
            href="/admin/users"
            className="text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            Manage Users →
          </Link>
        </div>

        {recentUsers.length ===
        0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            No users found.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-4 pr-4">
                    Name
                  </th>

                  <th className="pb-4 pr-4">
                    Email
                  </th>

                  <th className="pb-4 pr-4">
                    Role
                  </th>

                  <th className="pb-4 pr-4">
                    Status
                  </th>

                  <th className="pb-4">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentUsers.map(
                  (user) => (
                    <tr
                      key={
                        user._id
                      }
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="py-4 pr-4 font-semibold text-white">
                        {
                          user.name
                        }
                      </td>

                      <td className="py-4 pr-4 text-slate-400">
                        {
                          user.email
                        }
                      </td>

                      <td className="py-4 pr-4 capitalize text-slate-400">
                        {
                          user.role
                        }
                      </td>

                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            user.isBlocked
                              ? "bg-red-500/10 text-red-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {user.isBlocked
                            ? "Blocked"
                            : "Active"}
                        </span>
                      </td>

                      <td className="py-4 text-slate-400">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}