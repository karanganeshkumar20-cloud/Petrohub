import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import BookmarkButton from "@/components/BookmarkButton";
import ArticleContent from "@/components/technical/ArticleContent";

import {
  connectDB,
} from "@/lib/mongodb";

import Article from "@/models/Article";

export const dynamic =
  "force-dynamic";

const PRODUCTION_URL =
  "https://petrohub-dlor.vercel.app";

/* =========================================================
   TYPES
========================================================= */

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ArticleData = {
  _id: string;

  title: string;
  slug: string;

  summary?: string;
  content: string;

  category: string;
  tags?: string[];

  featuredImage?: string;

  source?: string;
  sourceUrl?: string;
  license?: string;
  author?: string;

  views?: number;

  createdAt?: string;
  updatedAt?: string;
};

type RelatedArticleData = {
  _id: string;

  title: string;
  slug: string;

  summary?: string;
  category: string;

  featuredImage?: string;

  views?: number;

  createdAt?: string;
};

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
   GET ARTICLE
========================================================= */

async function getArticle(
  slug: string
): Promise<
  ArticleData | null
> {
  try {
    await connectDB();

    const article =
      await Article.findOne({
        slug,
        status:
          "Published",
      })
        .select(
          "_id title slug summary content category tags featuredImage source sourceUrl license author views createdAt updatedAt"
        )
        .lean();

    if (!article) {
      return null;
    }

    return JSON.parse(
      JSON.stringify(
        article
      )
    ) as ArticleData;
  } catch (error) {
    console.error(
      "Article page fetch error:",
      error
    );

    return null;
  }
}

/* =========================================================
   RELATED ARTICLES
========================================================= */

async function getRelatedArticles(
  category: string,
  articleId: string
): Promise<
  RelatedArticleData[]
> {
  try {
    await connectDB();

    const documents =
      await Article.find({
        category,

        status:
          "Published",

        _id: {
          $ne:
            articleId,
        },
      })
        .select(
          "_id title slug summary category featuredImage views createdAt"
        )
        .sort({
          featured:
            -1,

          createdAt:
            -1,
        })
        .limit(3)
        .lean();

    return JSON.parse(
      JSON.stringify(
        documents
      )
    ) as RelatedArticleData[];
  } catch (error) {
    console.error(
      "Related article fetch error:",
      error
    );

    return [];
  }
}

/* =========================================================
   CATEGORY SLUG
========================================================= */

function getCategorySlug(
  category: string
) {
  const mapping: Record<
    string,
    string
  > = {
    HSE:
      "hse",

    "Oil & Gas":
      "oil-gas",

    Mechanical:
      "mechanical",

    Civil:
      "civil",

    Electrical:
      "electrical",

    Instrumentation:
      "instrumentation",

    Process:
      "process",

    Geology:
      "geology",

    Engineering:
      "engineering",
  };

  return (
    mapping[
      category
    ] ||
    category
      .toLowerCase()
      .trim()
      .replace(
        /&/g,
        "and"
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      ) ||
    "engineering"
  );
}

/* =========================================================
   CLEAN SEO TEXT
========================================================= */

