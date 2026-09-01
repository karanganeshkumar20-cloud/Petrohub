"use client";

import {
  useEffect,
  useState,
} from "react";

type SectionId =
  | "overview"
  | "categories"
  | "trending";

const sections: {
  id: SectionId;
  label: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "categories",
    label: "Categories",
  },
  {
    id: "trending",
    label: "Trending",
  },
];

function formatTime(
  date: Date
) {
  return date.toLocaleTimeString(
    "en-IN",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,
    }
  );
}

export default function AnalyticsQuickTools() {
  const [
    lastUpdated,
    setLastUpdated,
  ] =
    useState<Date>(
      new Date()
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    progress,
    setProgress,
  ] =
    useState(0);

  /* =====================================================
     SCROLL PROGRESS
  ===================================================== */

  useEffect(() => {
    function handleScroll() {
      const scrollTop =
        window.scrollY;

      const documentHeight =
        document.documentElement
          .scrollHeight -
        window.innerHeight;

      if (
        documentHeight <=
        0
      ) {
        setProgress(
          0
        );

        return;
      }

      const value =
        Math.min(
          Math.max(
            (scrollTop /
              documentHeight) *
              100,
            0
          ),
          100
        );

      setProgress(
        value
      );
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );
    };
  }, []);

  /* =====================================================
     REFRESH
  ===================================================== */

  function refreshAnalytics() {
    setRefreshing(
      true
    );

    setLastUpdated(
      new Date()
    );

    /*
      Reloading the page guarantees
      all independent analytics
      components fetch fresh data.
    */

    window.setTimeout(
      () => {
        window.location.reload();
      },
      250
    );
  }

  /* =====================================================
     SECTION JUMP
  ===================================================== */

  function jumpToSection(
    id: SectionId
  ) {
    const element =
      document.getElementById(
        id
      );

    if (!element) {
      return;
    }

    const offset =
      120;

    const top =
      element.getBoundingClientRect()
        .top +
      window.scrollY -
      offset;

    window.scrollTo({
      top,

      behavior:
        "smooth",
    });

    window.history.replaceState(
      null,
      "",
      `#${id}`
    );
  }

  return (
    <>
      {/* =================================================
          TOP SCROLL PROGRESS
      ================================================= */}

      <div className="fixed left-0 right-0 top-0 z-[100] h-1 bg-slate-900">
        <div
          className="h-full bg-orange-500 transition-[width] duration-150"
          style={{
            width:
              `${progress}%`,
          }}
        />
      </div>

      {/* =================================================
          QUICK TOOLBAR
      ================================================= */}

      <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Analytics Status
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                <span className="text-sm font-semibold text-white">
                  Live
                </span>
              </div>
            </div>

            <div className="hidden h-9 w-px bg-slate-800 sm:block" />

            <div>
              <p className="text-xs text-slate-500">
                Last Updated
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-300">
                {formatTime(
                  lastUpdated
                )}
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex flex-wrap items-center gap-3">
            {/* QUICK JUMP */}

            <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
              {sections.map(
                (section) => (
                  <button
                    key={
                      section.id
                    }
                    type="button"
                    onClick={() =>
                      jumpToSection(
                        section.id
                      )
                    }
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    {
                      section.label
                    }
                  </button>
                )
              )}
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={
                refreshAnalytics
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh Analytics"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}