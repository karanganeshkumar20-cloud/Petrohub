import type {
  Metadata,
} from "next";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  ENGINEERING_CATEGORIES,
} from "@/lib/categories";

import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

export const dynamic =
  "force-dynamic";

const PRODUCTION_URL =
  "https://petrohub-dlor.vercel.app";

/* =========================================================
   SITE URL
========================================================= */

function getSiteUrl() {
  const configuredUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.trim();

  if (
    process.env.NODE_ENV ===
      "production" &&
    (
      !configuredUrl ||
      configuredUrl.includes(
        "localhost"
      ) ||
      configuredUrl.includes(
        "127.0.0.1"
      )
    )
  ) {
    return PRODUCTION_URL;
  }

  return (
    configuredUrl ||
    "http://localhost:3000"
  ).replace(
    /\/+$/,
    ""
  );
}

/* =========================================================
   TYPES
========================================================= */

type CategoryCountResult = {
  _id: string;
  count: number;
};

type CategoryStats = {
  name: string;
  slug: string;
  description: string;

  articleCount: number;
  resourceCount: number;
  totalCount: number;
};

/* =========================================================
   DATA
========================================================= */

async function getCategoryStats(): Promise<
  CategoryStats[]
> {
  try {
    await connectDB();

    const [
      articleResults,
      resourceResults,
    ] =
      await Promise.all([
        Article.aggregate([
          {
            $match: {
              status:
                "Published",
            },
          },

          {
            $group: {
              _id:
                "$category",

              count: {
                $sum:
                  1,
              },
            },
          },
        ]),

        BookModel.aggregate([
          {
            $match: {
              status:
                "Published",
            },
          },

          {
            $group: {
              _id:
                "$category",

              count: {
                $sum:
                  1,
              },
            },
          },
        ]),
      ]);

    const articleCounts =
      new Map<
        string,
        number
      >(
        (
          articleResults as CategoryCountResult[]
        ).map(
          (
            item
          ) => [
            item._id,
            item.count,
          ]
        )
      );

    const resourceCounts =
      new Map<
        string,
        number
      >(
        (
          resourceResults as CategoryCountResult[]
        ).map(
          (
            item
          ) => [
            item._id,
            item.count,
          ]
        )
      );

    return ENGINEERING_CATEGORIES.map(
      (
        category
      ) => {
        const articleCount =
          articleCounts.get(
            category.name
          ) || 0;

        const resourceCount =
          resourceCounts.get(
            category.name
          ) || 0;

        return {
          name:
            category.name,

          slug:
            category.slug,

          description:
            category.description,

          articleCount,

          resourceCount,

          totalCount:
            articleCount +
            resourceCount,
        };
      }
    );
  } catch (error) {
    console.error(
      "Category stats fetch error:",
      error
    );

    return ENGINEERING_CATEGORIES.map(
      (
        category
      ) => ({
        name:
          category.name,

        slug:
          category.slug,

        description:
          category.description,

        articleCount:
          0,

        resourceCount:
          0,

        totalCount:
          0,
      })
    );
  }
}

/* =========================================================
   SEO
========================================================= */

