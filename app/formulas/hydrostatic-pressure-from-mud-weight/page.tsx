import type {
  Metadata,
} from "next";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import DrillingBatch1Calculator from "@/components/formulas/DrillingBatch1Calculator";

export const metadata: Metadata = {
  title:
    "Hydrostatic Pressure Calculator | PetroHub",

  description:
    "Calculate drilling-fluid hydrostatic pressure from mud weight and true vertical depth using the field-unit hydrostatic pressure equation.",

  alternates: {
    canonical:
      "/formulas/hydrostatic-pressure-from-mud-weight",
  },
};

export default function HydrostaticPressurePage() {
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
              Hydrostatic Pressure
              Calculator
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Calculate drilling-fluid
              hydrostatic pressure using
              mud weight and true vertical
              depth.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FORMULA
      ===================================================== */}

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Equation
            </p>

            <div className="mt-6 overflow-x-auto text-center text-2xl font-bold text-white md:text-4xl">
              HP = 0.052 × MW × TVD
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <VariableCard
                symbol="HP"
                name="Hydrostatic Pressure"
                unit="psi"
              />

              <VariableCard
                symbol="MW"
                name="Mud Weight"
                unit="ppg"
              />

              <VariableCard
                symbol="TVD"
                name="True Vertical Depth"
                unit="ft"
              />
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-400">
              This calculator uses the
              conventional oilfield-unit
              form of the hydrostatic
              pressure equation. The
              constant 0.052 applies when
              mud weight is entered in
              pounds per gallon and TVD is
              entered in feet.
            </p>
          </div>

          {/* =================================================
              CALCULATOR
          ================================================= */}

          <DrillingBatch1Calculator
            calculator="hydrostatic-pressure"
          />

          {/* =================================================
              ENGINEERING NOTES
          ================================================= */}

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Calculation Basis
              </h2>

              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
                <li>
                  • Mud weight is entered
                  in lb/gal (ppg).
                </li>

                <li>
                  • True vertical depth
                  is entered in feet.
                </li>

                <li>
                  • Hydrostatic pressure
                  is returned in psi.
                </li>

                <li>
                  • Pressure gradient is
                  also calculated in
                  psi/ft.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Engineering Note
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Use true vertical depth
                rather than measured depth
                when calculating the
                vertical hydrostatic
                pressure contribution.
                Actual well conditions may
                require consideration of
                fluid-density variation,
                temperature, pressure and
                multiphase effects.
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