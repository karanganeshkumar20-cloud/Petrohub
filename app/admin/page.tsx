import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  await connectDB();

  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    totalUsers,
    articles,
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

  const totalViewsResult = await Article.aggregate([
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
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
    totalViews,
    recentArticles: JSON.parse(
      JSON.stringify(articles)
    ),
  };
}

export default async function AdminDashboardPage() {
  const {
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    totalUsers,
    totalViews,
    recentArticles,
  } = await getDashboardData();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold uppercase tracking-widest text-orange-500">
                PetroHub CMS
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Admin Dashboard
              </h1>

              <p className="mt-3 text-slate-400">
                Manage PetroHub content, users and platform activity.
              </p>
            </div>

            <Link
              href="/admin/articles/new"
              className="rounded-xl bg-orange-500 px-6 py-3 text-center font-bold text-white transition hover:bg-orange-600"
            >
              + New Article
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            <DashboardStat
              title="Total Articles"
              value={totalArticles}
            />

            <DashboardStat
              title="Published"
              value={publishedArticles}
            />

            <DashboardStat
              title="Drafts"
              value={draftArticles}
            />

            <DashboardStat
              title="Featured"
              value={featuredArticles}
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

          {/* Quick Actions */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold">
              Quick Actions
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <DashboardLink
                href="/admin/articles/new"
                title="Create Article"
                description="Write and publish a new engineering article."
              />

              <DashboardLink
                href="/admin/articles"
                title="Manage Articles"
                description="Edit, delete and manage published content."
              />

              <DashboardLink
                href="/articles"
                title="View Website"
                description="Open the public PetroHub article library."
              />

              <DashboardLink
                href="/search"
                title="Test Search"
                description="Check PetroHub article search results."
              />

            </div>
          </section>

          {/* Recent Articles */}
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
                    <thead className="border-b border-slate-800 bg-slate-900">
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
                                    alt={article.title}
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
                                    {new Date(
                                      article.createdAt
                                    ).toLocaleDateString()}
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

function DashboardStat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function DashboardLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/50"
    >
      <h3 className="text-xl font-bold transition group-hover:text-orange-400">
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