import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

import { connectDB } from "@/lib/mongodb";

import Article from "@/models/Article";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

/* =========================
   TYPES
========================= */

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

type LibraryResource = {
  _id: string;
  title: string;
  slug: string;
  author?: string;
  description?: string;
  category: string;

  contentType:
    | "book"
    | "manual"
    | "standard"
    | "note"
    | "download";

  resourceType:
    | "hosted"
    | "external";

  coverImage?: string;

  featured?: boolean;

  views?: number;
  downloads?: number;

  publisher?: string;
  year?: number;

  createdAt?: string;
};

/* =========================
   CATEGORIES
========================= */

const categories = [
  {
    name: "HSE",
    slug: "hse",
    description:
      "Safety, HIRA, PTW, LOTO, incident prevention and workplace risk management.",
  },

  {
    name: "Oil & Gas",
    slug: "oil-gas",
    description:
      "Drilling, production, reservoir engineering and petroleum operations.",
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
      "Electrical safety, isolation, power systems and industrial equipment.",
  },

  {
    name: "Instrumentation",
    slug: "instrumentation",
    description:
      "Sensors, transmitters, calibration, measurement and industrial control.",
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
      "Construction, structural systems, site practices and civil engineering.",
  },

  {
    name: "Geology",
    slug: "geology",
    description:
      "Petroleum geology, reservoirs, formations and subsurface knowledge.",
  },
];

/* =========================
   DATABASE
========================= */

async function getHomepageData() {
  try {
    await connectDB();

    const [
      articles,
      featuredResources,
      popularResources,
      articleCount,
      resourceCount,
    ] = await Promise.all([
      Article.find({
        status: "Published",
      })
        .sort({
          featured: -1,
          createdAt: -1,
        })
        .limit(6)
        .lean(),

      BookModel.find({
        status: "Published",
        featured: true,
      })
        .sort({
          createdAt: -1,
        })
        .limit(4)
        .lean(),

      BookModel.find({
        status: "Published",
      })
        .sort({
          views: -1,
          downloads: -1,
          createdAt: -1,
        })
        .limit(4)
        .lean(),

      Article.countDocuments({
        status: "Published",
      }),

      BookModel.countDocuments({
        status: "Published",
      }),
    ]);

    return {
      articles: JSON.parse(
        JSON.stringify(articles)
      ) as ArticleData[],

      featuredResources: JSON.parse(
        JSON.stringify(
          featuredResources
        )
      ) as LibraryResource[],

      popularResources: JSON.parse(
        JSON.stringify(
          popularResources
        )
      ) as LibraryResource[],

      articleCount,
      resourceCount,
    };
  } catch (error) {
    console.error(
      "Homepage data fetch error:",
      error
    );

    return {
      articles: [] as ArticleData[],

      featuredResources:
        [] as LibraryResource[],

      popularResources:
        [] as LibraryResource[],

      articleCount: 0,
      resourceCount: 0,
    };
  }
}

/* =========================
   HOMEPAGE
========================= */

