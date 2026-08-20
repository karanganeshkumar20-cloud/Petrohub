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
  const books = await getBooks();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold uppercase tracking-widest text-orange-500">
                PetroHub Library
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Manage Books
              </h1>

              <p className="mt-3 text-slate-400">
                Search, edit, publish and manage
                PetroHub library resources.
              </p>
            </div>

            <Link
              href="/admin/books/new"
              className="rounded-xl bg-orange-500 px-6 py-3 text-center font-bold transition hover:bg-orange-600"
            >
              + Add Book
            </Link>
          </div>

          <BookManager books={books} />
        </div>
      </section>

      <Footer />
    </main>
  );
}