"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type GoalMetric =
  | "users"
  | "views"
  | "downloads"
  | "bookmarks";

type GoalStatus =
  | "not_set"
  | "achieved"
  | "on_track"
  | "behind";

type GoalItem = {
  metric: GoalMetric;

  label: string;

  target: number;

  current: number;

  remaining: number;

  progressPercent: number;

  projected: number;

  projectedPercent: number;

  status: GoalStatus;
};

type GoalsResponse = {
  success: boolean;

  message?: string;

  period: {
    type: "monthly";

    startDate: string;

    endDate: string;

    generatedAt: string;

    daysElapsed: number;

    daysInMonth: number;

    daysRemaining: number;
  };

  summary: {
    configured: number;

    achieved: number;

    onTrack: number;

    behind: number;
  };

  goals: GoalItem[];
};

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

  views: number;

  previousViews: number;

  downloads: number;

  previousDownloads: number;

  currentEngagement: number;

  previousEngagement: number;

  growthPercent:
    | number
    | null;

  trend: TrendStatus;

  momentumScore: number;
};

type TrendingResponse = {
  success: boolean;

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
};

type AlertSeverity =
  | "critical"
  | "warning"
  | "success"
  | "info";

type AlertItem = {
  id: string;

  severity:
    AlertSeverity;

  icon: string;

  title: string;

  message: string;

  action: string;

  metric?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(
  value: number
) {
  return value.toLocaleString(
    "en-IN"
  );
}

function getSeverityStyles(
  severity:
    AlertSeverity
) {
  switch (
    severity
  ) {
    case "critical":
      return {
        border:
          "border-red-500/30",

        background:
          "bg-red-500/10",

        iconBackground:
          "bg-red-500/15",

        title:
          "text-red-400",

        badge:
          "border-red-500/30 bg-red-500/10 text-red-400",

        badgeLabel:
          "Critical",
      };

    case "warning":
      return {
        border:
          "border-amber-500/30",

        background:
          "bg-amber-500/10",

        iconBackground:
          "bg-amber-500/15",

        title:
          "text-amber-400",

        badge:
          "border-amber-500/30 bg-amber-500/10 text-amber-400",

        badgeLabel:
          "Attention",
      };

    case "success":
      return {
        border:
          "border-green-500/30",

        background:
          "bg-green-500/10",

        iconBackground:
          "bg-green-500/15",

        title:
          "text-green-400",

        badge:
          "border-green-500/30 bg-green-500/10 text-green-400",

        badgeLabel:
          "Good",
      };

    default:
      return {
        border:
          "border-cyan-500/30",

        background:
          "bg-cyan-500/10",

        iconBackground:
          "bg-cyan-500/15",

        title:
          "text-cyan-400",

        badge:
          "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",

        badgeLabel:
          "Info",
      };
  }
}

function calculateRequiredDaily(
  remaining: number,
  daysRemaining: number
) {
  if (
    remaining <= 0
  ) {
    return 0;
  }

  if (
    daysRemaining <= 0
  ) {
    return remaining;
  }

  return Math.ceil(
    remaining /
      daysRemaining
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AnalyticsAlerts() {
  const [
    goals,
    setGoals,
  ] =
    useState<
      GoalsResponse |
      null
    >(
      null
    );

  const [
    trending,
    setTrending,
  ] =
    useState<
      TrendingResponse |
      null
    >(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    error,
    setError,
  ] =
    useState(
      ""
    );

  /* =====================================================
     LOAD
  ===================================================== */

  const loadAlerts =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          const [
            goalsResponse,
            trendingResponse,
          ] =
            await Promise.all([
              fetch(
                "/api/admin/analytics/goals",
                {
                  cache:
                    "no-store",
                }
              ),

              fetch(
                "/api/admin/analytics/trending?days=30",
                {
                  cache:
                    "no-store",
                }
              ),
            ]);

          if (
            !goalsResponse.ok
          ) {
            throw new Error(
              "Unable to load KPI goals."
            );
          }

          if (
            !trendingResponse.ok
          ) {
            throw new Error(
              "Unable to load trending analytics."
            );
          }

          const goalsResult =
            (await goalsResponse.json()) as
              GoalsResponse;

          const trendingResult =
            (await trendingResponse.json()) as
              TrendingResponse;

          if (
            !goalsResult.success
          ) {
            throw new Error(
              goalsResult.message ??
                "Unable to load KPI goals."
            );
          }

          if (
            !trendingResult.success
          ) {
            throw new Error(
              "Unable to load trending analytics."
            );
          }

          setGoals(
            goalsResult
          );

          setTrending(
            trendingResult
          );
        } catch (
          loadError
        ) {
          console.error(
            "Analytics alerts error:",
            loadError
          );

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load analytics alerts."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(
    () => {
      void loadAlerts();
    },
    [
      loadAlerts,
    ]
  );

  /* =====================================================
     BUILD ALERTS
  ===================================================== */

  const alerts =
    useMemo<
      AlertItem[]
    >(
      () => {
        if (
          !goals ||
          !trending
        ) {
          return [];
        }

        const result:
          AlertItem[] =
          [];

        /* =================================================
           KPI ALERTS
        ================================================= */

        goals.goals.forEach(
          (
            goal
          ) => {
            /*
              Skip disabled goals.
            */

            if (
              goal.target <=
              0
            ) {
              return;
            }

            const requiredDaily =
              calculateRequiredDaily(
                goal.remaining,
                goals.period
                  .daysRemaining
              );

            /* ===============================================
               ACHIEVED
            =============================================== */

            if (
              goal.status ===
              "achieved"
            ) {
              result.push({
                id:
                  `goal-achieved-${goal.metric}`,

                severity:
                  "success",

                icon:
                  "🏆",

                title:
                  `${goal.label} target achieved`,

                message:
                  `${formatNumber(
                    goal.current
                  )} achieved against a monthly target of ${formatNumber(
                    goal.target
                  )}.`,

                action:
                  "Maintain the current performance and consider increasing next month's target.",

                metric:
                  goal.label,
              });

              return;
            }

            /* ===============================================
               CRITICAL
            =============================================== */

            if (
              goal.status ===
                "behind" &&
              goal.projectedPercent <
                70
            ) {
              result.push({
                id:
                  `goal-critical-${goal.metric}`,

                severity:
                  "critical",

                icon:
                  "🚨",

                title:
                  `${goal.label} significantly behind target`,

                message:
                  `Current progress is ${goal.progressPercent}% and month-end projection is only ${goal.projectedPercent}% of target.`,

                action:
                  requiredDaily >
                  0
                    ? `Approximately ${formatNumber(
                        requiredDaily
                      )} additional ${goal.label.toLowerCase()} per remaining day are required to reach the target.`
                    : "Review the target and current performance immediately.",

                metric:
                  goal.label,
              });

              return;
            }

            /* ===============================================
               WARNING
            =============================================== */

            if (
              goal.status ===
              "behind"
            ) {
              result.push({
                id:
                  `goal-warning-${goal.metric}`,

                severity:
                  "warning",

                icon:
                  "⚠️",

                title:
                  `${goal.label} behind target`,

                message:
                  `${formatNumber(
                    goal.remaining
                  )} remaining to reach the monthly goal. Current month-end projection is ${formatNumber(
                    goal.projected
                  )}.`,

                action:
                  requiredDaily >
                  0
                    ? `Aim for at least ${formatNumber(
                        requiredDaily
                      )} per day during the remaining ${goals.period.daysRemaining} days.`
                    : "Review current performance before month end.",

                metric:
                  goal.label,
              });

              return;
            }

            /* ===============================================
               ON TRACK
            =============================================== */

            if (
              goal.status ===
              "on_track"
            ) {
              result.push({
                id:
                  `goal-track-${goal.metric}`,

                severity:
                  "info",

                icon:
                  "🎯",

                title:
                  `${goal.label} is on track`,

                message:
                  `Current progress is ${goal.progressPercent}% with a projected month-end result of ${formatNumber(
                    goal.projected
                  )}.`,

                action:
                  "Maintain the current pace to reach the monthly goal.",

                metric:
                  goal.label,
              });
            }
          }
        );

        /* =================================================
           TRENDING CONTENT
        ================================================= */

        const fastGrowing =
          trending.trendingContent.find(
            (
              item
            ) =>
              (
                item.trend ===
                  "up" ||
                item.trend ===
                  "new"
              ) &&
              item.currentEngagement >
                0
          );

        if (
          fastGrowing
        ) {
          result.push({
            id:
              `trending-up-${fastGrowing.itemId}`,

            severity:
              "success",

            icon:
              "🔥",

            title:
              "High-momentum content detected",

            message:
              `"${fastGrowing.title}" is currently one of the strongest performing items with ${formatNumber(
                fastGrowing.currentEngagement
              )} engagement points.`,

            action:
              "Consider featuring, updating or promoting this content while engagement is strong.",

            metric:
              fastGrowing.category,
          });
        }

        /* =================================================
           DECLINING CONTENT
        ================================================= */

        const declining =
          trending.trendingContent
            .filter(
              (
                item
              ) =>
                item.trend ===
                  "down" &&
                item.previousEngagement >
                  0
            )
            .sort(
              (
                first,
                second
              ) =>
                second.previousEngagement -
                first.previousEngagement
            )[0];

        if (
          declining
        ) {
          result.push({
            id:
              `trending-down-${declining.itemId}`,

            severity:
              "warning",

            icon:
              "📉",

            title:
              "Previously active content is declining",

            message:
              `"${declining.title}" has lower engagement than the previous equal period.`,

            action:
              "Review the title, thumbnail, SEO, internal links and content freshness.",

            metric:
              declining.category,
          });
        }

        /* =================================================
           DOWNLOAD ACTIVITY
        ================================================= */

        if (
          trending.summary.views >
            0 &&
          trending.summary.downloads ===
            0
        ) {
          result.push({
            id:
              "downloads-zero",

            severity:
              "warning",

            icon:
              "⬇️",

            title:
              "Views recorded but no downloads",

            message:
              `${formatNumber(
                trending.summary.views
              )} tracked views were recorded while download activity remained zero for the selected trending period.`,

            action:
              "Review downloadable resources, CTA visibility and whether users can easily identify downloadable content.",
          });
        }

        /* =================================================
           NO TARGETS
        ================================================= */

        if (
          goals.summary
            .configured ===
          0
        ) {
          result.push({
            id:
              "targets-not-configured",

            severity:
              "info",

            icon:
              "🎯",

            title:
              "Monthly KPI targets are not configured",

            message:
              "Without KPI targets, PetroHub can report activity but cannot measure progress against monthly growth goals.",

            action:
              "Use Set Targets in the Monthly KPI Targets section to define realistic goals.",
          });
        }

        /* =================================================
           ORDER
        ================================================= */

        const priority:
          Record<
            AlertSeverity,
            number
          > = {
            critical:
              1,

            warning:
              2,

            info:
              3,

            success:
              4,
          };

        return result
          .sort(
            (
              first,
              second
            ) =>
              priority[
                first.severity
              ] -
              priority[
                second.severity
              ]
          )
          .slice(
            0,
            10
          );
      },
      [
        goals,
        trending,
      ]
    );

  /* =====================================================
     COUNTS
  ===================================================== */

  const counts =
    useMemo(
      () => {
        return {
          critical:
            alerts.filter(
              (
                alert
              ) =>
                alert.severity ===
                "critical"
            ).length,

          warning:
            alerts.filter(
              (
                alert
              ) =>
                alert.severity ===
                "warning"
            ).length,

          success:
            alerts.filter(
              (
                alert
              ) =>
                alert.severity ===
                "success"
            ).length,

          info:
            alerts.filter(
              (
                alert
              ) =>
                alert.severity ===
                "info"
            ).length,
        };
      },
      [
        alerts,
      ]
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {
    return (
      <section className="mb-14 rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-800" />

          <div>
            <div className="h-5 w-52 animate-pulse rounded bg-slate-800" />

            <div className="mt-3 h-3 w-72 animate-pulse rounded bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (
    error
  ) {
    return (
      <section className="mb-14 rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-bold text-red-400">
          Analytics Action Center
          unavailable
        </p>

        <p className="mt-2 text-sm text-red-300">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            void loadAlerts()
          }
          className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section
      id="action-center"
      className="mb-14 scroll-mt-32"
    >
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="border-b border-slate-800 bg-gradient-to-r from-red-500/5 via-slate-900 to-orange-500/5 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-2xl">
                🚦
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">
                  Smart Monitoring
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Analytics Alerts
                  & Action Center
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Automatically
                  highlights KPI risks,
                  positive performance
                  and content momentum
                  that may require
                  admin attention.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadAlerts()
              }
              className="self-start rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-orange-500/40 hover:text-white lg:self-auto"
            >
              ↻ Refresh Alerts
            </button>
          </div>

          {/* =================================================
              COUNTS
          ================================================= */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-xs text-red-300">
                Critical
              </p>

              <p className="mt-1 text-2xl font-black text-red-400">
                {
                  counts.critical
                }
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs text-amber-300">
                Attention
              </p>

              <p className="mt-1 text-2xl font-black text-amber-400">
                {
                  counts.warning
                }
              </p>
            </div>

            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-xs text-green-300">
                Positive
              </p>

              <p className="mt-1 text-2xl font-black text-green-400">
                {
                  counts.success
                }
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="text-xs text-cyan-300">
                Information
              </p>

              <p className="mt-1 text-2xl font-black text-cyan-400">
                {
                  counts.info
                }
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        <div className="p-6 md:p-8">
          {alerts.length ===
          0 ? (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center">
              <div className="text-4xl">
                ✅
              </div>

              <h3 className="mt-4 text-lg font-bold text-green-400">
                No immediate
                analytics alerts
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                No significant KPI
                warnings or analytics
                issues were identified
                from the currently
                available data.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {alerts.map(
                (
                  alert
                ) => {
                  const styles =
                    getSeverityStyles(
                      alert.severity
                    );

                  return (
                    <article
                      key={
                        alert.id
                      }
                      className={`rounded-2xl border ${styles.border} ${styles.background} p-5`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBackground} text-xl`}
                        >
                          {
                            alert.icon
                          }
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3
                              className={`font-bold ${styles.title}`}
                            >
                              {
                                alert.title
                              }
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${styles.badge}`}
                            >
                              {
                                styles.badgeLabel
                              }
                            </span>
                          </div>

                          <p className="mt-3 text-xs leading-5 text-slate-400">
                            {
                              alert.message
                            }
                          </p>

                          <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                              Recommended
                              Action
                            </p>

                            <p className="mt-2 text-xs leading-5 text-slate-300">
                              {
                                alert.action
                              }
                            </p>
                          </div>

                          {alert.metric && (
                            <p className="mt-3 text-[10px] font-semibold text-slate-600">
                              Related:{" "}
                              {
                                alert.metric
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <div className="border-t border-slate-800 bg-slate-950/40 p-4">
          <p className="text-center text-[10px] leading-5 text-slate-600">
            Recommendations are
            deterministic suggestions
            based on currently tracked
            PetroHub analytics and KPI
            targets. They are not
            forecasts of guaranteed
            future performance.
          </p>
        </div>
      </div>
    </section>
  );
}