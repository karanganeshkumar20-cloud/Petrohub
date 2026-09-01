import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type CategoryConfig = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  keywords: string[];
};

type ArticleData = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  category: string;
  featuredImage?: string;
  featured?: boolean;
  views?: number;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
};

/* =========================================================
   SITE URL
========================================================= */

const PRODUCTION_URL =
  "https://petrohub-dlor.vercel.app";

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (
    process.env.NODE_ENV === "production" &&
    (
      !configuredUrl ||
      configuredUrl.includes("localhost") ||
      configuredUrl.includes("127.0.0.1")
    )
  ) {
    return PRODUCTION_URL;
  }

  return (
    configuredUrl ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

/* =========================================================
   CATEGORY CONFIGURATION
========================================================= */

const categories: CategoryConfig[] = [
  {
    name: "HSE",
    slug: "hse",

    seoTitle:
      "HSE Engineering Articles & Safety Resources",

    description:
      "Explore HSE articles, workplace safety guidance, HIRA, permit to work, LOTO, risk assessment and incident prevention resources for professionals.",

    keywords: [
      "HSE",
      "HSE Engineering",
      "Health and Safety",
      "Workplace Safety",
      "HIRA",
      "Risk Assessment",
      "Permit to Work",
      "PTW",
      "LOTO",
      "Safety Engineering",
    ],
  },

  {
    name: "Oil & Gas",
    slug: "oil-gas",

    seoTitle:
      "Oil & Gas Engineering Articles & Resources",

    description:
      "Explore Oil & Gas engineering articles covering petroleum engineering, drilling, production, reservoirs, upstream operations and industry knowledge.",

    keywords: [
      "Oil and Gas",
      "Oil and Gas Engineering",
      "Petroleum Engineering",
      "Drilling Engineering",
      "Production Engineering",
      "Reservoir Engineering",
      "Upstream Oil and Gas",
    ],
  },

  {
    name: "Mechanical",
    slug: "mechanical",

    seoTitle:
      "Mechanical Engineering Articles & Resources",

    description:
      "Explore mechanical engineering knowledge covering piping, rotating equipment, maintenance, corrosion, industrial systems and engineering practices.",

    keywords: [
      "Mechanical Engineering",
      "Piping Engineering",
      "Rotating Equipment",
      "Mechanical Maintenance",
      "Corrosion",
      "Industrial Equipment",
    ],
  },

  {
    name: "Civil",
    slug: "civil",

    seoTitle:
      "Civil Engineering Articles & Resources",

    description:
      "Explore civil engineering articles covering construction, structural systems, site practices, materials, safety and engineering fundamentals.",

    keywords: [
      "Civil Engineering",
      "Construction Engineering",
      "Structural Engineering",
      "Construction Safety",
      "Site Engineering",
      "Civil Engineering Resources",
    ],
  },

  {
    name: "Electrical",
    slug: "electrical",

    seoTitle:
      "Electrical Engineering Articles & Resources",

    description:
      "Explore electrical engineering articles covering electrical safety, isolation, power systems, protection and industrial electrical equipment.",

    keywords: [
      "Electrical Engineering",
      "Electrical Safety",
      "Power Systems",
      "Electrical Isolation",
      "Electrical Protection",
      "Industrial Electrical",
    ],
  },

  {
    name: "Instrumentation",
    slug: "instrumentation",

    seoTitle:
      "Instrumentation Engineering Articles & Resources",

    description:
      "Explore instrumentation engineering knowledge covering sensors, transmitters, calibration, measurement, process control and industrial automation.",

    keywords: [
      "Instrumentation Engineering",
      "Process Instrumentation",
      "Calibration",
      "Transmitters",
      "Sensors",
      "Process Control",
      "Industrial Automation",
    ],
  },

  {
    name: "Process",
    slug: "process",

    seoTitle:
      "Process Engineering Articles & Resources",

    description:
      "Explore process engineering articles covering process safety, HAZOP, industrial operations, equipment, systems and engineering fundamentals.",

    keywords: [
      "Process Engineering",
      "Process Safety",
      "HAZOP",
      "Industrial Process",
      "Chemical Process",
      "Process Operations",
    ],
  },

  {
    name: "Geology",
    slug: "geology",

    seoTitle:
      "Geology & Petroleum Geology Articles",

    description:
      "Explore geology and petroleum geology articles covering reservoirs, formations, subsurface systems, rocks and earth science for engineering professionals.",

    keywords: [
      "Geology",
      "Petroleum Geology",
      "Reservoir Geology",
      "Subsurface",
      "Rock Formations",
      "Oil and Gas Geology",
    ],
  },
];

/* =========================================================
   CATEGORY HELPER
========================================================= */

function getCategoryBySlug(
  slug: string
): CategoryConfig | null {
  return (
    categories.find(
      (category) =>
        category.slug === slug
    ) || null
  );
}

/* =========================================================
   GET ARTICLES
========================================================= */

async function getCategoryArticles(
  categoryName: string
): Promise<ArticleData[]> {
  try {
    await connectDB();

    const documents =
      await Article.find({
        category: categoryName,
        status: "Published",
      })
        .select(
          "_id title slug summary category featuredImage featured views author createdAt updatedAt"
        )
        .sort({
          featured: -1,
          createdAt: -1,
        })
        .lean();

    return JSON.parse(
      JSON.stringify(documents)
    ) as ArticleData[];
  } catch (error) {
    console.error(
      "Category article fetch error:",
      error
    );

    return [];
  }
}

/* =========================================================
   SEO METADATA
========================================================= */

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } =
    await params;

  const category =
    getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",

      description:
        "The requested PetroHub engineering category could not be found.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl =
    getSiteUrl();

  const canonicalUrl =
    `${siteUrl}/categories/${category.slug}`;

  const socialTitle =
    `${category.seoTitle} | PetroHub`;

  return {
    /*
     * Root layout already adds:
     * "%s | PetroHub"
     */
    title:
      category.seoTitle,

    description:
      category.description,

    keywords: [
      ...category.keywords,
      "PetroHub",
      "Engineering Articles",
      "Engineering Resources",
      "Engineering Knowledge",
    ],

    alternates: {
      canonical:
        canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "website",

      locale: "en_US",

      url:
        canonicalUrl,

      siteName:
        "PetroHub",

      title:
        socialTitle,

      description:
        category.description,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        socialTitle,

      description:
        category.description,
    },
  };
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
  value?: string
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   CATEGORY PAGE
========================================================= */

