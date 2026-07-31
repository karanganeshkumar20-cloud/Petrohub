import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import CategoriesSection from "@/components/CategoriesSection";
import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

async function getHomepageArticles() {
  await connectDB();

  const [featuredArticle, latestArticles] = await Promise.all([
    Article.findOne({
      status: "Published",
      featured: true,
    })
      .sort({ updatedAt: -1 })
      .lean(),

    Article.find({
      status: "Published",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return {
    featuredArticle: featuredArticle
      ? JSON.parse(JSON.stringify(featuredArticle))
      : null,

    latestArticles: JSON.parse(
      JSON.stringify(latestArticles)
    ),
  };
}

export default async function HomePage() {
  const { featuredArticle, latestArticles } =
    await getHomepageArticles();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="border-b border-slate-800 bg-slate-950 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
              Engineering Knowledge Platform
            </p>

            <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-7xl">
              Learn engineering.
              <span className="block text-orange-500">
                Build real expertise.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Explore practical knowledge across Oil & Gas, HSE,
              Mechanical, Electrical, Civil, Process,
              Instrumentation and Geology.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/articles"
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-600"
              >
                Explore Articles
              </Link>

              <Link
                href="/search"
                className="rounded-xl border border-slate-700 px-6 py-3 font-bold transition hover:bg-slate-900"
              >
                Search PetroHub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featuredArticle && (
        <section className="border-b border-slate-800 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="font-semibold uppercase tracking-widest text-orange-500">
              Featured Article
            </p>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">
              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
                {featuredArticle.category}
              </span>

              <h2 className="mt-5 text-4xl font-bold">
                {featuredArticle.title}
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
                {featuredArticle.summary}
              </p>

              <Link
                href={`/articles/${featuredArticle.slug}`}
                className="mt-8 inline-block font-bold text-orange-400 hover:text-orange-300"
              >
                Read featured article →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-semibold uppercase tracking-widest text-orange-500">
                Latest Knowledge
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                Latest Articles
              </h2>
            </div>

            <Link
              href="/articles"
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              View all articles →
            </Link>
          </div>

          {latestArticles.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
              No published articles available yet.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestArticles.map((article: any) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CategoriesSection />

      <Footer />
    </main>
  );
}