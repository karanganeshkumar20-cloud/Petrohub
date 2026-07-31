import Link from "next/link";
import Navbar from "@/components/Navbar";

const geologyArticles = [
  {
    title: "Introduction to Petroleum Geology",
    slug: "petroleum-geology",
    description:
      "Learn about rocks, sediments, basins and geological concepts used in oil and gas exploration.",
  },

  {
    title: "Rock Types and Properties",
    slug: "rock-types",
    description:
      "Understand igneous, sedimentary and metamorphic rocks and their importance.",
  },

  {
    title: "Reservoir Characterization",
    slug: "reservoir-characterization",
    description:
      "Explore reservoir rocks, porosity, permeability and fluid behaviour.",
  },

  {
    title: "Seismic Exploration Basics",
    slug: "seismic-exploration",
    description:
      "Learn how seismic surveys are used to identify subsurface structures.",
  },

  {
    title: "Well Logging Fundamentals",
    slug: "well-logging",
    description:
      "Understand formation evaluation using different well logging techniques.",
  },

  {
    title: "Basin Analysis",
    slug: "basin-analysis",
    description:
      "Explore sedimentary basins and their role in hydrocarbon exploration.",
  },
];

export default function GeologyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-center text-5xl font-bold">
          Geology Knowledge Hub
        </h1>

        <p className="mt-5 text-center text-gray-400">
          Explore petroleum geology, exploration and reservoir concepts.
        </p>


        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {geologyArticles.map((article) => (

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