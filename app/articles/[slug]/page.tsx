import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  cache,
} from "react";

import Navbar from "@/components/Navbar";

import Footer from "@/components/Footer";

import ArticleViewTracker from "@/components/ArticleViewTracker";

import BookmarkButton from "@/components/BookmarkButton";

import {
  connectDB,
} from "@/lib/mongodb";

import Article from "@/models/Article";

/* =========================================================
   NEXT CONFIG
========================================================= */

export const dynamic =
  "force-dynamic";

/* =========================================================
   SITE URL
========================================================= */

const SITE_URL =
  (
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(
    /\/+$/,
    ""
  );

/* =========================================================
   TYPES
========================================================= */

type ArticlePageProps = {
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

  status?: string;

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
};

/* =========================================================
   TEXT HELPERS
========================================================= */

function cleanText(
  value:
    string
) {
  return value
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /&lt;/gi,
      "<"
    )
    .replace(
      /&gt;/gi,
      ">"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/* =========================================================
   SEO DESCRIPTION
========================================================= */

function createDescription(
  article:
    ArticleData
) {
  const source =
    cleanText(
      article.summary ||
        article.content ||
        ""
    );

  if (
    source.length <=
    160
  ) {
    return (
      source ||
      `Read ${article.title} on PetroHub, the engineering knowledge platform for Oil & Gas, HSE and multidisciplinary engineering professionals.`
    );
  }

  const shortened =
    source.slice(
      0,
      157
    );

  const lastSpace =
    shortened.lastIndexOf(
      " "
    );

  const ending =
    lastSpace >
    120
      ? shortened.slice(
          0,
          lastSpace
        )
      : shortened;

  return `${ending}...`;
}

/* =========================================================
   GET ARTICLE

   React cache prevents unnecessary
   repeated database reads when both
   generateMetadata() and the page
   request the same article.
========================================================= */

const getArticleBySlug =
  cache(
    async (
      slug:
        string
    ): Promise<
      ArticleData |
      null
    > => {
      await connectDB();

      const article =
        await Article.findOne({
          slug,

          status:
            "Published",
        }).lean();

      if (
        !article
      ) {
        return null;
      }

      return JSON.parse(
        JSON.stringify(
          article
        )
      ) as ArticleData;
    }
  );

/* =========================================================
   RELATED ARTICLES
========================================================= */

async function getRelatedArticles(
  category:
    string,

  articleId:
    string
): Promise<
  RelatedArticleData[]
> {
  await connectDB();

  const relatedArticles =
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
        [
          "_id",
          "title",
          "slug",
          "summary",
          "category",
          "featuredImage",
          "views",
        ].join(
          " "
        )
      )
      .sort({
        createdAt:
          -1,
      })
      .limit(
        3
      )
      .lean();

  return JSON.parse(
    JSON.stringify(
      relatedArticles
    )
  ) as RelatedArticleData[];
}

/* =========================================================
   CATEGORY SLUG
========================================================= */

function getCategorySlug(
  category:
    string
) {
  const categorySlugs:
    Record<
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

      Geology:
        "geology",

      Civil:
        "civil",

      Engineering:
        "engineering",
    };

  return (
    categorySlugs[
      category
    ] ||
    "engineering"
  );
}

