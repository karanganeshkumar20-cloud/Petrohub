"use client";

import {
  useState,
} from "react";

import CompleteAnalyticsExport from "@/components/admin/CompleteAnalyticsExport";

import ExcelDashboardExport from "@/components/admin/ExcelDashboardExport";

import AnalyticsPdfExport from "@/components/admin/AnalyticsPdfExport";

import {
  useAnalyticsRange,
  type AnalyticsRangeDays,
} from "@/lib/useAnalyticsRange";

/* =========================================================
   TYPES
========================================================= */

type ExportFormat =
  | "excel"
  | "pdf"
  | "csv";

type ExportOption = {
  id: ExportFormat;

  title: string;

  description: string;

  icon: string;

  badge: string;

  features: string[];

  accent:
    | "cyan"
    | "purple"
    | "green";
};

/* =========================================================
   EXPORT OPTIONS
========================================================= */

const exportOptions:
  ExportOption[] = [
    {
      id:
        "excel",

      title:
        "Excel Dashboard",

      description:
        "Professional XLSX workbook with KPI dashboard, charts, graphs and detailed analytics sheets.",

      icon:
        "📊",

      badge:
        "Recommended",

      features: [
        "Executive Dashboard",
        "Charts",
        "Graphs",
        "Multiple Sheets",
      ],

      accent:
        "cyan",
    },

    {
      id:
        "pdf",

      title:
        "Management PDF",

      description:
        "Presentation-ready management analytics report for review, sharing and documentation.",

      icon:
        "📄",

      badge:
        "Presentation",

      features: [
        "KPI Cards",
        "Traffic Graph",
        "Category Graph",
        "Management Report",
      ],

      accent:
        "purple",
    },

    {
      id:
        "csv",

      title:
        "Complete CSV",

      description:
        "Consolidated analytics data for Excel analysis, filtering, calculations and further processing.",

      icon:
        "📑",

      badge:
        "Raw Data",

      features: [
        "Full Analytics",
        "Raw Data",
        "Excel Compatible",
        "Lightweight",
      ],

      accent:
        "green",
    },
  ];

/* =========================================================
   ACCENT HELPERS
========================================================= */

function getActiveCardClass(
  accent:
    ExportOption["accent"]
) {
  if (
    accent ===
    "cyan"
  ) {
    return "border-cyan-500/60 bg-cyan-500/10";
  }

  if (
    accent ===
    "purple"
  ) {
    return "border-purple-500/60 bg-purple-500/10";
  }

  return "border-green-500/60 bg-green-500/10";
}

function getIconClass(
  accent:
    ExportOption["accent"]
) {
  if (
    accent ===
    "cyan"
  ) {
    return "border-cyan-500/20 bg-cyan-500/10";
  }

  if (
    accent ===
    "purple"
  ) {
    return "border-purple-500/20 bg-purple-500/10";
  }

  return "border-green-500/20 bg-green-500/10";
}

function getBadgeClass(
  accent:
    ExportOption["accent"]
) {
  if (
    accent ===
    "cyan"
  ) {
    return "bg-cyan-500/10 text-cyan-400";
  }

  if (
    accent ===
    "purple"
  ) {
    return "bg-purple-500/10 text-purple-400";
  }

  return "bg-green-500/10 text-green-400";
}

