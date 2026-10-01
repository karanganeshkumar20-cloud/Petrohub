import type {
  Metadata,
} from "next";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import BernoulliCalculator from "@/components/formulas/BernoulliCalculator";

export const metadata: Metadata = {
  title:
    "Bernoulli Equation Calculator | PetroHub",

  description:
    "Calculate downstream fluid pressure using the Bernoulli equation with pressure, velocity, elevation and density inputs.",

  alternates: {
    canonical:
      "/formulas/bernoulli-equation",
  },
};

export default function BernoulliEquationPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="border-b border-slate-800 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/formulas"
            className="text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            ← All Engineering
            Calculators
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                Fluid Mechanics
              </span>

              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Deterministic
                Calculation
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black md:text-6xl">
              Bernoulli Equation
              Calculator
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Calculate the
              downstream pressure
              between two points in
              steady incompressible
              flow using the
              Bernoulli energy
              equation.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Equation
            </p>

            <div className="mt-5 overflow-x-auto text-center text-xl font-semibold text-white md:text-3xl">
              P₁/(ρg) + V₁²/(2g)
              + z₁ = P₂/(ρg) +
              V₂²/(2g) + z₂
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              This calculator
              assumes steady,
              incompressible flow,
              no pump or turbine
              work between the two
              points, and no
              frictional head loss.
              Use a pressure-loss
              model when pipe
              friction is
              significant.
            </p>
          </div>

          <BernoulliCalculator />

          <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-xl font-bold">
              Important
              Engineering Note
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              The calculator uses
              fixed TypeScript
              calculation logic.
              PetroHub AI does not
              generate or execute
              the numerical
              equation during the
              calculation.
            </p>

            <Link
              href="/articles/bernoulli-equation"
              className="mt-5 inline-block font-semibold text-orange-400 hover:text-orange-300"
            >
              Read the Bernoulli
              Equation article →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}