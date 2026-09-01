import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

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
   PAGE SEO
========================================================= */

export const metadata: Metadata = {
  /*
   * Root layout already adds:
   * "%s | PetroHub"
   */
  title:
    "Engineering Articles",

  description:
    "Explore practical engineering articles across Oil & Gas, HSE, Mechanical, Electrical, Instrumentation, Process, Civil and Geology on PetroHub.",

  keywords: [
    "Engineering Articles",
    "PetroHub Articles",
    "Oil and Gas Articles",
    "Petroleum Engineering",
    "HSE Articles",
    "Safety Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Instrumentation Engineering",
    "Process Engineering",
    "Civil Engineering",
    "Geology",
    "Technical Articles",
    "Engineering Knowledge",
  ],

  alternates: {
    canonical:
      "/articles",
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },

  openGraph: {
    type:
      "website",

    locale:
      "en_US",

    url:
      "/articles",

    siteName:
      "PetroHub",

    title:
      "Engineering Articles | PetroHub",

    description:
      "Practical engineering knowledge covering Oil & Gas, HSE, Mechanical, Electrical, Instrumentation, Process, Civil and Geology.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Engineering Articles | PetroHub",

    description:
      "Explore practical engineering and technical articles across multiple professional engineering disciplines.",
  },
};

/* =========================================================
   GET ARTICLES
========================================================= */

async function getArticles(): Promise<ArticleData[]> {
  try {
    await connectDB();

    const documents =
      await Article.find({
        status:
          "Published",
      })
        .select(
          "_id title slug summary category featuredImage featured views author createdAt updatedAt"
        )
        .sort({
          featured:
            -1,

          createdAt:
            -1,
        })
        .lean();

    return JSON.parse(
      JSON.stringify(
        documents
      )
    ) as ArticleData[];
  } catch (error) {
    console.error(
      "Articles page fetch error:",
      error
    );

    return [];
  }
}

/* =========================================================
   DATE FORMAT
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
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
}

/* =========================================================
   ARTICLES PAGE
========================================================= */

export default async function ArticlesPage() {
  const articles =
    await getArticles();

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/articles`;

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
          `${pageUrl}#collection`,

        url:
          pageUrl,

        name:
          "Engineering Articles",

        headline:
          "Engineering Articles",

        description:
          "Practical engineering articles covering Oil & Gas, HSE, Mechanical, Electrical, Instrumentation, Process, Civil and Geology.",

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
          `${pageUrl}#breadcrumb`,

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
              "Engineering Articles",

            item:
              pageUrl,
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

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          {/* Breadcrumb */}

          <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-slate-300">
              Articles
            </span>
          </div>

          <p className="font-semibold uppercase tracking-widest text-orange-500">
            PetroHub Knowledge
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Engineering Articles
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Explore practical knowledge
            across Oil & Gas, HSE,
            Mechanical, Electrical,
            Process, Instrumentation,
            Civil and Geology.
          </p>

          {/* SEARCH + LIBRARY */}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600"
            >
              Search Articles →
            </Link>

            <Link
              href="/categories"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Browse Categories
            </Link>

            <Link
              href="/library"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Engineering Library
            </Link>
          </div>

          {/* COUNT */}

          <div className="mt-8">
            <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
              {articles.length}{" "}
              {articles.length === 1
                ? "Published Article"
                : "Published Articles"}
            </span>
          </div>
        </div>
      </section>

      {/* =================================================
          ARTICLE LIST
      ================================================= */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Latest Knowledge
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Latest Engineering Articles
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Technical learning,
              professional guidance and
              practical engineering
              knowledge published on
              PetroHub.
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10">
              <h3 className="text-xl font-bold">
                No published articles available
              </h3>

              <p className="mt-3 text-slate-400">
                Published engineering
                articles will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(
                (
                  article
                ) => (
                  <article
                    key={
                      article._id
                    }
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
                  >
                    {/* FEATURED IMAGE */}

                    <Link
                      href={`/articles/${article.slug}`}
                      className="block"
                    >
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
                    </Link>

                    {/* ARTICLE CONTENT */}

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                          href={`/categories/${getCategorySlug(
                            article.category
                          )}`}
                          className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/20"
                        >
                          {
                            article.category
                          }
                        </Link>

                        <div className="flex items-center gap-2">
                          {article.featured && (
                            <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400">
                              ★ Featured
                            </span>
                          )}

                          <span className="text-sm text-slate-500">
                            {article.views ??
                              0}{" "}
                            views
                          </span>
                        </div>
                      </div>

                      <h2 className="mt-5 text-2xl font-bold leading-8 transition group-hover:text-orange-400">
                        <Link
                          href={`/articles/${article.slug}`}
                        >
                          {
                            article.title
                          }
                        </Link>
                      </h2>

                      {article.summary && (
                        <p className="mt-4 line-clamp-4 flex-1 leading-7 text-slate-400">
                          {
                            article.summary
                          }
                        </p>
                      )}

                      {/* AUTHOR / DATE */}

                      {(article.author ||
                        article.createdAt) && (
                        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          {article.author && (
                            <span>
                              By{" "}
                              {
                                article.author
                              }
                            </span>
                          )}

                          {article.author &&
                            article.createdAt && (
                              <span>
                                •
                              </span>
                            )}

                          {article.createdAt && (
                            <time
                              dateTime={
                                article.createdAt
                              }
                            >
                              {formatDate(
                                article.createdAt
                              )}
                            </time>
                          )}
                        </div>
                      )}

                      <Link
                        href={`/articles/${article.slug}`}
                        className="mt-6 font-semibold text-orange-400 transition hover:text-orange-300"
                      >
                        Read article →
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          CATEGORY CTA
      ================================================= */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-10">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Explore by Discipline
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Find Engineering Knowledge
              by Category
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Browse PetroHub articles
              based on your engineering
              discipline and professional
              interests.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {[
                {
                  name:
                    "HSE",

                  slug:
                    "hse",
                },
                {
                  name:
                    "Oil & Gas",

                  slug:
                    "oil-gas",
                },
                {
                  name:
                    "Mechanical",

                  slug:
                    "mechanical",
                },
                {
                  name:
                    "Electrical",

                  slug:
                    "electrical",
                },
                {
                  name:
                    "Instrumentation",

                  slug:
                    "instrumentation",
                },
                {
                  name:
                    "Process",

                  slug:
                    "process",
                },
                {
                  name:
                    "Civil",

                  slug:
                    "civil",
                },
                {
                  name:
                    "Geology",

                  slug:
                    "geology",
                },
              ].map(
                (
                  category
                ) => (
                  <Link
                    key={
                      category.slug
                    }
                    href={`/categories/${category.slug}`}
                    className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
                  >
                    {
                      category.name
                    }
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   CATEGORY SLUG
========================================================= */

function getCategorySlug(
  category: string
) {
  const categorySlugs: Record<
    string,
    string
  > = {
    HSE:
      "hse",

    "Oil & Gas":
      "oil-gas",

    Mechanical:
      "mechanical",

    Electrical:
      "electrical",

    Instrumentation:
      "instrumentation",

    Process:
      "process",

    Civil:
      "civil",

    Geology:
      "geology",
  };

  return (
    categorySlugs[
      category
    ] ||
    "hse"
  );
}