function getSelectedClass(
  accent:
    ExportOption["accent"]
) {
  if (
    accent ===
    "cyan"
  ) {
    return "bg-cyan-500 text-slate-950";
  }

  if (
    accent ===
    "purple"
  ) {
    return "bg-purple-500 text-white";
  }

  return "bg-green-500 text-slate-950";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function UnifiedExportCenter() {
  const [
    selectedFormat,
    setSelectedFormat,
  ] =
    useState<ExportFormat>(
      "excel"
    );

  /*
    Global analytics range.

    Changing this here automatically
    updates all other analytics
    components using the same hook.
  */

  const [
    days,
    setDays,
  ] =
    useAnalyticsRange(
      30
    );

  const selected =
    exportOptions.find(
      (
        option
      ) =>
        option.id ===
        selectedFormat
    ) ??
    exportOptions[0];

  return (
    <section
      id="export-center"
      className="mb-14"
    >
      {/* =================================================
          MAIN EXPORT CENTER
      ================================================= */}

      <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-slate-900 shadow-2xl shadow-black/10">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="border-b border-slate-800 bg-gradient-to-r from-orange-500/10 via-slate-900 to-slate-900 p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            {/* LEFT */}

            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-2xl">
                📦
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">
                  PetroHub Report
                  Center
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                  Analytics Export
                  Center
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                  Select one reporting
                  period and generate
                  Excel, PDF or CSV
                  analytics reports.
                  The selected period
                  is synchronized
                  across the entire
                  analytics dashboard.
                </p>
              </div>
            </div>

            {/* STATUS */}

            <div className="self-start rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 xl:self-auto">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />

                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>

                <div>
                  <p className="text-xs font-bold text-green-400">
                    Export System
                    Ready
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Live analytics
                    data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            GLOBAL REPORTING PERIOD
        ================================================= */}

        <div className="border-b border-slate-800 bg-slate-950/40 p-5 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* LABEL */}

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
                  🗓️
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                    Reporting Period
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-white">
                    Last {days} Days
                  </h3>
                </div>
              </div>

              <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-500">
                Overview, category
                analytics, trending
                analytics and exported
                reports will use the
                same reporting period.
              </p>
            </div>

            {/* RANGE BUTTONS */}

            <div className="flex rounded-2xl border border-slate-700 bg-slate-950 p-1.5">
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
                      className={`min-w-[88px] rounded-xl px-4 py-3 text-sm font-bold transition ${
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

          {/* SYNC INDICATORS */}

          <div className="mt-5 flex flex-wrap gap-2">
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

        {/* =================================================
            EXPORT FORMAT
        ================================================= */}

        <div className="p-5 md:p-8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Export Format
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Choose your report
              type
            </h3>
          </div>

          {/* FORMAT CARDS */}

          <div className="grid gap-4 lg:grid-cols-3">
            {exportOptions.map(
              (
                option
              ) => {
                const active =
                  selectedFormat ===
                  option.id;

                return (
                  <button
                    key={
                      option.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedFormat(
                        option.id
                      )
                    }
                    className={`relative rounded-2xl border p-5 text-left transition duration-200 ${
                      active
                        ? getActiveCardClass(
                            option.accent
                          )
                        : "border-slate-800 bg-slate-950/60 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-950"
                    }`}
                  >
                    {/* SELECTED CHECK */}

                    {active && (
                      <span
                        className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${getSelectedClass(
                          option.accent
                        )}`}
                      >
                        ✓
                      </span>
                    )}

                    {/* TITLE */}

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl ${getIconClass(
                          option.accent
                        )}`}
                      >
                        {
                          option.icon
                        }
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          {
                            option.title
                          }
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getBadgeClass(
                            option.accent
                          )}`}
                        >
                          {
                            option.badge
                          }
                        </span>
                      </div>
                    </div>

                    {/* DESCRIPTION */}

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      {
                        option.description
                      }
                    </p>

                    {/* FEATURES */}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {option.features.map(
                        (
                          feature
                        ) => (
                          <span
                            key={
                              feature
                            }
                            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-slate-500"
                          >
                            {
                              feature
                            }
                          </span>
                        )
                      )}
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* =================================================
              SELECTED REPORT SUMMARY
          ================================================= */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl ${getIconClass(
                    selected.accent
                  )}`}
                >
                  {
                    selected.icon
                  }
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                    Ready to Export
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {
                      selected.title
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Reporting period:
                    Last{" "}
                    <strong className="text-orange-400">
                      {days} Days
                    </strong>
                  </p>
                </div>
              </div>

              <div className="max-w-xl md:text-right">
                <p className="text-xs leading-5 text-slate-500">
                  {
                    selected.description
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          SELECTED EXPORTER
      ================================================= */}

      <div className="mt-6">
        {selectedFormat ===
          "excel" && (
          <ExcelDashboardExport />
        )}

        {selectedFormat ===
          "pdf" && (
          <AnalyticsPdfExport />
        )}

        {selectedFormat ===
          "csv" && (
          <CompleteAnalyticsExport />
        )}
      </div>

      {/* =================================================
          USAGE INFO
      ================================================= */}

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex gap-3">
          <span className="text-lg">
            💡
          </span>

          <p className="text-xs leading-5 text-slate-500">
            <strong className="text-slate-300">
              Report guide:
            </strong>{" "}
            Use{" "}
            <span className="font-semibold text-cyan-400">
              Excel Dashboard
            </span>{" "}
            for detailed analysis,{" "}
            <span className="font-semibold text-purple-400">
              Management PDF
            </span>{" "}
            for presentation and
            sharing, and{" "}
            <span className="font-semibold text-green-400">
              CSV
            </span>{" "}
            for raw analytics data.
          </p>
        </div>
      </div>
    </section>
  );
}