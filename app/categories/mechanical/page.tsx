import Link from "next/link";
import Navbar from "@/components/Navbar";

const mechanicalArticles = [
  {
    title: "Rotating Equipment Basics",
    slug: "rotating-equipment",
    description:
      "Learn about pumps, compressors, turbines and other rotating machinery used in industries.",
  },

  {
    title: "Pump Engineering Fundamentals",
    slug: "pump-engineering",
    description:
      "Understand pump types, selection, operation and maintenance practices.",
  },

  {
    title: "Compressor Systems",
    slug: "compressor-systems",
    description:
      "Explore compressor working principles, applications and maintenance requirements.",
  },

  {
    title: "Static Equipment Engineering",
    slug: "static-equipment",
    description:
      "Learn about pressure vessels, heat exchangers and storage tanks.",
  },

  {
    title: "Mechanical Maintenance",
    slug: "mechanical-maintenance",
    description:
      "Understand preventive maintenance, predictive maintenance and reliability practices.",
  },

  {
    title: "Mechanical Integrity Management",
    slug: "mechanical-integrity",
    description:
      "Learn how industries maintain equipment safety and reliability.",
  },
];

export default function MechanicalPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-center text-5xl font-bold">
          Mechanical Engineering Hub
        </h1>

        <p className="mt-5 text-center text-gray-400">
          Explore equipment, maintenance and reliability engineering concepts.
        </p>


        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {mechanicalArticles.map((article) => (

            <div
              key={article.slug}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500"
            >

              <h2 className="text-xl font-bold">
                {article.title}
              </h2>

              <p className="mt-3 text-gray-400">
                {article.description}
              </p>


              <Link
                href={`/articles/${article.slug}`}
                className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-2 font-semibold hover:bg-orange-600"
              >
                Read Article
              </Link>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}