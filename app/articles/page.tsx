import type {
  Metadata,
} from "next";

import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import ArticlesExplorer, {
  type ArticleCardData,
} from "@/components/articles/ArticlesExplorer";

import {
  connectDB,
} from "@/lib/mongodb";

import Article from "@/models/Article";

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
   SEO
========================================================= */

export const metadata:
  Metadata = {
  title:
    "Engineering Articles",

  description:
    "Explore practical engineering articles across Oil & Gas, HSE, Mechanical, Electrical, Instrumentation, Process, Civil and Geology on PetroHub.",

  alternates: {
    canonical:
      "/articles",
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
   ARTICLES
========================================================= */

async function getArticles(): Promise<
  ArticleCardData[]
> {
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
    ) as ArticleCardData[];
  } catch (error) {
    console.error(
      "Articles page fetch error:",
      error
    );

    return [];
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function ArticlesPage() {
  const articles =
    await getArticles();

  const siteUrl =
    getSiteUrl();

  const pageUrl =
    `${siteUrl}/articles`;

  const featuredCount =
    articles.filter(
      (
        article
      ) =>
        article.featured ===
        true
    ).length;

  const categoryCount =
    new Set(
      articles.map(
        (
          article
        ) =>
          article.category
      )
    ).size;

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

        description:
          "Practical engineering articles across major engineering disciplines.",

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

            <span>/</span>

            <span className="text-slate-300">
              Articles
            </span>
          </div>

          <p className="font-semibold uppercase tracking-[0.22em] text-orange-500">
            PetroHub Knowledge
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Engineering Articles
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Practical technical
            knowledge for engineers,
            HSE professionals,
            students and the
            Oil & Gas industry.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <StatBadge
              value={
                articles.length
              }
              label="Published Articles"
            />

            <StatBadge
              value={
                categoryCount
              }
              label="Disciplines"
            />

            <StatBadge
              value={
                featuredCount
              }
              label="Featured"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/categories"
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Browse Categories
            </Link>

            <Link
              href="/library"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Engineering Library
            </Link>
          </div>
        </div>
      </section>

      {/* ARTICLE EXPLORER */}

      <ArticlesExplorer
        initialArticles={
          articles
        }
      />

      {/* FOOTER CTA */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-10">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub Engineering
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Continue Learning
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Explore engineering
            resources, calculators
            and discipline-specific
            knowledge across
            PetroHub.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/library"
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Open Library
            </Link>

            <Link
              href="/formulas"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Formulas & Calculators
            </Link>

            <Link
              href="/categories"
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Categories
            </Link>
          </div>
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
      <span className="font-black text-white">
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