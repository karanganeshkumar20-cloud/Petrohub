import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookManager from "@/components/admin/BookManager";

import { connectDB } from "@/lib/mongodb";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

async function getBooks() {
  await connectDB();

  const books = await BookModel.find({})
    .sort({
      createdAt: -1,
    })
    .lean();

  return JSON.parse(
    JSON.stringify(books)
  );
}

export default async function AdminBooksPage() {
  const books =
    await getBooks();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
                PetroHub Library
              </p>

              <h1 className="mt-3 text-4xl font-black">
                Manage Library
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Manage books,
                manuals, standards,
                notes and downloadable
                engineering resources.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-orange-500 hover:text-white"
              >
                Admin Dashboard
              </Link>

              <Link
                href="/admin/books/new"
                className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                + Add Resource
              </Link>
            </div>
          </div>

          <BookManager
            books={books}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}