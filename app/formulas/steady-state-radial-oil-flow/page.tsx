import type {
  Metadata,
} from "next";

import Footer from "@/components/Footer";
import FormulaBookmarkButton from "@/components/formulas/FormulaBookmarkButton";
import Navbar from "@/components/Navbar";

import SteadyStateRadialOilCalculator from "@/components/formulas/SteadyStateRadialOilCalculator";

export const metadata: Metadata = {
  title:
    "Steady-State Radial Oil Flow Calculator | PetroHub",

  description:
    "Calculate steady-state radial oil production rate using permeability, pay thickness, pressure drawdown, oil viscosity, formation volume factor, drainage radius, wellbore radius, and skin factor.",

  alternates: {
    canonical:
      "/formulas/steady-state-radial-oil-flow",
  },
};

export default function SteadyStateRadialOilFlowPage() {
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
                Steady-State Radial
                Oil Flow
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
                Estimate oil production
                rate for steady-state
                radial flow toward a well
                using reservoir,
                fluid, pressure, geometry,
                and skin parameters.
              </p>
            </div>
          </div>
        
          <div className="mx-auto mt-8 max-w-7xl">
            <FormulaBookmarkButton
              slug="steady-state-radial-oil-flow"
            />
          </div>
</section>

        {/* MAIN CONTENT */}

        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr]">
            {/* FORMULA INFORMATION */}

            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Equation
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Steady-State Radial
                  Flow Equation
                </h2>

                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="whitespace-nowrap font-mono text-base font-semibold text-orange-300 sm:text-lg">
                    q = 0.00708 k h
                    (Pe - Pwf) /
                    [mu Bo
                    (ln(re / rw) + s)]
                  </p>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-400">
                  This form estimates
                  liquid production rate
                  under steady-state
                  radial flow conditions
                  using field units.
                </p>
              </section>

              {/* VARIABLES */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-xl font-bold">
                  Variables
                </h2>

                <div className="mt-5 space-y-4">
                  <Variable
                    symbol="q"
                    description="Oil production rate"
                    unit="STB/day"
                  />

                  <Variable
                    symbol="k"
                    description="Reservoir permeability"
                    unit="mD"
                  />

                  <Variable
                    symbol="h"
                    description="Net pay thickness"
                    unit="ft"
                  />

                  <Variable
                    symbol="Pe"
                    description="External or reservoir pressure"
                    unit="psi"
                  />

                  <Variable
                    symbol="Pwf"
                    description="Flowing bottomhole pressure"
                    unit="psi"
                  />

                  <Variable
                    symbol="mu"
                    description="Oil viscosity"
                    unit="cP"
                  />

                  <Variable
                    symbol="Bo"
                    description="Oil formation volume factor"
                    unit="rb/STB"
                  />

                  <Variable
                    symbol="re"
                    description="Drainage radius"
                    unit="ft"
                  />

                  <Variable
                    symbol="rw"
                    description="Wellbore radius"
                    unit="ft"
                  />

                  <Variable
                    symbol="s"
                    description="Skin factor"
                    unit="dimensionless"
                  />
                </div>
              </section>

              {/* ASSUMPTIONS */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-xl font-bold">
                  Typical Assumptions
                </h2>

                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
                  <li>
                    - Single-phase liquid
                    flow is assumed.
                  </li>

                  <li>
                    - Flow is radial and
                    steady-state.
                  </li>

                  <li>
                    - Reservoir properties
                    are treated as
                    homogeneous.
                  </li>

                  <li>
                    - Permeability and
                    fluid properties are
                    treated as constant.
                  </li>

                  <li>
                    - Pressure at the
                    external drainage
                    boundary is maintained.
                  </li>

                  <li>
                    - Skin factor is used
                    to represent additional
                    near-wellbore pressure
                    loss or improvement.
                  </li>
                </ul>
              </section>

              {/* INTERPRETATION */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-xl font-bold">
                  Engineering
                  Interpretation
                </h2>

                <div className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
                  <p>
                    Production rate
                    increases with higher
                    permeability, thicker
                    net pay, and larger
                    pressure drawdown.
                  </p>

                  <p>
                    Higher viscosity,
                    formation volume
                    factor, or positive
                    skin reduces the
                    calculated production
                    rate.
                  </p>

                  <p>
                    Negative skin can
                    represent improved
                    near-wellbore flow,
                    such as after
                    stimulation.
                  </p>
                </div>
              </section>
            </div>

            {/* CALCULATOR */}

            <div>
              <SteadyStateRadialOilCalculator />

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
                    label="Permeability"
                    value="50 mD"
                  />

                  <ExampleValue
                    label="Net Pay"
                    value="30 ft"
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
                    label="Oil Viscosity"
                    value="2 cP"
                  />

                  <ExampleValue
                    label="Bo"
                    value="1.2 rb/STB"
                  />

                  <ExampleValue
                    label="Drainage Radius"
                    value="1000 ft"
                  />

                  <ExampleValue
                    label="Wellbore Radius"
                    value="0.25 ft"
                  />

                  <ExampleValue
                    label="Skin"
                    value="0"
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5">
                  <p className="text-sm text-slate-400">
                    Calculated production
                    rate
                  </p>

                  <p className="mt-2 text-2xl font-bold text-orange-400">
                    Approximately 800.27
                    STB/day
                  </p>
                </div>
              </section>

              {/* NOTICE */}

              <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-lg font-bold">
                  Engineering Notice
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  This calculator is
                  intended for engineering
                  learning, screening, and
                  preliminary calculations.
                  Final reservoir or well
                  decisions should use
                  verified project data,
                  appropriate reservoir
                  models, and qualified
                  engineering review.
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