import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import DrillingBatch1Calculator from "@/components/formulas/DrillingBatch1Calculator";

export const metadata: Metadata = {
  title:
    "Annular Fluid Velocity Calculator | PetroHub",

  description:
    "Calculate drilling-fluid velocity in an annulus from flow rate, hole diameter and pipe outer diameter.",

  alternates: {
    canonical:
      "/formulas/velocity-of-fluid-in-annulus",
  },
};

export default function AnnularVelocityPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-slate-800 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/formulas"
            className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
          >
            ← All Engineering Calculators
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                Drilling Engineering
              </span>

              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Deterministic Calculation
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              Annular Fluid Velocity
              Calculator
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Calculate fluid velocity
              through the annular space
              between the hole and drill
              pipe.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              EQUATION
          ================================================= */}

          <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Equation
            </p>

            <div className="mt-6 overflow-x-auto text-center text-2xl font-bold text-white md:text-4xl">
              vₐ = Q / [2.448 × (Dₒ² − Dₚ²)]
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <VariableCard
                symbol="vₐ"
                name="Annular Velocity"
                unit="ft/s"
              />

              <VariableCard
                symbol="Q"
                name="Flow Rate"
                unit="gpm"
              />

              <VariableCard
                symbol="Dₒ"
                name="Hole Diameter"
                unit="in"
              />

              <VariableCard
                symbol="Dₚ"
                name="Pipe Outer Diameter"
                unit="in"
              />
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-400">
              The calculator uses flow
              rate in gallons per minute
              and diameters in inches.
              The resulting annular
              velocity is displayed in
              both ft/s and ft/min.
            </p>
          </div>

          {/* =================================================
              CALCULATOR
          ================================================= */}

          <DrillingBatch1Calculator
            calculator="annular-velocity"
          />

          {/* =================================================
              NOTES
          ================================================= */}

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Calculation Basis
              </h2>

              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
                <li>
                  • Flow rate is entered
                  in gallons per minute.
                </li>

                <li>
                  • Hole diameter is
                  entered in inches.
                </li>

                <li>
                  • Pipe outer diameter
                  is entered in inches.
                </li>

                <li>
                  • Hole diameter must be
                  greater than pipe outer
                  diameter.
                </li>

                <li>
                  • Output is displayed in
                  ft/s and ft/min.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Engineering Note
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Annular velocity is an
                important drilling
                hydraulics parameter
                because sufficient
                upward fluid velocity
                supports cuttings
                transport from the
                wellbore.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Actual hole cleaning also
                depends on factors such
                as cuttings size, fluid
                rheology, inclination,
                pipe rotation and
                eccentricity.
              </p>
            </div>
          </div>

          {/* =================================================
              EXAMPLE
          ================================================= */}

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-xl font-bold">
              Example
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <ExampleValue
                label="Flow Rate"
                value="500 gpm"
              />

              <ExampleValue
                label="Hole Diameter"
                value="12.25 in"
              />

              <ExampleValue
                label="Pipe OD"
                value="5 in"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
              <p className="text-sm text-orange-200">
                Expected Annular Velocity
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                ≈ 1.633 ft/s
              </p>

              <p className="mt-2 text-sm text-slate-300">
                ≈ 97.99 ft/min
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   VARIABLE CARD
========================================================= */

function VariableCard({
  symbol,
  name,
  unit,
}: {
  symbol: string;
  name: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-lg font-bold text-orange-400">
        {symbol}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {name}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Unit: {unit}
      </p>
    </div>
  );
}

/* =========================================================
   EXAMPLE VALUE
========================================================= */

function ExampleValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">
        {value}
      </p>
    </div>
  );
}