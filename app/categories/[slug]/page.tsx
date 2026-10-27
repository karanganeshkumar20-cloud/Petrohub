import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  ENGINEERING_CATEGORIES,
  getCategoryBySlug,
} from "@/lib/categories";

import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

export const dynamic =
  "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  params: Promise<{
    slug: string;
  }>;
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
};

type LibraryResource = {
  _id: string;
  title: string;
  slug: string;

  author?: string;
  description?: string;

  category: string;

  contentType?:
    | "book"
    | "manual"
    | "standard"
    | "note"
    | "download";

  resourceType?:
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

/* =========================================================
   SITE URL
========================================================= */

const PRODUCTION_URL =
  "https://petrohub-dlor.vercel.app";

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
   CATEGORY CONTENT
========================================================= */

async function getCategoryContent(
  categoryName: string
): Promise<{
  articles:
    ArticleData[];
  resources:
    LibraryResource[];
}> {
  try {
    await connectDB();

    const [
      articleDocuments,
      resourceDocuments,
    ] =
      await Promise.all([
        Article.find({
          category:
            categoryName,

          status:
            "Published",
        })
          .select(
            "_id title slug summary category featuredImage featured views author createdAt"
          )
          .sort({
            featured:
              -1,

            createdAt:
              -1,
          })
          .lean(),

        BookModel.find({
          category:
            categoryName,

          status:
            "Published",
        })
          .select(
            "_id title slug author description category contentType resourceType coverImage featured views downloads publisher year createdAt"
          )
          .sort({
            featured:
              -1,

            createdAt:
              -1,
          })
          .lean(),
      ]);

    return {
      articles:
        JSON.parse(
          JSON.stringify(
            articleDocuments
          )
        ) as ArticleData[],

      resources:
        JSON.parse(
          JSON.stringify(
            resourceDocuments
          )
        ) as LibraryResource[],
    };
  } catch (error) {
    console.error(
      "Category content fetch error:",
      error
    );

    return {
      articles:
        [],

      resources:
        [],
    };
  }
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const category =
    getCategoryBySlug(
      slug
    );

  if (!category) {
    return {
      title:
        "Category Not Found",

      description:
        "The requested PetroHub engineering category could not be found.",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  const siteUrl =
    getSiteUrl();

  const canonicalUrl =
    `${siteUrl}/categories/${category.slug}`;

  return {
    title:
      category.seoTitle,

    description:
      category.description,

    keywords: [
      ...category.keywords,
      "PetroHub",
      "Engineering Articles",
      "Engineering Resources",
    ],

    alternates: {
      canonical:
        canonicalUrl,
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
        canonicalUrl,

      siteName:
        "PetroHub",

      title:
        `${category.seoTitle} | PetroHub`,

      description:
        category.description,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        `${category.seoTitle} | PetroHub`,

      description:
        category.description,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function CategoryPage({
  params,
}: Props) {
  const {
    slug,
  } = await params;

  const category =
    getCategoryBySlug(
      slug
    );

  if (!category) {
    notFound();
  }

  const {
    articles,
    resources,
  } =
    await getCategoryContent(
      category.name
    );

  const siteUrl =
    getSiteUrl();

  const categoryUrl =
    `${siteUrl}/categories/${category.slug}`;

  const knowledgeItems = [
    ...articles.map(
      (
        article
      ) => ({
        name:
          article.title,

        url:
          `${siteUrl}/articles/${article.slug}`,
      })
    ),

    ...resources.map(
      (
        resource
      ) => ({
        name:
          resource.title,

        url:
          `${siteUrl}/library/${resource.slug}`,
      })
    ),
  ];

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

        mainEntity: {
          "@type":
            "ItemList",

          numberOfItems:
            knowledgeItems.length,

          itemListElement:
            knowledgeItems.map(
              (
                item,
                index
              ) => ({
                "@type":
                  "ListItem",

                position:
                  index + 1,

                name:
                  item.name,

                url:
                  item.url,
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

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>
              /
            </span>

            <Link
              href="/categories"
              className="transition hover:text-orange-400"
            >
              Categories
            </Link>

            <span>
              /
            </span>

            <span className="text-slate-300">
              {
                category.name
              }
            </span>
          </div>

          <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
            Engineering Discipline
          </p>

          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight md:text-6xl">
            {
              category.name
            }

            <span className="block text-orange-500">
              Engineering Knowledge
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            {
              category.description
            }
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <StatBadge
              value={
                articles.length
              }
              label="Articles"
            />

            <StatBadge
              value={
                resources.length
              }
              label="Library Resources"
            />

            <StatBadge
              value={
                articles.length +
                resources.length
              }
              label="Knowledge Items"
            />
          </div>
        </div>
      </section>

      {/* ARTICLES */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Latest Knowledge"
            title={`${category.name} Articles`}
            description={`Explore published PetroHub articles and technical knowledge from the ${category.name} discipline.`}
            href="/articles"
            linkLabel="Browse All Articles"
          />

          {articles.length ===
          0 ? (
            <EmptyState
              title="No published articles yet"
              description={`New ${category.name} articles will appear here when they are published.`}
            />
          ) : (
            <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(
                (
                  article
                ) => (
                  <ArticleCard
                    key={
                      article._id
                    }
                    article={
                      article
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* LIBRARY RESOURCES */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Engineering Library"
            title={`${category.name} Resources`}
            description={`Books, manuals, standards, notes and professional references related to ${category.name}.`}
            href="/library"
            linkLabel="Browse Full Library"
          />

          {resources.length ===
          0 ? (
            <EmptyState
              title="No library resources yet"
              description={`Published ${category.name} library resources will appear here automatically.`}
            />
          ) : (
            <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {resources.map(
                (
                  resource
                ) => (
                  <ResourceCard
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
          )}
        </div>
      </section>

      {/* OTHER CATEGORIES */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            More Disciplines
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Explore Other Categories
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {ENGINEERING_CATEGORIES
              .filter(
                (
                  item
                ) =>
                  item.slug !==
                  category.slug
              )
              .map(
                (
                  item
                ) => (
                  <Link
                    key={
                      item.slug
                    }
                    href={`/categories/${item.slug}`}
                    className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-orange-500/50"
                  >
                    <p className="font-bold transition group-hover:text-orange-400">
                      {
                        item.name
                      }
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {
                        item.description
                      }
                    </p>
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

/* =========================================================
   SECTION HEADER
========================================================= */

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
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
          {
            eyebrow
          }
        </p>

        <h2 className="mt-3 text-3xl font-bold">
          {title}
        </h2>

        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          {
            description
          }
        </p>
      </div>

      <Link
        href={
          href
        }
        className="text-sm font-semibold text-orange-400 hover:text-orange-300"
      >
        {
          linkLabel
        }
      </Link>
    </div>
  );
}

/* =========================================================
   ARTICLE CARD
========================================================= */

function ArticleCard({
  article,
}: {
  article:
    ArticleData;
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
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
        <Placeholder />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-orange-400">
            {
              article.category
            }
          </span>

          {article.featured && (
            <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400">
              Featured
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-bold leading-7 transition group-hover:text-orange-400">
          {
            article.title
          }
        </h3>

        {article.summary && (
          <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">
            {
              article.summary
            }
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            {(
              article.views ??
              0
            ).toLocaleString()}{" "}
            views
          </span>

          {article.createdAt && (
            <span>
              {formatDate(
                article.createdAt
              )}
            </span>
          )}
        </div>

        <p className="mt-5 text-sm font-semibold text-orange-400">
          Read Article
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   RESOURCE CARD
========================================================= */

function ResourceCard({
  resource,
}: {
  resource:
    LibraryResource;
}) {
  return (
    <Link
      href={`/library/${resource.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
    >
      {resource.coverImage ? (
        <img
          src={
            resource.coverImage
          }
          alt={
            resource.title
          }
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
      ) : (
        <Placeholder />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold capitalize text-orange-400">
            {resource.contentType ||
              "resource"}
          </span>

          {resource.featured && (
            <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400">
              Featured
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-bold leading-7 transition group-hover:text-orange-400">
          {
            resource.title
          }
        </h3>

        {resource.description && (
          <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">
            {
              resource.description
            }
          </p>
        )}

        {resource.author && (
          <p className="mt-4 text-sm text-slate-500">
            By{" "}
            {
              resource.author
            }
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>
            {(
              resource.views ??
              0
            ).toLocaleString()}{" "}
            views
          </span>

          <span>
            {(
              resource.downloads ??
              0
            ).toLocaleString()}{" "}
            downloads
          </span>
        </div>

        <p className="mt-5 text-sm font-semibold text-orange-400">
          Open Resource
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   PLACEHOLDER
========================================================= */

function Placeholder() {
  return (
    <div className="flex aspect-video items-center justify-center bg-slate-800">
      <span className="font-bold text-slate-500">
        PetroHub
      </span>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10">
      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 max-w-2xl leading-7 text-slate-400">
        {
          description
        }
      </p>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatBadge({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-400">
      <strong className="text-white">
        {
          value.toLocaleString()
        }
      </strong>{" "}
      {label}
    </span>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value?: string
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
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