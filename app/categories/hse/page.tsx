import Link from "next/link";
import Navbar from "@/components/Navbar";

const hseArticles = [
  {
    title: "HIRA - Hazard Identification & Risk Assessment",
    slug: "hira",
    description:
      "Learn how to identify hazards, assess risks and implement control measures.",
  },
  {
    title: "Permit To Work System",
    slug: "permit-to-work",
    description:
      "Understand PTW process and control of hazardous activities.",
  },
  {
    title: "Job Safety Analysis (JSA)",
    slug: "job-safety-analysis",
    description:
      "Learn the process of breaking down jobs and identifying hazards.",
  },
  {
    title: "Incident Investigation",
    slug: "incident-investigation",
    description:
      "Understand root cause analysis and incident prevention methods.",
  },
];

export default function HSEPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-center text-5xl font-bold">
          HSE Knowledge Hub
        </h1>

        <p className="mt-5 text-center text-gray-400">
          Safety management, risk assessment and workplace safety practices.
        </p>


        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {hseArticles.map((article) => (

            <div
              key={article.slug}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-orange-500 hover:-translate-y-1"
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