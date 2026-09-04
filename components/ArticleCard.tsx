import Image from "next/image";
import Link from "next/link";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

/* =========================================================
   TYPES
========================================================= */

type ArticleCardData = {
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

/* =========================================================
   GET ARTICLE
========================================================= */

async function getArticle(
  articleId: string
): Promise<ArticleCardData | null> {
  try {
    await connectDB();

    const document = await Article.findOne({
      _id: articleId,
      status: "Published",
    })
      .select(
        "title slug summary category featuredImage featured views author createdAt"
      )
      .lean();

    if (!document) {
      return null;
    }

    return JSON.parse(
      JSON.stringify(document)
    ) as ArticleCardData;
  } catch (error) {
    console.error(
      "ArticleCard fetch error:",
      error
    );

    return null;
  }
}

/* =========================================================
   ARTICLE CARD
========================================================= */

export default async function ArticleCard({
  articleId,
}: {
  articleId: string;
}) {
  const article =
    await getArticle(articleId);

  if (!article) {
    return null;
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
    >
      {/* IMAGE */}

      <div className="relative aspect-[16/9] overflow-hidden bg-slate-800">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            width={800}
            height={450}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800">
            <span className="text-xl font-extrabold text-slate-600">
              PetroHub
            </span>
          </div>
        )}

        {/* FEATURED BADGE */}

        {article.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
            ★ Featured
          </span>
        )}
      </div>

      {/* CONTENT */}

      <div className="flex flex-1 flex-col p-6">
        {/* CATEGORY + VIEWS */}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-orange-400">
            {article.category}
          </span>

          <span className="text-xs text-slate-500">
            {article.views ?? 0} views
          </span>
        </div>

        {/* TITLE */}

        <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-7 text-white transition group-hover:text-orange-400">
          {article.title}
        </h3>

        {/* SUMMARY */}

        {article.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
            {article.summary}
          </p>
        )}

        {/* FOOTER */}

        <div className="mt-auto pt-6">
          <div className="border-t border-slate-800 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {article.author && (
                  <span>
                    {article.author}
                  </span>
                )}

                {article.author &&
                  article.createdAt && (
                    <span>
                      {" "}•{" "}
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

              <span className="text-sm font-semibold text-orange-400">
                Read article →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value: string
) {
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
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}