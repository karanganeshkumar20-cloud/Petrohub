import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { connectDB } from "@/lib/mongodb";

import Article from "@/models/Article";
import User from "@/models/User";
import { BookModel } from "@/models/Book";

import {
  ContactMessageModel,
} from "@/models/ContactMessage";

export const dynamic = "force-dynamic";

/* =========================
   DASHBOARD DATA
========================= */

async function getDashboardData() {
  await connectDB();

  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    totalUsers,
    totalResources,
    totalMessages,
    unreadMessages,
    recentArticles,
    recentMessages,
    totalViewsResult,
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

    BookModel.countDocuments({
      status: "Published",
    }),

    ContactMessageModel.countDocuments(),

    ContactMessageModel.countDocuments({
      status: "Unread",
    }),

    Article.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean(),

    ContactMessageModel.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean(),

    Article.aggregate([
      {
        $group: {
          _id: null,

          totalViews: {
            $sum: "$views",
          },
        },
      },
    ]),
  ]);

  const totalViews =
    totalViewsResult.length > 0
      ? totalViewsResult[0].totalViews
      : 0;

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    totalUsers,
    totalResources,
    totalMessages,
    unreadMessages,
    totalViews,

    recentArticles: JSON.parse(
      JSON.stringify(
        recentArticles
      )
    ),

    recentMessages: JSON.parse(
      JSON.stringify(
        recentMessages
      )
    ),
  };
}

/* =========================
   ADMIN DASHBOARD
========================= */

