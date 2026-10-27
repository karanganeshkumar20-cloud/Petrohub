"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

export type ArticleCardData = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  category: string;
  featuredImage?: string;
  featured?: boolean;
  views?: number;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  initialArticles:
    ArticleCardData[];
};

export default function ArticlesExplorer({
  initialArticles,
}: Props) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("All");

  const [
    featuredOnly,
    setFeaturedOnly,
  ] = useState(false);

  const categories =
    useMemo(
      () =>
        Array.from(
          new Set(
            initialArticles.map(
              (
                article
              ) =>
                article.category
            )
          )
        ).sort(),
      [
        initialArticles,
      ]
    );

  const filteredArticles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return initialArticles.filter(
        (
          article
        ) => {
          const matchesSearch =
            !query ||
            [
              article.title,
              article.summary,
              article.category,
              article.author,
            ]
              .filter(
                Boolean
              )
              .join(" ")
              .toLowerCase()
              .includes(
                query
              );

          const matchesCategory =
            category ===
              "All" ||
            article.category ===
              category;

          const matchesFeatured =
            !featuredOnly ||
            article.featured ===
              true;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesFeatured
          );
        }
      );
    }, [
      initialArticles,
      search,
      category,
      featuredOnly,
    ]);

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setFeaturedOnly(
      false
    );
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              PetroHub Knowledge
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Explore Engineering
              Articles
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Search and filter
              PetroHub technical
              articles by engineering
              discipline.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-300">
              {
                filteredArticles.length
              }
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-300">
              {
                initialArticles.length
              }
            </span>
          </div>
        </div>

        {/* FILTERS */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_240px_auto]">
            <input
              type="search"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Search articles, topics, authors..."
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
            />

            <select
              value={
                category
              }
              onChange={(
                event
              ) =>
                setCategory(
                  event
                    .target
                    .value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="All">
                All Categories
              </option>

              {categories.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      item
                    }
                  </option>
                )
              )}
            </select>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
              <input
                type="checkbox"
                checked={
                  featuredOnly
                }
                onChange={(
                  event
                ) =>
                  setFeaturedOnly(
                    event
                      .target
                      .checked
                  )
                }
                className="h-4 w-4"
              />

              <span className="whitespace-nowrap text-sm font-semibold text-slate-300">
                Featured only
              </span>
            </label>
          </div>

          {(search ||
            category !==
              "All" ||
            featuredOnly) && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="mt-4 text-sm font-semibold text-orange-400 hover:text-orange-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ARTICLES */}

        {filteredArticles.length ===
        0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center">
            <h3 className="text-xl font-bold">
              No articles found
            </h3>

            <p className="mt-3 text-slate-400">
              Try another search
              term or change the
              selected filters.
            </p>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map(
              (
                article
              ) => (
                <ArticleCard
                  key={
                    article._id
                  }
                  article={
                    article
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   ARTICLE CARD
========================================================= */

function ArticleCard({
  article,
}: {
  article:
    ArticleCardData;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50">
      <Link
        href={`/articles/${article.slug}`}
        className="block"
      >
        {article.featuredImage ? (
          <img
            src={
              article.featuredImage
            }
            alt={
              article.title
            }
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-slate-800">
            <span className="font-bold text-slate-500">
              PetroHub
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/categories/${getCategorySlug(
              article.category
            )}`}
            className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/20"
          >
            {
              article.category
            }
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {article.featured && (
              <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400">
                Featured
              </span>
            )}

            <span className="text-xs text-slate-500">
              {(
                article.views ??
                0
              ).toLocaleString()}{" "}
              views
            </span>
          </div>
        </div>

        <h3 className="mt-5 text-2xl font-bold leading-8 transition group-hover:text-orange-400">
          <Link
            href={`/articles/${article.slug}`}
          >
            {
              article.title
            }
          </Link>
        </h3>

        {article.summary && (
          <p className="mt-4 line-clamp-4 flex-1 leading-7 text-slate-400">
            {
              article.summary
            }
          </p>
        )}

        {(article.author ||
          article.createdAt) && (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {article.author && (
              <span>
                By{" "}
                {
                  article.author
                }
              </span>
            )}

            {article.author &&
              article.createdAt && (
                <span>
                  |
                </span>
              )}

            {article.createdAt && (
              <time
                dateTime={
                  article.createdAt
                }
              >
                {formatDate(
                  article.createdAt
                )}
              </time>
            )}
          </div>
        )}

        <Link
          href={`/articles/${article.slug}`}
          className="mt-6 font-semibold text-orange-400 transition hover:text-orange-300"
        >
          Read article
        </Link>
      </div>
    </article>
  );
}

/* =========================================================
   CATEGORY SLUG
========================================================= */

function getCategorySlug(
  category: string
) {
  const mapping: Record<
    string,
    string
  > = {
    HSE:
      "hse",

    "Oil & Gas":
      "oil-gas",

    Mechanical:
      "mechanical",

    Civil:
      "civil",

    Electrical:
      "electrical",

    Instrumentation:
      "instrumentation",

    Process:
      "process",

    Geology:
      "geology",

    Engineering:
      "engineering",
  };

  return (
    mapping[
      category
    ] ||
    category
      .toLowerCase()
      .trim()
      .replace(
        /&/g,
        "and"
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      ) ||
    "engineering"
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value?: string
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
}