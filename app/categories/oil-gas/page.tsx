import Link from "next/link";
import Navbar from "@/components/Navbar";

const oilGasArticles = [
  {
    title: "Introduction to Oil & Gas Industry",
    slug: "oil-gas-basics",
    description:
      "Understand upstream, midstream and downstream operations in the oil and gas industry.",
  },

  {
    title: "Drilling Engineering Basics",
    slug: "drilling-engineering",
    description:
      "Learn about drilling operations, rigs, well planning and drilling processes.",
  },

  {
    title: "Reservoir Engineering Fundamentals",
    slug: "reservoir-engineering",
    description:
      "Explore reservoir characteristics, pressure behaviour and production concepts.",
  },

  {
    title: "Oil Refining Process",
    slug: "oil-refining",
    description:
      "Understand crude oil processing, distillation and refinery operations.",
  },

  {
    title: "Production Operations",
    slug: "production-operations",
    description:
      "Learn about oil and gas production systems, equipment and field operations.",
  },

  {
    title: "Pipeline Engineering",
    slug: "pipeline-engineering",
    description:
      "Explore pipeline design, transportation systems and integrity management.",
  },
];


export default function OilGasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-center text-5xl font-bold">
          Oil & Gas Knowledge Hub
        </h1>

        <p className="mt-5 text-center text-gray-400">
          Explore upstream, midstream, downstream and petroleum engineering concepts.
        </p>


        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {oilGasArticles.map((article) => (

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