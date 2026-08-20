import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const categoryMap: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  hse: {
    name: "HSE",
    description:
      "Explore health, safety and environment articles covering workplace safety, risk assessment, permit to work, LOTO, incident investigation and safety management.",
  },

  "oil-gas": {
    name: "Oil & Gas",
    description:
      "Explore petroleum engineering, drilling, production, reservoir engineering, upstream operations and oil and gas industry knowledge.",
  },

  mechanical: {
    name: "Mechanical",
    description:
      "Explore mechanical engineering topics including piping, rotating equipment, corrosion, maintenance and industrial machinery.",
  },

  electrical: {
    name: "Electrical",
    description:
      "Explore industrial electrical systems, electrical safety, isolation, power systems and equipment protection.",
  },

  instrumentation: {
    name: "Instrumentation",
    description:
      "Explore instrumentation, calibration, sensors, transmitters, industrial measurement and control systems.",
  },

  process: {
    name: "Process",
    description:
      "Explore process engineering, process safety, HAZOP, industrial systems and operational engineering concepts.",
  },

  civil: {
    name: "Civil",
    description:
      "Explore civil engineering, construction, structural systems, site practices and engineering fundamentals.",
  },

  geology: {
    name: "Geology",
    description:
      "Explore petroleum geology, earth sciences, formations, reservoirs and subsurface engineering topics.",
  },
};

async function getArticlesByCategory(
  categoryName: string
) {
  await connectDB();

  const articles = await Article.find({
    category: categoryName,
    status: "Published",
  })
    .sort({
      featured: -1,
      createdAt: -1,
    })
    .lean();

  return JSON.parse(
    JSON.stringify(articles)
  );
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const category = categoryMap[slug];

  if (!category) {
    notFound();
  }

  const articles =
    await getArticlesByCategory(
      category.name
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span className="mx-2">
              /
            </span>

            <Link
              href="/categories"
              className="transition hover:text-orange-400"
            >
              Categories
            </Link>

            <span className="mx-2">
              /
            </span>

            <span className="text-slate-300">
              {category.name}
            </span>
          </div>

          <p className="mt-8 font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub Category
          </p>

          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
            {category.name}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            {category.description}
          </p>

          <div className="mt-8 inline-flex rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
            <span className="text-2xl font-bold">
              {articles.length}
            </span>

            <span className="ml-2 self-center text-sm text-slate-500">
              Published Articles
            </span>
          </div>
        </div>
      </section>

      {/* ARTICLES */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                Articles
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Latest {category.name} Articles
              </h2>
            </div>

            <Link
              href="/articles"
              className="font-semibold text-orange-400 transition hover:text-orange-300"
            >
              Browse all articles →
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10">
              <h3 className="text-xl font-bold">
                No articles available yet
              </h3>

              <p className="mt-3 text-slate-400">
                New {category.name} articles
                will appear here once they are
                published.
              </p>

              <Link
                href="/articles"
                className="mt-6 inline-block font-semibold text-orange-400 hover:text-orange-300"
              >
                Explore other articles →
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(
                (article: any) => (
                  <ArticleCard
                    key={article._id.toString()}
                    articleId={
                      article._id.toString()
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}