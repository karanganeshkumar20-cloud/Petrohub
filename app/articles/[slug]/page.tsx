import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import BookmarkButton from "@/components/BookmarkButton";

import ArticleContent from "@/components/technical/ArticleContent";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

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

/* =========================================================
   GET ARTICLE
========================================================= */

async function getArticle(
  slug: string
): Promise<ArticleData | null> {
  await connectDB();

  const article = await Article.findOne({
    slug,
    status: "Published",
  }).lean();

  if (!article) {
    return null;
  }

  return JSON.parse(
    JSON.stringify(article)
  );
}

/* =========================================================
   RELATED ARTICLES
========================================================= */

async function getRelatedArticles(
  category: string,
  articleId: string
) {
  await connectDB();

  const articles = await Article.find({
    category,
    status: "Published",

    _id: {
      $ne: articleId,
    },
  })
    .sort({
      createdAt: -1,
    })
    .limit(3)
    .lean();

  return JSON.parse(
    JSON.stringify(articles)
  );
}

/* =========================================================
   CATEGORY URL
========================================================= */

function getCategorySlug(
  category: string
) {
  const categories: Record<
    string,
    string
  > = {
    HSE: "hse",

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
    categories[category] ||
    "engineering"
  );
}

/* =========================================================
   CLEAN TEXT FOR SEO
========================================================= */

function cleanText(
  value: string
) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>$]/g, " ")
    .replace(/\\[A-Za-z]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const article =
    await getArticle(slug);

  if (!article) {
    return {
      title:
        "Article Not Found | PetroHub",
    };
  }

  const description =
    cleanText(
      article.summary ||
        article.content ||
        ""
    ).slice(0, 160);

  return {
    title: `${article.title} | PetroHub`,

    description,

    alternates: {
      canonical:
        `/articles/${article.slug}`,
    },

    openGraph: {
      title:
        article.title,

      description,

      type:
        "article",

      images:
        article.featuredImage
          ? [
              {
                url:
                  article.featuredImage,
              },
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
  const { slug } =
    await params;

  const article =
    await getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles =
    await getRelatedArticles(
      article.category,
      article._id
    );

  /* =====================================================
     STRUCTURED DATA
  ===================================================== */

  const structuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      article.title,

    description:
      cleanText(
        article.summary ||
          article.content ||
          ""
      ).slice(0, 160),

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
    },

    datePublished:
      article.createdAt,

    dateModified:
      article.updatedAt ||
      article.createdAt,

    image:
      article.featuredImage ||
      undefined,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* SEO JSON-LD */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      {/* NAVBAR */}

      <Navbar />

      {/* VIEW COUNT */}

      <ArticleViewTracker
        articleId={
          article._id
        }
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-slate-800 px-5 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>/</span>

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

            <span>/</span>

            <span className="text-slate-300">
              {
                article.title
              }
            </span>
          </div>

          {/* Meta */}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
              {
                article.category
              }
            </span>

            <span className="text-sm text-slate-400">
              {article.views ??
                0}{" "}
              views
            </span>

            {article.updatedAt && (
              <span className="text-sm text-slate-400">
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

          {/* Title */}

          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
            {
              article.title
            }
          </h1>

          {/* Summary */}

          {article.summary && (
            <p className="mt-6 text-lg leading-8 text-slate-300">
              {
                article.summary
              }
            </p>
          )}

          {/* Author */}

          <div className="mt-7 flex flex-wrap gap-4 text-sm text-slate-400">
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

          {/* Save */}

          <div className="mt-7">
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
          ARTICLE CONTENT
      ================================================= */}

      <section className="px-4 py-12 sm:px-6">
        <article
          className="
            mx-auto
            min-w-0
            max-w-4xl
            overflow-hidden
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-5
            sm:p-8
            md:p-10
          "
        >
          {/* IMPORTANT

              No dangerouslySetInnerHTML here.

              Existing HTML:
              ArticleContent handles it.

              AI Markdown:
              ArticleContent sends it to
              TechnicalMarkdown.

              Formula:
              remark-math + KaTeX renders it.
          */}

          <ArticleContent
            content={
              article.content ||
              ""
            }
          />

          {/* =================================================
              TAGS
          ================================================= */}

          {Array.isArray(
            article.tags
          ) &&
            article.tags.length >
              0 && (
              <div className="mt-12 border-t border-slate-800 pt-6">
                <p className="mb-4 text-sm font-semibold text-slate-400">
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
                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-300"
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

          {/* =================================================
              SOURCE / LICENSE
          ================================================= */}

          {(article.source ||
            article.license) && (
            <div className="mt-10 border-t border-slate-800 pt-6">
              <h2 className="text-lg font-bold">
                Article Information
              </h2>

              {article.source && (
                <p className="mt-4 text-sm text-slate-400">
                  Source:{" "}
                  {
                    article.source
                  }
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

          {/* =================================================
              SAVE ARTICLE
          ================================================= */}

          <div className="mt-10 border-t border-slate-800 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <h3 className="font-bold">
                  Save this article
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Keep it in your
                  PetroHub saved
                  resources.
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
        <section className="border-t border-slate-800 px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="font-semibold uppercase tracking-widest text-orange-400">
              Keep Learning
            </p>

            <div className="mt-3 flex items-center justify-between gap-5">
              <h2 className="text-3xl font-bold">
                Related Articles
              </h2>

              <Link
                href={`/categories/${getCategorySlug(
                  article.category
                )}`}
                className="hidden text-sm font-semibold text-orange-400 hover:text-orange-300 sm:block"
              >
                View all →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedArticles.map(
                (
                  item: any
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