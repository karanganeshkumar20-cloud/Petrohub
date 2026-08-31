import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import BookmarkButton from "@/components/BookmarkButton";
import ReadingHistoryTracker from "@/components/ReadingHistoryTracker";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getArticleBySlug(slug: string) {
  await connectDB();

  const article = await Article.findOne({
    slug,
    status: "Published",
  }).lean();

  if (!article) {
    return null;
  }

  return JSON.parse(JSON.stringify(article));
}

async function getRelatedArticles(
  category: string,
  articleId: string
) {
  await connectDB();

  const relatedArticles = await Article.find({
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

  return JSON.parse(JSON.stringify(relatedArticles));
}

function getCategorySlug(category: string) {
  const categorySlugs: Record<string, string> = {
    HSE: "hse",
    "Oil & Gas": "oil-gas",
    Mechanical: "mechanical",
    Electrical: "electrical",
    Instrumentation: "instrumentation",
    Process: "process",
    Geology: "geology",
  };

  return categorySlugs[category] || "hse";
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(
    article.category,
    article._id
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <ArticleViewTracker articleId={article._id} />
      <ReadingHistoryTracker
  itemType="article"
  itemId={String(article._id)}
/>

      {/* Header */}
      <section className="border-b border-slate-800 px-6 py-14">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
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
              {article.category}
            </Link>

            <span>/</span>

            <span className="text-slate-400">
              {article.title}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
              {article.category}
            </span>

            <span className="text-sm text-slate-500">
              {article.views ?? 0} views
            </span>

            {article.updatedAt && (
              <span className="text-sm text-slate-500">
                Updated{" "}
                {new Date(
                  article.updatedAt
                ).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
            {article.title}
          </h1>

          {/* Summary */}
          {article.summary && (
            <p className="mt-6 text-lg leading-8 text-slate-400">
              {article.summary}
            </p>
          )}

          {/* Author */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span>
              Author: {article.author || "PetroHub Team"}
            </span>

            {article.source && (
              <span>
                Source: {article.source}
              </span>
            )}
          </div>
        </div>
      </section>
      {/* SAVE ARTICLE */}

<div className="mt-8 flex flex-wrap items-center gap-4">
  <BookmarkButton
    itemType="article"
    itemId={String(article._id)}
  />

  <Link
    href="/profile"
    className="text-sm font-semibold text-slate-400 transition hover:text-orange-400"
  >
    View saved items →
  </Link>
</div>

      {/* Cover Image */}
      {article.featuredImage && (
        <section className="px-6 pt-10">
          <div className="mx-auto max-w-5xl">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="aspect-video w-full rounded-2xl border border-slate-800 object-cover shadow-2xl"
            />
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="px-6 py-14">
        <article className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-10">
          <div
            className="
              prose
              prose-invert
              max-w-none

              prose-headings:text-white
              prose-headings:font-bold

              prose-h1:mt-10
              prose-h1:text-4xl

              prose-h2:mt-10
              prose-h2:text-3xl

              prose-h3:mt-8
              prose-h3:text-2xl

              prose-p:text-slate-300
              prose-p:leading-8

              prose-strong:text-white

              prose-a:text-orange-400
              prose-a:no-underline
              hover:prose-a:text-orange-300

              prose-ul:my-6
              prose-ol:my-6
              prose-li:text-slate-300
              prose-li:leading-7

              prose-blockquote:border-orange-500
              prose-blockquote:text-slate-400

              prose-code:text-orange-300

              prose-pre:border
              prose-pre:border-slate-800
              prose-pre:bg-slate-950

              prose-hr:border-slate-800
            "
            dangerouslySetInnerHTML={{
              __html: article.content,
            }}
          />

          {/* Tags */}
          {Array.isArray(article.tags) &&
            article.tags.length > 0 && (
              <div className="mt-12 border-t border-slate-800 pt-6">
                <p className="mb-3 text-sm font-semibold text-slate-400">
                  Tags
                </p>

                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Source & Licensing */}
          {(article.sourceUrl ||
            article.license) && (
            <div className="mt-10 border-t border-slate-800 pt-6">
              <h2 className="text-lg font-bold">
                Source & Licensing
              </h2>

              {article.source && (
                <p className="mt-4 text-sm text-slate-400">
                  Source: {article.source}
                </p>
              )}

              {article.sourceUrl && (
                <p className="mt-2 text-sm text-slate-400">
                  Source URL:{" "}
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-orange-400 hover:text-orange-300"
                  >
                    View original source
                  </a>
                </p>
              )}

              {article.license && (
                <p className="mt-2 text-sm text-slate-400">
                  License: {article.license}
                </p>
              )}
            </div>
          )}
        </article>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
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
                className="hidden text-sm font-semibold text-orange-400 hover:text-orange-300 sm:block"
              >
                View all {article.category} articles →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedArticles.map((item: any) => (
                <Link
                  key={item._id}
                  href={`/articles/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
                >
                  {item.featuredImage && (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="aspect-video w-full object-cover"
                    />
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-orange-400">
                        {item.category}
                      </span>

                      <span className="text-xs text-slate-500">
                        {item.views ?? 0} views
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold leading-7 transition group-hover:text-orange-400">
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                        {item.summary}
                      </p>
                    )}

                    <p className="mt-5 text-sm font-semibold text-orange-400">
                      Read article →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}