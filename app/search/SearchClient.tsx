"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  ENGINEERING_CATEGORIES,
} from "@/lib/categories";

/* =========================================================
   TYPES
========================================================= */

type ResultType =
  | "article"
  | "library"
  | "formula";

type SearchResult = {
  id: string;

  title: string;
  slug: string;

  description: string;
  category: string;

  resultType:
    ResultType;

  typeLabel: string;

  href: string;

  author?: string;
  publisher?: string;

  coverImage?: string;

  resourceType?: string;
  contentType?: string;

  formulaText?: string;
  subDomain?: string;

  featured?: boolean;
  views?: number;

  createdAt?: string;

  relevance?: number;
};

type SearchCounts = {
  articles: number;
  library: number;
  formulas: number;
};

type SearchClientProps = {
  initialQuery: string;
  initialType: string;
  initialCategory: string;
  initialContentType: string;
};

type SearchApiResponse = {
  success?: boolean;
  message?: string;

  query?: string;

  results?: SearchResult[];

  total?: number;

  counts?: Partial<
    SearchCounts
  >;
};

/* =========================================================
   OPTIONS
========================================================= */

const resultTypes = [
  {
    value:
      "all",
    label:
      "All Content",
  },

  {
    value:
      "article",
    label:
      "Articles",
  },

  {
    value:
      "library",
    label:
      "Library",
  },

  {
    value:
      "formula",
    label:
      "Formulas",
  },
];

const libraryTypes = [
  {
    value:
      "all",
    label:
      "All Library Types",
  },

  {
    value:
      "book",
    label:
      "Books",
  },

  {
    value:
      "manual",
    label:
      "Manuals",
  },

  {
    value:
      "standard",
    label:
      "Standards",
  },

  {
    value:
      "note",
    label:
      "Notes",
  },

  {
    value:
      "download",
    label:
      "Downloads",
  },
];

/* =========================================================
   CLIENT
========================================================= */

