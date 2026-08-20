"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-orange-500">
          PetroHub
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
          <Link href="/" className="transition hover:text-orange-400">
            Home
          </Link>

          <Link
            href="/articles"
            className="transition hover:text-orange-400"
          >
            Articles
          </Link>

          <Link
            href="/categories"
            className="transition hover:text-orange-400"
          >
            Categories
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-sm text-slate-400">
              Loading...
            </span>
          ) : session ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Join Free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}