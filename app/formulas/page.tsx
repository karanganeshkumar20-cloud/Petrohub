import type {
  Metadata,
} from "next";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  connectDB,
} from "@/lib/mongodb";

import FormulaModel from "@/models/Formula";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Engineering Formulas & Calculators | PetroHub",

  description:
    "Verified engineering formulas and deterministic calculators for petroleum, fluid mechanics, thermodynamics, process and oil and gas engineering.",

  alternates: {
    canonical:
      "/formulas",
  },
};

/* =========================================================
   TYPE
========================================================= */

type PublicFormula = {
  _id:
    string;

  name:
    string;

  slug:
    string;

  domain:
    string;

  subDomain?:
    string;

  description?:
    string;

  formulaText:
    string;

  calculationKey?:
    string;

  featured?:
    boolean;
};

/* =========================================================
   LOAD VERIFIED FORMULAS
========================================================= */

async function getFormulas(): Promise<
  PublicFormula[]
> {
  try {
    await connectDB();

    const formulas =
      await FormulaModel.find({
        status:
          "Published",

        verificationStatus:
          "verified",
      })
        .select(
          [
            "name",
            "slug",
            "domain",
            "subDomain",
            "description",
            "formulaText",
            "calculationKey",
            "featured",
          ].join(" ")
        )
        .sort({
          featured:
            -1,

          domain:
            1,

          name:
            1,
        })
        .lean();

    return JSON.parse(
      JSON.stringify(
        formulas
      )
    ) as PublicFormula[];
  } catch (error) {
    console.error(
      "Formula page database error:",
      error
    );

    return [];
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function FormulasPage() {
  const formulas =
    await getFormulas();

  const domains = Array.from(
    new Set(
      formulas.map(
        (
          formula
        ) =>
          formula.domain
      )
    )
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
            PetroHub Engineering
            Tools
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Engineering Formulas
            & Calculators
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Verified engineering
            equations paired with
            deterministic
            calculators for
            practical engineering
            calculations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <StatBadge
              value={
                formulas.length
              }
              label="Verified Calculators"
            />

            <StatBadge
              value={
                domains.length
              }
              label="Engineering Domains"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          VERIFIED CALCULATORS
      ===================================================== */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Verified Tools
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Available Calculators
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-slate-400">
              Only verified formulas
              connected to approved
              calculation engines are
              displayed here.
            </p>
          </div>

          {/* EMPTY */}

          {formulas.length ===
          0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center">
              <h3 className="text-xl font-bold">
                No verified
                calculators available.
              </h3>

              <p className="mt-3 text-slate-500">
                Verified engineering
                tools will appear here
                when they are
                published.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {formulas.map(
                (
                  formula
                ) => (
                  <FormulaCard
                    key={
                      formula._id
                    }
                    formula={
                      formula
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="border-y border-slate-800 bg-slate-900/30 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Calculation Integrity
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            How PetroHub
            calculators work
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <InfoCard
              number="01"
              title="Formula Review"
              description="Engineering equations are reviewed before being marked as verified."
            />

            <InfoCard
              number="02"
              title="Trusted Engine"
              description="Verified formulas are connected to predefined TypeScript calculation engines."
            />

            <InfoCard
              number="03"
              title="Deterministic Result"
              description="Numerical calculations are performed by fixed calculation logic rather than generated dynamically by AI."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          UPCOMING
      ===================================================== */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Engineering Toolkit
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Calculators Planned
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <UpcomingCard
              title="Darcy-Weisbach"
              description="Pipeline friction and pressure-loss calculations."
            />

            <UpcomingCard
              title="Hydrostatic Pressure"
              description="Pressure calculation using fluid density and vertical depth."
            />

            <UpcomingCard
              title="Reynolds Number"
              description="Determine flow regime using velocity, characteristic length and viscosity."
            />

            <UpcomingCard
              title="Pipe Flow Rate"
              description="Calculate volumetric flow from pipe diameter and velocity."
            />

            <UpcomingCard
              title="Pump Hydraulic Power"
              description="Estimate hydraulic power using flow rate, pressure or head."
            />

            <UpcomingCard
              title="Ideal Gas Law"
              description="Pressure, volume, temperature and mole calculations."
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   FORMULA CARD
========================================================= */

function FormulaCard({
  formula,
}: {
  formula:
    PublicFormula;
}) {
  return (
    <Link
      href={`/formulas/${formula.slug}`}
      className="group flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/60 p-7 transition hover:-translate-y-1 hover:border-orange-500/60"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          Verified
        </span>

        {formula.featured && (
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
            Featured
          </span>
        )}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
        {formula.domain}
      </p>

      <h3 className="mt-2 text-2xl font-bold transition group-hover:text-orange-400">
        {formula.name}
      </h3>

      {formula.subDomain && (
        <p className="mt-2 text-sm text-slate-500">
          {formula.subDomain}
        </p>
      )}

      {formula.description && (
        <p className="mt-4 flex-1 leading-7 text-slate-400">
          {formula.description}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="whitespace-nowrap font-mono text-sm text-orange-300">
          {formula.formulaText}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-orange-400">
          Open Calculator
        </span>

        <span className="text-xl text-slate-500 transition group-hover:translate-x-1 group-hover:text-orange-400">
          →
        </span>
      </div>
    </Link>
  );
}

/* =========================================================
   STAT BADGE
========================================================= */

function StatBadge({
  value,
  label,
}: {
  value:
    number;

  label:
    string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-3">
      <span className="font-bold text-orange-400">
        {value}
      </span>

      <span className="ml-2 text-sm text-slate-400">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   INFO
========================================================= */

function InfoCard({
  number,
  title,
  description,
}: {
  number:
    string;

  title:
    string;

  description:
    string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
      <p className="font-bold text-orange-500">
        {number}
      </p>

      <h3 className="mt-4 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   UPCOMING
========================================================= */

function UpcomingCard({
  title,
  description,
}: {
  title:
    string;

  description:
    string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-6">
      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
        Planned
      </span>

      <h3 className="mt-5 text-xl font-bold text-slate-300">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}