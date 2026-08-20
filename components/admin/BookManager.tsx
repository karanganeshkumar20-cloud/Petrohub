"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Book = {
  _id: string;
  title: string;
  slug: string;
  author?: string;
  category: string;
  coverImage?: string;
  status: string;
  featured?: boolean;
  views?: number;
  downloads?: number;
};

export default function BookManager({
  books,
}: {
  books: Book[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(books.map((book) => book.category))
      ),
    ];
  }, [books]);

  const filteredBooks = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return books.filter((book) => {
      const matchesSearch =
        !keyword ||
        book.title.toLowerCase().includes(keyword) ||
        (book.author || "")
          .toLowerCase()
          .includes(keyword);

      const matchesCategory =
        category === "All" ||
        book.category === category;

      const matchesStatus =
        status === "All" ||
        book.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [books, search, category, status]);

  async function deleteBook(
    id: string,
    title: string
  ) {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(
        `/api/books/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete book"
        );
      }

      alert("Book deleted successfully");

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Filters */}

      <div className="mt-10 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search title or author..."
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
        >
          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item === "All"
                ? "All Categories"
                : item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
        >
          <option value="All">
            All Status
          </option>

          <option value="Published">
            Published
          </option>

          <option value="Draft">
            Draft
          </option>
        </select>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Showing {filteredBooks.length} of{" "}
        {books.length} books
      </p>

      {/* Books Table */}

      {filteredBooks.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          No matching books found.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-slate-400">
                    Book
                  </th>

                  <th className="px-6 py-4 text-left text-sm text-slate-400">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-sm text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm text-slate-400">
                    Views
                  </th>

                  <th className="px-6 py-4 text-left text-sm text-slate-400">
                    Downloads
                  </th>

                  <th className="px-6 py-4 text-left text-sm text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr
                    key={book._id}
                    className="border-b border-slate-800 last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-16 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-12 rounded-lg bg-slate-800" />
                        )}

                        <div>
                          <p className="max-w-xs font-semibold">
                            {book.title}
                          </p>

                          {book.author && (
                            <p className="mt-1 text-sm text-slate-500">
                              {book.author}
                            </p>
                          )}

                          {book.featured && (
                            <span className="mt-2 inline-block text-xs font-semibold text-orange-400">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {book.category}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={
                          book.status === "Published"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400"
                            : "rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400"
                        }
                      >
                        {book.status}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {book.views ?? 0}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {book.downloads ?? 0}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-4">
                        <Link
                          href={`/admin/books/edit/${book._id}`}
                          className="font-semibold text-orange-400 hover:text-orange-300"
                        >
                          Edit
                        </Link>

                        {book.status ===
                          "Published" && (
                          <Link
                            href={`/library/${book.slug}`}
                            target="_blank"
                            className="font-semibold text-slate-300 hover:text-white"
                          >
                            View
                          </Link>
                        )}

                        <button
                          type="button"
                          disabled={
                            deletingId === book._id
                          }
                          onClick={() =>
                            deleteBook(
                              book._id,
                              book.title
                            )
                          }
                          className="font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          {deletingId === book._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}