export default function SearchClient({
  initialQuery,
  initialType,
  initialCategory,
  initialContentType,
}: SearchClientProps) {
  const router =
    useRouter();

  const [
    query,
    setQuery,
  ] = useState(
    initialQuery
  );

  const [
    resultType,
    setResultType,
  ] = useState(
    normalizeType(
      initialType
    )
  );

  const [
    category,
    setCategory,
  ] = useState(
    normalizeCategory(
      initialCategory
    )
  );

  const [
    contentType,
    setContentType,
  ] = useState(
    normalizeContentType(
      initialContentType
    )
  );

  const [
    results,
    setResults,
  ] = useState<
    SearchResult[]
  >([]);

  const [
    counts,
    setCounts,
  ] = useState<SearchCounts>({
    articles:
      0,

    library:
      0,

    formulas:
      0,
  });

  const [
    total,
    setTotal,
  ] = useState(
    0
  );

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const [
    searched,
    setSearched,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  /* =====================================================
     SEARCH
  ===================================================== */

  async function searchPetroHub(
    searchQuery: string,
    searchType: string,
    searchCategory: string,
    searchContentType: string
  ) {
    const trimmedQuery =
      searchQuery.trim();

    const hasFilter =
      searchType !==
        "all" ||
      searchCategory !==
        "all" ||
      searchContentType !==
        "all";

    if (
      !trimmedQuery &&
      !hasFilter
    ) {
      setResults(
        []
      );

      setCounts({
        articles:
          0,

        library:
          0,

        formulas:
          0,
      });

      setTotal(
        0
      );

      setSearched(
        false
      );

      setError(
        ""
      );

      return;
    }

    setLoading(
      true
    );

    setError(
      ""
    );

    try {
      const params =
        new URLSearchParams();

      if (
        trimmedQuery
      ) {
        params.set(
          "q",
          trimmedQuery
        );
      }

      if (
        searchType !==
        "all"
      ) {
        params.set(
          "type",
          searchType
        );
      }

      if (
        searchCategory !==
        "all"
      ) {
        params.set(
          "category",
          searchCategory
        );
      }

      if (
        searchContentType !==
        "all"
      ) {
        params.set(
          "contentType",
          searchContentType
        );
      }

      const response =
        await fetch(
          `/api/search?${params.toString()}`,
          {
            method:
              "GET",

            cache:
              "no-store",
          }
        );

      const responseText =
        await response.text();

      let parsed:
        unknown = {};

      try {
        parsed =
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
        typeof parsed !==
          "object" ||
        parsed ===
          null
      ) {
        throw new Error(
          "Invalid search response"
        );
      }

      const data =
        parsed as SearchApiResponse;

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
          data.counts
            ?.articles ??
          0,

        library:
          data.counts
            ?.library ??
          0,

        formulas:
          data.counts
            ?.formulas ??
          0,
      });

      setTotal(
        data.total ??
          0
      );

      setSearched(
        true
      );
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

      setResults(
        []
      );

      setCounts({
        articles:
          0,

        library:
          0,

        formulas:
          0,
      });

      setTotal(
        0
      );

      setSearched(
        true
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /* =====================================================
     URL
  ===================================================== */

  function buildUrl(
    nextQuery: string,
    nextType: string,
    nextCategory: string,
    nextContentType: string
  ) {
    const params =
      new URLSearchParams();

    const trimmed =
      nextQuery.trim();

    if (
      trimmed
    ) {
      params.set(
        "q",
        trimmed
      );
    }

    if (
      nextType !==
      "all"
    ) {
      params.set(
        "type",
        nextType
      );
    }

    if (
      nextCategory !==
      "all"
    ) {
      params.set(
        "category",
        nextCategory
      );
    }

    if (
      nextContentType !==
        "all" &&
      (
        nextType ===
          "all" ||
        nextType ===
          "library"
      )
    ) {
      params.set(
        "contentType",
        nextContentType
      );
    }

    const queryString =
      params.toString();

    return queryString
      ? `/search?${queryString}`
      : "/search";
  }

  function navigate(
    nextQuery: string,
    nextType: string,
    nextCategory: string,
    nextContentType: string
  ) {
    router.push(
      buildUrl(
        nextQuery,
        nextType,
        nextCategory,
        nextContentType
      )
    );
  }

  /* =====================================================
     SUBMIT
  ===================================================== */

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const nextContentType =
      resultType ===
        "article" ||
      resultType ===
        "formula"
        ? "all"
        : contentType;

    navigate(
      query,
      resultType,
      category,
      nextContentType
    );
  }

  /* =====================================================
     FILTER CHANGE
  ===================================================== */

  function changeType(
    nextType: string
  ) {
    setResultType(
      nextType
    );

    const nextContentType =
      nextType ===
        "article" ||
      nextType ===
        "formula"
        ? "all"
        : contentType;

    setContentType(
      nextContentType
    );

    navigate(
      query,
      nextType,
      category,
      nextContentType
    );
  }

  function changeCategory(
    nextCategory: string
  ) {
    setCategory(
      nextCategory
    );

    navigate(
      query,
      resultType,
      nextCategory,
      contentType
    );
  }

  function changeContentType(
    nextContentType: string
  ) {
    setContentType(
      nextContentType
    );

    navigate(
      query,
      resultType,
      category,
      nextContentType
    );
  }

  /* =====================================================
     CLEAR
  ===================================================== */

  function clearSearch() {
    setQuery(
      ""
    );

    setResultType(
      "all"
    );

    setCategory(
      "all"
    );

    setContentType(
      "all"
    );

    setResults(
      []
    );

    setCounts({
      articles:
        0,

      library:
        0,

      formulas:
        0,
    });

    setTotal(
      0
    );

    setSearched(
      false
    );

    setError(
      ""
    );

    router.push(
      "/search"
    );
  }

  /* =====================================================
     INITIAL / URL CHANGE
  ===================================================== */

  useEffect(() => {
    const nextType =
      normalizeType(
        initialType
      );

    const nextCategory =
      normalizeCategory(
        initialCategory
      );

    let nextContentType =
      normalizeContentType(
        initialContentType
      );

    if (
      nextType ===
        "article" ||
      nextType ===
        "formula"
    ) {
      nextContentType =
        "all";
    }

    setQuery(
      initialQuery
    );

    setResultType(
      nextType
    );

    setCategory(
      nextCategory
    );

    setContentType(
      nextContentType
    );

    searchPetroHub(
      initialQuery,
      nextType,
      nextCategory,
      nextContentType
    );
  }, [
    initialQuery,
    initialType,
    initialCategory,
    initialContentType,
  ]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-slate-800 px-5 py-16 sm:px-6 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub Search
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Search Engineering
            Knowledge
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Search engineering
            articles, library
            resources and verified
            PetroHub formulas from
            one place.
          </p>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={
                  query
                }
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                autoComplete="off"
                placeholder="Search HIRA, drilling, Darcy, reservoir, LOTO..."
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
              />

              <button
                type="submit"
                disabled={
                  loading
                }
                className="rounded-xl bg-orange-500 px-8 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Searching..."
                  : "Search"}
              </button>
            </div>

            {/* FILTERS */}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterSelect
                label="Content"
                value={
                  resultType
                }
                onChange={
                  changeType
                }
                options={
                  resultTypes
                }
              />

              <FilterSelect
                label="Category"
                value={
                  category
                }
                onChange={
                  changeCategory
                }
                options={[
                  {
                    value:
                      "all",

                    label:
                      "All Categories",
                  },

                  ...ENGINEERING_CATEGORIES.map(
                    (
                      item
                    ) => ({
                      value:
                        item.slug,

                      label:
                        item.name,
                    })
                  ),
                ]}
              />

              <FilterSelect
                label="Library Type"
                value={
                  contentType
                }
                onChange={
                  changeContentType
                }
                disabled={
                  resultType ===
                    "article" ||
                  resultType ===
                    "formula"
                }
                options={
                  libraryTypes
                }
              />
            </div>
          </form>

          {/* QUICK SEARCH */}

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "HIRA",
              "LOTO",
              "Darcy",
              "Drilling",
              "Reservoir",
              "Fire Safety",
            ].map(
              (
                keyword
              ) => (
                <button
                  key={
                    keyword
                  }
                  type="button"
                  onClick={() => {
                    setQuery(
                      keyword
                    );

                    navigate(
                      keyword,
                      resultType,
                      category,
                      contentType
                    );
                  }}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-orange-500 hover:text-orange-400"
                >
                  {
                    keyword
                  }
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* RESULTS */}

      <section className="px-5 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          {/* LOADING */}

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <p className="font-semibold text-orange-400">
                Searching PetroHub...
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Looking through
                articles, library
                resources and verified
                formulas.
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
                  {
                    error
                  }
                </p>
              </div>
            )}

          {/* INITIAL */}

          {!loading &&
            !error &&
            !searched && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <h2 className="text-xl font-bold">
                  Search PetroHub
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  Enter a keyword or
                  choose a filter to
                  search PetroHub
                  engineering
                  knowledge.
                </p>
              </div>
            )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            searched &&
            results.length ===
              0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <h2 className="text-xl font-bold">
                  No results found
                </h2>

                <p className="mt-3 text-slate-400">
                  No PetroHub content
                  matched your current
                  search and filters.
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
                <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {total.toLocaleString()}{" "}
                        result
                        {total === 1
                          ? ""
                          : "s"}{" "}
                        matched
                      </p>

                      {query.trim() && (
                        <p className="mt-1 text-sm text-slate-500">
                          Search results
                          for{" "}
                          <span className="font-semibold text-slate-300">
                            "
                            {
                              query
                            }
                            "
                          </span>
                        </p>
                      )}

                      {total >
                        results.length && (
                        <p className="mt-1 text-xs text-slate-600">
                          Showing the
                          top{" "}
                          {
                            results.length
                          }{" "}
                          results by
                          relevance.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={
                        clearSearch
                      }
                      className="self-start font-semibold text-orange-400 hover:text-orange-300 lg:self-auto"
                    >
                      Clear Search
                    </button>
                  </div>

                  {/* COUNTS */}

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <ResultCount
                      label="Articles"
                      value={
                        counts.articles
                      }
                      active={
                        resultType ===
                        "article"
                      }
                      onClick={() =>
                        changeType(
                          "article"
                        )
                      }
                    />

                    <ResultCount
                      label="Library"
                      value={
                        counts.library
                      }
                      active={
                        resultType ===
                        "library"
                      }
                      onClick={() =>
                        changeType(
                          "library"
                        )
                      }
                    />

                    <ResultCount
                      label="Formulas"
                      value={
                        counts.formulas
                      }
                      active={
                        resultType ===
                        "formula"
                      }
                      onClick={() =>
                        changeType(
                          "formula"
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  {results.map(
                    (
                      result
                    ) => (
                      <SearchResultCard
                        key={`${result.resultType}-${result.id}`}
                        result={
                          result
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   RESULT CARD
========================================================= */

function SearchResultCard({
  result,
}: {
  result:
    SearchResult;
}) {
  const isArticle =
    result.resultType ===
    "article";

  const isLibrary =
    result.resultType ===
    "library";

  const isFormula =
    result.resultType ===
    "formula";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-0.5 hover:border-orange-500/50">
      <div
        className={
          result.coverImage
            ? "grid md:grid-cols-[180px_1fr]"
            : ""
        }
      >
        {result.coverImage && (
          <Link
            href={
              result.href
            }
            className="block bg-slate-800"
          >
            <img
              src={
                result.coverImage
              }
              alt={
                result.title
              }
              loading="lazy"
              className="h-full min-h-[220px] w-full object-cover"
            />
          </Link>
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                isArticle
                  ? "rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400"
                  : isFormula
                    ? "rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-400"
                    : "rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400"
              }
            >
              {
                result.typeLabel
              }
            </span>

            {result.category && (
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-400">
                {
                  result.category
                }
              </span>
            )}

            {result.featured && (
              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                Featured
              </span>
            )}

            {isLibrary &&
              result.resourceType && (
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-500">
                  {result.resourceType ===
                  "hosted"
                    ? "Hosted"
                    : "External"}
                </span>
              )}
          </div>

          <Link
            href={
              result.href
            }
          >
            <h2 className="mt-5 text-2xl font-bold leading-8 transition hover:text-orange-400">
              {
                result.title
              }
            </h2>
          </Link>

          {isFormula &&
            result.subDomain && (
              <p className="mt-2 text-sm text-slate-500">
                {
                  result.subDomain
                }
              </p>
            )}

          {result.author && (
            <p className="mt-2 text-sm text-slate-500">
              By{" "}
              <span className="font-medium text-slate-400">
                {
                  result.author
                }
              </span>
            </p>
          )}

          {result.description && (
            <p className="mt-4 line-clamp-3 leading-7 text-slate-400">
              {
                result.description
              }
            </p>
          )}

          {isFormula &&
            result.formulaText && (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Formula
                </p>

                <p className="mt-2 break-words font-mono text-sm text-slate-300">
                  {
                    result.formulaText
                  }
                </p>
              </div>
            )}

          {isLibrary &&
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
                ? "Read Article"
                : isFormula
                  ? "Open Formula"
                  : "View Resource"}
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              {typeof result.views ===
                "number" && (
                <span>
                  {result.views.toLocaleString()}{" "}
                  views
                </span>
              )}

              {result.createdAt && (
                <span>
                  {formatDate(
                    result.createdAt
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;

  value: string;

  options: {
    value: string;
    label: string;
  }[];

  onChange: (
    value: string
  ) => void;

  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <select
        value={
          value
        }
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {options.map(
          (
            option
          ) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>
    </label>
  );
}

/* =========================================================
   RESULT COUNT
========================================================= */

function ResultCount({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={
        active
          ? "rounded-xl border border-orange-500 bg-orange-500/10 px-4 py-3 text-left"
          : "rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-orange-500/50"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {
          value.toLocaleString()
        }
      </p>
    </button>
  );
}

/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeType(
  value: string
) {
  return [
    "article",
    "library",
    "formula",
  ].includes(
    value
  )
    ? value
    : "all";
}

function normalizeCategory(
  value: string
) {
  const valid =
    ENGINEERING_CATEGORIES.some(
      (
        category
      ) =>
        category.slug ===
        value
    );

  return valid
    ? value
    : "all";
}

function normalizeContentType(
  value: string
) {
  return [
    "book",
    "manual",
    "standard",
    "note",
    "download",
  ].includes(
    value
  )
    ? value
    : "all";
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value: string
) {
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