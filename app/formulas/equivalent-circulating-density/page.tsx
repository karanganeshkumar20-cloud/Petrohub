import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import DrillingBatch1Calculator from "@/components/formulas/DrillingBatch1Calculator";

export const metadata: Metadata = {
  title:
    "Equivalent Circulating Density Calculator | PetroHub",

  description:
    "Calculate equivalent circulating density from mud weight, annular pressure loss and true vertical depth.",

  alternates: {
    canonical:
      "/formulas/equivalent-circulating-density",
  },
};

export default function EquivalentCirculatingDensityPage() {
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
              Equivalent Circulating
              Density Calculator
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Calculate equivalent
              circulating density from
              static mud weight and
              annular pressure loss.
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
              ECD = MW + ΔPₐ / (0.052 × TVD)
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <VariableCard
                symbol="ECD"
                name="Equivalent Circulating Density"
                unit="ppg"
              />

              <VariableCard
                symbol="MW"
                name="Mud Weight"
                unit="ppg"
              />

              <VariableCard
                symbol="ΔPₐ"
                name="Annular Pressure Loss"
                unit="psi"
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
              form of the ECD equation.
              Mud weight is entered in
              pounds per gallon, annular
              pressure loss in psi and
              true vertical depth in feet.
            </p>
          </div>

          {/* =================================================
              CALCULATOR
          ================================================= */}

          <DrillingBatch1Calculator
            calculator="ecd"
          />

          {/* =================================================
              ENGINEERING INFORMATION
          ================================================= */}

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Calculation Basis
              </h2>

              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
                <li>
                  • Static mud weight is
                  entered in ppg.
                </li>

                <li>
                  • Annular pressure loss
                  is entered in psi.
                </li>

                <li>
                  • TVD is entered in
                  feet.
                </li>

                <li>
                  • ECD is returned in
                  ppg.
                </li>

                <li>
                  • The additional density
                  contribution caused by
                  annular pressure loss is
                  also displayed.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Engineering Note
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Equivalent circulating
                density represents the
                effective density seen by
                the formation while fluid
                is circulating. It is
                higher than static mud
                weight when annular
                friction produces
                additional pressure loss.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                ECD should be evaluated
                against the available
                pressure window, including
                pore-pressure and
                fracture-pressure limits,
                when applying the result
                to drilling operations.
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
                label="Mud Weight"
                value="10 ppg"
              />

              <ExampleValue
                label="Annular Pressure Loss"
                value="500 psi"
              />

              <ExampleValue
                label="TVD"
                value="10,000 ft"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
              <p className="text-sm text-orange-200">
                Expected ECD
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                ≈ 10.962 ppg
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