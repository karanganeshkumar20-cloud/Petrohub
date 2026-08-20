"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

type ContentType =
  | "all"
  | "book"
  | "manual"
  | "standard"
  | "note"
  | "download";

type Book = {
  _id: string;
  title: string;
  slug: string;

  author?: string;
  category: string;

  contentType?:
    | "book"
    | "manual"
    | "standard"
    | "note"
    | "download";

  resourceType?:
    | "hosted"
    | "external";

  coverImage?: string;
  description?: string;

  featured?: boolean;

  views?: number;
  downloads?: number;
};

type Counts = {
  all: number;
  book: number;
  manual: number;
  standard: number;
  note: number;
  download: number;
};

export default function LibraryBrowser({
  books,
  counts,
}: {
  books: Book[];
  counts: Counts;
}) {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [contentType, setContentType] =
    useState<ContentType>("all");

  const categories = useMemo(() => {
    const uniqueCategories =
      Array.from(
        new Set(
          books
            .map(
              (book) =>
                book.category
            )
            .filter(Boolean)
        )
      );

    return [
      "All",
      ...uniqueCategories,
    ];
  }, [books]);

  const filteredBooks =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      return books.filter(
        (book) => {
          const currentType =
            book.contentType ||
            "book";

          const matchesType =
            contentType ===
              "all" ||
            currentType ===
              contentType;

          const matchesCategory =
            category === "All" ||
            book.category ===
              category;

          const searchableText = [
            book.title,
            book.author || "",
            book.description || "",
            book.category,
            currentType,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !keyword ||
            searchableText.includes(
              keyword
            );

          return (
            matchesType &&
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      books,
      search,
      category,
      contentType,
    ]);

  return (
    <>
      {/* CONTENT TYPE TABS */}

      <div className="mt-10 flex gap-3 overflow-x-auto pb-2">
        <TypeButton
          label="All"
          value="all"
          count={counts.all}
          active={
            contentType === "all"
          }
          onClick={() =>
            setContentType("all")
          }
        />

        <TypeButton
          label="Books"
          value="book"
          count={counts.book}
          active={
            contentType === "book"
          }
          onClick={() =>
            setContentType("book")
          }
        />

        <TypeButton
          label="Manuals"
          value="manual"
          count={counts.manual}
          active={
            contentType ===
            "manual"
          }
          onClick={() =>
            setContentType(
              "manual"
            )
          }
        />

        <TypeButton
          label="Standards"
          value="standard"
          count={counts.standard}
          active={
            contentType ===
            "standard"
          }
          onClick={() =>
            setContentType(
              "standard"
            )
          }
        />

        <TypeButton
          label="Notes"
          value="note"
          count={counts.note}
          active={
            contentType === "note"
          }
          onClick={() =>
            setContentType("note")
          }
        />

        <TypeButton
          label="Downloads"
          value="download"
          count={counts.download}
          active={
            contentType ===
            "download"
          }
          onClick={() =>
            setContentType(
              "download"
            )
          }
        />
      </div>

      {/* SEARCH + CATEGORY */}

      <div className="mt-7 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-[1fr_300px]">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search books, manuals, standards, authors or topics..."
          className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none focus:border-orange-500"
        >
          {categories.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item === "All"
                  ? "All Categories"
                  : item}
              </option>
            )
          )}
        </select>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Showing{" "}
          {
            filteredBooks.length
          }{" "}
          of {books.length}{" "}
          resources
        </p>

        {(search ||
          category !== "All" ||
          contentType !==
            "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setContentType(
                "all"
              );
            }}
            className="text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* EMPTY */}

      {filteredBooks.length ===
      0 ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h3 className="text-xl font-bold">
            No resources found
          </h3>

          <p className="mt-3 text-slate-400">
            Try another search,
            category or resource
            type.
          </p>
        </div>
      ) : (
        /* RESOURCE GRID */

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map(
            (book) => (
              <Link
                key={book._id}
                href={`/library/${book.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl"
              >
                <div className="relative">
                  {book.coverImage ? (
                    <img
                      src={
                        book.coverImage
                      }
                      alt={
                        book.title
                      }
                      className="aspect-[3/4] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center bg-slate-800 text-slate-500">
                      No Cover
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-950/90 px-3 py-1 text-xs font-bold text-orange-400 backdrop-blur">
                      {getTypeLabel(
                        book.contentType
                      )}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
                        book.resourceType ===
                        "external"
                          ? "bg-blue-500/90 text-white"
                          : "bg-green-500/90 text-white"
                      }`}
                    >
                      {book.resourceType ===
                      "external"
                        ? "Official Source"
                        : "Hosted"}
                    </span>
                  </div>

                  {book.featured && (
                    <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                      ★ Featured
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <span className="text-sm font-semibold text-orange-400">
                    {book.category}
                  </span>

                  <h2 className="mt-3 line-clamp-2 text-xl font-bold leading-7 transition group-hover:text-orange-400">
                    {book.title}
                  </h2>

                  {book.author && (
                    <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                      {book.author}
                    </p>
                  )}

                  {book.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                      {
                        book.description
                      }
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
                    <span>
                      {book.views ??
                        0}{" "}
                      views
                    </span>

                    {book.resourceType ===
                      "hosted" && (
                      <span>
                        {book.downloads ??
                          0}{" "}
                        downloads
                      </span>
                    )}
                  </div>

                  <p className="mt-5 font-semibold text-orange-400">
                    {book.resourceType ===
                    "external"
                      ? "View details →"
                      : "Open resource →"}
                  </p>
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </>
  );
}

function TypeButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  value: ContentType;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
        active
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-slate-700 bg-slate-900 text-slate-300 hover:border-orange-500/50 hover:text-orange-400"
      }`}
    >
      {label}

      <span
        className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
          active
            ? "bg-white/20 text-white"
            : "bg-slate-800 text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function getTypeLabel(
  value?: string
) {
  switch (value) {
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