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

type CategoryAnalyticsData = {
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
   MAIN COMPONENT
========================================================= */

export default function CategoryAnalytics() {
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
    useState<CategoryAnalyticsData | null>(
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
    `/api/admin/analytics/categories/export?days=${days}`;

  /* =====================================================
     FETCH
  ===================================================== */

  const loadData =
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
              `/api/admin/analytics/categories?days=${days}`,
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            );

          const result =
            (await response.json()) as
              CategoryAnalyticsData & {
                message?: string;
              };

          if (
            !response.ok
          ) {
            throw new Error(
              result.message ||
                "Unable to load category analytics"
            );
          }

          setData(
            result
          );
        } catch (
          err
        ) {
          console.error(
            "Category analytics fetch error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load category analytics"
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
    loadData();
  }, [loadData]);

  /* =====================================================
     SAFE DATA
  ===================================================== */

  const categories =
    data?.categories ??
    [];

  const maxScore =
    useMemo(() => {
      if (
        categories.length ===
        0
      ) {
        return 1;
      }

      return Math.max(
        ...categories.map(
          (
            category
          ) =>
            category.score
        ),

        1
      );
    }, [
      categories,
    ]);

  const topCategory =
    categories[0];

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading &&
    !data
  ) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex min-h-52 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-800 border-t-orange-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading category
              analytics...
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
          Category Analytics
          Error
        </h2>

        <p className="mt-3 text-sm text-red-300">
          {error}
        </p>

        <button
          type="button"
          onClick={
            loadData
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
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Category Analytics
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Engineering Category
              Performance
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Compare HSE, Oil &
              Gas, Mechanical,
              Electrical and other
              categories using
              views, downloads,
              saves and published
              content.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* =============================================
                EXPORT
            ============================================= */}

            <a
              href={
                exportUrl
              }
              className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm font-bold text-green-400 transition hover:bg-green-500/20"
            >
              ↓ Export CSV
            </a>

            {/* =============================================
                RANGE
            ============================================= */}

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
                        ? "bg-orange-500 text-white"
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

        {/* =================================================
            TOP CATEGORY
        ================================================= */}

        {topCategory && (
          <div className="mt-7 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                  #1 Category
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  {
                    topCategory.category
                  }
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Highest overall
                  engagement score
                  during the last{" "}
                  {days} days.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-950 px-4 py-3">
                  <p className="text-lg font-bold text-white">
                    {formatNumber(
                      topCategory.views
                    )}
                  </p>

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Views
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 px-4 py-3">
                  <p className="text-lg font-bold text-purple-400">
                    {formatNumber(
                      topCategory.downloads
                    )}
                  </p>

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Downloads
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 px-4 py-3">
                  <p className="text-lg font-bold text-yellow-400">
                    {formatNumber(
                      topCategory.bookmarks
                    )}
                  </p>

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Saves
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Categories"
          value={
            data.summary
              .categories
          }
          subtitle={`${formatNumber(
            data.summary
              .totalContent
          )} published content items`}
          icon="🗂️"
        />

        <SummaryCard
          title="Category Views"
          value={
            data.summary
              .views
          }
          subtitle={`${formatNumber(
            data.summary
              .articleViews
          )} article • ${formatNumber(
            data.summary
              .bookViews
          )} library`}
          icon="👁"
        />

        <SummaryCard
          title="Downloads"
          value={
            data.summary
              .downloads
          }
          subtitle={`Last ${days} days`}
          icon="⬇️"
        />

        <SummaryCard
          title="New Saves"
          value={
            data.summary
              .bookmarks
          }
          subtitle={`Bookmarks created during the last ${days} days`}
          icon="⭐"
        />
      </div>

      {/* =================================================
          PERFORMANCE
      ================================================= */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <div>
          <p className="font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Ranking
          </p>

          <h3 className="mt-2 text-xl font-bold text-white">
            Category Engagement
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Score gives extra
            weight to downloads
            and bookmarks because
            they represent stronger
            user engagement.
          </p>
        </div>

        {categories.length ===
        0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">
            No category data
            available yet.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {categories.map(
              (
                category,
                index
              ) => {
                const width =
                  category.score >
                  0
                    ? Math.max(
                        (
                          category.score /
                          maxScore
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
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-orange-400">
                          #
                          {index +
                            1}
                        </span>

                        {category.category ===
                        "Uncategorized" ? (
                          <span className="font-semibold text-white">
                            {
                              category.category
                            }
                          </span>
                        ) : (
                          <Link
                            href={`/categories/${slug}`}
                            className="font-semibold text-white transition hover:text-orange-400"
                          >
                            {
                              category.category
                            }
                          </Link>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
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
                          ⭐{" "}
                          {formatNumber(
                            category.bookmarks
                          )}
                        </span>

                        <span>
                          Score{" "}
                          <strong className="text-slate-300">
                            {formatNumber(
                              category.score
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-950">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 transition-all duration-500"
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
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Detailed Breakdown
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Category Statistics
            </h3>
          </div>

          <a
            href={
              exportUrl
            }
            className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400 transition hover:bg-green-500/20"
          >
            ↓ Download {days}-Day Report
          </a>
        </div>

        {categories.length >
          0 && (
          <div className="mt-7 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-slate-800 bg-slate-950/70">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rank
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Articles
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Resources
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Views
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Downloads
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Saves
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Score
                  </th>
                </tr>
              </thead>

              <tbody>
                {categories.map(
                  (
                    category,
                    index
                  ) => {
                    const slug =
                      categorySlug(
                        category.category
                      );

                    return (
                      <tr
                        key={
                          category.category
                        }
                        className="border-b border-slate-800 transition last:border-0 hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4 font-bold text-orange-500">
                          #
                          {index +
                            1}
                        </td>

                        <td className="px-5 py-4">
                          {category.category ===
                          "Uncategorized" ? (
                            <span className="font-semibold text-white">
                              {
                                category.category
                              }
                            </span>
                          ) : (
                            <Link
                              href={`/categories/${slug}`}
                              className="font-semibold text-white hover:text-orange-400"
                            >
                              {
                                category.category
                              }
                            </Link>
                          )}

                          <p className="mt-1 text-xs text-slate-500">
                            {formatNumber(
                              category.totalContent
                            )}{" "}
                            published items
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right text-slate-300">
                          {formatNumber(
                            category.articles
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-slate-300">
                          {formatNumber(
                            category.resources
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-white">
                            {formatNumber(
                              category.views
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-600">
                            {formatNumber(
                              category.articleViews
                            )}{" "}
                            article /{" "}
                            {formatNumber(
                              category.bookViews
                            )}{" "}
                            library
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-purple-400">
                          {formatNumber(
                            category.downloads
                          )}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-yellow-400">
                          {formatNumber(
                            category.bookmarks
                          )}
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-cyan-400">
                          {formatNumber(
                            category.score
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

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-5 text-slate-500">
          <strong className="text-slate-300">
            Engagement score:
          </strong>{" "}
          Views × 1 +
          Downloads × 3 +
          Saves × 2.
          Published content counts
          are current totals, while
          views, downloads and saves
          use the selected reporting
          period.
        </div>
      </div>
    </section>
  );
}