import Link from "next/link";
import Navbar from "@/components/Navbar";

const electricalArticles = [
  {
    title: "Electrical Safety Fundamentals",
    slug: "electrical-safety",
    description:
      "Learn electrical hazards, protection systems and safe working practices.",
  },

  {
    title: "Motors and Generators Basics",
    slug: "motors-generators",
    description:
      "Understand industrial motors, generators and their applications.",
  },

  {
    title: "Power Distribution Systems",
    slug: "power-distribution",
    description:
      "Explore electrical power generation, transmission and distribution systems.",
  },

  {
    title: "Electrical Maintenance Practices",
    slug: "electrical-maintenance",
    description:
      "Learn preventive maintenance and troubleshooting techniques for electrical equipment.",
  },

  {
    title: "Hazardous Area Classification",
    slug: "hazardous-area-classification",
    description:
      "Understand hazardous zones and electrical equipment selection in Oil & Gas industries.",
  },

  {
    title: "Electrical Testing and Protection",
    slug: "electrical-testing",
    description:
      "Learn about testing methods, relays and electrical protection systems.",
  },
];

export default function ElectricalPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-center text-5xl font-bold">
          Electrical Engineering Hub
        </h1>

        <p className="mt-5 text-center text-gray-400">
          Explore electrical systems, safety, maintenance and industrial applications.
        </p>


        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {electricalArticles.map((article) => (

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