import type {
  Metadata,
} from "next";

import {
  getServerSession,
} from "next-auth";

import {
  redirect,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import AIContentInbox from "@/components/admin/AIContentInbox";

import {
  authOptions,
} from "@/lib/auth";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Knowledge Growth Inbox | PetroHub Admin",

  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAIContentPage() {
  const session =
    await getServerSession(
      authOptions
    );

  const user =
    session?.user as
      | {
          role?: string;
        }
      | undefined;

  if (!session) {
    redirect(
      "/login?callbackUrl=/admin/ai-content"
    );
  }

  if (
    user?.role !==
    "admin"
  ) {
    redirect(
      "/"
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="border-b border-slate-800 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            PetroHub Admin
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
            Knowledge Growth Inbox
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Review topics that
            PetroHub users are asking
            about but are not yet
            sufficiently covered by
            the published knowledge
            base.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/admin"
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              ← Admin Dashboard
            </a>

            <a
              href="/admin/articles"
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Articles
            </a>

            <a
              href="/ai"
              target="_blank"
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-orange-400"
            >
              Open PetroHub AI
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <AIContentInbox />
        </div>
      </section>

      <Footer />
    </main>
  );
}