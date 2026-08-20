import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const engineeringCategories = [
  {
    title: "Mechanical Engineering",
    description:
      "Explore mechanical systems, maintenance, rotating equipment, piping, corrosion and industrial machinery.",
    href: "/categories/mechanical",
  },
  {
    title: "Electrical Engineering",
    description:
      "Learn electrical safety, power systems, equipment, isolation, protection and industrial electrical practices.",
    href: "/categories/electrical",
  },
  {
    title: "Instrumentation",
    description:
      "Explore industrial instrumentation, calibration, control systems, transmitters, sensors and measurement.",
    href: "/categories/instrumentation",
  },
  {
    title: "Process Engineering",
    description:
      "Learn process operations, process safety, equipment, flow systems, HAZOP and engineering fundamentals.",
    href: "/categories/process",
  },
  {
    title: "Civil Engineering",
    description:
      "Explore construction engineering, structural systems, site safety and civil engineering fundamentals.",
    href: "/categories/civil",
  },
];

export default function EngineeringCategoryPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub Categories
          </p>

          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
            Engineering
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Explore technical knowledge across mechanical,
            electrical, instrumentation, process and civil
            engineering disciplines.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {engineeringCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/50"
              >
                <h2 className="text-2xl font-bold transition group-hover:text-orange-400">
                  {category.title}
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  {category.description}
                </p>

                <p className="mt-6 font-semibold text-orange-400">
                  Explore category →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}