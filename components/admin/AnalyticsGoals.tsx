"use client";

import {
  useEffect,
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
  success: true;

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

type ErrorResponse = {
  success: false;

  message?: string;
};

type GoalForm = {
  users: string;

  views: string;

  downloads: string;

  bookmarks: string;
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

function formatMonth(
  value: string
) {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month:
        "long",

      year:
        "numeric",

      timeZone:
        "UTC",
    }
  );
}

function getMetricIcon(
  metric:
    GoalMetric
) {
  switch (
    metric
  ) {
    case "users":
      return "👥";

    case "views":
      return "👁️";

    case "downloads":
      return "⬇️";

    case "bookmarks":
      return "🔖";

    default:
      return "🎯";
  }
}

function getStatusInfo(
  status:
    GoalStatus
) {
  switch (
    status
  ) {
    case "achieved":
      return {
        label:
          "Target Achieved",

        className:
          "border-green-500/30 bg-green-500/10 text-green-400",
      };

    case "on_track":
      return {
        label:
          "On Track",

        className:
          "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
      };

    case "behind":
      return {
        label:
          "Behind Target",

        className:
          "border-amber-500/30 bg-amber-500/10 text-amber-400",
      };

    default:
      return {
        label:
          "Target Not Set",

        className:
          "border-slate-700 bg-slate-800 text-slate-400",
      };
  }
}

