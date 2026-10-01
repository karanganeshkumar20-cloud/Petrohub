import type {
  Metadata,
} from "next";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import DarcyWeisbachCalculator from "@/components/formulas/DarcyWeisbachCalculator";

export const metadata: Metadata = {
  title:
    "Darcy-Weisbach Pressure Loss Calculator | PetroHub",

  description:
    "Calculate pipe pressure loss and hydraulic head loss using the Darcy-Weisbach equation.",

  alternates: {
    canonical:
      "/formulas/darcy-weisbach",
  },
};

export default function DarcyWeisbachPage() {
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
              Darcy-Weisbach
              Pressure Loss
              Calculator
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Calculate pressure
              loss and hydraulic
              head loss caused by
              friction in a straight
              pipe.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Darcy-Weisbach
              Equation
            </p>

            <div className="mt-6 overflow-x-auto text-center text-2xl font-bold md:text-3xl">
              ΔP = f (L / D)
              (ρV² / 2)
            </div>

            <div className="mt-5 overflow-x-auto text-center text-xl text-slate-300">
              h<sub>f</sub> =
              f (L / D)
              (V² / 2g)
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-400">
              f is the Darcy
              friction factor, L is
              pipe length, D is
              internal diameter, ρ
              is fluid density and V
              is average fluid
              velocity.
            </p>
          </div>

          <DarcyWeisbachCalculator />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Assumptions
              </h2>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                <li>
                  • Straight pipe
                  friction loss.
                </li>

                <li>
                  • Constant internal
                  pipe diameter.
                </li>

                <li>
                  • Constant fluid
                  density.
                </li>

                <li>
                  • Average fluid
                  velocity is used.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Engineering Note
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Enter the Darcy
                friction factor,
                not the Fanning
                friction factor.
                Minor losses from
                elbows, valves,
                tees, entrances and
                fittings are not
                included in this
                calculation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}