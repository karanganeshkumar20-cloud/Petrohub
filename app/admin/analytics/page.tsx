import Navbar from "@/components/Navbar";

import Footer from "@/components/Footer";

import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

import CategoryAnalytics from "@/components/admin/CategoryAnalytics";

import TrendingAnalytics from "@/components/admin/TrendingAnalytics";

import AnalyticsSectionNav from "@/components/admin/AnalyticsSectionNav";

import AnalyticsQuickTools from "@/components/admin/AnalyticsQuickTools";

import UnifiedExportCenter from "@/components/admin/UnifiedExportCenter";

import AnalyticsGoals from "@/components/admin/AnalyticsGoals";

import AnalyticsAlerts from "@/components/admin/AnalyticsAlerts";

export const dynamic =
  "force-dynamic";

export default function AdminAnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
                Admin Intelligence
              </p>

              <h1 className="mt-3 text-3xl font-extrabold text-white md:text-5xl">
                PetroHub Analytics
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
                Monitor traffic,
                growth, downloads,
                engagement, KPI
                targets, smart alerts,
                category performance
                and trending content
                from one professional
                analytics dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/admin"
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-orange-500/50 hover:text-orange-400"
              >
                ← Admin Dashboard
              </a>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                View Website ↗
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400">
              📊 Platform Analytics
            </span>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
              🎯 KPI Targets
            </span>

            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400">
              🚦 Smart Alerts
            </span>

            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-400">
              📈 Growth Comparison
            </span>

            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-400">
              🗂 Category Analytics
            </span>

            <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-xs font-semibold text-pink-400">
              🔥 Trending Analytics
            </span>

            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-400">
              📦 Report Center
            </span>
          </div>
        </div>
      </section>

      <AnalyticsSectionNav />

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <AnalyticsQuickTools />

          {/* EXPORT */}

          <UnifiedExportCenter />

          {/* KPI TARGETS */}

          <AnalyticsGoals />

          {/* SMART ALERTS */}

          <AnalyticsAlerts />

          {/* =================================================
              OVERVIEW
          ================================================= */}

          <section
            id="overview"
            className="scroll-mt-32"
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-xl">
                📊
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Section 01
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  Platform Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Traffic,
                  engagement,
                  visitors,
                  downloads and
                  platform growth.
                </p>
              </div>
            </div>

            <AnalyticsDashboard />
          </section>

          {/* =================================================
              CATEGORY DIVIDER
          ================================================= */}

          <div className="my-16 flex items-center gap-5">
            <div className="h-px flex-1 bg-slate-800" />

            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
              Category Intelligence
            </span>

            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* =================================================
              CATEGORIES
          ================================================= */}

          <section
            id="categories"
            className="scroll-mt-32"
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-xl">
                🗂️
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Section 02
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  Category Analytics
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Compare engineering
                  categories using
                  views, downloads,
                  saves and content
                  performance.
                </p>
              </div>
            </div>

            <CategoryAnalytics />
          </section>

          {/* =================================================
              TRENDING DIVIDER
          ================================================= */}

          <div className="my-16 flex items-center gap-5">
            <div className="h-px flex-1 bg-slate-800" />

            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
              Momentum Intelligence
            </span>

            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* =================================================
              TRENDING
          ================================================= */}

          <section
            id="trending"
            className="scroll-mt-32"
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-xl">
                🔥
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-400">
                  Section 03
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  Trending Analytics
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Identify content
                  and categories with
                  strong current
                  activity and
                  momentum.
                </p>
              </div>
            </div>

            <TrendingAnalytics />
          </section>

          {/* =================================================
              END CARD
          ================================================= */}

          <div className="mt-16 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-2xl">
              📊
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">
              PetroHub Analytics
              Complete
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Track platform
              activity, monthly KPI
              targets, automatic
              performance alerts,
              category intelligence
              and content momentum
              from one system.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="#export-center"
                className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-sm font-bold text-orange-400 transition hover:bg-orange-500 hover:text-white"
              >
                📦 Export Reports
              </a>

              <a
                href="#goals"
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500 hover:text-slate-950"
              >
                🎯 KPI Targets
              </a>

              <a
                href="#action-center"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                🚦 View Alerts
              </a>

              <a
                href="#overview"
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                ↑ Overview
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}