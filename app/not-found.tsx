import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="relative flex min-h-[75vh] items-center overflow-hidden border-b border-slate-800 px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
              Error 404
            </p>

            <h1 className="mt-5 text-5xl font-extrabold leading-tight md:text-7xl">
              Page not found.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              The PetroHub page or engineering resource you are
              looking for may have been moved, removed, renamed or
              may no longer be available.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/"
                className="rounded-xl bg-orange-500 px-7 py-3.5 font-bold text-white transition hover:bg-orange-600"
              >
                Go to Home
              </Link>

              <Link
                href="/search"
                className="rounded-xl border border-slate-700 bg-slate-900 px-7 py-3.5 font-bold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                Search PetroHub
              </Link>
            </div>

            <div className="mt-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Continue exploring
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <QuickLink
                  href="/articles"
                  title="Articles"
                  description="Read practical engineering knowledge."
                />

                <QuickLink
                  href="/library"
                  title="Library"
                  description="Explore books, manuals and resources."
                />

                <QuickLink
                  href="/categories"
                  title="Categories"
                  description="Browse engineering disciplines."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-orange-500/50"
    >
      <h2 className="font-bold text-white transition group-hover:text-orange-400">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <p className="mt-4 text-sm font-semibold text-orange-400">
        Explore →
      </p>
    </Link>
  );
}