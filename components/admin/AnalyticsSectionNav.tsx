"use client";

import {
  useEffect,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type SectionId =
  | "overview"
  | "categories"
  | "trending";

type NavigationItem = {
  id: SectionId;

  label: string;

  icon: string;

  description: string;
};

/* =========================================================
   NAVIGATION ITEMS
========================================================= */

const navigationItems:
  NavigationItem[] = [
    {
      id: "overview",

      label: "Overview",

      icon: "📊",

      description:
        "Traffic, growth, downloads and engagement",
    },

    {
      id: "categories",

      label: "Categories",

      icon: "🗂️",

      description:
        "Engineering category performance",
    },

    {
      id: "trending",

      label: "Trending",

      icon: "🔥",

      description:
        "Trending content and categories",
    },
  ];

/* =========================================================
   COMPONENT
========================================================= */

export default function AnalyticsSectionNav() {
  const [
    activeSection,
    setActiveSection,
  ] =
    useState<SectionId>(
      "overview"
    );

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  /* =====================================================
     WATCH CURRENT SECTION
  ===================================================== */

  useEffect(() => {
    const sections =
      navigationItems
        .map(
          (item) =>
            document.getElementById(
              item.id
            )
        )
        .filter(
          (
            element
          ): element is HTMLElement =>
            element !== null
        );

    if (
      sections.length ===
      0
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visibleEntries =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (
                  first,
                  second
                ) =>
                  second.intersectionRatio -
                  first.intersectionRatio
              );

          const visible =
            visibleEntries[0];

          if (!visible) {
            return;
          }

          const id =
            visible.target
              .id as SectionId;

          if (
            navigationItems.some(
              (item) =>
                item.id === id
            )
          ) {
            setActiveSection(
              id
            );
          }
        },
        {
          root: null,

          rootMargin:
            "-120px 0px -55% 0px",

          threshold: [
            0,
            0.1,
            0.25,
            0.5,
          ],
        }
      );

    for (
      const section of
      sections
    ) {
      observer.observe(
        section
      );
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =====================================================
     SCROLL TO SECTION
  ===================================================== */

  function scrollToSection(
    id: SectionId
  ) {
    const section =
      document.getElementById(
        id
      );

    if (!section) {
      return;
    }

    setActiveSection(
      id
    );

    setMenuOpen(
      false
    );

    const offset =
      115;

    const position =
      section.getBoundingClientRect()
        .top +
      window.scrollY -
      offset;

    window.scrollTo({
      top: position,

      behavior:
        "smooth",
    });

    window.history.replaceState(
      null,
      "",
      `#${id}`
    );
  }

  /* =====================================================
     BACK TO TOP
  ===================================================== */

  function scrollToTop() {
    setMenuOpen(
      false
    );

    window.scrollTo({
      top: 0,

      behavior:
        "smooth",
    });

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  }

  /* =====================================================
     ACTIVE ITEM
  ===================================================== */

  const activeItem =
    navigationItems.find(
      (item) =>
        item.id ===
        activeSection
    );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="sticky top-0 z-40 mb-10 border-y border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* =================================================
            DESKTOP
        ================================================= */}

        <div className="hidden min-h-[72px] items-center justify-between gap-5 md:flex">
          <div className="flex items-center gap-2">
            {navigationItems.map(
              (item) => {
                const active =
                  activeSection ===
                  item.id;

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        item.id
                      )
                    }
                    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                      active
                        ? "bg-orange-500/10 text-orange-400"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">
                      {
                        item.icon
                      }
                    </span>

                    <div>
                      <p className="text-sm font-bold">
                        {
                          item.label
                        }
                      </p>

                      <p className="mt-0.5 hidden text-[10px] text-slate-600 xl:block">
                        {
                          item.description
                        }
                      </p>
                    </div>

                    {active && (
                      <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-orange-500" />
                    )}
                  </button>
                );
              }
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-600 lg:inline">
              PetroHub Analytics
            </span>

            <button
              type="button"
              onClick={
                scrollToTop
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-orange-500/50 hover:text-orange-400"
            >
              ↑ Top
            </button>
          </div>
        </div>

        {/* =================================================
            MOBILE
        ================================================= */}

        <div className="md:hidden">
          <div className="flex min-h-[64px] items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                Analytics
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                {activeItem?.label ??
                  "Overview"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (current) =>
                    !current
                )
              }
              aria-expanded={
                menuOpen
              }
              aria-label="Toggle analytics navigation"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-lg text-white"
            >
              {menuOpen
                ? "×"
                : "☰"}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-slate-800 py-3">
              <div className="space-y-2">
                {navigationItems.map(
                  (item) => {
                    const active =
                      activeSection ===
                      item.id;

                    return (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() =>
                          scrollToSection(
                            item.id
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                          active
                            ? "bg-orange-500/10 text-orange-400"
                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <span className="text-lg">
                          {
                            item.icon
                          }
                        </span>

                        <div>
                          <p className="text-sm font-bold">
                            {
                              item.label
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {
                              item.description
                            }
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                onClick={
                  scrollToTop
                }
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300 transition hover:text-white"
              >
                ↑ Back to Top
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}