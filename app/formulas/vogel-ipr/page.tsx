import type {
  Metadata,
} from "next";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import VogelIPRCalculator from "@/components/formulas/VogelIPRCalculator";

export const metadata: Metadata = {
  title:
    "Vogel IPR Calculator | PetroHub",

  description:
    "Calculate oil production rate using Vogel's inflow performance relationship for solution-gas-drive reservoirs.",

  alternates: {
    canonical:
      "/formulas/vogel-ipr",
  },
};

export default function VogelIPRPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="border-b border-slate-800 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/formulas"
            className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
          >
            &larr; All Engineering Calculators
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                Reservoir Engineering
              </span>

              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Deterministic Calculation
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black md:text-6xl">
              Vogel IPR Calculator
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Estimate oil production rate
              using Vogel&apos;s inflow
              performance relationship
              based on reservoir pressure,
              flowing bottomhole pressure,
              and maximum production rate.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          CALCULATOR CONTENT
      ================================================= */}

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            {/* =============================================
                EQUATION / THEORY
            ============================================= */}

            <div className="space-y-6">
              {/* EQUATION */}

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Equation
                </p>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">
                  <p className="whitespace-nowrap text-lg font-bold text-white md:text-xl">
                    q = qmax [1 - 0.2(Pwf / Pr) - 0.8(Pwf / Pr)^2]
                  </p>
                </div>

                {/* VARIABLES */}

                <div className="mt-6 space-y-3">
                  <Variable
                    symbol="q"
                    name="Oil Production Rate"
                    unit="STB/day"
                  />

                  <Variable
                    symbol="qmax"
                    name="Maximum Production Rate"
                    unit="STB/day"
                  />

                  <Variable
                    symbol="Pr"
                    name="Reservoir Pressure"
                    unit="psi"
                  />

                  <Variable
                    symbol="Pwf"
                    name="Flowing Bottomhole Pressure"
                    unit="psi"
                  />
                </div>
              </div>

              {/* ENGINEERING ASSUMPTIONS */}

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-bold">
                  Engineering Assumptions
                </h2>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                  <li>
                    - Intended for solution-gas-drive oil wells.
                  </li>

                  <li>
                    - Reservoir pressure must be greater than zero.
                  </li>

                  <li>
                    - Flowing bottomhole pressure must not exceed reservoir pressure.
                  </li>

                  <li>
                    - Maximum production rate represents the theoretical rate at zero flowing bottomhole pressure.
                  </li>

                  <li>
                    - Vogel&apos;s empirical relationship assumes nonlinear inflow performance.
                  </li>
                </ul>
              </div>

              {/* INTERPRETATION */}

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-bold">
                  Result Interpretation
                </h2>

                <div className="mt-4 space-y-4 text-sm leading-6 text-slate-400">
                  <p>
                    When flowing bottomhole
                    pressure approaches reservoir
                    pressure, the predicted
                    production rate approaches
                    zero.
                  </p>

                  <p>
                    As flowing bottomhole pressure
                    decreases, the predicted
                    production rate increases
                    toward the maximum production
                    rate.
                  </p>

                  <p>
                    The calculated percentage of
                    maximum rate can be used to
                    understand how much of the
                    well&apos;s theoretical inflow
                    capacity is being produced.
                  </p>
                </div>
              </div>

              {/* EXAMPLE */}

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-bold">
                  Example
                </h2>

                <div className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
                  <p>
                    Reservoir Pressure:
                    <span className="ml-2 font-semibold text-white">
                      3000 psi
                    </span>
                  </p>

                  <p>
                    Flowing Bottomhole Pressure:
                    <span className="ml-2 font-semibold text-white">
                      1000 psi
                    </span>
                  </p>

                  <p>
                    Maximum Production Rate:
                    <span className="ml-2 font-semibold text-white">
                      1000 STB/day
                    </span>
                  </p>

                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <p>
                      Expected Production Rate:
                      <span className="ml-2 font-semibold text-orange-400">
                        approximately 844.44 STB/day
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =============================================
                CALCULATOR
            ============================================= */}

            <VogelIPRCalculator />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   VARIABLE
========================================================= */

function Variable({
  symbol,
  name,
  unit,
}: {
  symbol: string;
  name: string;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <div>
        <p className="font-bold text-orange-400">
          {symbol}
        </p>

        <p className="text-sm text-slate-300">
          {name}
        </p>
      </div>

      <span className="text-sm text-slate-500">
        {unit}
      </span>
    </div>
  );
}