function getMetricAccent(
  metric:
    GoalMetric
) {
  switch (
    metric
  ) {
    case "users":
      return {
        text:
          "text-blue-400",

        bar:
          "bg-blue-500",

        box:
          "border-blue-500/20 bg-blue-500/10",
      };

    case "views":
      return {
        text:
          "text-orange-400",

        bar:
          "bg-orange-500",

        box:
          "border-orange-500/20 bg-orange-500/10",
      };

    case "downloads":
      return {
        text:
          "text-purple-400",

        bar:
          "bg-purple-500",

        box:
          "border-purple-500/20 bg-purple-500/10",
      };

    case "bookmarks":
      return {
        text:
          "text-green-400",

        bar:
          "bg-green-500",

        box:
          "border-green-500/20 bg-green-500/10",
      };

    default:
      return {
        text:
          "text-slate-400",

        bar:
          "bg-slate-500",

        box:
          "border-slate-700 bg-slate-800",
      };
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AnalyticsGoals() {
  const [
    data,
    setData,
  ] =
    useState<
      GoalsResponse |
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
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  const [
    editing,
    setEditing,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState(
      ""
    );

  const [
    success,
    setSuccess,
  ] =
    useState(
      ""
    );

  const [
    form,
    setForm,
  ] =
    useState<GoalForm>(
      {
        users:
          "0",

        views:
          "0",

        downloads:
          "0",

        bookmarks:
          "0",
      }
    );

  /* =====================================================
     LOAD GOALS
  ===================================================== */

  async function loadGoals() {
    try {
      setLoading(
        true
      );

      setError(
        ""
      );

      const response =
        await fetch(
          "/api/admin/analytics/goals",
          {
            method:
              "GET",

            cache:
              "no-store",
          }
        );

      const result =
        (await response.json()) as
          | GoalsResponse
          | ErrorResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          "message" in
            result
            ? result.message ??
                "Unable to load KPI targets."
            : "Unable to load KPI targets."
        );
      }

      setData(
        result
      );

      const targetMap:
        Record<
          GoalMetric,
          number
        > = {
          users:
            0,

          views:
            0,

          downloads:
            0,

          bookmarks:
            0,
        };

      result.goals.forEach(
        (
          goal
        ) => {
          targetMap[
            goal.metric
          ] =
            goal.target;
        }
      );

      setForm(
        {
          users:
            String(
              targetMap.users
            ),

          views:
            String(
              targetMap.views
            ),

          downloads:
            String(
              targetMap.downloads
            ),

          bookmarks:
            String(
              targetMap.bookmarks
            ),
        }
      );
    } catch (
      loadError
    ) {
      console.error(
        "Analytics goals load error:",
        loadError
      );

      setError(
        loadError instanceof
          Error
          ? loadError.message
          : "Unable to load KPI targets."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(
    () => {
      void loadGoals();
    },
    []
  );

  /* =====================================================
     INPUT
  ===================================================== */

  function updateField(
    metric:
      GoalMetric,

    value:
      string
  ) {
    /*
      Allow blank while editing.
    */

    if (
      value !==
        "" &&
      !/^\d+$/.test(
        value
      )
    ) {
      return;
    }

    setForm(
      (
        previous
      ) => ({
        ...previous,

        [metric]:
          value,
      })
    );
  }

  /* =====================================================
     SAVE
  ===================================================== */

  async function saveGoals() {
    try {
      setSaving(
        true
      );

      setError(
        ""
      );

      setSuccess(
        ""
      );

      const payload = {
        users:
          Number(
            form.users ||
              0
          ),

        views:
          Number(
            form.views ||
              0
          ),

        downloads:
          Number(
            form.downloads ||
              0
          ),

        bookmarks:
          Number(
            form.bookmarks ||
              0
          ),
      };

      const response =
        await fetch(
          "/api/admin/analytics/goals",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        (await response.json()) as
          | {
              success:
                true;

              message?:
                string;
            }
          | ErrorResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          "message" in
            result
            ? result.message ??
                "Unable to save KPI targets."
            : "Unable to save KPI targets."
        );
      }

      setSuccess(
        result.message ??
          "Monthly KPI targets updated successfully."
      );

      setEditing(
        false
      );

      await loadGoals();
    } catch (
      saveError
    ) {
      console.error(
        "Analytics goals save error:",
        saveError
      );

      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Unable to save KPI targets."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading &&
    !data
  ) {
    return (
      <section className="mb-14 rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-800" />

          <div>
            <div className="h-5 w-48 animate-pulse rounded bg-slate-800" />

            <div className="mt-3 h-3 w-72 animate-pulse rounded bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  /* =====================================================
     FAILED LOAD
  ===================================================== */

  if (
    !data
  ) {
    return (
      <section className="mb-14 rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="font-bold text-red-400">
          Unable to load Monthly KPI
          Targets
        </p>

        <p className="mt-2 text-sm text-red-300">
          {error ||
            "Analytics goals API returned no data."}
        </p>

        <button
          type="button"
          onClick={() =>
            void loadGoals()
          }
          className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
      </section>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section
      id="goals"
      className="mb-14 scroll-mt-32"
    >
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="border-b border-slate-800 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-2xl">
                🎯
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                  Performance Goals
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Monthly KPI Targets
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Track monthly new
                  users, tracked
                  views, downloads
                  and saves against
                  configured growth
                  targets.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void loadGoals()
                }
                disabled={
                  loading ||
                  saving
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
              >
                ↻ Refresh
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(
                    (
                      current
                    ) =>
                      !current
                  );

                  setError(
                    ""
                  );

                  setSuccess(
                    ""
                  );
                }}
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                {editing
                  ? "Cancel"
                  : "⚙ Set Targets"}
              </button>
            </div>
          </div>

          {/* PERIOD */}

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-400">
              🗓{" "}
              {formatMonth(
                data.period
                  .startDate
              )}
            </span>

            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
              {data.period
                .daysElapsed}{" "}
              days elapsed
            </span>

            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400">
              {data.period
                .daysRemaining}{" "}
              days remaining
            </span>
          </div>
        </div>

        {/* =================================================
            TARGET EDITOR
        ================================================= */}

        {editing && (
          <div className="border-b border-slate-800 bg-slate-950/50 p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Target Settings
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Set monthly targets
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Enter 0 if you do not
              want to track a
              particular KPI target.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(
                [
                  [
                    "users",
                    "New Users",
                    "👥",
                  ],

                  [
                    "views",
                    "Tracked Views",
                    "👁️",
                  ],

                  [
                    "downloads",
                    "Downloads",
                    "⬇️",
                  ],

                  [
                    "bookmarks",
                    "New Saves",
                    "🔖",
                  ],
                ] as [
                  GoalMetric,
                  string,
                  string,
                ][]
              ).map(
                (
                  [
                    metric,
                    label,
                    icon,
                  ]
                ) => (
                  <label
                    key={
                      metric
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <span>
                        {icon}
                      </span>

                      {label}
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        form[
                          metric
                        ]
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          metric,
                          event
                            .target
                            .value
                        )
                      }
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-bold text-white outline-none transition focus:border-emerald-500"
                    />
                  </label>
                )
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  void saveGoals()
                }
                className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Monthly Targets"}
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="grid gap-px border-b border-slate-800 bg-slate-800 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Goals Configured
            </p>

            <p className="mt-2 text-2xl font-black text-white">
              {
                data.summary
                  .configured
              }
            </p>
          </div>

          <div className="bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Achieved
            </p>

            <p className="mt-2 text-2xl font-black text-green-400">
              {
                data.summary
                  .achieved
              }
            </p>
          </div>

          <div className="bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              On Track
            </p>

            <p className="mt-2 text-2xl font-black text-cyan-400">
              {
                data.summary
                  .onTrack
              }
            </p>
          </div>

          <div className="bg-slate-900 p-5">
            <p className="text-xs text-slate-500">
              Behind
            </p>

            <p className="mt-2 text-2xl font-black text-amber-400">
              {
                data.summary
                  .behind
              }
            </p>
          </div>
        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
          {data.goals.map(
            (
              goal
            ) => {
              const accent =
                getMetricAccent(
                  goal.metric
                );

              const status =
                getStatusInfo(
                  goal.status
                );

              const progressWidth =
                Math.min(
                  Math.max(
                    goal
                      .progressPercent,
                    0
                  ),
                  100
                );

              return (
                <article
                  key={
                    goal.metric
                  }
                  className={`rounded-2xl border ${accent.box} p-5`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950/60 text-xl">
                        {getMetricIcon(
                          goal.metric
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          {
                            goal.label
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Monthly KPI
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                    >
                      {
                        status.label
                      }
                    </span>
                  </div>

                  {/* CURRENT/TARGET */}

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        Current
                      </p>

                      <p
                        className={`mt-1 text-3xl font-black ${accent.text}`}
                      >
                        {formatNumber(
                          goal.current
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Target
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {goal.target >
                        0
                          ? formatNumber(
                              goal.target
                            )
                          : "Not Set"}
                      </p>
                    </div>
                  </div>

                  {/* PROGRESS */}

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Progress
                      </span>

                      <span className="font-bold text-white">
                        {goal.target >
                        0
                          ? `${goal.progressPercent}%`
                          : "—"}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${accent.bar}`}
                        style={{
                          width:
                            `${progressWidth}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Remaining
                      </p>

                      <p className="mt-1 font-bold text-slate-300">
                        {goal.target >
                        0
                          ? formatNumber(
                              goal.remaining
                            )
                          : "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Projection
                      </p>

                      <p className="mt-1 font-bold text-slate-300">
                        {goal.target >
                        0
                          ? formatNumber(
                              goal.projected
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {goal.target >
                    0 && (
                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      Current pace
                      projects{" "}
                      <strong className="text-slate-300">
                        {formatNumber(
                          goal.projected
                        )}
                      </strong>{" "}
                      by month end,
                      equivalent to{" "}
                      <strong className="text-slate-300">
                        {
                          goal.projectedPercent
                        }
                        %
                      </strong>{" "}
                      of the target.
                    </p>
                  )}
                </article>
              );
            }
          )}
        </div>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm font-semibold text-green-400">
          ✓ {success}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
          {error}
        </div>
      )}

      {/* NOTE */}

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs leading-5 text-slate-500">
          <strong className="text-slate-300">
            Projection:
          </strong>{" "}
          current month activity is
          extended across the full
          month. It is an estimate,
          not a guaranteed future
          result.
        </p>
      </div>
    </section>
  );
}