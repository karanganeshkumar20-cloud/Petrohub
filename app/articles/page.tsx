import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const articles = [
  {
    title: "Permit to Work System: Complete Guide",
    description:
      "Learn the purpose, types, responsibilities and safe implementation of a permit to work system.",
    category: "HSE",
    slug: "permit-to-work-system",
    readTime: "8 min read",
  },
  {
    title: "Introduction to Upstream Oil and Gas",
    description:
      "Understand exploration, drilling, production and the main stages of upstream petroleum operations.",
    category: "Oil & Gas",
    slug: "introduction-to-upstream-oil-and-gas",
    readTime: "10 min read",
  },
  {
    title: "What Is HAZOP?",
    description:
      "A practical introduction to Hazard and Operability Study, guide words and risk identification.",
    category: "Process Safety",
    slug: "what-is-hazop",
    readTime: "7 min read",
  },
  {
    title: "Basics of Pipeline Corrosion",
    description:
      "Explore common corrosion mechanisms, inspection methods and preventive control measures.",
    category: "Mechanical",
    slug: "pipeline-corrosion-basics",
    readTime: "9 min read",
  },
  {
    title: "Electrical Lockout Tagout Procedure",
    description:
      "Understand isolation, verification and safe restoration during electrical maintenance activities.",
    category: "Electrical",
    slug: "electrical-lockout-tagout",
    readTime: "6 min read",
  },
  {
    title: "Introduction to Instrument Calibration",
    description:
      "Learn why calibration is important and how industrial instruments are checked for accuracy.",
    category: "Instrumentation",
    slug: "instrument-calibration-introduction",
    readTime: "8 min read",
  },
];

export default function ArticlesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-widest text-orange-500">
            PetroHub Library
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Engineering Articles
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Explore practical knowledge across Oil & Gas, HSE, Mechanical,
            Electrical, Process and Instrumentation engineering.
          </p>

          <div className="mt-8 max-w-2xl">
            <input
              type="search"
              placeholder="Search articles..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/50"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
                  {article.category}
                </span>

                <span className="text-sm text-slate-500">
                  {article.readTime}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-bold leading-8">
                {article.title}
              </h2>

              <p className="mt-4 flex-1 leading-7 text-slate-400">
                {article.description}
              </p>

              <Link
                href={`/articles/${article.slug}`}
                className="mt-6 font-semibold text-orange-400 hover:text-orange-300"
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}