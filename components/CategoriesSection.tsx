import Link from "next/link";

const categories = [
  {
    title: "Oil & Gas",
    icon: "⛽",
    description:
      "Upstream, midstream, downstream and petroleum operations.",
    slug: "oil-gas",
  },
  {
    title: "HSE",
    icon: "🦺",
    description:
      "Workplace safety, risk management and environmental topics.",
    slug: "hse",
  },
  {
    title: "Mechanical",
    icon: "⚙️",
    description:
      "Equipment, piping, maintenance and mechanical systems.",
    slug: "mechanical",
  },
  {
    title: "Electrical",
    icon: "⚡",
    description:
      "Electrical safety, systems, power and installations.",
    slug: "electrical",
  },
  {
    title: "Instrumentation",
    icon: "📡",
    description:
      "Control systems, sensors, automation and calibration.",
    slug: "instrumentation",
  },
  {
    title: "Process",
    icon: "🧪",
    description:
      "Process engineering, operations and plant fundamentals.",
    slug: "process",
  },
  {
    title: "Geology",
    icon: "🌍",
    description:
      "Earth science, reservoirs and geological exploration.",
    slug: "geology",
  },
];

export default function CategoriesSection() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="font-semibold uppercase tracking-widest text-orange-500">
            Explore Knowledge
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Engineering Categories
          </h2>

          <p className="mt-4 max-w-2xl text-slate-400">
            Browse technical knowledge across PetroHub engineering disciplines.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/50"
            >
              <div className="text-4xl">{category.icon}</div>

              <h3 className="mt-5 text-xl font-bold transition group-hover:text-orange-400">
                {category.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {category.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-orange-400">
                Explore category →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}