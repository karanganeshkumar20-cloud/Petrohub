import type {
  Metadata,
} from "next";

import Footer from "@/components/Footer";
import FormulaBookmarkButton from "@/components/formulas/FormulaBookmarkButton";
import Navbar from "@/components/Navbar";

import ProductivityIndexCalculator from "@/components/formulas/ProductivityIndexCalculator";

export const metadata: Metadata = {
  title:
    "Productivity Index Calculator | PetroHub",

  description:
    "Calculate well productivity index from production rate, reservoir pressure, and flowing bottomhole pressure.",

  alternates: {
    canonical:
      "/formulas/productivity-index",
  },
};

export default function ProductivityIndexPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 text-white">
        {/* HERO */}

        <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
                Reservoir Engineering
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Productivity Index
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
                Calculate well productivity
                index from production rate
                and pressure drawdown.
              </p>
            </div>
          </div>
        
          <div className="mx-auto mt-8 max-w-7xl">
            <FormulaBookmarkButton
              slug="productivity-index"
            />
          </div>
</section>

        {/* MAIN */}

        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr]">
            {/* FORMULA INFO */}

            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Equation
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Productivity Index Equation
                </h2>

                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="whitespace-nowrap font-mono text-lg font-semibold text-orange-300">
                    J = q / (Pr - Pwf)
                  </p>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-400">
                  Productivity index describes
                  the production rate obtained
                  per unit of pressure drawdown.
                </p>
              </section>

              {/* VARIABLES */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-xl font-bold">
                  Variables
                </h2>

                <div className="mt-5 space-y-4">
                  <Variable
                    symbol="J"
                    description="Productivity index"
                    unit="STB/day/psi"
                  />

                  <Variable
                    symbol="q"
                    description="Oil production rate"
                    unit="STB/day"
                  />

                  <Variable
                    symbol="Pr"
                    description="Reservoir pressure"
                    unit="psi"
                  />

                  <Variable
                    symbol="Pwf"
                    description="Flowing bottomhole pressure"
                    unit="psi"
                  />
                </div>
              </section>

              {/* INTERPRETATION */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-xl font-bold">
                  Engineering Interpretation
                </h2>

                <div className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
                  <p>
                    A higher productivity
                    index generally indicates
                    stronger well inflow
                    performance for a given
                    pressure drawdown.
                  </p>

                  <p>
                    A lower productivity
                    index can indicate lower
                    reservoir permeability,
                    formation damage, higher
                    fluid resistance, or
                    unfavorable completion
                    conditions.
                  </p>

                  <p>
                    Productivity index is
                    commonly used for well
                    performance screening
                    and inflow analysis.
                  </p>
                </div>
              </section>

              {/* LIMITATIONS */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-xl font-bold">
                  Important Notes
                </h2>

                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
                  <li>
                    - Reservoir pressure must
                    be greater than flowing
                    bottomhole pressure.
                  </li>

                  <li>
                    - This simple PI relation
                    assumes approximately
                    linear inflow behavior.
                  </li>

                  <li>
                    - For solution-gas-drive
                    oil wells below bubble
                    point pressure, a nonlinear
                    inflow model such as
                    Vogel IPR may be more
                    appropriate.
                  </li>
                </ul>
              </section>
            </div>

            {/* CALCULATOR */}

            <div>
              <ProductivityIndexCalculator />

              {/* EXAMPLE */}

              <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Worked Example
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Reference Calculation
                </h2>

                <div className="mt-6 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                  <ExampleValue
                    label="Production Rate"
                    value="1000 STB/day"
                  />

                  <ExampleValue
                    label="Reservoir Pressure"
                    value="3000 psi"
                  />

                  <ExampleValue
                    label="Pwf"
                    value="1500 psi"
                  />

                  <ExampleValue
                    label="Pressure Drawdown"
                    value="1500 psi"
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5">
                  <p className="text-sm text-slate-400">
                    Calculated productivity
                    index
                  </p>

                  <p className="mt-2 text-2xl font-bold text-orange-400">
                    Approximately 0.6667
                    STB/day/psi
                  </p>
                </div>
              </section>

              {/* NOTICE */}

              <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-lg font-bold">
                  Engineering Notice
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  This calculator is intended
                  for engineering learning,
                  screening, and preliminary
                  calculations. Final well
                  performance decisions should
                  use verified field data and
                  appropriate reservoir and
                  production engineering
                  analysis.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Variable({
  symbol,
  description,
  unit,
}: {
  symbol: string;
  description: string;
  unit: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <div className="flex gap-3">
        <span className="min-w-10 font-mono font-bold text-orange-400">
          {symbol}
        </span>

        <span className="text-sm text-slate-300">
          {description}
        </span>
      </div>

      <span className="whitespace-nowrap text-xs font-semibold text-slate-500">
        {unit}
      </span>
    </div>
  );
}

function ExampleValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}