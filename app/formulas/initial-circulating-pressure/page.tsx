import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import DrillingBatch1Calculator from "@/components/formulas/DrillingBatch1Calculator";

export const metadata: Metadata = {
  title:
    "Initial Circulating Pressure Calculator | PetroHub",

  description:
    "Calculate initial circulating pressure from slow circulating rate pressure and shut-in drillpipe pressure.",

  alternates: {
    canonical:
      "/formulas/initial-circulating-pressure",
  },
};

export default function InitialCirculatingPressurePage() {
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
                Well Control
              </span>

              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                Deterministic Calculation
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              Initial Circulating Pressure
              Calculator
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Calculate initial circulating
              pressure used in well-control
              calculations from SCRP and
              SIDPP.
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
              ICP = SCRP + SIDPP
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <VariableCard
                symbol="ICP"
                name="Initial Circulating Pressure"
                unit="psi"
              />

              <VariableCard
                symbol="SCRP"
                name="Slow Circulating Rate Pressure"
                unit="psi"
              />

              <VariableCard
                symbol="SIDPP"
                name="Shut-In Drillpipe Pressure"
                unit="psi"
              />
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-400">
              This calculator adds the
              slow circulating rate pressure
              to the shut-in drillpipe
              pressure to determine the
              initial circulating pressure.
            </p>
          </div>

          {/* =================================================
              CALCULATOR
          ================================================= */}

          <DrillingBatch1Calculator
            calculator="initial-circulating-pressure"
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
                  • SCRP is entered in psi.
                </li>

                <li>
                  • SIDPP is entered in psi.
                </li>

                <li>
                  • ICP is returned in psi.
                </li>

                <li>
                  • Both inputs must be
                  zero or positive.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-xl font-bold">
                Well-Control Note
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Initial circulating pressure
                is commonly used as a
                starting pressure reference
                during well-control
                circulation procedures.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Actual field procedures
                should follow the approved
                well-control program,
                equipment limits and
                operating procedures for
                the specific well.
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

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ExampleValue
                label="SCRP"
                value="600 psi"
              />

              <ExampleValue
                label="SIDPP"
                value="400 psi"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
              <p className="text-sm text-orange-200">
                Expected ICP
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                1,000 psi
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