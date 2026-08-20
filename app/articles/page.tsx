import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

async function getArticles() {
  await connectDB();

  const articles = await Article.find({
    status: "Published",
  })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(articles));
}

export default async function ArticlesPage() {
  const articles = await getArticles();

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
            Explore practical knowledge across Oil & Gas, HSE,
            Mechanical, Electrical, Process, Instrumentation and
            Geology.
          </p>

          <div className="mt-8 max-w-2xl">
            <Link
              href="/search"
              className="inline-block rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Search PetroHub Articles →
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {articles.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
              No published articles available.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article: any) => (
                <article
                  key={article._id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
                >
                  {article.featuredImage && (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="aspect-video w-full object-cover"
                    />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
                        {article.category}
                      </span>

                      <span className="text-sm text-slate-500">
                        {article.views ?? 0} views
                      </span>
                    </div>

                    <h2 className="mt-5 text-2xl font-bold leading-8">
                      {article.title}
                    </h2>

                    {article.summary && (
                      <p className="mt-4 flex-1 leading-7 text-slate-400">
                        {article.summary}
                      </p>
                    )}

                    <Link
                      href={`/articles/${article.slug}`}
                      className="mt-6 font-semibold text-orange-400 hover:text-orange-300"
                    >
                      Read article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}