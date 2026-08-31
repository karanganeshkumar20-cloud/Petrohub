"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type HistoryItemType =
  | "article"
  | "book";

type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  category?: string;
  featuredImage?: string;
  author?: string;
};

type BookItem = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  coverImage?: string;
  author?: string;
  contentType?: string;
};

type HistoryItem = {
  historyId: string;

  itemType:
    HistoryItemType;

  itemId: string;

  viewCount: number;

  lastViewedAt:
    string;

  item:
    | ArticleItem
    | BookItem;
};

export default function ReadingHistoryManager() {
  const [
    history,
    setHistory,
  ] =
    useState<
      HistoryItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    removingId,
    setRemovingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    clearing,
    setClearing,
  ] =
    useState(false);

  /* =========================
     LOAD HISTORY
  ========================= */

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/history",
            {
              method:
                "GET",

              cache:
                "no-store",
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
              "Unable to load history"
          );
        }

        setHistory(
          Array.isArray(
            data.items
          )
            ? data.items
            : []
        );
      } catch (
        error
      ) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to load history"
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  /* =========================
     COUNTS
  ========================= */

  const stats =
    useMemo(() => {
      const articles =
        history.filter(
          (item) =>
            item.itemType ===
            "article"
        ).length;

      const resources =
        history.filter(
          (item) =>
            item.itemType ===
            "book"
        ).length;

      return {
        total:
          history.length,

        articles,

        resources,
      };
    }, [history]);

  /* =========================
     REMOVE ONE
  ========================= */

  async function removeHistoryItem(
    historyId: string
  ) {
    const confirmed =
      window.confirm(
        "Remove this item from your reading history?"
      );

    if (!confirmed) {
      return;
    }

    setRemovingId(
      historyId
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/history/${historyId}`,
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
            "Unable to remove history item"
        );
      }

      setHistory(
        (current) =>
          current.filter(
            (item) =>
              item.historyId !==
              historyId
          )
      );

      setSuccess(
        "History item removed."
      );
    } catch (
      error
    ) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Unable to remove history item"
      );
    } finally {
      setRemovingId(
        null
      );
    }
  }

  /* =========================
     CLEAR ALL
  ========================= */

  async function clearHistory() {
    if (
      history.length ===
      0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Clear your complete PetroHub reading history?"
      );

    if (!confirmed) {
      return;
    }

    setClearing(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/history",
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
            "Unable to clear history"
        );
      }

      setHistory([]);

      setSuccess(
        "Reading history cleared successfully."
      );
    } catch (
      error
    ) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Unable to clear history"
      );
    } finally {
      setClearing(false);
    }
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <section className="mt-14">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading reading
          history...
        </div>
      </section>
    );
  }

  return (
    <section className="mt-14">

      {/* =========================
          STATS
      ========================= */}

      <div className="grid gap-5 sm:grid-cols-3">

        <StatCard
          title="Recently Viewed"
          value={
            stats.total
          }
        />

        <StatCard
          title="Articles Read"
          value={
            stats.articles
          }
        />

        <StatCard
          title="Resources Viewed"
          value={
            stats.resources
          }
        />
      </div>

      {/* =========================
          HEADER
      ========================= */}

      <div className="mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Learning History
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Recently Viewed
          </h2>

          <p className="mt-3 text-slate-400">
            Continue from
            articles and
            resources you
            recently explored.
          </p>
        </div>

        {history.length >
          0 && (
          <button
            type="button"
            onClick={
              clearHistory
            }
            disabled={
              clearing
            }
            className="rounded-xl border border-red-900 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {clearing
              ? "Clearing..."
              : "Clear History"}
          </button>
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="mt-6 rounded-xl border border-green-800 bg-green-500/10 p-4 text-green-400">
          {success}
        </div>
      )}

      {/* =========================
          EMPTY HISTORY
      ========================= */}

      {history.length ===
      0 ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

          <div className="text-4xl">
            ◷
          </div>

          <h3 className="mt-4 text-xl font-bold">
            No reading
            history yet
          </h3>

          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-400">
            Open an article or
            engineering resource
            while logged in and
            PetroHub will show it
            here.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">

            <Link
              href="/articles"
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Browse Articles
            </Link>

            <Link
              href="/library"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Browse Library
            </Link>
          </div>
        </div>
      ) : (
        /* =========================
           HISTORY CARDS
        ========================= */

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {history.map(
            (record) => {
              const isArticle =
                record.itemType ===
                "article";

              const article =
                isArticle
                  ? (record.item as ArticleItem)
                  : null;

              const book =
                !isArticle
                  ? (record.item as BookItem)
                  : null;

              const image =
                isArticle
                  ? article
                      ?.featuredImage
                  : book
                      ?.coverImage;

              const description =
                isArticle
                  ? article
                      ?.summary
                  : book
                      ?.description;

              const href =
                isArticle
                  ? `/articles/${record.item.slug}`
                  : `/library/${record.item.slug}`;

              return (
                <article
                  key={
                    record.historyId
                  }
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                >

                  {/* IMAGE */}

                  <Link
                    href={
                      href
                    }
                  >
                    {image ? (
                      <img
                        src={
                          image
                        }
                        alt={
                          record
                            .item
                            .title
                        }
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-slate-800 text-sm font-semibold text-slate-500">
                        PetroHub
                      </div>
                    )}
                  </Link>

                  {/* CONTENT */}

                  <div className="flex flex-1 flex-col p-5">

                    <div className="flex flex-wrap items-center justify-between gap-2">

                      <span
                        className={
                          isArticle
                            ? "rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400"
                            : "rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400"
                        }
                      >
                        {isArticle
                          ? "Article"
                          : getContentTypeLabel(
                              book
                                ?.contentType
                            )}
                      </span>

                      {record
                        .item
                        .category && (
                        <span className="text-xs text-slate-500">
                          {
                            record
                              .item
                              .category
                          }
                        </span>
                      )}
                    </div>

                    <Link
                      href={
                        href
                      }
                    >
                      <h3 className="mt-4 text-xl font-bold leading-7 transition hover:text-orange-400">
                        {
                          record
                            .item
                            .title
                        }
                      </h3>
                    </Link>

                    {description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                        {
                          description
                        }
                      </p>
                    )}

                    {/* VIEW INFO */}

                    <div className="mt-auto pt-6">

                      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">

                        <span>
                          Viewed{" "}
                          {
                            record.viewCount
                          }{" "}
                          {record.viewCount ===
                          1
                            ? "time"
                            : "times"}
                        </span>

                        <span>
                          {
                            formatDate(
                              record.lastViewedAt
                            )
                          }
                        </span>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2">

                        <Link
                          href={
                            href
                          }
                          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                        >
                          {isArticle
                            ? "Continue Reading"
                            : "Open Resource"}
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            removeHistoryItem(
                              record.historyId
                            )
                          }
                          disabled={
                            removingId ===
                            record.historyId
                          }
                          className="rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {removingId ===
                          record.historyId
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================
   CONTENT TYPE
========================= */

function getContentTypeLabel(
  type?: string
) {
  switch (type) {
    case "manual":
      return "Manual";

    case "standard":
      return "Standard";

    case "note":
      return "Note";

    case "download":
      return "Download";

    default:
      return "Book";
  }
}

/* =========================
   DATE
========================= */

function formatDate(
  value: string
) {
  const date =
    new Date(value);

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
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}