export default async function AdminDashboardPage() {
  const {
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    totalUsers,
    totalResources,
    totalMessages,
    unreadMessages,
    totalViews,
    recentArticles,
    recentMessages,
  } = await getDashboardData();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold uppercase tracking-widest text-orange-500">
                PetroHub CMS
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Admin Dashboard
              </h1>

              <p className="mt-3 max-w-3xl text-slate-400">
                Manage PetroHub articles,
                library resources, users,
                contact messages and
                platform activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/books/new"
                className="rounded-xl border border-slate-700 px-5 py-3 text-center font-bold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                + New Resource
              </Link>

              <Link
                href="/admin/articles/new"
                className="rounded-xl bg-orange-500 px-6 py-3 text-center font-bold text-white transition hover:bg-orange-600"
              >
                + New Article
              </Link>
            </div>
          </div>

          {/* STATS */}

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardStat
              title="Total Articles"
              value={totalArticles}
            />

            <DashboardStat
              title="Published"
              value={publishedArticles}
            />

            <DashboardStat
              title="Draft Articles"
              value={draftArticles}
            />

            <DashboardStat
              title="Featured Articles"
              value={featuredArticles}
            />

            <DashboardStat
              title="Article Views"
              value={totalViews}
            />

            <DashboardStat
              title="Library Resources"
              value={totalResources}
            />

            <DashboardStat
              title="Users"
              value={totalUsers}
            />

            <DashboardStat
              title="Messages"
              value={totalMessages}
              subtitle={
                unreadMessages > 0
                  ? `${unreadMessages} unread`
                  : "No unread messages"
              }
              highlight={
                unreadMessages > 0
              }
            />
          </div>

          {/* QUICK ACTIONS */}

          <section className="mt-12">
            <div>
              <p className="font-semibold uppercase tracking-widest text-orange-500">
                Management
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Quick Actions
              </h2>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              <DashboardLink
                href="/admin/articles/new"
                title="Create Article"
                description="Write and publish a new engineering article."
              />

              <DashboardLink
                href="/admin/articles"
                title="Manage Articles"
                description="Edit, delete and manage PetroHub articles."
              />

              <DashboardLink
                href="/admin/books"
                title="Manage Library"
                description="Create and manage books, manuals, PDFs and official resources."
              />

              <DashboardLink
                href="/admin/users"
                title="Manage Users"
                description={`Review ${totalUsers} registered users and manage PetroHub account roles.`}
              />

              <DashboardLink
                href="/admin/messages"
                title={
                  unreadMessages > 0
                    ? `Contact Messages (${unreadMessages})`
                    : "Contact Messages"
                }
                description="Read and manage enquiries submitted through the PetroHub contact form."
                highlight={
                  unreadMessages > 0
                }
              />

              <DashboardLink
                href="/search"
                title="Test Search"
                description="Test global search across PetroHub articles and library resources."
              />

              <DashboardLink
                href="/"
                title="View Website"
                description="Open the public PetroHub website."
              />
            </div>
          </section>

          {/* RECENT CONTACT MESSAGES */}

          <section className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="font-semibold uppercase tracking-widest text-orange-500">
                  Inbox
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Recent Contact Messages
                </h2>
              </div>

              <Link
                href="/admin/messages"
                className="text-sm font-semibold text-orange-400 hover:text-orange-300"
              >
                View all messages →
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
                No contact messages
                received yet.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Sender
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Subject
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Received
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentMessages.map(
                        (message: any) => (
                          <tr
                            key={message._id}
                            className="border-b border-slate-800 last:border-b-0"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold">
                                {message.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {message.email}
                              </p>
                            </td>

                            <td className="max-w-xs px-6 py-5">
                              <p className="truncate text-slate-300">
                                {message.subject}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <MessageStatus
                                status={
                                  message.status
                                }
                              />
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-500">
                              {formatDate(
                                message.createdAt
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <Link
                                href="/admin/messages"
                                className="font-semibold text-orange-400 hover:text-orange-300"
                              >
                                Open
                              </Link>
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

          {/* RECENT ARTICLES */}

          <section className="mt-14">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="font-semibold uppercase tracking-widest text-orange-500">
                  Content
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Recent Articles
                </h2>
              </div>

              <Link
                href="/admin/articles"
                className="text-sm font-semibold text-orange-400 hover:text-orange-300"
              >
                Manage all →
              </Link>
            </div>

            {recentArticles.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
                No articles available yet.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b border-slate-800">
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
                        (article: any) => (
                          <tr
                            key={article._id}
                            className="border-b border-slate-800 last:border-b-0"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
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
                                  <div className="h-12 w-20 rounded-lg bg-slate-800" />
                                )}

                                <div>
                                  <p className="font-semibold">
                                    {article.title}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatDate(
                                      article.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-slate-300">
                              {article.category}
                            </td>

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

                            <td className="px-6 py-5 text-slate-300">
                              {article.views ?? 0}
                            </td>

                            <td className="px-6 py-5">
                              <Link
                                href={`/admin/articles/edit/${article._id}`}
                                className="font-semibold text-orange-400 hover:text-orange-300"
                              >
                                Edit
                              </Link>
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

/* =========================
   DASHBOARD STAT
========================= */

function DashboardStat({
  title,
  value,
  subtitle,
  highlight = false,
}: {
  title: string;
  value: number;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl border border-orange-500/50 bg-orange-500/10 p-5"
          : "rounded-2xl border border-slate-800 bg-slate-900 p-5"
      }
    >
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value.toLocaleString()}
      </p>

      {subtitle && (
        <p
          className={
            highlight
              ? "mt-2 text-xs font-semibold text-orange-400"
              : "mt-2 text-xs text-slate-500"
          }
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* =========================
   QUICK ACTION
========================= */

function DashboardLink({
  href,
  title,
  description,
  highlight = false,
}: {
  href: string;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        highlight
          ? "group rounded-2xl border border-orange-500/50 bg-orange-500/10 p-6 transition hover:-translate-y-1 hover:border-orange-400"
          : "group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/50"
      }
    >
      <h3
        className={
          highlight
            ? "text-xl font-bold text-orange-400"
            : "text-xl font-bold transition group-hover:text-orange-400"
        }
      >
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <p className="mt-5 text-sm font-semibold text-orange-400">
        Open →
      </p>
    </Link>
  );
}

/* =========================
   MESSAGE STATUS
========================= */

function MessageStatus({
  status,
}: {
  status: string;
}) {
  const style =
    status === "Unread"
      ? "bg-orange-500/10 text-orange-400"
      : status === "Resolved"
        ? "bg-green-500/10 text-green-400"
        : "bg-blue-500/10 text-blue-400";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

/* =========================
   DATE
========================= */

function formatDate(
  value?: string | Date
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

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