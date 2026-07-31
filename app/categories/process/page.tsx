import Link from "next/link";
import Navbar from "@/components/Navbar";

const processArticles = [
  {
    title: "Process Flow Diagram (PFD) Basics",
    slug: "process-flow-diagram",
    description:
      "Learn how PFDs represent major process equipment, streams and plant operations.",
  },

  {
    title: "Piping & Instrumentation Diagram (P&ID)",
    slug: "pid-basics",
    description:
      "Understand P&ID symbols, piping systems, instruments and control loops.",
  },

  {
    title: "Heat Exchanger Fundamentals",
    slug: "heat-exchanger",
    description:
      "Explore heat transfer principles, exchanger types and industrial applications.",
  },

  {
    title: "Separation Process Engineering",
    slug: "separation-process",
    description:
      "Learn about distillation, separators and process separation techniques.",
  },

  {
    title: "Process Safety Engineering",
    slug: "process-safety",
    description:
      "Understand process hazards, safety studies and risk reduction methods.",
  },

  {
    title: "Process Simulation Basics",
    slug: "process-simulation",
    description:
      "Introduction to process modelling and simulation concepts used in industry.",
  },
];

export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-center text-5xl font-bold">
          Process Engineering Hub
        </h1>

        <p className="mt-5 text-center text-gray-400">
          Explore process design, safety, simulation and plant operation concepts.
        </p>


        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {processArticles.map((article) => (

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