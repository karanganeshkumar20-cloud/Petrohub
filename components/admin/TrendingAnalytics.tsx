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

type TrendStatus =
  | "up"
  | "down"
  | "same"
  | "new";

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

type TrendingData = {
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

function categorySlug(
  category: string
) {
  return category
    .trim()
    .toLowerCase()
    .replace(
      /&/g,
      " "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

/* =========================================================
   TREND BADGE
========================================================= */

function TrendBadge({
  trend,
  growthPercent,
}: {
  trend:
    TrendStatus;

  growthPercent:
    | number
    | null;
}) {
  if (
    trend === "new"
  ) {
    return (
      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
        ✨ New
      </span>
    );
  }

  if (
    trend === "up"
  ) {
    return (
      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
        ↑{" "}
        {Math.abs(
          growthPercent ??
            0
        )}
        %
      </span>
    );
  }

  if (
    trend === "down"
  ) {
    return (
      <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
        ↓{" "}
        {Math.abs(
          growthPercent ??
            0
        )}
        %
      </span>
    );
  }

  return (
    <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-slate-400">
      No change
    </span>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
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
   MAIN
========================================================= */

export default function TrendingAnalytics() {
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
    useState<TrendingData | null>(
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
    `/api/admin/analytics/trending/export?days=${days}`;

  /* =====================================================
     LOAD
  ===================================================== */

  const loadTrending =
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
              `/api/admin/analytics/trending?days=${days}`,
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            );

          const result =
            (await response.json()) as
              TrendingData & {
                message?: string;
              };

          if (
            !response.ok
          ) {
            throw new Error(
              result.message ||
                "Unable to load trending analytics"
            );
          }

          setData(
            result
          );
        } catch (
          err
        ) {
          console.error(
            "Trending analytics error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load trending analytics"
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
    loadTrending();
  }, [loadTrending]);

  /* =====================================================
     SAFE DATA
  ===================================================== */

  const trendingContent =
    data?.trendingContent ??
    [];

  const trendingCategories =
    data?.trendingCategories ??
    [];

  const maxCategoryScore =
    useMemo(() => {
      if (
        trendingCategories.length ===
        0
      ) {
        return 1;
      }

      return Math.max(
        ...trendingCategories.map(
          (
            category
          ) =>
            category.momentumScore
        ),

        1
      );
    }, [
      trendingCategories,
    ]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading &&
    !data
  ) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-800 border-t-pink-500" />

            <p className="mt-4 text-sm text-slate-400">
              Calculating
              trends...
            </p>
          </div>
        </div>
      </section>
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
      <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
        <h2 className="text-xl font-bold text-red-400">
          Trending Analytics
          Error
        </h2>

        <p className="mt-3 text-sm text-red-300">
          {error}
        </p>

        <button
          type="button"
          onClick={
            loadTrending
          }
          className="mt-5 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="space-y-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-pink-400">
              Momentum
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Trending Content &
              Categories
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Discover articles,
              resources and
              engineering
              categories gaining
              momentum compared
              with the previous
              equal period.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* EXPORT */}

            <a
              href={
                exportUrl
              }
              className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm font-bold text-green-400 transition hover:bg-green-500/20"
            >
              ↓ Export CSV
            </a>

            {/* RANGE */}

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
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      days ===
                      value
                        ? "bg-pink-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {value} Days
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Active Content"
          value={
            data.summary
              .trackedContent
          }
          subtitle={`Content with activity in the last ${days} days`}
          icon="🔥"
        />

        <SummaryCard
          title="Rising Content"
          value={
            data.summary
              .risingContent
          }
          subtitle="Growing or newly active content"
          icon="📈"
        />

        <SummaryCard
          title="Declining Content"
          value={
            data.summary
              .decliningContent
          }
          subtitle="Lower momentum than previous period"
          icon="📉"
        />

        <SummaryCard
          title="Trending Categories"
          value={
            data.summary
              .trendingCategories
          }
          subtitle={`${formatNumber(
            data.summary.views
          )} views • ${formatNumber(
            data.summary.downloads
          )} downloads`}
          icon="🗂️"
        />
      </div>

      {/* =================================================
          TOP TRENDING CONTENT
      ================================================= */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-pink-400">
              Trending
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Top Trending
              Content
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Ranking combines
              recent views,
              downloads and
              performance versus
              the previous{" "}
              {days}-day period.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {trendingContent[0] && (
              <span className="max-w-md truncate rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-xs font-bold text-pink-400">
                🔥 #1{" "}
                {
                  trendingContent[0]
                    .title
                }
              </span>
            )}

            <a
              href={
                exportUrl
              }
              className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400 transition hover:bg-green-500/20"
            >
              ↓ {days}-Day Report
            </a>
          </div>
        </div>

        {trendingContent.length ===
        0 ? (
          <div className="mt-7 rounded-xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">
            No trending
            activity recorded
            yet.
          </div>
        ) : (
          <div className="mt-7 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-slate-800 bg-slate-950/70">
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

                  <th className="px-5 py-4 text-right text-xs uppercase text-slate-500">
                    Views
                  </th>

                  <th className="px-5 py-4 text-right text-xs uppercase text-slate-500">
                    Downloads
                  </th>

                  <th className="px-5 py-4 text-right text-xs uppercase text-slate-500">
                    Engagement
                  </th>

                  <th className="px-5 py-4 text-center text-xs uppercase text-slate-500">
                    Trend
                  </th>

                  <th className="px-5 py-4 text-right text-xs uppercase text-slate-500">
                    Momentum
                  </th>
                </tr>
              </thead>

              <tbody>
                {trendingContent.map(
                  (
                    item
                  ) => {
                    const href =
                      item.itemType ===
                      "article"
                        ? `/articles/${item.slug}`
                        : `/library/${item.slug}`;

                    return (
                      <tr
                        key={`${item.itemType}-${item.itemId}`}
                        className="border-b border-slate-800 transition last:border-0 hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`font-bold ${
                              item.rank ===
                              1
                                ? "text-pink-400"
                                : item.rank <=
                                    3
                                  ? "text-orange-400"
                                  : "text-slate-400"
                            }`}
                          >
                            #
                            {
                              item.rank
                            }
                          </span>
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

                          <p className="mt-1 text-xs text-slate-500">
                            {
                              item.category
                            }
                          </p>
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

                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-white">
                            {formatNumber(
                              item.views
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-600">
                            Previous{" "}
                            {formatNumber(
                              item.previousViews
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-purple-400">
                            {formatNumber(
                              item.downloads
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-600">
                            Previous{" "}
                            {formatNumber(
                              item.previousDownloads
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-cyan-400">
                            {formatNumber(
                              item.currentEngagement
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-600">
                            Previous{" "}
                            {formatNumber(
                              item.previousEngagement
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <TrendBadge
                            trend={
                              item.trend
                            }
                            growthPercent={
                              item.growthPercent
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-pink-400">
                          {formatNumber(
                            item.momentumScore
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
      </div>

      {/* =================================================
          TRENDING CATEGORIES
      ================================================= */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Categories
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Trending
              Engineering
              Categories
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Category momentum
              based on views,
              downloads and
              period-over-period
              growth.
            </p>
          </div>

          <a
            href={
              exportUrl
            }
            className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400 transition hover:bg-green-500/20"
          >
            ↓ Export Trending Data
          </a>
        </div>

        {trendingCategories.length ===
        0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">
            No category trend
            data available yet.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {trendingCategories.map(
              (
                category
              ) => {
                const width =
                  category.momentumScore >
                  0
                    ? Math.max(
                        (
                          category.momentumScore /
                          maxCategoryScore
                        ) *
                          100,
                        2
                      )
                    : 0;

                const slug =
                  categorySlug(
                    category.category
                  );

                return (
                  <div
                    key={
                      category.category
                    }
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-pink-400">
                          #
                          {
                            category.rank
                          }
                        </span>

                        {category.category ===
                        "Uncategorized" ? (
                          <span className="font-bold text-white">
                            {
                              category.category
                            }
                          </span>
                        ) : (
                          <Link
                            href={`/categories/${slug}`}
                            className="font-bold text-white hover:text-orange-400"
                          >
                            {
                              category.category
                            }
                          </Link>
                        )}

                        <TrendBadge
                          trend={
                            category.trend
                          }
                          growthPercent={
                            category.growthPercent
                          }
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>
                          👁{" "}
                          {formatNumber(
                            category.views
                          )}
                        </span>

                        <span>
                          ↓{" "}
                          {formatNumber(
                            category.downloads
                          )}
                        </span>

                        <span>
                          📄{" "}
                          {formatNumber(
                            category.activeContent
                          )}{" "}
                          active
                        </span>

                        <span>
                          Momentum{" "}
                          <strong className="text-pink-400">
                            {formatNumber(
                              category.momentumScore
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-950">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 transition-all duration-500"
                        style={{
                          width:
                            `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        <div className="mt-7 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300">
            Trending logic:
          </strong>{" "}
          views contribute
          1 engagement point and
          downloads contribute
          3 points. Momentum also
          compares current
          engagement with the
          previous equal calendar
          period.
        </div>
      </div>
    </section>
  );
}