export const metadata:
  Metadata = {
  title:
    "Engineering Categories",

  description:
    "Explore PetroHub engineering knowledge across HSE, Oil & Gas, Mechanical, Electrical, Instrumentation, Process, Civil and Geology.",

  alternates: {
    canonical:
      "/categories",
  },

  robots: {
    index:
      true,

    follow:
      true,
  },

  openGraph: {
    type:
      "website",

    url:
      "/categories",

    siteName:
      "PetroHub",

    title:
      "Engineering Categories | PetroHub",

    description:
      "Browse engineering articles and technical resources across PetroHub engineering disciplines.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Engineering Categories | PetroHub",

    description:
      "Explore engineering knowledge, articles and technical resources by discipline.",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default async function CategoriesPage() {
  const categories =
    await getCategoryStats();

  const siteUrl =
    getSiteUrl();

  const categoriesUrl =
    `${siteUrl}/categories`;

  const totalArticles =
    categories.reduce(
      (
        total,
        category
      ) =>
        total +
        category.articleCount,
      0
    );

  const totalResources =
    categories.reduce(
      (
        total,
        category
      ) =>
        total +
        category.resourceCount,
      0
    );

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "CollectionPage",

        "@id":
          `${categoriesUrl}#collection`,

        url:
          categoriesUrl,

        name:
          "Engineering Categories",

        description:
          "Engineering articles and technical resources organized by professional discipline.",

        inLanguage:
          "en",

        mainEntity: {
          "@type":
            "ItemList",

          numberOfItems:
            categories.length,

          itemListElement:
            categories.map(
              (
                category,
                index
              ) => ({
                "@type":
                  "ListItem",

                position:
                  index + 1,

                name:
                  category.name,

                description:
                  category.description,

                url:
                  `${siteUrl}/categories/${category.slug}`,
              })
            ),
        },
      },

      {
        "@type":
          "BreadcrumbList",

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
              categoriesUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>
              /
            </span>

            <span className="text-slate-300">
              Categories
            </span>
          </div>

          <p className="font-semibold uppercase tracking-[0.22em] text-orange-500">
            Engineering Disciplines
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black md:text-6xl">
            Explore Engineering
            Knowledge by Discipline
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Browse PetroHub
            engineering articles,
            books, manuals,
            standards and technical
            resources organized by
            professional discipline.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <StatBadge
              value={
                categories.length
              }
              label="Disciplines"
            />

            <StatBadge
              value={
                totalArticles
              }
              label="Articles"
            />

            <StatBadge
              value={
                totalResources
              }
              label="Library Resources"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Knowledge Areas
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Engineering Disciplines
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-slate-400">
              Select a discipline
              to explore its
              published articles
              and engineering
              library resources.
            </p>
          </div>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(
              (
                category
              ) => (
                <Link
                  key={
                    category.slug
                  }
                  href={`/categories/${category.slug}`}
                  className="group flex min-h-[300px] flex-col rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-orange-500/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-xl font-black text-orange-400">
                      {category.name.charAt(
                        0
                      )}
                    </div>

                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-400">
                      {
                        category.totalCount
                      }{" "}
                      items
                    </span>
                  </div>

                  <h2 className="mt-6 text-2xl font-bold transition group-hover:text-orange-400">
                    {
                      category.name
                    }
                  </h2>

                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                    {
                      category.description
                    }
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-950 px-3 py-1.5 text-slate-400">
                      {
                        category.articleCount
                      }{" "}
                      Articles
                    </span>

                    <span className="rounded-full bg-slate-950 px-3 py-1.5 text-slate-400">
                      {
                        category.resourceCount
                      }{" "}
                      Resources
                    </span>
                  </div>

                  <p className="mt-6 text-sm font-semibold text-orange-400">
                    Explore{" "}
                    {
                      category.name
                    }
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* PLATFORM LINKS */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <PlatformCard
            href="/articles"
            title="Engineering Articles"
            description="Explore practical technical articles and professional engineering guidance."
          />

          <PlatformCard
            href="/library"
            title="Engineering Library"
            description="Browse books, manuals, standards, notes and downloadable engineering resources."
          />

          <PlatformCard
            href="/formulas"
            title="Formulas & Calculators"
            description="Use PetroHub engineering formulas and interactive technical calculators."
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   STAT BADGE
========================================================= */

function StatBadge({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3">
      <span className="font-black">
        {
          value.toLocaleString()
        }
      </span>

      <span className="ml-2 text-sm text-slate-400">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   PLATFORM CARD
========================================================= */

function PlatformCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={
        href
      }
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-orange-500/50"
    >
      <h3 className="text-xl font-bold transition group-hover:text-orange-400">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>

      <p className="mt-5 font-semibold text-orange-400">
        Explore
      </p>
    </Link>
  );
}