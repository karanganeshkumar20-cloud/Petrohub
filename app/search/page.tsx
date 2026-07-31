"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type SearchResult = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  createdAt: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function searchArticles(searchQuery: string) {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setResults([]);
      setSearched(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(trimmedQuery)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Search failed");
      }

      setResults(data.results);
      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to search articles"
      );
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    searchArticles(query);
  }

  useEffect(() => {
    if (initialQuery) {
      searchArticles(initialQuery);
    }
  }, [initialQuery]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-semibold uppercase tracking-widest text-orange-500">
            PetroHub Search
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Search Engineering Knowledge
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Search articles by title, summary, content or category.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Permit to Work, HIRA, LOTO..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 outline-none placeholder:text-slate-500 focus:border-orange-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-orange-500 px-7 py-4 font-bold hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          {error && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 p-5 text-red-300">
              {error}
            </div>
          )}

          {!error && searched && results.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
              No results found for “{query}”.
            </div>
          )}

          {!error && results.length > 0 && (
            <>
              <p className="mb-6 text-slate-400">
                {results.length} result(s) found
              </p>

              <div className="space-y-5">
                {results.map((article) => (
                  <article
                    key={article._id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-orange-500/50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
                        {article.category}
                      </span>

                      <span className="text-sm text-slate-500">
                        {new Date(
                          article.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-bold">
                      {article.title}
                    </h2>

                    <p className="mt-3 leading-7 text-slate-400">
                      {article.summary}
                    </p>

                    <Link
                      href={`/articles/${article.slug}`}
                      className="mt-5 inline-block font-semibold text-orange-400 hover:text-orange-300"
                    >
                      Read article →
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}