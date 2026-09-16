import {
  getServerSession,
} from "next-auth";

import {
  redirect,
} from "next/navigation";

import type {
  Metadata,
} from "next";

import "katex/dist/katex.min.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PetroHubAIChat from "@/components/ai/PetroHubAIChat";

import {
  authOptions,
} from "@/lib/auth";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "PetroHub AI | Engineering Knowledge Assistant",

  description:
    "Ask PetroHub AI about petroleum engineering, petrochemical engineering, drilling, reservoir engineering, production, process engineering, fluid mechanics and thermodynamics.",

  alternates: {
    canonical: "/ai",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title:
      "PetroHub AI | Engineering Knowledge Assistant",

    description:
      "Petroleum and petrochemical engineering knowledge, formulas and technical calculations.",

    url: "/ai",

    type: "website",
  },
};

export default async function PetroHubAIPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session) {
    redirect(
      "/login?callbackUrl=/ai"
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}

      <section className="border-b border-slate-800 px-6 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
            PetroHub AI
          </span>

          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your Engineering
            Knowledge Assistant
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Ask questions about
            petroleum engineering,
            petrochemical engineering,
            drilling, reservoir,
            production, process
            engineering, fluid
            mechanics,
            thermodynamics and
            related technical
            calculations.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
              Petroleum Engineering
            </span>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
              Petrochemical
            </span>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
              Fluid Mechanics
            </span>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
              Thermodynamics
            </span>

            <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
              Engineering Formulas
            </span>
          </div>
        </div>
      </section>

      {/* CHAT */}

      <section className="px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <PetroHubAIChat />
        </div>
      </section>

      <Footer />
    </main>
  );
}