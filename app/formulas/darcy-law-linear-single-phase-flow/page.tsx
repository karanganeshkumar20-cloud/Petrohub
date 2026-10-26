import type {
  Metadata,
} from "next";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import DarcyLinearFlowCalculator from "@/components/formulas/DarcyLinearFlowCalculator";

export const metadata: Metadata = {
  title:
    "Darcy Linear Flow Calculator | PetroHub",

  description:
    "Calculate steady-state linear single-phase flow through porous media using Darcy's law.",

  alternates: {
    canonical:
      "/formulas/darcy-law-linear-single-phase-flow",
  },
};

export default function DarcyLinearFlowPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="border-b border-slate-800 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/formulas"
            className="text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            ← All Engineering Calculators
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
              Darcy&apos;s Law for Linear
              Single-Phase Flow
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Calculate steady-state
              single-phase fluid flow
              through a porous medium
              using permeability,
              cross-sectional area,
              pressure drop, viscosity,
              and flow length.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Equation
                </p>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">
                  <p className="whitespace-nowrap text-xl font-bold text-white md:text-2xl">
                    q = 0.001127 × k × A × ΔP / (μ × L)
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <Variable
                    symbol="q"
                    name="Flow Rate"
                    unit="bbl/day"
                  />

                  <Variable
                    symbol="k"
                    name="Permeability"
                    unit="mD"
                  />

                  <Variable
                    symbol="A"
                    name="Cross-Sectional Area"
                    unit="ft²"
                  />

                  <Variable
                    symbol="ΔP"
                    name="Pressure Drop"
                    unit="psi"
                  />

                  <Variable
                    symbol="μ"
                    name="Fluid Viscosity"
                    unit="cP"
                  />

                  <Variable
                    symbol="L"
                    name="Flow Length"
                    unit="ft"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-bold">
                  Engineering Assumptions
                </h2>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                  <li>
                    • Steady-state flow
                  </li>

                  <li>
                    • Single-phase fluid
                  </li>

                  <li>
                    • Homogeneous porous medium
                  </li>

                  <li>
                    • Constant fluid viscosity
                  </li>

                  <li>
                    • Linear flow geometry
                  </li>
                </ul>
              </div>
            </div>

            <DarcyLinearFlowCalculator />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

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