import type { MetadataRoute } from "next";

import { connectDB } from "@/lib/mongodb";

import Article from "@/models/Article";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type SitemapDocument = {
  slug: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
   DATE
========================================================= */

function getValidDate(
  value?: Date | string
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  return date;
}

/* =========================================================
   SITEMAP
========================================================= */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    getSiteUrl();

  /* =====================================================
     STATIC PUBLIC PAGES
  ===================================================== */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url:
        siteUrl,

      changeFrequency:
        "daily",

      priority:
        1,
    },

    {
      url:
        `${siteUrl}/articles`,

      changeFrequency:
        "daily",

      priority:
        0.9,
    },

    {
      url:
        `${siteUrl}/library`,

      changeFrequency:
        "daily",

      priority:
        0.9,
    },

    {
      url:
        `${siteUrl}/categories`,

      changeFrequency:
        "weekly",

      priority:
        0.8,
    },

    {
      url:
        `${siteUrl}/about`,

      changeFrequency:
        "monthly",

      priority:
        0.6,
    },

    {
      url:
        `${siteUrl}/contact`,

      changeFrequency:
        "monthly",

      priority:
        0.5,
    },
  ];

  /* =====================================================
     CATEGORY PAGES
  ===================================================== */

  const categorySlugs = [
    "hse",
    "oil-gas",
    "mechanical",
    "electrical",
    "instrumentation",
    "process",
    "civil",
    "geology",
  ];

  const categoryPages: MetadataRoute.Sitemap =
    categorySlugs.map(
      (
        slug
      ) => ({
        url:
          `${siteUrl}/categories/${slug}`,

        changeFrequency:
          "weekly",

        priority:
          0.8,
      })
    );

  /* =====================================================
     DYNAMIC CONTENT
  ===================================================== */

  let articlePages: MetadataRoute.Sitemap =
    [];

  let libraryPages: MetadataRoute.Sitemap =
    [];

  try {
    await connectDB();

    const [
      articleDocuments,
      bookDocuments,
    ] = await Promise.all([
      Article.find({
        status:
          "Published",
      })
        .select(
          "slug createdAt updatedAt"
        )
        .lean(),

      BookModel.find({
        status:
          "Published",
      })
        .select(
          "slug createdAt updatedAt"
        )
        .lean(),
    ]);

    const articles =
      articleDocuments as unknown as SitemapDocument[];

    const books =
      bookDocuments as unknown as SitemapDocument[];

    /* ===================================================
       ARTICLES
    =================================================== */

    articlePages =
      articles
        .filter(
          (
            article
          ) =>
            Boolean(
              article.slug
            )
        )
        .map(
          (
            article
          ) => {
            const lastModified =
              getValidDate(
                article.updatedAt ||
                  article.createdAt
              );

            return {
              url:
                `${siteUrl}/articles/${article.slug}`,

              ...(lastModified
                ? {
                    lastModified,
                  }
                : {}),

              changeFrequency:
                "monthly" as const,

              priority:
                0.8,
            };
          }
        );

    /* ===================================================
       LIBRARY
    =================================================== */

    libraryPages =
      books
        .filter(
          (
            book
          ) =>
            Boolean(
              book.slug
            )
        )
        .map(
          (
            book
          ) => {
            const lastModified =
              getValidDate(
                book.updatedAt ||
                  book.createdAt
              );

            return {
              url:
                `${siteUrl}/library/${book.slug}`,

              ...(lastModified
                ? {
                    lastModified,
                  }
                : {}),

              changeFrequency:
                "monthly" as const,

              priority:
                0.8,
            };
          }
        );
  } catch (error) {
    console.error(
      "Unable to load dynamic sitemap URLs:",
      error
    );
  }

  /* =====================================================
     FINAL SITEMAP
  ===================================================== */

  return [
    ...staticPages,
    ...categoryPages,
    ...articlePages,
    ...libraryPages,
  ];
}