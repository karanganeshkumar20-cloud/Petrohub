import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LibraryBrowser from "@/components/library/LibraryBrowser";

import { connectDB } from "@/lib/mongodb";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

async function getBooks() {
  await connectDB();

  const books = await BookModel.find({
    status: "Published",
  })
    .sort({
      featured: -1,
      createdAt: -1,
    })
    .lean();

  return JSON.parse(JSON.stringify(books));
}

export default async function LibraryPage() {
  const books = await getBooks();

  const featuredBooks = books.filter(
    (book: any) => book.featured
  );

  const counts = {
    all: books.length,

    book: books.filter(
      (item: any) =>
        (item.contentType || "book") === "book"
    ).length,

    manual: books.filter(
      (item: any) =>
        item.contentType === "manual"
    ).length,

    standard: books.filter(
      (item: any) =>
        item.contentType === "standard"
    ).length,

    note: books.filter(
      (item: any) =>
        item.contentType === "note"
    ).length,

    download: books.filter(
      (item: any) =>
        item.contentType === "download"
    ).length,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}
      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub Library
          </p>

          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
            Engineering Library
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Explore engineering books, manuals, standards,
            notes and legally available technical resources
            across Oil & Gas, HSE and engineering disciplines.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <LibraryStat
              label="Resources"
              value={books.length}
            />

            <LibraryStat
              label="Featured"
              value={featuredBooks.length}
            />

            <LibraryStat
              label="Categories"
              value={
                new Set(
                  books.map(
                    (book: any) => book.category
                  )
                ).size
              }
            />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featuredBooks.length > 0 && (
        <section className="border-b border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Recommended
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Featured Resources
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredBooks
                .slice(0, 3)
                .map((book: any) => (
                  <a
                    key={book._id}
                    href={`/library/${book.slug}`}
                    className="group flex gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-orange-500/50"
                  >
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-40 w-28 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-28 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs text-slate-500">
                        No Cover
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                          {book.category}
                        </span>

                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                          {getContentTypeLabel(
                            book.contentType
                          )}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-bold leading-7 transition group-hover:text-orange-400">
                        {book.title}
                      </h3>

                      {book.author && (
                        <p className="mt-2 text-sm text-slate-500">
                          {book.author}
                        </p>
                      )}

                      <p className="mt-4 text-sm font-semibold text-orange-400">
                        View resource →
                      </p>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* BROWSE */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Browse
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Explore Resources
          </h2>

          <p className="mt-3 max-w-2xl text-slate-400">
            Filter PetroHub resources by type, engineering
            category, title, author or topic.
          </p>

          <LibraryBrowser
            books={books}
            counts={counts}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function LibraryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
      <span className="text-2xl font-bold">
        {value}
      </span>

      <span className="ml-2 text-sm text-slate-500">
        {label}
      </span>
    </div>
  );
}

function getContentTypeLabel(
  contentType?: string
) {
  switch (contentType) {
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