function cleanText(
  value: string
) {
  return value
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /[#*_`>$]/g,
      " "
    )
    .replace(
      /\\[A-Za-z]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/* =========================================================
   DESCRIPTION
========================================================= */

function getDescription(
  article: ArticleData
) {
  const description =
    cleanText(
      article.summary ||
        article.content ||
        ""
    ).slice(
      0,
      160
    );

  return (
    description ||
    `Explore this ${article.category} engineering article on PetroHub.`
  );
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const article =
    await getArticle(
      slug
    );

  if (!article) {
    return {
      title:
        "Article Not Found",

      description:
        "The requested PetroHub engineering article could not be found.",

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

  const articleUrl =
    `${siteUrl}/articles/${article.slug}`;

  const description =
    getDescription(
      article
    );

  const author =
    article.author ||
    "PetroHub Team";

  return {
    /*
     * Root layout adds:
     * "%s | PetroHub"
     */
    title:
      article.title,

    description,

    keywords: [
      article.category,
      ...(article.tags ||
        []),
      "Engineering",
      "PetroHub",
    ],

    authors: [
      {
        name:
          author,
      },
    ],

    alternates: {
      canonical:
        articleUrl,
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
      },
    },

    openGraph: {
      type:
        "article",

      url:
        articleUrl,

      siteName:
        "PetroHub",

      title:
        article.title,

      description,

      publishedTime:
        article.createdAt,

      modifiedTime:
        article.updatedAt,

      authors: [
        author,
      ],

      section:
        article.category,

      tags:
        article.tags,

      images:
        article.featuredImage
          ? [
              {
                url:
                  article.featuredImage,

                alt:
                  article.title,
              },
            ]
          : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        article.title,

      description,

      images:
        article.featuredImage
          ? [
              article.featuredImage,
            ]
          : undefined,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function ArticlePage({
  params,
}: PageProps) {
  const {
    slug,
  } = await params;

  const article =
    await getArticle(
      slug
    );

  if (!article) {
    notFound();
  }

  const relatedArticles =
    await getRelatedArticles(
      article.category,
      article._id
    );

  const siteUrl =
    getSiteUrl();

  const articleUrl =
    `${siteUrl}/articles/${article.slug}`;

  const categoryUrl =
    `${siteUrl}/categories/${getCategorySlug(
      article.category
    )}`;

  const description =
    getDescription(
      article
    );

  const authorName =
    article.author ||
    "PetroHub Team";

  const authorType =
    authorName ===
    "PetroHub Team"
      ? "Organization"
      : "Person";

  /* =====================================================
     STRUCTURED DATA
  ===================================================== */

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "Article",

        "@id":
          `${articleUrl}#article`,

        mainEntityOfPage: {
          "@type":
            "WebPage",

          "@id":
            articleUrl,
        },

        url:
          articleUrl,

        headline:
          article.title,

        description,

        articleSection:
          article.category,

        keywords:
          article.tags?.join(
            ", "
          ),

        author: {
          "@type":
            authorType,

          name:
            authorName,
        },

        publisher: {
          "@type":
            "Organization",

          name:
            "PetroHub",

          url:
            siteUrl,
        },

        datePublished:
          article.createdAt,

        dateModified:
          article.updatedAt ||
          article.createdAt,

        image:
          article.featuredImage ||
          undefined,
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${articleUrl}#breadcrumb`,

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
              "Articles",

            item:
              `${siteUrl}/articles`,
          },

          {
            "@type":
              "ListItem",

            position:
              3,

            name:
              article.category,

            item:
              categoryUrl,
          },

          {
            "@type":
              "ListItem",

            position:
              4,

            name:
              article.title,

            item:
              articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      <Navbar />

      {/* VIEW TRACKER */}

      <ArticleViewTracker
        articleId={
          article._id
        }
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="relative overflow-hidden border-b border-slate-800 px-5 py-14 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.07] via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl">
          {/* BREADCRUMB */}

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
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
              href="/articles"
              className="transition hover:text-orange-400"
            >
              Articles
            </Link>

            <span>
              /
            </span>

            <Link
              href={`/categories/${getCategorySlug(
                article.category
              )}`}
              className="transition hover:text-orange-400"
            >
              {
                article.category
              }
            </Link>
          </div>

          {/* META */}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/categories/${getCategorySlug(
                article.category
              )}`}
              className="rounded-full bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/20"
            >
              {
                article.category
              }
            </Link>

            <span className="text-sm text-slate-400">
              {(
                article.views ??
                0
              ).toLocaleString()}{" "}
              views
            </span>

            {article.createdAt && (
              <span className="text-sm text-slate-400">
                Published{" "}
                {formatDate(
                  article.createdAt
                )}
              </span>
            )}

            {article.updatedAt &&
              hasMeaningfulUpdate(
                article.createdAt,
                article.updatedAt
              ) && (
                <span className="text-sm text-slate-400">
                  Updated{" "}
                  {formatDate(
                    article.updatedAt
                  )}
                </span>
              )}
          </div>

          {/* TITLE */}

          <h1 className="mt-7 text-4xl font-black leading-tight md:text-6xl">
            {
              article.title
            }
          </h1>

          {/* SUMMARY */}

          {article.summary && (
            <p className="mt-7 text-lg leading-8 text-slate-300">
              {
                article.summary
              }
            </p>
          )}

          {/* AUTHOR */}

          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>
              By{" "}
              <span className="font-semibold text-slate-200">
                {
                  authorName
                }
              </span>
            </span>

            {article.source && (
              <>
                <span className="text-slate-700">
                  |
                </span>

                <span>
                  Source:{" "}
                  {
                    article.source
                  }
                </span>
              </>
            )}
          </div>

          {/* BOOKMARK */}

          <div className="mt-8">
            <BookmarkButton
              itemType="article"
              itemId={
                article._id
              }
            />
          </div>
        </div>
      </section>

      {/* =================================================
          COVER IMAGE
      ================================================= */}

      {article.featuredImage && (
        <section className="px-5 pt-10 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <img
              src={
                article.featuredImage
              }
              alt={
                article.title
              }
              className="aspect-video w-full rounded-2xl border border-slate-800 object-cover"
            />
          </div>
        </section>
      )}

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="px-4 py-12 sm:px-6">
        <article className="mx-auto min-w-0 max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8 md:p-10">
          <ArticleContent
            content={
              article.content ||
              ""
            }
          />

          {/* TAGS */}

          {Array.isArray(
            article.tags
          ) &&
            article.tags.length >
              0 && (
              <section className="mt-12 border-t border-slate-800 pt-7">
                <h2 className="text-lg font-bold">
                  Topics
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map(
                    (
                      tag
                    ) => (
                      <span
                        key={
                          tag
                        }
                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-300"
                      >
                        {
                          tag
                        }
                      </span>
                    )
                  )}
                </div>
              </section>
            )}

          {/* ARTICLE INFORMATION */}

          {(article.source ||
            article.sourceUrl ||
            article.license ||
            article.updatedAt) && (
            <section className="mt-10 border-t border-slate-800 pt-7">
              <h2 className="text-xl font-bold">
                Article Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {article.source && (
                  <InfoItem
                    label="Source"
                    value={
                      article.source
                    }
                  />
                )}

                {article.license && (
                  <InfoItem
                    label="License / Rights"
                    value={
                      article.license
                    }
                  />
                )}

                {article.createdAt && (
                  <InfoItem
                    label="Published"
                    value={formatDate(
                      article.createdAt
                    )}
                  />
                )}

                {article.updatedAt && (
                  <InfoItem
                    label="Last Updated"
                    value={formatDate(
                      article.updatedAt
                    )}
                  />
                )}
              </div>

              {article.sourceUrl && (
                <a
                  href={
                    article.sourceUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-bold text-orange-400 transition hover:border-orange-500 hover:text-orange-300"
                >
                  Visit Source
                </a>
              )}
            </section>
          )}

          {/* BOTTOM NAVIGATION */}

          <section className="mt-10 border-t border-slate-800 pt-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold">
                  Continue exploring
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Discover more
                  engineering knowledge
                  on PetroHub.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/articles"
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  All Articles
                </Link>

                <Link
                  href={`/categories/${getCategorySlug(
                    article.category
                  )}`}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
                >
                  More in{" "}
                  {
                    article.category
                  }
                </Link>
              </div>
            </div>
          </section>
        </article>
      </section>

      {/* =================================================
          RELATED ARTICLES
      ================================================= */}

      {relatedArticles.length >
        0 && (
        <section className="border-t border-slate-800 px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Keep Learning
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Related Articles
                </h2>
              </div>

              <Link
                href={`/categories/${getCategorySlug(
                  article.category
                )}`}
                className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
              >
                View Category
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedArticles.map(
                (
                  item
                ) => (
                  <Link
                    key={
                      item._id
                    }
                    href={`/articles/${item.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
                  >
                    {item.featuredImage ? (
                      <img
                        src={
                          item.featuredImage
                        }
                        alt={
                          item.title
                        }
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-slate-800 font-bold text-slate-500">
                        PetroHub
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-sm font-semibold text-orange-400">
                        {
                          item.category
                        }
                      </span>

                      <h3 className="mt-3 text-lg font-bold leading-7 transition group-hover:text-orange-400">
                        {
                          item.title
                        }
                      </h3>

                      {item.summary && (
                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">
                          {
                            item.summary
                          }
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <span>
                          {(
                            item.views ??
                            0
                          ).toLocaleString()}{" "}
                          views
                        </span>

                        {item.createdAt && (
                          <span>
                            {formatDate(
                              item.createdAt
                            )}
                          </span>
                        )}
                      </div>

                      <p className="mt-5 text-sm font-semibold text-orange-400">
                        Read article
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

/* =========================================================
   INFORMATION ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 break-words text-sm text-slate-300">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
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

/* =========================================================
   UPDATED CHECK
========================================================= */

function hasMeaningfulUpdate(
  createdAt?: string,
  updatedAt?: string
) {
  if (
    !createdAt ||
    !updatedAt
  ) {
    return false;
  }

  const created =
    new Date(
      createdAt
    );

  const updated =
    new Date(
      updatedAt
    );

  if (
    Number.isNaN(
      created.getTime()
    ) ||
    Number.isNaN(
      updated.getTime()
    )
  ) {
    return false;
  }

  return (
    updated.getTime() -
      created.getTime() >
    60 * 1000
  );
}