/* =========================================================
   DYNAMIC ARTICLE METADATA
========================================================= */

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const article =
    await getArticleBySlug(
      slug
    );

  /* =====================================================
     ARTICLE NOT FOUND
  ===================================================== */

  if (
    !article
  ) {
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

  /* =====================================================
     ARTICLE SEO
  ===================================================== */

  const description =
    createDescription(
      article
    );

  const canonicalUrl =
    `${SITE_URL}/articles/${article.slug}`;

  const tags =
    Array.isArray(
      article.tags
    )
      ? article.tags
      : [];

  const keywords =
    Array.from(
      new Set([
        article.category,

        ...tags,

        "PetroHub",

        "Engineering",

        "Engineering Articles",

        article.category ===
        "HSE"
          ? "Health and Safety"
          : "",

        article.category ===
        "Oil & Gas"
          ? "Oil and Gas Engineering"
          : "",
      ])
    ).filter(
      Boolean
    );

  return {
    /* ===================================================
       TITLE

       Root layout automatically adds:
       | PetroHub
    =================================================== */

    title:
      article.title,

    /* ===================================================
       DESCRIPTION
    =================================================== */

    description,

    /* ===================================================
       KEYWORDS
    =================================================== */

    keywords,

    /* ===================================================
       AUTHORS
    =================================================== */

    authors: [
      {
        name:
          article.author ||
          "PetroHub Team",
      },
    ],

    creator:
      article.author ||
      "PetroHub Team",

    publisher:
      "PetroHub",

    category:
      article.category,

    /* ===================================================
       CANONICAL URL
    =================================================== */

    alternates: {
      canonical:
        canonicalUrl,
    },

    /* ===================================================
       OPEN GRAPH
    =================================================== */

    openGraph: {
      type:
        "article",

      locale:
        "en_US",

      url:
        canonicalUrl,

      siteName:
        "PetroHub",

      title:
        article.title,

      description,

      authors: [
        article.author ||
          "PetroHub Team",
      ],

      section:
        article.category,

      tags,

      ...(article.createdAt
        ? {
            publishedTime:
              article.createdAt,
          }
        : {}),

      ...(article.updatedAt
        ? {
            modifiedTime:
              article.updatedAt,
          }
        : {}),

      ...(article.featuredImage
        ? {
            images: [
              {
                url:
                  article.featuredImage,

                alt:
                  article.title,
              },
            ],
          }
        : {}),
    },

    /* ===================================================
       TWITTER / SOCIAL SHARE
    =================================================== */

    twitter: {
      card:
        article.featuredImage
          ? "summary_large_image"
          : "summary",

      title:
        article.title,

      description,

      ...(article.featuredImage
        ? {
            images: [
              article.featuredImage,
            ],
          }
        : {}),
    },

    /* ===================================================
       SEARCH ENGINE RULES
    =================================================== */

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

        "max-snippet":
          -1,

        "max-image-preview":
          "large",

        "max-video-preview":
          -1,
      },
    },
  };
}

/* =========================================================
   STRUCTURED DATA
========================================================= */

function createStructuredData(
  article:
    ArticleData
) {
  const canonicalUrl =
    `${SITE_URL}/articles/${article.slug}`;

  const categoryUrl =
    `${SITE_URL}/categories/${getCategorySlug(
      article.category
    )}`;

  const description =
    createDescription(
      article
    );

  return {
    "@context":
      "https://schema.org",

    "@graph": [
      /* =================================================
         ARTICLE
      ================================================= */

      {
        "@type":
          "Article",

        "@id":
          `${canonicalUrl}#article`,

        headline:
          article.title,

        description,

        url:
          canonicalUrl,

        mainEntityOfPage: {
          "@type":
            "WebPage",

          "@id":
            canonicalUrl,
        },

        ...(article.featuredImage
          ? {
              image: [
                article.featuredImage,
              ],
            }
          : {}),

        ...(article.createdAt
          ? {
              datePublished:
                article.createdAt,
            }
          : {}),

        ...(article.updatedAt
          ? {
              dateModified:
                article.updatedAt,
            }
          : {}),

        author: {
          "@type":
            "Organization",

          name:
            article.author ||
            "PetroHub Team",
        },

        publisher: {
          "@type":
            "Organization",

          name:
            "PetroHub",

          url:
            SITE_URL,
        },

        articleSection:
          article.category,

        ...(Array.isArray(
          article.tags
        ) &&
        article.tags.length >
          0
          ? {
              keywords:
                article.tags.join(
                  ", "
                ),
            }
          : {}),

        isAccessibleForFree:
          true,

        inLanguage:
          "en",
      },

      /* =================================================
         BREADCRUMBS
      ================================================= */

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${canonicalUrl}#breadcrumb`,

        itemListElement: [
          {
            "@type":
              "ListItem",

            position:
              1,

            name:
              "Home",

            item:
              SITE_URL,
          },

          {
            "@type":
              "ListItem",

            position:
              2,

            name:
              article.category,

            item:
              categoryUrl,
          },

          {
            "@type":
              "ListItem",

            position:
              3,

            name:
              article.title,

            item:
              canonicalUrl,
          },
        ],
      },
    ],
  };
}

