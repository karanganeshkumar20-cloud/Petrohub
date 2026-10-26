"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type PublicationStatus =
  | "Draft"
  | "Published";

type Article = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: PublicationStatus;
  views?: number;
  featured?: boolean;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
};

type APIResponse = {
  success: boolean;
  message?: string;
  articles?: Article[];
};

const categories = [
  "HSE",
  "Oil & Gas",
  "Mechanical",
  "Civil",
  "Electrical",
  "Instrumentation",
  "Process",
  "Geology",
];

export default function AdminArticlesPage() {
  const [
    articles,
    setArticles,
  ] =
    useState<Article[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("All");

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState("All");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  async function fetchArticles() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/articles",
          {
            cache:
              "no-store",
          }
        );

      const data =
        (await response.json()) as APIResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load articles"
        );
      }

      setArticles(
        data.articles || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load articles"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchArticles();
  }, []);

  async function deleteArticle(
    article: Article
  ) {
    const confirmed =
      window.confirm(
        `Delete "${article.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        article._id
      );

      setError("");
      setMessage("");

      const response =
        await fetch(
          `/api/articles/${article._id}`,
          {
            method:
              "DELETE",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete article"
        );
      }

      setArticles(
        (
          currentArticles
        ) =>
          currentArticles.filter(
            (
              currentArticle
            ) =>
              currentArticle._id !==
              article._id
          )
      );

      setMessage(
        "Article deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete article"
      );
    } finally {
      setDeletingId("");
    }
  }

  const filteredArticles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return articles.filter(
        (
          article
        ) => {
          const matchesSearch =
            !query ||
            [
              article.title,
              article.slug,
              article.category,
              article.author,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(
                query
              );

          const matchesStatus =
            statusFilter ===
              "All" ||
            article.status ===
              statusFilter;

          const matchesCategory =
            categoryFilter ===
              "All" ||
            article.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );
        }
      );
    }, [
      articles,
      search,
      statusFilter,
      categoryFilter,
    ]);

  const publishedCount =
    articles.filter(
      (
        article
      ) =>
        article.status ===
        "Published"
    ).length;

  const draftCount =
    articles.filter(
      (
        article
      ) =>
        article.status ===
        "Draft"
    ).length;

  const featuredCount =
    articles.filter(
      (
        article
      ) =>
        article.featured
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
              PetroHub CMS
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Manage Articles
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Create, review,
              publish, feature and
              manage PetroHub
              engineering articles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-orange-500 hover:text-white"
            >
              Admin Dashboard
            </Link>

            <Link
              href="/admin/articles/new"
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              + New Article
            </Link>
          </div>
        </div>

        {/* STATS */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Articles"
            value={
              articles.length
            }
          />

          <StatCard
            label="Published"
            value={
              publishedCount
            }
          />

          <StatCard
            label="Drafts"
            value={
              draftCount
            }
          />

          <StatCard
            label="Featured"
            value={
              featuredCount
            }
          />
        </div>

        {/* FILTERS */}

        <div className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-3">
          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search title, slug, category..."
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Published">
              Published
            </option>

            <option value="Draft">
              Draft
            </option>
          </select>

          <select
            value={
              categoryFilter
            }
            onChange={(
              event
            ) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
          >
            <option value="All">
              All Categories
            </option>

            {categories.map(
              (
                category
              ) => (
                <option
                  key={
                    category
                  }
                  value={
                    category
                  }
                >
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
            Loading articles...
          </div>
        ) : filteredArticles.length ===
          0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
            <p className="font-semibold text-slate-300">
              No articles found.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Adjust the filters or
              create a new article.
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
                  {filteredArticles.map(
                    (
                      article
                    ) => (
                      <tr
                        key={
                          article._id
                        }
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-5">
                          <div className="min-w-[260px]">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-white">
                                {
                                  article.title
                                }
                              </p>

                              {article.featured && (
                                <span className="rounded-full bg-orange-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-400">
                                  Featured
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                article.slug
                              }
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-300">
                          {
                            article.category
                          }
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
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
                          <div className="flex flex-wrap gap-4">
                            {article.status ===
                              "Published" && (
                              <Link
                                href={`/articles/${article.slug}`}
                                className="text-sm font-bold text-slate-300 transition hover:text-white"
                              >
                                View
                              </Link>
                            )}

                            <Link
                              href={`/admin/articles/edit/${article._id}`}
                              className="text-sm font-bold text-orange-400 transition hover:text-orange-300"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                article._id
                              }
                              onClick={() =>
                                deleteArticle(
                                  article
                                )
                              }
                              className="text-sm font-bold text-red-400 transition hover:text-red-300 disabled:opacity-50"
                            >
                              {deletingId ===
                              article._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
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
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function StatusBadge({
  status,
}: {
  status:
    PublicationStatus;
}) {
  return (
    <span
      className={
        status ===
        "Published"
          ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400"
          : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400"
      }
    >
      {status}
    </span>
  );
}

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