export default async function CategoryPage({
  params,
}: Props) {
  const { slug } =
    await params;

  const category =
    getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const articles =
    await getCategoryArticles(
      category.name
    );

  const siteUrl =
    getSiteUrl();

  const categoryUrl =
    `${siteUrl}/categories/${category.slug}`;

  /* =====================================================
     STRUCTURED DATA
  ===================================================== */

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "CollectionPage",

        "@id":
          `${categoryUrl}#collection`,

        url:
          categoryUrl,

        name:
          category.seoTitle,

        description:
          category.description,

        inLanguage:
          "en",

        isPartOf: {
          "@type":
            "WebSite",

          name:
            "PetroHub",

          url:
            siteUrl,
        },

        mainEntity: {
          "@type":
            "ItemList",

          numberOfItems:
            articles.length,

          itemListElement:
            articles.map(
              (
                article,
                index
              ) => ({
                "@type":
                  "ListItem",

                position:
                  index + 1,

                name:
                  article.title,

                url:
                  `${siteUrl}/articles/${article.slug}`,
              })
            ),
        },
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${categoryUrl}#breadcrumb`,

        itemListElement: [
          {
            "@type":
              "ListItem",

            position:
              1,

            name:
              "Home",

            item:
              siteUrl,
          },

          {
            "@type":
              "ListItem",

            position:
              2,

            name:
              "Categories",

            item:
              `${siteUrl}/categories`,
          },

          {
            "@type":
              "ListItem",

            position:
              3,

            name:
              category.name,

            item:
              categoryUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =================================================
          STRUCTURED DATA
      ================================================= */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          {/* Breadcrumb */}

          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href="/categories"
              className="transition hover:text-orange-400"
            >
              Categories
            </Link>

            <span>/</span>

            <span className="text-slate-300">
              {category.name}
            </span>
          </div>

          <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
            Engineering Discipline
          </p>

          <h1 className="mt-5 max-w-5xl text-4xl font-extrabold leading-tight md:text-6xl">
            {category.name}
            <span className="block text-orange-500">
              Engineering Knowledge
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            {category.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
              {articles.length}{" "}
              {articles.length === 1
                ? "Article"
                : "Articles"}
            </span>

            <Link
              href="/library"
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-orange-400 transition hover:border-orange-500"
            >
              Engineering Library →
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          ARTICLES
      ================================================= */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                Latest Knowledge
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                {category.name} Articles
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Explore published PetroHub
                articles and technical
                knowledge from this
                engineering discipline.
              </p>
            </div>

            <Link
              href="/articles"
              className="font-semibold text-orange-400 transition hover:text-orange-300"
            >
              Browse all articles →
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10">
              <h3 className="text-xl font-bold">
                No published articles yet
              </h3>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                New {category.name} articles
                will appear here
                automatically when they
                are published.
              </p>

              <Link
                href="/articles"
                className="mt-6 inline-block font-semibold text-orange-400 hover:text-orange-300"
              >
                Explore other articles →
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(
                (article) => (
                  <Link
                    key={
                      article._id
                    }
                    href={`/articles/${article.slug}`}
                    className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
                  >
                    {/* Image */}

                    {article.featuredImage ? (
                      <img
                        src={
                          article.featuredImage
                        }
                        alt={
                          article.title
                        }
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-slate-800">
                        <span className="font-bold text-slate-500">
                          PetroHub
                        </span>
                      </div>
                    )}

                    {/* Card */}

                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-semibold text-orange-400">
                          {
                            article.category
                          }
                        </span>

                        {article.featured && (
                          <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-xl font-bold leading-7 transition group-hover:text-orange-400">
                        {
                          article.title
                        }
                      </h3>

                      {article.summary && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                          {
                            article.summary
                          }
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-orange-400">
                          Read article →
                        </span>

                        <span className="text-slate-500">
                          {article.views ??
                            0}{" "}
                          views
                        </span>
                      </div>

                      {(article.author ||
                        article.createdAt) && (
                        <div className="mt-5 border-t border-slate-800 pt-4 text-xs text-slate-500">
                          {article.author && (
                            <span>
                              {
                                article.author
                              }
                            </span>
                          )}

                          {article.author &&
                            article.createdAt && (
                              <span>
                                {" "}
                                •{" "}
                              </span>
                            )}

                          {article.createdAt && (
                            <span>
                              {formatDate(
                                article.createdAt
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          OTHER CATEGORIES
      ================================================= */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            More Disciplines
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Explore Other Categories
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories
              .filter(
                (item) =>
                  item.slug !==
                  category.slug
              )
              .map(
                (item) => (
                  <Link
                    key={
                      item.slug
                    }
                    href={`/categories/${item.slug}`}
                    className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-orange-500/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold transition group-hover:text-orange-400">
                        {
                          item.name
                        }
                      </span>

                      <span className="text-slate-600 transition group-hover:text-orange-400">
                        →
                      </span>
                    </div>
                  </Link>
                )
              )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}