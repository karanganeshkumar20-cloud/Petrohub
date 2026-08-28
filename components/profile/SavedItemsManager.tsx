"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

type ItemType =
  | "article"
  | "book";

type SavedArticle = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  category?: string;
  featuredImage?: string;
  author?: string;
};

type SavedBook = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  coverImage?: string;
  author?: string;
  contentType?: string;
};

type SavedBookmark = {
  bookmarkId: string;

  itemType:
    ItemType;

  savedAt?: string;

  item:
    | SavedArticle
    | SavedBook;
};

type Props = {
  initialBookmarks:
    SavedBookmark[];
};

type FilterType =
  | "all"
  | "article"
  | "book";

export default function SavedItemsManager({
  initialBookmarks,
}: Props) {
  const [
    bookmarks,
    setBookmarks,
  ] =
    useState<
      SavedBookmark[]
    >(
      initialBookmarks
    );

  const [
    filter,
    setFilter,
  ] =
    useState<FilterType>(
      "all"
    );

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* =========================
     COUNTS
  ========================= */

  const counts =
    useMemo(() => {
      return {
        total:
          bookmarks.length,

        articles:
          bookmarks.filter(
            (bookmark) =>
              bookmark.itemType ===
              "article"
          ).length,

        resources:
          bookmarks.filter(
            (bookmark) =>
              bookmark.itemType ===
              "book"
          ).length,
      };
    }, [bookmarks]);

  /* =========================
     FILTERED ITEMS
  ========================= */

  const filteredBookmarks =
    useMemo(() => {
      if (
        filter ===
        "all"
      ) {
        return bookmarks;
      }

      return bookmarks.filter(
        (bookmark) =>
          bookmark.itemType ===
          filter
      );
    }, [
      bookmarks,
      filter,
    ]);

  /* =========================
     REMOVE BOOKMARK
  ========================= */

  async function removeBookmark(
    bookmark:
      SavedBookmark
  ) {
    const confirmed =
      window.confirm(
        `Remove "${bookmark.item.title}" from your saved items?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      bookmark.bookmarkId
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/bookmarks/${bookmark.bookmarkId}`,
          {
            method:
              "DELETE",
          }
        );

      const text =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
      } = {};

      try {
        data = text
          ? JSON.parse(
              text
            )
          : {};
      } catch {
        throw new Error(
          `Invalid server response (${response.status})`
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to remove saved item"
        );
      }

      setBookmarks(
        (
          current
        ) =>
          current.filter(
            (item) =>
              item.bookmarkId !==
              bookmark.bookmarkId
          )
      );

      setSuccess(
        "Saved item removed successfully."
      );
    } catch (
      error
    ) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Unable to remove saved item"
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  return (
    <div>
      {/* =========================
          STATS
      ========================= */}

      <div className="grid gap-5 sm:grid-cols-3">
        <SavedStat
          label="Total Saved"
          value={
            counts.total
          }
        />

        <SavedStat
          label="Saved Articles"
          value={
            counts.articles
          }
        />

        <SavedStat
          label="Saved Resources"
          value={
            counts.resources
          }
        />
      </div>

      {/* =========================
          SAVED COLLECTION
      ========================= */}

      <section className="mt-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              My Collection
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Saved Items
            </h2>

            <p className="mt-3 text-slate-400">
              Articles and
              engineering
              resources saved
              for later.
            </p>
          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={
                filter ===
                "all"
              }
              onClick={() =>
                setFilter(
                  "all"
                )
              }
            >
              All (
              {
                counts.total
              }
              )
            </FilterButton>

            <FilterButton
              active={
                filter ===
                "article"
              }
              onClick={() =>
                setFilter(
                  "article"
                )
              }
            >
              Articles (
              {
                counts.articles
              }
              )
            </FilterButton>

            <FilterButton
              active={
                filter ===
                "book"
              }
              onClick={() =>
                setFilter(
                  "book"
                )
              }
            >
              Resources (
              {
                counts.resources
              }
              )
            </FilterButton>
          </div>
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
            {
              success
            }
          </div>
        )}

        {/* EMPTY */}

        {filteredBookmarks.length ===
        0 ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-4xl">
              ☆
            </div>

            <h3 className="mt-4 text-xl font-bold">
              No saved items
            </h3>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-400">
              Save useful
              PetroHub articles
              and library
              resources to access
              them quickly from
              your profile.
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
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookmarks.map(
              (
                bookmark
              ) => {
                const isArticle =
                  bookmark.itemType ===
                  "article";

                const article =
                  isArticle
                    ? (bookmark.item as SavedArticle)
                    : null;

                const book =
                  !isArticle
                    ? (bookmark.item as SavedBook)
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
                    ? `/articles/${bookmark.item.slug}`
                    : `/library/${bookmark.item.slug}`;

                return (
                  <article
                    key={
                      bookmark.bookmarkId
                    }
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                  >
                    {/* IMAGE */}

                    <Link
                      href={
                        href
                      }
                      className="block"
                    >
                      {image ? (
                        <img
                          src={
                            image
                          }
                          alt={
                            bookmark
                              .item
                              .title
                          }
                          className={
                            isArticle
                              ? "aspect-video w-full object-cover"
                              : "aspect-[16/9] w-full object-cover"
                          }
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-slate-800 text-sm font-semibold text-slate-500">
                          PetroHub
                        </div>
                      )}
                    </Link>

                    {/* BODY */}

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

                        {bookmark
                          .item
                          .category && (
                          <span className="text-xs text-slate-500">
                            {
                              bookmark
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
                            bookmark
                              .item
                              .title
                          }
                        </h3>
                      </Link>

                      {bookmark
                        .item
                        .author && (
                        <p className="mt-2 text-sm text-slate-500">
                          By{" "}
                          {
                            bookmark
                              .item
                              .author
                          }
                        </p>
                      )}

                      {description && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                          {
                            description
                          }
                        </p>
                      )}

                      <div className="mt-auto pt-6">
                        {bookmark.savedAt && (
                          <p className="mb-4 text-xs text-slate-600">
                            Saved{" "}
                            {formatDate(
                              bookmark.savedAt
                            )}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={
                              href
                            }
                            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                          >
                            {isArticle
                              ? "Read Article"
                              : "Open Resource"}
                          </Link>

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              bookmark.bookmarkId
                            }
                            onClick={() =>
                              removeBookmark(
                                bookmark
                              )
                            }
                            className="rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            bookmark.bookmarkId
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
    </div>
  );
}

/* =========================
   STAT
========================= */

function SavedStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================
   FILTER BUTTON
========================= */

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children:
    React.ReactNode;
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
          ? "rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white"
          : "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-orange-500 hover:text-orange-400"
      }
    >
      {children}
    </button>
  );
}

/* =========================
   CONTENT LABEL
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