export default async function HomePage() {
  const {
    articles,
    featuredResources,
    popularResources,
    articleCount,
    resourceCount,
  } = await getHomepageData();

  const featuredArticle =
    articles.find(
      (article) =>
        article.featured
    ) || articles[0];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =========================
          HERO
      ========================= */}

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-5xl">
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
              Explore practical engineering
              articles, professional manuals,
              technical references and
              industry resources across HSE,
              Oil & Gas, Mechanical,
              Electrical and more.
            </p>

            {/* GLOBAL SEARCH */}

            <form
              action="/search"
              method="GET"
              className="mt-9 max-w-3xl"
            >
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-3 shadow-2xl backdrop-blur sm:flex-row">
                <input
                  type="search"
                  name="q"
                  required
                  placeholder="Search HIRA, OSHA, LOTO, drilling, reservoir..."
                  className="min-w-0 flex-1 rounded-xl bg-slate-950 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:ring-1 focus:ring-orange-500"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600"
                >
                  Search PetroHub
                </button>
              </div>
            </form>

            {/* QUICK SEARCH */}

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "HIRA",
                "OSHA",
                "LOTO",
                "Fire Safety",
                "Reservoir",
              ].map(
                (keyword) => (
                  <Link
                    key={keyword}
                    href={`/search?q=${encodeURIComponent(
                      keyword
                    )}`}
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-orange-500 hover:text-orange-400"
                  >
                    {keyword}
                  </Link>
                )
              )}
            </div>

            {/* PRIMARY CTA */}

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

          {/* PLATFORM STATS */}

          <div className="mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
            <HeroStat
              value={articleCount}
              label="Published Articles"
            />

            <HeroStat
              value={resourceCount}
              label="Library Resources"
            />

            <HeroStat
              value={categories.length}
              label="Engineering Disciplines"
            />
          </div>
        </div>
      </section>

      {/* =========================
          FEATURED LIBRARY
      ========================= */}

      {featuredResources.length >
        0 && (
        <section className="border-b border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Featured Resources"
              title="Engineering Library"
              description="Selected books, manuals, standards and technical resources from the PetroHub Library."
              href="/library"
              linkLabel="Explore Library →"
            />

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredResources.map(
                (resource) => (
                  <LibraryCard
                    key={
                      resource._id
                    }
                    resource={
                      resource
                    }
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================
          FEATURED ARTICLE
      ========================= */}

      {featuredArticle && (
        <section className="border-b border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Featured Knowledge
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
                <div className="flex min-h-[320px] items-center justify-center bg-slate-800 text-2xl font-extrabold text-slate-600">
                  PetroHub
                </div>
              )}

              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
                    {
                      featuredArticle.category
                    }
                  </span>

                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Article
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-bold leading-tight transition group-hover:text-orange-400">
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

                <div className="mt-7 flex flex-wrap items-center gap-5 text-sm">
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

      {/* =========================
          CATEGORIES
      ========================= */}

      <section className="border-b border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Disciplines"
            title="Explore Engineering Categories"
            description="Find knowledge and resources based on your engineering discipline."
            href="/categories"
            linkLabel="View all categories →"
          />

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
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold transition group-hover:text-orange-400">
                      {
                        category.name
                      }
                    </h3>

                    <span className="text-xl text-slate-600 transition group-hover:text-orange-400">
                      →
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {
                      category.description
                    }
                  </p>

                  <p className="mt-5 text-sm font-semibold text-orange-400">
                    Explore category
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* =========================
          LATEST ARTICLES
      ========================= */}

      <section className="border-b border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Latest Knowledge"
            title="Latest Articles"
            description="Practical engineering knowledge, safety guidance and technical learning from PetroHub."
            href="/articles"
            linkLabel="Browse all articles →"
          />

          {articles.length === 0 ? (
            <EmptyState
              title="No articles available"
              description="Published articles will appear here automatically."
            />
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

      {/* =========================
          POPULAR RESOURCES
      ========================= */}

      {popularResources.length >
        0 && (
        <section className="border-b border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Popular Resources"
              title="Most Viewed in the Library"
              description="Discover the engineering resources PetroHub readers are exploring."
              href="/library"
              linkLabel="Browse Library →"
            />

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularResources.map(
                (resource) => (
                  <LibraryCard
                    key={
                      resource._id
                    }
                    resource={
                      resource
                    }
                    showStats
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================
          KNOWLEDGE PLATFORM CTA
      ========================= */}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                  PetroHub
                </p>

                <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-4xl">
                  Engineering knowledge
                  and professional
                  resources in one place.
                </h2>

                <p className="mt-5 max-w-3xl leading-7 text-slate-400">
                  Learn from practical
                  engineering articles,
                  browse technical
                  references and access
                  hosted or official
                  industry resources
                  through PetroHub.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/library"
                  className="rounded-xl bg-orange-500 px-7 py-3.5 text-center font-bold text-white transition hover:bg-orange-600"
                >
                  Open Library
                </Link>

                <Link
                  href="/search"
                  className="rounded-xl border border-slate-700 px-7 py-3.5 text-center font-bold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
                >
                  Search PetroHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================
   LIBRARY CARD
========================= */

function LibraryCard({
  resource,
  showStats = false,
}: {
  resource: LibraryResource;
  showStats?: boolean;
}) {
  return (
    <Link
      href={`/library/${resource.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
    >
      <div className="relative overflow-hidden bg-slate-800">
        {resource.coverImage ? (
          <img
            src={
              resource.coverImage
            }
            alt={
              resource.title
            }
            className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center text-xl font-bold text-slate-600">
            PetroHub
          </div>
        )}

        {resource.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-slate-950">
            ★ Featured
          </span>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-slate-950/90 px-3 py-1 text-xs font-semibold text-orange-400">
          {getContentTypeLabel(
            resource.contentType
          )}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-orange-400">
            {resource.category}
          </span>

          <span className="text-xs text-slate-600">
            •
          </span>

          <span className="text-xs font-semibold text-slate-500">
            {resource.resourceType ===
            "hosted"
              ? "Hosted PDF"
              : "Official Source"}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-6 transition group-hover:text-orange-400">
          {resource.title}
        </h3>

        {resource.author && (
          <p className="mt-2 line-clamp-1 text-sm text-slate-500">
            By {resource.author}
          </p>
        )}

        {showStats && (
          <div className="mt-5 flex gap-4 border-t border-slate-800 pt-4 text-xs text-slate-500">
            <span>
              {resource.views ??
                0}{" "}
              views
            </span>

            <span>
              {resource.downloads ??
                0}{" "}
              downloads
            </span>
          </div>
        )}

        <p className="mt-5 text-sm font-semibold text-orange-400">
          View resource →
        </p>
      </div>
    </Link>
  );
}

/* =========================
   SECTION HEADER
========================= */

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
          {eyebrow}
        </p>

        <h2 className="mt-3 text-3xl font-bold">
          {title}
        </h2>

        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="font-semibold text-orange-400 transition hover:text-orange-300"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

/* =========================
   HERO STAT
========================= */

function HeroStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-3xl font-extrabold text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10">
      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================
   CONTENT TYPE LABEL
========================= */

function getContentTypeLabel(
  contentType?: string
) {
  switch (contentType) {
    case "manual":
      return "Manual";

    case "standard":
      return "Standard";

    case "note":
      return "Note";

    case "download":
      return "Download";

    default:
      return "Book";
  }
}