/* =========================================================
   ARTICLE PAGE
========================================================= */

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const {
    slug,
  } =
    await params;

  const article =
    await getArticleBySlug(
      slug
    );

  if (
    !article
  ) {
    notFound();
  }

  const relatedArticles =
    await getRelatedArticles(
      article.category,
      article._id
    );

  const structuredData =
    createStructuredData(
      article
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* =================================================
          STRUCTURED DATA
      ================================================= */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          VIEW TRACKING
      ================================================= */}

      <ArticleViewTracker
        articleId={
          article._id
        }
      />

      {/* =================================================
          ARTICLE HEADER
      ================================================= */}

      <section className="border-b border-slate-800 px-6 py-14">
        <div className="mx-auto max-w-4xl">
          {/* =============================================
              BREADCRUMB
          ============================================= */}

          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
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
              href={`/categories/${getCategorySlug(
                article.category
              )}`}
              className="transition hover:text-orange-400"
            >
              {
                article.category
              }
            </Link>

            <span>
              /
            </span>

            <span className="text-slate-400">
              {
                article.title
              }
            </span>
          </div>

          {/* =============================================
              META
          ============================================= */}

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
              {
                article.category
              }
            </span>

            <span className="text-sm text-slate-500">
              {
                article.views ??
                0
              }{" "}
              views
            </span>

            {article.updatedAt && (
              <span className="text-sm text-slate-500">
                Updated{" "}
                {new Date(
                  article.updatedAt
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day:
                      "2-digit",

                    month:
                      "short",

                    year:
                      "numeric",
                  }
                )}
              </span>
            )}
          </div>

          {/* =============================================
              TITLE
          ============================================= */}

          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
            {
              article.title
            }
          </h1>

          {/* =============================================
              SUMMARY
          ============================================= */}

          {article.summary && (
            <p className="mt-6 text-lg leading-8 text-slate-400">
              {
                article.summary
              }
            </p>
          )}

          {/* =============================================
              AUTHOR
          ============================================= */}

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span>
              Author:{" "}
              {article.author ||
                "PetroHub Team"}
            </span>

            {article.source && (
              <span>
                Source:{" "}
                {
                  article.source
                }
              </span>
            )}
          </div>

          {/* =============================================
              SAVE
          ============================================= */}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <BookmarkButton
              itemType="article"
              itemId={
                article._id
              }
            />

            <Link
              href="/profile"
              className="text-sm font-semibold text-slate-400 transition hover:text-orange-400"
            >
              View saved items →
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          FEATURED IMAGE
      ================================================= */}

      {article.featuredImage && (
        <section className="px-6 pt-10">
          <div className="mx-auto max-w-5xl">
            <img
              src={
                article.featuredImage
              }
              alt={
                article.title
              }
              className="aspect-video w-full rounded-2xl border border-slate-800 object-cover shadow-2xl"
            />
          </div>
        </section>
      )}

      {/* =================================================
          ARTICLE CONTENT
      ================================================= */}

      <section className="px-6 py-14">
        <article className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-10">
          <div
            className="
              prose
              prose-invert
              max-w-none

              prose-headings:font-bold
              prose-headings:text-white

              prose-h1:mt-10
              prose-h1:text-4xl

              prose-h2:mt-10
              prose-h2:text-3xl

              prose-h3:mt-8
              prose-h3:text-2xl

              prose-p:leading-8
              prose-p:text-slate-300

              prose-strong:text-white

              prose-a:text-orange-400
              prose-a:no-underline
              hover:prose-a:text-orange-300

              prose-ul:my-6
              prose-ol:my-6

              prose-li:leading-7
              prose-li:text-slate-300

              prose-blockquote:border-orange-500
              prose-blockquote:text-slate-400

              prose-code:text-orange-300

              prose-pre:border
              prose-pre:border-slate-800
              prose-pre:bg-slate-950

              prose-hr:border-slate-800
            "
            dangerouslySetInnerHTML={{
              __html:
                article.content,
            }}
          />

          {/* =============================================
              TAGS
          ============================================= */}

          {Array.isArray(
            article.tags
          ) &&
            article.tags.length >
              0 && (
              <div className="mt-12 border-t border-slate-800 pt-6">
                <p className="mb-3 text-sm font-semibold text-slate-400">
                  Tags
                </p>

                <div className="flex flex-wrap gap-2">
                  {article.tags.map(
                    (
                      tag
                    ) => (
                      <span
                        key={
                          tag
                        }
                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-300"
                      >
                        {
                          tag
                        }
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

          {/* =============================================
              SOURCE & LICENSING
          ============================================= */}

          {(article.sourceUrl ||
            article.license) && (
            <div className="mt-10 border-t border-slate-800 pt-6">
              <h2 className="text-lg font-bold">
                Source &
                Licensing
              </h2>

              {article.source && (
                <p className="mt-4 text-sm text-slate-400">
                  Source:{" "}
                  {
                    article.source
                  }
                </p>
              )}

              {article.sourceUrl && (
                <p className="mt-2 text-sm text-slate-400">
                  Source URL:{" "}
                  <a
                    href={
                      article.sourceUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-orange-400 transition hover:text-orange-300"
                  >
                    View original
                    source
                  </a>
                </p>
              )}

              {article.license && (
                <p className="mt-2 text-sm text-slate-400">
                  License:{" "}
                  {
                    article.license
                  }
                </p>
              )}
            </div>
          )}

          {/* =============================================
              BOTTOM SAVE
          ============================================= */}

          <div className="mt-10 border-t border-slate-800 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold">
                  Save this article
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add this article
                  to your PetroHub
                  saved collection.
                </p>
              </div>

              <BookmarkButton
                itemType="article"
                itemId={
                  article._id
                }
              />
            </div>
          </div>
        </article>
      </section>

      {/* =================================================
          RELATED ARTICLES
      ================================================= */}

      {relatedArticles.length >
        0 && (
        <section className="border-t border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="font-semibold uppercase tracking-widest text-orange-500">
              Keep Learning
            </p>

            <div className="mt-3 flex items-end justify-between gap-6">
              <h2 className="text-3xl font-bold">
                Related Articles
              </h2>

              <Link
                href={`/categories/${getCategorySlug(
                  article.category
                )}`}
                className="hidden text-sm font-semibold text-orange-400 transition hover:text-orange-300 sm:block"
              >
                View all{" "}
                {
                  article.category
                }{" "}
                articles →
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
                    className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
                  >
                    {item.featuredImage && (
                      <img
                        src={
                          item.featuredImage
                        }
                        alt={
                          item.title
                        }
                        className="aspect-video w-full object-cover"
                      />
                    )}

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-orange-400">
                          {
                            item.category
                          }
                        </span>

                        <span className="text-xs text-slate-500">
                          {
                            item.views ??
                            0
                          }{" "}
                          views
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold leading-7 transition group-hover:text-orange-400">
                        {
                          item.title
                        }
                      </h3>

                      {item.summary && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                          {
                            item.summary
                          }
                        </p>
                      )}

                      <p className="mt-5 text-sm font-semibold text-orange-400">
                        Read article →
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