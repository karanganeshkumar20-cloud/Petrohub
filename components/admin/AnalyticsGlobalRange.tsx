"use client";

import {
  useAnalyticsRange,
  type AnalyticsRangeDays,
} from "@/lib/useAnalyticsRange";

/* =========================================================
   COMPONENT
========================================================= */

export default function AnalyticsGlobalRange() {
  const [
    days,
    setDays,
  ] =
    useAnalyticsRange(
      30
    );

  return (
    <section className="mb-10 overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-slate-900 to-slate-900">
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-xl">
              🗓️
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">
                Global Reporting
                Period
              </p>

              <h2 className="mt-1 text-lg font-bold text-white md:text-xl">
                Last {days} Days
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                This period is
                synchronized across
                Overview, Categories,
                Trending and all
                report exports.
              </p>
            </div>
          </div>

          {/* =================================================
              RANGE
          ================================================= */}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-semibold text-slate-500">
              Reporting period
            </span>

            <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
              {(
                [
                  7,
                  30,
                  90,
                ] as
                  AnalyticsRangeDays[]
              ).map(
                (
                  value
                ) => {
                  const active =
                    days ===
                    value;

                  return (
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
                      className={`min-w-[82px] rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                        active
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {value} Days
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            SYNC INDICATORS
        ================================================= */}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          {[
            "📊 Overview",
            "🗂 Categories",
            "🔥 Trending",
            "📊 Excel",
            "📄 PDF",
            "📑 CSV",
          ].map(
            (
              item
            ) => (
              <span
                key={
                  item
                }
                className="rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5 text-[10px] font-semibold text-green-400"
              >
                ✓ {item}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}