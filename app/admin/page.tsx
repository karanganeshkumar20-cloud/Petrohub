import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { connectDB } from "@/lib/mongodb";

import Article from "@/models/Article";
import User from "@/models/User";

export const dynamic = "force-dynamic";

/* =========================================================
   DASHBOARD DATA
========================================================= */

async function getDashboardData() {
  await connectDB();

  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    totalUsers,
    recentArticles,
  ] = await Promise.all([
    Article.countDocuments(),

    Article.countDocuments({
      status: "Published",
    }),

    Article.countDocuments({
      status: "Draft",
    }),

    Article.countDocuments({
      featured: true,
    }),

    User.countDocuments(),

    Article.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean(),
  ]);

  /* =========================
     TOTAL ARTICLE VIEWS
  ========================= */

  const totalViewsResult =
    await Article.aggregate([
      {
        $group: {
          _id: null,

          totalViews: {
            $sum: {
              $ifNull: [
                "$views",
                0,
              ],
            },
          },
        },
      },
    ]);

  const totalViews =
    totalViewsResult.length > 0
      ? totalViewsResult[0]
          .totalViews
      : 0;

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    totalUsers,
    totalViews,

    recentArticles:
      JSON.parse(
        JSON.stringify(
          recentArticles
        )
      ),
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function AdminDashboardPage() {
  const {
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    totalUsers,
    totalViews,
    recentArticles,
  } =
    await getDashboardData();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {/* =========================
              HEADER
          ========================= */}

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold uppercase tracking-widest text-orange-500">
                PetroHub CMS
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Admin Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Manage PetroHub
                content, users,
                resources and platform
                activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/analytics"
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-center font-bold text-white transition hover:border-orange-500 hover:text-orange-400"
              >
                📊 Analytics
              </Link>

              <Link
                href="/admin/articles/new"
                className="rounded-xl bg-orange-500 px-6 py-3 text-center font-bold text-white transition hover:bg-orange-600"
              >
                + New Article
              </Link>
            </div>
          </div>

          {/* =========================
              STATS
          ========================= */}

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <DashboardStat
              title="Total Articles"
              value={
                totalArticles
              }
            />

            <DashboardStat
              title="Published"
              value={
                publishedArticles
              }
            />

            <DashboardStat
              title="Drafts"
              value={
                draftArticles
              }
            />

            <DashboardStat
              title="Featured"
              value={
                featuredArticles
              }
            />

            <DashboardStat
              title="Total Views"
              value={totalViews}
            />

            <DashboardStat
              title="Users"
              value={totalUsers}
            />
          </div>

          {/* =====================================================
              QUICK ACTIONS
          ===================================================== */}

          <section className="mt-12">
            <div>
              <p className="font-semibold uppercase tracking-widest text-orange-500">
                Management
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Quick Actions
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Access PetroHub
                management tools from
                one place.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* ANALYTICS */}

              <DashboardLink
                href="/admin/analytics"
                icon="📊"
                title="Platform Analytics"
                description="Monitor users, views, downloads, bookmarks and top-performing content."
              />

              {/* CREATE ARTICLE */}

              <DashboardLink
                href="/admin/articles/new"
                icon="✍️"
                title="Create Article"
                description="Write and publish a new engineering article."
              />

              {/* ARTICLES */}

              <DashboardLink
                href="/admin/articles"
                icon="📝"
                title="Manage Articles"
                description="Edit, publish, feature or delete PetroHub articles."
              />

              {/* LIBRARY */}

              <DashboardLink
                href="/admin/books"
                icon="📚"
                title="Manage Library"
                description="Add and manage engineering books, PDFs and learning resources."
              />

              {/* USERS */}

              <DashboardLink
                href="/admin/users"
                icon="👥"
                title="Manage Users"
                description="View registered users and manage account access."
              />

              {/* CONTACT MESSAGES */}

              <DashboardLink
                href="/admin/messages"
                icon="✉️"
                title="Contact Inbox"
                description="Review and manage messages received from PetroHub visitors."
              />

              {/* PUBLIC WEBSITE */}

              <DashboardLink
                href="/"
                icon="🌐"
                title="View Website"
                description="Open the public PetroHub website and review published content."
              />

              {/* SEARCH */}

              <DashboardLink
                href="/search"
                icon="🔎"
                title="Test Search"
                description="Test PetroHub search and verify published content appears correctly."
              />
            </div>
          </section>

          {/* =====================================================
              ANALYTICS FEATURE CARD
          ===================================================== */}

          <section className="mt-14">
            <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30 p-7 md:p-9">
              <div className="absolute right-6 top-6 text-7xl opacity-10">
                📊
              </div>

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                    PetroHub Analytics
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">
                    Understand how
                    PetroHub is growing
                  </h2>

                  <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                    Track users,
                    articles, library
                    resources, views,
                    downloads,
                    bookmarks and
                    engagement from the
                    analytics dashboard.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                    <AnalyticsBadge>
                      👥 Users
                    </AnalyticsBadge>

                    <AnalyticsBadge>
                      👁 Views
                    </AnalyticsBadge>

                    <AnalyticsBadge>
                      ⭐ Bookmarks
                    </AnalyticsBadge>

                    <AnalyticsBadge>
                      ⬇ Downloads
                    </AnalyticsBadge>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href="/admin/analytics"
                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
                  >
                    View Analytics →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              RECENT ARTICLES
          ===================================================== */}

          <section className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="font-semibold uppercase tracking-widest text-orange-500">
                  Content
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Recent Articles
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Recently created
                  PetroHub articles.
                </p>
              </div>

              <Link
                href="/admin/articles"
                className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
              >
                Manage all →
              </Link>
            </div>

            {/* =========================
                EMPTY STATE
            ========================= */}

            {recentArticles.length ===
            0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
                No articles available
                yet.
              </div>
            ) : (
              /* =========================
                 TABLE
              ========================= */

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b border-slate-800 bg-slate-900/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Article
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Category
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Views
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentArticles.map(
                        (
                          article: any
                        ) => (
                          <tr
                            key={
                              article._id
                            }
                            className="border-b border-slate-800 transition last:border-b-0 hover:bg-slate-800/30"
                          >
                            {/* ARTICLE */}

                            <td className="px-6 py-5">
                              <div className="flex min-w-[260px] items-center gap-4">
                                {article.featuredImage ? (
                                  <img
                                    src={
                                      article.featuredImage
                                    }
                                    alt={
                                      article.title
                                    }
                                    className="h-12 w-20 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-slate-800 text-lg">
                                    📝
                                  </div>
                                )}

                                <div>
                                  <p className="font-semibold text-white">
                                    {
                                      article.title
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {article.createdAt
                                      ? new Date(
                                          article.createdAt
                                        ).toLocaleDateString()
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}

                            <td className="px-6 py-5 text-slate-300">
                              {article.category ||
                                "-"}
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">
                              <span
                                className={
                                  article.status ===
                                  "Published"
                                    ? "rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-400"
                                    : "rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-400"
                                }
                              >
                                {article.status}
                              </span>
                            </td>

                            {/* VIEWS */}

                            <td className="px-6 py-5 text-slate-300">
                              {Number(
                                article.views ??
                                  0
                              ).toLocaleString()}
                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <Link
                                  href={`/admin/articles/edit/${article._id}`}
                                  className="font-semibold text-orange-400 transition hover:text-orange-300"
                                >
                                  Edit
                                </Link>

                                {article.slug &&
                                  article.status ===
                                    "Published" && (
                                    <Link
                                      href={`/articles/${article.slug}`}
                                      className="font-semibold text-slate-400 transition hover:text-white"
                                    >
                                      View
                                    </Link>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   DASHBOARD STAT
========================================================= */

function DashboardStat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">
        {Number(
          value || 0
        ).toLocaleString()}
      </p>
    </div>
  );
}

/* =========================================================
   DASHBOARD LINK
========================================================= */

function DashboardLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition duration-200 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-950/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-4 text-3xl">
            {icon}
          </div>

          <h3 className="text-xl font-bold text-white transition group-hover:text-orange-400">
            {title}
          </h3>
        </div>

        <span className="text-xl text-slate-600 transition group-hover:translate-x-1 group-hover:text-orange-400">
          →
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <p className="mt-5 text-sm font-semibold text-orange-400">
        Open →
      </p>
    </Link>
  );
}

/* =========================================================
   ANALYTICS BADGE
========================================================= */

function AnalyticsBadge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2">
      {children}
    </span>
  );
}