import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

type ArticleData = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  category: string;
  featuredImage?: string;
  featured?: boolean;
  views?: number;
  createdAt?: string;
};

const categories = [
  {
    name: "HSE",
    slug: "hse",
    description:
      "Workplace safety, risk management, PTW, HIRA, LOTO and incident prevention.",
  },
  {
    name: "Oil & Gas",
    slug: "oil-gas",
    description:
      "Upstream, drilling, production, reservoir engineering and petroleum operations.",
  },
  {
    name: "Mechanical",
    slug: "mechanical",
    description:
      "Piping, rotating equipment, maintenance, corrosion and mechanical systems.",
  },
  {
    name: "Electrical",
    slug: "electrical",
    description:
      "Electrical safety, power systems, isolation, protection and industrial equipment.",
  },
  {
    name: "Instrumentation",
    slug: "instrumentation",
    description:
      "Calibration, sensors, transmitters, measurement and industrial control systems.",
  },
  {
    name: "Process",
    slug: "process",
    description:
      "Process engineering, HAZOP, process safety and industrial operations.",
  },
  {
    name: "Civil",
    slug: "civil",
    description:
      "Construction, structural systems, site practices and civil engineering fundamentals.",
  },
  {
    name: "Geology",
    slug: "geology",
    description:
      "Petroleum geology, formations, reservoirs and subsurface knowledge.",
  },
];

async function getHomepageArticles(): Promise<ArticleData[]> {
  try {
    await connectDB();

    const articles = await Article.find({
      status: "Published",
    })
      .sort({
        featured: -1,
        createdAt: -1,
      })
      .limit(6)
      .lean();

    return JSON.parse(
      JSON.stringify(articles)
    );
  } catch (error) {
    console.error(
      "Homepage article fetch error:",
      error
    );

    return [];
  }
}

export default async function HomePage() {
  const articles =
    await getHomepageArticles();

  const featuredArticle =
    articles.find(
      (article) =>
        article.featured
    ) || articles[0];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
              Engineering Knowledge Platform
            </p>

            <h1 className="mt-5 text-5xl font-extrabold leading-tight md:text-7xl">
              Learn Engineering.
              <span className="block text-orange-500">
                Build Expertise.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
              PetroHub brings together practical
              engineering knowledge across Oil & Gas,
              HSE, Mechanical, Electrical,
              Instrumentation, Process, Civil and
              Geology.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/articles"
                className="rounded-xl bg-orange-500 px-7 py-3.5 font-bold text-white transition hover:bg-orange-600"
              >
                Explore Articles
              </Link>

              <Link
                href="/library"
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-7 py-3.5 font-bold text-slate-200 transition hover:border-orange-500 hover:text-orange-400"
              >
                Engineering Library
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ARTICLE */}

      {featuredArticle && (
        <section className="border-b border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Featured
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Featured Article
            </h2>

            <Link
              href={`/articles/${featuredArticle.slug}`}
              className="group mt-8 grid overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition hover:border-orange-500/50 lg:grid-cols-2"
            >
              {featuredArticle.featuredImage ? (
                <img
                  src={
                    featuredArticle.featuredImage
                  }
                  alt={
                    featuredArticle.title
                  }
                  className="h-full min-h-[320px] w-full object-cover"
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center bg-slate-800 text-slate-500">
                  PetroHub
                </div>
              )}

              <div className="flex flex-col justify-center p-8 md:p-10">
                <span className="text-sm font-semibold text-orange-400">
                  {
                    featuredArticle.category
                  }
                </span>

                <h3 className="mt-4 text-3xl font-bold leading-tight transition group-hover:text-orange-400">
                  {
                    featuredArticle.title
                  }
                </h3>

                {featuredArticle.summary && (
                  <p className="mt-5 line-clamp-4 text-base leading-7 text-slate-400">
                    {
                      featuredArticle.summary
                    }
                  </p>
                )}

                <div className="mt-7 flex flex-wrap items-center gap-4 text-sm">
                  <span className="font-semibold text-orange-400">
                    Read article →
                  </span>

                  <span className="text-slate-500">
                    {featuredArticle.views ??
                      0}{" "}
                    views
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* CATEGORIES */}

      <section className="border-b border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                Disciplines
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Explore Categories
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                Browse practical engineering
                knowledge by discipline.
              </p>
            </div>

            <Link
              href="/categories"
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              View all categories →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(
              (category) => (
                <Link
                  key={
                    category.slug
                  }
                  href={`/categories/${category.slug}`}
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/50"
                >
                  <h3 className="text-xl font-bold transition group-hover:text-orange-400">
                    {category.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {
                      category.description
                    }
                  </p>

                  <p className="mt-5 text-sm font-semibold text-orange-400">
                    Explore →
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* LATEST ARTICLES */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                Latest Knowledge
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Latest Articles
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                Practical engineering
                articles published on
                PetroHub.
              </p>
            </div>

            <Link
              href="/articles"
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              Browse all articles →
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10">
              <h3 className="text-xl font-bold">
                No articles available
              </h3>

              <p className="mt-3 text-slate-400">
                Published articles will
                appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(
                (article) => (
                  <ArticleCard
                    key={
                      article._id
                    }
                    articleId={
                      article._id
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* LIBRARY CTA */}

      <section className="border-t border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                  PetroHub Library
                </p>

                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  Engineering Resources
                  in One Place
                </h2>

                <p className="mt-5 max-w-3xl leading-7 text-slate-400">
                  Access books, manuals,
                  technical notes, official
                  resources and legally
                  available engineering
                  documents through the
                  PetroHub Library.
                </p>
              </div>

              <Link
                href="/library"
                className="rounded-xl bg-orange-500 px-7 py-3.5 text-center font-bold text-white transition hover:bg-orange-600"
              >
                Open Library
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}