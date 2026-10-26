import Link from "next/link";
import type { ReactNode } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { connectDB } from "@/lib/mongodb";

import Article from "@/models/Article";
import User from "@/models/User";
import { BookModel } from "@/models/Book";
import FormulaModel from "@/models/Formula";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type RecentArticle = {
  _id: string;
  title: string;
  slug?: string;
  category?: string;
  status?: string;
  views?: number;
  featured?: boolean;
  createdAt?: string;
};

type AggregateTotal = {
  _id: null;
  total: number;
};

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

    totalBooks,
    publishedBooks,
    draftBooks,

    totalFormulas,
    verifiedFormulas,
    publishedFormulas,

    totalUsers,

    recentArticles,

    articleViewsResult,
    bookViewsResult,
    bookDownloadsResult,
  ] = await Promise.all([
    /* ARTICLES */

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

    /* BOOKS */

    BookModel.countDocuments(),

    BookModel.countDocuments({
      status: "Published",
    }),

    BookModel.countDocuments({
      status: "Draft",
    }),

    /* FORMULAS */

    FormulaModel.countDocuments(),

    FormulaModel.countDocuments({
      verificationStatus: "verified",
    }),

    FormulaModel.countDocuments({
      status: "Published",
    }),

    /* USERS */

    User.countDocuments(),

    /* RECENT ARTICLES */

    Article.find()
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .select(
        [
          "title",
          "slug",
          "category",
          "status",
          "views",
          "featured",
          "createdAt",
        ].join(" ")
      )
      .lean(),

    /* ARTICLE VIEWS */

    Article.aggregate<AggregateTotal>([
      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $ifNull: [
                "$views",
                0,
              ],
            },
          },
        },
      },
    ]),

    /* BOOK VIEWS */

    BookModel.aggregate<AggregateTotal>([
      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $ifNull: [
                "$views",
                0,
              ],
            },
          },
        },
      },
    ]),

    /* BOOK DOWNLOADS */

    BookModel.aggregate<AggregateTotal>([
      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $ifNull: [
                "$downloads",
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const articleViews =
    articleViewsResult[0]?.total || 0;

  const bookViews =
    bookViewsResult[0]?.total || 0;

  const totalDownloads =
    bookDownloadsResult[0]?.total || 0;

  const totalViews =
    articleViews +
    bookViews;

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,

    totalBooks,
    publishedBooks,
    draftBooks,

    totalFormulas,
    verifiedFormulas,
    publishedFormulas,

    totalUsers,

    articleViews,
    bookViews,
    totalViews,
    totalDownloads,

    recentArticles:
      JSON.parse(
        JSON.stringify(
          recentArticles
        )
      ) as RecentArticle[],
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

    totalBooks,
    publishedBooks,
    draftBooks,

    totalFormulas,
    verifiedFormulas,
    publishedFormulas,

    totalUsers,

    articleViews,
    bookViews,
    totalViews,
    totalDownloads,

    recentArticles,
  } =
    await getDashboardData();

  const unverifiedFormulas =
    Math.max(
      totalFormulas -
        verifiedFormulas,
      0
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-orange-500">
                PetroHub CMS
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                Admin Dashboard
              </h1>

              <p className="mt-4 max-w-3xl leading-7 text-slate-400">
                Manage engineering
                articles, library
                resources, verified
                formulas, users,
                messages and platform
                performance from one
                dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/analytics"
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:border-orange-500 hover:text-orange-400"
              >
                View Analytics
              </Link>

              <Link
                href="/admin/articles/new"
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                + New Article
              </Link>
            </div>
          </div>

          {/* =====================================================
              PRIMARY STATS
          ===================================================== */}

          <section className="mt-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardStat
                title="Articles"
                value={
                  totalArticles
                }
                detail={`${publishedArticles} published`}
              />

              <DashboardStat
                title="Library Resources"
                value={
                  totalBooks
                }
                detail={`${publishedBooks} published`}
              />

              <DashboardStat
                title="Engineering Formulas"
                value={
                  totalFormulas
                }
                detail={`${verifiedFormulas} verified`}
              />

              <DashboardStat
                title="Registered Users"
                value={
                  totalUsers
                }
                detail="PetroHub accounts"
              />
            </div>
          </section>

          {/* =====================================================
              ENGAGEMENT
          ===================================================== */}

          <section className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardStat
                title="Total Views"
                value={
                  totalViews
                }
                detail="Articles + library"
              />

              <DashboardStat
                title="Article Views"
                value={
                  articleViews
                }
                detail="Article engagement"
              />

              <DashboardStat
                title="Library Views"
                value={
                  bookViews
                }
                detail="Resource engagement"
              />

              <DashboardStat
                title="Downloads"
                value={
                  totalDownloads
                }
                detail="Library downloads"
              />
            </div>
          </section>

          {/* =====================================================
              CONTENT HEALTH
          ===================================================== */}

          <section className="mt-12">
            <SectionHeading
              eyebrow="Overview"
              title="Content Health"
              description="Review content that is published, pending or still requires verification."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatusCard
                title="Article Drafts"
                value={
                  draftArticles
                }
                description="Articles waiting to be completed or published."
                href="/admin/articles"
                action="Review Articles"
              />

              <StatusCard
                title="Featured Articles"
                value={
                  featuredArticles
                }
                description="Articles currently marked as featured."
                href="/admin/articles"
                action="Manage Features"
              />

              <StatusCard
                title="Library Drafts"
                value={
                  draftBooks
                }
                description="Library resources not yet published."
                href="/admin/books"
                action="Review Library"
              />

              <StatusCard
                title="Formula Review"
                value={
                  unverifiedFormulas
                }
                description="Formulas that are not yet verified."
                href="/admin/formulas"
                action="Review Formulas"
              />
            </div>
          </section>

          {/* =====================================================
              MANAGEMENT
          ===================================================== */}

          <section className="mt-14">
            <SectionHeading
              eyebrow="Management"
              title="Admin Operations"
              description="Open each PetroHub management module directly from the dashboard."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <DashboardLink
                href="/admin/articles"
                code="AR"
                title="Articles"
                description="Create, edit, publish, feature and manage engineering articles."
              />

              <DashboardLink
                href="/admin/books"
                code="BK"
                title="Library"
                description="Manage engineering books, manuals, PDFs and technical resources."
              />

              <DashboardLink
                href="/admin/formulas"
                code="FM"
                title="Formulas"
                description="Verify, publish and manage engineering formulas and calculators."
              />

              <DashboardLink
                href="/admin/users"
                code="US"
                title="Users"
                description="Review registered users and manage account access."
              />

              <DashboardLink
                href="/admin/messages"
                code="MS"
                title="Messages"
                description="Review enquiries and messages received from PetroHub visitors."
              />

              <DashboardLink
                href="/admin/analytics"
                code="AN"
                title="Analytics"
                description="Monitor traffic, engagement, downloads and content performance."
              />

              <DashboardLink
                href="/admin/ai-content"
                code="AI"
                title="AI Content"
                description="Review and manage PetroHub AI-assisted content operations."
              />

              <DashboardLink
                href="/"
                code="WB"
                title="Public Website"
                description="Open PetroHub and review the live public experience."
              />
            </div>
          </section>

          {/* =====================================================
              CONTENT SUMMARY
          ===================================================== */}

          <section className="mt-14">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
                    Publishing Summary
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">
                    PetroHub Content
                    Pipeline
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    The dashboard now
                    tracks the major
                    content systems from
                    one place. Additional
                    calculators can be
                    added later without
                    blocking the rest of
                    the platform work.
                  </p>
                </div>

                <Link
                  href="/admin/analytics"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Open Analytics
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryItem
                  label="Published Articles"
                  value={
                    publishedArticles
                  }
                />

                <SummaryItem
                  label="Published Resources"
                  value={
                    publishedBooks
                  }
                />

                <SummaryItem
                  label="Verified Formulas"
                  value={
                    verifiedFormulas
                  }
                />

                <SummaryItem
                  label="Published Formulas"
                  value={
                    publishedFormulas
                  }
                />
              </div>
            </div>
          </section>

          {/* =====================================================
              RECENT ARTICLES
          ===================================================== */}

          <section className="mt-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Recent Content"
                title="Recent Articles"
                description="The latest engineering articles created in PetroHub."
              />

              <Link
                href="/admin/articles"
                className="text-sm font-bold text-orange-400 transition hover:text-orange-300"
              >
                Manage all articles
              </Link>
            </div>

            {recentArticles.length ===
            0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
                <p className="font-semibold text-slate-300">
                  No articles available.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Create the first
                  engineering article
                  from the admin panel.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b border-slate-800 bg-slate-950/40">
                      <tr>
                        <TableHeader>
                          Article
                        </TableHeader>

                        <TableHeader>
                          Category
                        </TableHeader>

                        <TableHeader>
                          Status
                        </TableHeader>

                        <TableHeader>
                          Views
                        </TableHeader>

                        <TableHeader>
                          Created
                        </TableHeader>

                        <TableHeader>
                          Actions
                        </TableHeader>
                      </tr>
                    </thead>

                    <tbody>
                      {recentArticles.map(
                        (
                          article
                        ) => (
                          <tr
                            key={
                              article._id
                            }
                            className="border-b border-slate-800 transition last:border-b-0 hover:bg-slate-800/30"
                          >
                            <td className="px-6 py-5">
                              <div className="min-w-[240px]">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-white">
                                    {
                                      article.title
                                    }
                                  </p>

                                  {article.featured && (
                                    <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-400">
                                      Featured
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                  {article.slug ||
                                    "No slug"}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-300">
                              {article.category ||
                                "-"}
                            </td>

                            <td className="px-6 py-5">
                              <PublicationBadge
                                status={
                                  article.status
                                }
                              />
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-300">
                              {Number(
                                article.views ??
                                  0
                              ).toLocaleString()}
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-400">
                              {formatDate(
                                article.createdAt
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <Link
                                  href={`/admin/articles/edit/${article._id}`}
                                  className="text-sm font-bold text-orange-400 transition hover:text-orange-300"
                                >
                                  Edit
                                </Link>

                                {article.slug &&
                                  article.status ===
                                    "Published" && (
                                    <Link
                                      href={`/articles/${article.slug}`}
                                      className="text-sm font-semibold text-slate-400 transition hover:text-white"
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

          {/* =====================================================
              NEXT OPERATIONS
          ===================================================== */}

          <section className="mt-14">
            <SectionHeading
              eyebrow="Platform Roadmap"
              title="Next Operations"
              description="Core platform work can now continue while the formula library is expanded later."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <RoadmapItem
                number="01"
                title="Admin Modules"
                description="Review Articles, Books, Formulas, Users, Messages and Analytics."
              />

              <RoadmapItem
                number="02"
                title="Article System"
                description="Improve technical publishing workflow, categorization and SEO."
              />

              <RoadmapItem
                number="03"
                title="Category System"
                description="Complete engineering category landing pages and content organization."
              />

              <RoadmapItem
                number="04"
                title="Global Search"
                description="Improve unified search across articles, resources and formulas."
              />

              <RoadmapItem
                number="05"
                title="User Experience"
                description="Complete profile, bookmarks, reading history and saved content."
              />

              <RoadmapItem
                number="06"
                title="Production Readiness"
                description="Finish QA, security, performance, SEO, monitoring and legal work."
              />
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   DASHBOARD STAT
========================================================= */

function DashboardStat({
  title,
  value,
  detail,
}: {
  title: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <p className="text-sm font-medium text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black text-white">
        {Number(
          value || 0
        ).toLocaleString()}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  title,
  value,
  description,
  href,
  action,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="font-bold text-white">
          {title}
        </p>

        <span className="rounded-lg bg-slate-950 px-3 py-1 text-lg font-black text-orange-400">
          {Number(
            value || 0
          ).toLocaleString()}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-block text-sm font-bold text-orange-400 transition hover:text-orange-300"
      >
        {action}
      </Link>
    </div>
  );
}

/* =========================================================
   DASHBOARD LINK
========================================================= */

function DashboardLink({
  href,
  code,
  title,
  description,
}: {
  href: string;
  code: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition duration-200 hover:-translate-y-1 hover:border-orange-500/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-xs font-black tracking-wider text-orange-400">
          {code}
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 transition group-hover:text-orange-400">
          Open
        </span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-white transition group-hover:text-orange-400">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </Link>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black text-white">
        {Number(
          value || 0
        ).toLocaleString()}
      </p>
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function TableHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

/* =========================================================
   PUBLICATION BADGE
========================================================= */

function PublicationBadge({
  status,
}: {
  status?: string;
}) {
  const isPublished =
    status ===
    "Published";

  return (
    <span
      className={
        isPublished
          ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400"
          : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400"
      }
    >
      {status ||
        "Draft"}
    </span>
  );
}

/* =========================================================
   ROADMAP
========================================================= */

function RoadmapItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-xs font-black tracking-[0.2em] text-orange-500">
        {number}
      </p>

      <h3 className="mt-3 font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value?: string
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}