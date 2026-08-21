"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type SearchResult = {
  id: string;

  title: string;

  slug: string;

  description: string;

  category: string;

  resultType:
    | "article"
    | "library";

  typeLabel: string;

  href: string;

  author?: string;

  publisher?: string;

  coverImage?: string;

  resourceType?: string;

  contentType?: string;

  createdAt?: string;
};

type SearchCounts = {
  articles: number;
  library: number;
};

type SearchClientProps = {
  initialQuery: string;
};

export default function SearchClient({
  initialQuery,
}: SearchClientProps) {
  const router = useRouter();

  const [query, setQuery] =
    useState(initialQuery);

  const [results, setResults] =
    useState<SearchResult[]>([]);

  const [counts, setCounts] =
    useState<SearchCounts>({
      articles: 0,
      library: 0,
    });

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  async function searchPetroHub(
    searchQuery: string
  ) {
    const trimmedQuery =
      searchQuery.trim();

    if (!trimmedQuery) {
      setResults([]);

      setCounts({
        articles: 0,
        library: 0,
      });

      setSearched(false);
      setError("");

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/search?q=${encodeURIComponent(
            trimmedQuery
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      /*
       * Read as text first so the
       * page does not crash if the
       * server returns non-JSON.
       */
      const responseText =
        await response.text();

      let data: any;

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : {};
      } catch {
        throw new Error(
          `Search returned an invalid response (${response.status})`
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Search failed"
        );
      }

      setResults(
        Array.isArray(
          data.results
        )
          ? data.results
          : []
      );

      setCounts({
        articles:
          data.counts?.articles ??
          0,

        library:
          data.counts?.library ??
          0,
      });

      setSearched(true);
    } catch (err) {
      console.error(
        "Search error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to search PetroHub"
      );

      setResults([]);

      setCounts({
        articles: 0,
        library: 0,
      });

      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    if (!trimmedQuery) {
      clearSearch();
      return;
    }

    router.push(
      `/search?q=${encodeURIComponent(
        trimmedQuery
      )}`
    );

    searchPetroHub(
      trimmedQuery
    );
  }

  function clearSearch() {
    setQuery("");

    setResults([]);

    setCounts({
      articles: 0,
      library: 0,
    });

    setSearched(false);
    setError("");

    router.push("/search");
  }

  useEffect(() => {
    setQuery(initialQuery);

    if (initialQuery.trim()) {
      searchPetroHub(
        initialQuery
      );
    } else {
      setResults([]);

      setCounts({
        articles: 0,
        library: 0,
      });

      setSearched(false);
      setError("");
    }
  }, [initialQuery]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* SEARCH HERO */}

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub Search
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Search Engineering
            Knowledge
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Search PetroHub
            articles, books,
            manuals, standards,
            notes and engineering
            resources.
          </p>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={query}
              onChange={(
                event
              ) =>
                setQuery(
                  event.target
                    .value
                )
              }
              placeholder="Search HIRA, LOTO, OSHA, drilling, safety..."
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Searching..."
                : "Search"}
            </button>
          </form>

          {/* QUICK SEARCH */}

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "HIRA",
              "LOTO",
              "OSHA",
              "Fire Safety",
              "Oil & Gas",
            ].map(
              (keyword) => (
                <button
                  key={
                    keyword
                  }
                  type="button"
                  onClick={() => {
                    setQuery(
                      keyword
                    );

                    router.push(
                      `/search?q=${encodeURIComponent(
                        keyword
                      )}`
                    );

                    searchPetroHub(
                      keyword
                    );
                  }}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-orange-500 hover:text-orange-400"
                >
                  {keyword}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* RESULTS */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">

          {/* LOADING */}

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <p className="font-semibold text-orange-400">
                Searching
                PetroHub...
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Looking through
                articles and
                library resources.
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6">
                <p className="font-semibold text-red-300">
                  Search failed
                </p>

                <p className="mt-2 text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

          {/* NO RESULTS */}

          {!loading &&
            !error &&
            searched &&
            results.length ===
              0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <h2 className="text-xl font-bold">
                  No results
                  found
                </h2>

                <p className="mt-3 text-slate-400">
                  No PetroHub
                  articles or
                  library resources
                  matched
                  {" "}
                  <span className="font-semibold text-white">
                    “{query}”
                  </span>
                  .
                </p>

                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                  className="mt-6 font-semibold text-orange-400 hover:text-orange-300"
                >
                  Clear Search
                </button>
              </div>
            )}

          {/* RESULTS */}

          {!loading &&
            !error &&
            results.length >
              0 && (
              <>
                {/* RESULT SUMMARY */}

                <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {
                          results.length
                        }{" "}
                        result
                        {results.length ===
                        1
                          ? ""
                          : "s"}{" "}
                        found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Results for
                        {" "}
                        <span className="text-slate-300">
                          “{query}”
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        clearSearch
                      }
                      className="font-semibold text-orange-400 hover:text-orange-300"
                    >
                      Clear Search
                    </button>
                  </div>

                  {/* COUNTS */}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <ResultCount
                      label="Articles"
                      value={
                        counts.articles
                      }
                    />

                    <ResultCount
                      label="Library"
                      value={
                        counts.library
                      }
                    />
                  </div>
                </div>

                {/* CARDS */}

                <div className="space-y-5">
                  {results.map(
                    (
                      result
                    ) => (
                      <SearchResultCard
                        key={
                          `${result.resultType}-${result.id}`
                        }
                        result={
                          result
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}

          {/* INITIAL STATE */}

          {!loading &&
            !error &&
            !searched &&
            !query.trim() && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <h2 className="text-xl font-bold">
                  Search PetroHub
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  Enter a keyword
                  above to search
                  engineering
                  articles, books,
                  manuals,
                  standards,
                  notes and
                  downloadable
                  resources.
                </p>
              </div>
            )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================
   SEARCH RESULT CARD
========================= */

function SearchResultCard({
  result,
}: {
  result: SearchResult;
}) {
  const isArticle =
    result.resultType ===
    "article";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-0.5 hover:border-orange-500/50">
      <div
        className={
          result.coverImage
            ? "grid md:grid-cols-[180px_1fr]"
            : ""
        }
      >
        {/* LIBRARY COVER */}

        {result.coverImage && (
          <Link
            href={result.href}
            className="block bg-slate-800"
          >
            <img
              src={
                result.coverImage
              }
              alt={result.title}
              className="h-full min-h-[220px] w-full object-cover"
            />
          </Link>
        )}

        {/* CONTENT */}

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">

            {/* RESULT TYPE */}

            <span
              className={
                isArticle
                  ? "rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400"
                  : "rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400"
              }
            >
              {
                result.typeLabel
              }
            </span>

            {/* CATEGORY */}

            {result.category && (
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-400">
                {
                  result.category
                }
              </span>
            )}

            {/* HOSTED / EXTERNAL */}

            {!isArticle &&
              result.resourceType && (
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-500">
                  {result.resourceType ===
                  "hosted"
                    ? "Hosted PDF"
                    : "Official Source"}
                </span>
              )}
          </div>

          <Link
            href={
              result.href
            }
          >
            <h2 className="mt-5 text-2xl font-bold leading-8 transition hover:text-orange-400">
              {result.title}
            </h2>
          </Link>

          {/* AUTHOR */}

          {!isArticle &&
            result.author && (
              <p className="mt-2 text-sm text-slate-500">
                By{" "}
                <span className="font-medium text-slate-400">
                  {
                    result.author
                  }
                </span>
              </p>
            )}

          {/* DESCRIPTION */}

          {result.description && (
            <p className="mt-4 line-clamp-3 leading-7 text-slate-400">
              {
                result.description
              }
            </p>
          )}

          {/* PUBLISHER */}

          {!isArticle &&
            result.publisher && (
              <p className="mt-4 text-sm text-slate-500">
                Publisher:{" "}
                {
                  result.publisher
                }
              </p>
            )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={
                result.href
              }
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              {isArticle
                ? "Read article →"
                : "View resource →"}
            </Link>

            {result.createdAt && (
              <span className="text-xs text-slate-600">
                {new Date(
                  result.createdAt
                ).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================
   RESULT COUNTER
========================= */

function ResultCount({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}