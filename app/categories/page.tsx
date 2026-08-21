import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  {
    name: "HSE",
    slug: "hse",
    description:
      "Workplace safety, HIRA, Permit to Work, LOTO, incident investigation, risk assessment and occupational health.",
  },
  {
    name: "Oil & Gas",
    slug: "oil-gas",
    description:
      "Petroleum engineering, drilling, production, reservoir engineering and upstream oil and gas operations.",
  },
  {
    name: "Mechanical",
    slug: "mechanical",
    description:
      "Mechanical equipment, piping, maintenance, rotating equipment, corrosion and engineering practices.",
  },
  {
    name: "Electrical",
    slug: "electrical",
    description:
      "Electrical safety, power systems, isolation, protection systems and industrial electrical equipment.",
  },
  {
    name: "Instrumentation",
    slug: "instrumentation",
    description:
      "Instrumentation, sensors, transmitters, calibration, measurement and industrial control systems.",
  },
  {
    name: "Process",
    slug: "process",
    description:
      "Process engineering, process safety, HAZOP, industrial operations and plant systems.",
  },
  {
    name: "Civil",
    slug: "civil",
    description:
      "Construction practices, structural systems, civil engineering fundamentals and site activities.",
  },
  {
    name: "Geology",
    slug: "geology",
    description:
      "Petroleum geology, formations, reservoirs, subsurface interpretation and geological knowledge.",
  },
];

export const metadata = {
  title: "Engineering Categories | PetroHub",
  description:
    "Explore PetroHub engineering knowledge across HSE, Oil & Gas, Mechanical, Electrical, Instrumentation, Process, Civil and Geology.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Engineering Disciplines
          </p>

          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
            Explore Categories
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Browse PetroHub engineering articles,
            technical knowledge and professional
            resources by discipline.
          </p>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group flex min-h-[250px] flex-col rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-orange-500/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-xl font-extrabold text-orange-400">
                    {category.name.charAt(0)}
                  </div>

                  <span className="text-xl text-slate-600 transition group-hover:text-orange-400">
                    →
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-bold transition group-hover:text-orange-400">
                  {category.name}
                </h2>

                <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                  {category.description}
                </p>

                <p className="mt-6 text-sm font-semibold text-orange-400">
                  Explore {category.name} →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH CTA */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Find Knowledge
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Looking for something specific?
                </h2>

                <p className="mt-3 max-w-2xl text-slate-400">
                  Search PetroHub articles, books,
                  manuals, standards and technical
                  resources from one place.
                </p>
              </div>

              <Link
                href="/search"
                className="shrink-0 rounded-xl bg-orange-500 px-7 py-3.5 text-center font-bold text-white transition hover:bg-orange-600"
              >
                Search PetroHub
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}