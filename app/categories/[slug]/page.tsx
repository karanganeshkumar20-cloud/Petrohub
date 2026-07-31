import { notFound } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

const categoryNames: Record<string, string> = {
  hse: "HSE",
  "oil-gas": "Oil & Gas",
  mechanical: "Mechanical",
  electrical: "Electrical",
  instrumentation: "Instrumentation",
  process: "Process",
  geology: "Geology",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = categoryNames[slug];

  if (!category) {
    notFound();
  }

  await connectDB();

  const articles = await Article.find({
    category,
    status: "Published",
  })
    .sort({ createdAt: -1 })
    .lean();

  const data = JSON.parse(JSON.stringify(articles));

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-5xl font-bold">{category}</h1>

        <p className="mt-4 text-slate-400">
          {data.length} article(s) available
        </p>

        {data.length === 0 ? (
          <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900 p-8">
            No articles available.
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.map((article: any) => (
              <ArticleCard
                key={article._id}
                article={article}
              />
            ))}
          </div>
        )}

        <Link
          href="/"
          className="mt-12 inline-block text-orange-400 hover:text-orange-300"
        >
          ← Back to Home
        </Link>
      </section>

      <Footer />
    </main>
  );
}