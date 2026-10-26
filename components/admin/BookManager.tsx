"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

  status:
    | "Published"
    | "Draft";

  featured?: boolean;

  views?: number;
  downloads?: number;

  publisher?: string;
  createdAt?: string;
};

export default function BookManager({
  books,
}: {
  books: Book[];
}) {
  const [
    resources,
    setResources,
  ] =
    useState<Book[]>(
      books
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState("All");

  const [
    status,
    setStatus,
  ] =
    useState("All");

  const [
    contentType,
    setContentType,
  ] =
    useState("All");

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<string | null>(
      null
    );

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

  useEffect(() => {
    setResources(
      books
    );
  }, [books]);

  const categories =
    useMemo(() => {
      return [
        "All",

        ...Array.from(
          new Set(
            resources
              .map(
                (
                  resource
                ) =>
                  resource.category
              )
              .filter(
                Boolean
              )
          )
        ),
      ];
    }, [resources]);

  const filteredResources =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return resources.filter(
        (
          resource
        ) => {
          const searchText =
            [
              resource.title,
              resource.slug,
              resource.author,
              resource.category,
              resource.publisher,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            !keyword ||
            searchText.includes(
              keyword
            );

          const matchesCategory =
            category ===
              "All" ||
            resource.category ===
              category;

          const matchesStatus =
            status ===
              "All" ||
            resource.status ===
              status;

          const matchesContentType =
            contentType ===
              "All" ||
            resource.contentType ===
              contentType;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus &&
            matchesContentType
          );
        }
      );
    }, [
      resources,
      search,
      category,
      status,
      contentType,
    ]);

  const publishedCount =
    resources.filter(
      (
        resource
      ) =>
        resource.status ===
        "Published"
    ).length;

  const draftCount =
    resources.filter(
      (
        resource
      ) =>
        resource.status ===
        "Draft"
    ).length;

  const featuredCount =
    resources.filter(
      (
        resource
      ) =>
        resource.featured
    ).length;

  const totalDownloads =
    resources.reduce(
      (
        total,
        resource
      ) =>
        total +
        Number(
          resource.downloads ||
            0
        ),
      0
    );

  async function deleteResource(
    resource: Book
  ) {
    const confirmed =
      window.confirm(
        `Delete "${resource.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      resource._id
    );

    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          `/api/books/${resource._id}`,
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
            "Unable to delete resource"
        );
      }

      setResources(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item._id !==
              resource._id
          )
      );

      setMessage(
        "Library resource deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete failed"
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  return (
    <>
      {/* STATS */}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Resources"
          value={
            resources.length
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

        <StatCard
          label="Downloads"
          value={
            totalDownloads
          }
        />
      </div>

      {/* FILTERS */}

      <div className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-2 xl:grid-cols-4">
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
          placeholder="Search resources..."
          className={inputClass}
        />

        <select
          value={
            category
          }
          onChange={(
            event
          ) =>
            setCategory(
              event.target.value
            )
          }
          className={inputClass}
        >
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
                {item ===
                "All"
                  ? "All Categories"
                  : item}
              </option>
            )
          )}
        </select>

        <select
          value={
            status
          }
          onChange={(
            event
          ) =>
            setStatus(
              event.target.value
            )
          }
          className={inputClass}
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
            contentType
          }
          onChange={(
            event
          ) =>
            setContentType(
              event.target.value
            )
          }
          className={inputClass}
        >
          <option value="All">
            All Types
          </option>

          <option value="book">
            Book
          </option>

          <option value="manual">
            Manual
          </option>

          <option value="standard">
            Standard
          </option>

          <option value="note">
            Note
          </option>

          <option value="download">
            Download
          </option>
        </select>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Showing{" "}
        {
          filteredResources.length
        }{" "}
        of{" "}
        {
          resources.length
        }{" "}
        resources
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {/* TABLE */}

      {filteredResources.length ===
      0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <p className="font-semibold text-slate-300">
            No matching resources
            found.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Adjust the filters or
            add a new library
            resource.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-800 bg-slate-950/40">
                <tr>
                  <TableHeader>
                    Resource
                  </TableHeader>

                  <TableHeader>
                    Type
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
                    Downloads
                  </TableHeader>

                  <TableHeader>
                    Actions
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {filteredResources.map(
                  (
                    resource
                  ) => (
                    <tr
                      key={
                        resource._id
                      }
                      className="border-b border-slate-800 transition last:border-b-0 hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex min-w-[280px] items-center gap-4">
                          {resource.coverImage ? (
                            <img
                              src={
                                resource.coverImage
                              }
                              alt={
                                resource.title
                              }
                              className="h-16 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-500">
                              PDF
                            </div>
                          )}

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="max-w-xs font-semibold text-white">
                                {
                                  resource.title
                                }
                              </p>

                              {resource.featured && (
                                <span className="rounded-full bg-orange-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-400">
                                  Featured
                                </span>
                              )}
                            </div>

                            {resource.author && (
                              <p className="mt-1 text-sm text-slate-500">
                                {
                                  resource.author
                                }
                              </p>
                            )}

                            <p className="mt-1 text-xs text-slate-600">
                              {
                                resource.slug
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm capitalize text-slate-300">
                        {resource.contentType ||
                          "book"}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-300">
                        {
                          resource.category
                        }
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          status={
                            resource.status
                          }
                        />
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-300">
                        {Number(
                          resource.views ??
                            0
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-300">
                        {Number(
                          resource.downloads ??
                            0
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-4">
                          <Link
                            href={`/admin/books/edit/${resource._id}`}
                            className="text-sm font-bold text-orange-400 transition hover:text-orange-300"
                          >
                            Edit
                          </Link>

                          {resource.status ===
                            "Published" && (
                            <Link
                              href={`/library/${resource.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-slate-300 transition hover:text-white"
                            >
                              View
                            </Link>
                          )}

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              resource._id
                            }
                            onClick={() =>
                              deleteResource(
                                resource
                              )
                            }
                            className="text-sm font-bold text-red-400 transition hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingId ===
                            resource._id
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
    </>
  );
}

const inputClass =
  "rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500";

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

      <p className="mt-3 text-3xl font-black text-white">
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
    | "Published"
    | "Draft";
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