import type {
  MetadataRoute,
} from "next";

import {
  connectDB,
} from "@/lib/mongodb";

import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

export const dynamic =
  "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type SitemapArticle = {
  slug: string;

  updatedAt?:
    Date;

  createdAt?:
    Date;
};

type SitemapBook = {
  slug: string;

  updatedAt?:
    Date;

  createdAt?:
    Date;
};

/* =========================================================
   SITE URL
========================================================= */

function getSiteUrl() {
  return (
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(
    /\/+$/,
    ""
  );
}

/* =========================================================
   SITEMAP
========================================================= */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    getSiteUrl();

  /* =====================================================
     STATIC PAGES
  ===================================================== */

  const staticPages:
    MetadataRoute.Sitemap =
    [
      {
        url:
          siteUrl,

        lastModified:
          new Date(),

        changeFrequency:
          "daily",

        priority:
          1,
      },

      {
        url:
          `${siteUrl}/articles`,

        lastModified:
          new Date(),

        changeFrequency:
          "daily",

        priority:
          0.9,
      },

      {
        url:
          `${siteUrl}/library`,

        lastModified:
          new Date(),

        changeFrequency:
          "daily",

        priority:
          0.9,
      },

      {
        url:
          `${siteUrl}/categories`,

        lastModified:
          new Date(),

        changeFrequency:
          "weekly",

        priority:
          0.8,
      },

      {
        url:
          `${siteUrl}/about`,

        lastModified:
          new Date(),

        changeFrequency:
          "monthly",

        priority:
          0.6,
      },

      {
        url:
          `${siteUrl}/contact`,

        lastModified:
          new Date(),

        changeFrequency:
          "monthly",

        priority:
          0.5,
      },
    ];

  /* =====================================================
     CATEGORY PAGES
  ===================================================== */

  const categories =
    [
      "hse",
      "oil-gas",
      "mechanical",
      "civil",
      "electrical",
      "instrumentation",
      "process",
      "geology",
    ];

  const categoryPages:
    MetadataRoute.Sitemap =
    categories.map(
      (
        category
      ) => ({
        url:
          `${siteUrl}/categories/${category}`,

        lastModified:
          new Date(),

        changeFrequency:
          "weekly" as const,

        priority:
          0.7,
      })
    );

  /* =====================================================
     ARTICLE PAGES
  ===================================================== */

  let articlePages:
    MetadataRoute.Sitemap =
    [];

  /* =====================================================
     LIBRARY PAGES
  ===================================================== */

  let libraryPages:
    MetadataRoute.Sitemap =
    [];

  /* =====================================================
     DATABASE
  ===================================================== */

  try {
    await connectDB();

    const [
      articleDocuments,
      bookDocuments,
    ] =
      await Promise.all([
        Article.find({
          status:
            "Published",
        })
          .select(
            "slug updatedAt createdAt"
          )
          .lean(),

        BookModel.find({
          status:
            "Published",
        })
          .select(
            "slug updatedAt createdAt"
          )
          .lean(),
      ]);

    /* ===================================================
       ARTICLES
    =================================================== */

    const articles =
      articleDocuments as unknown as
        SitemapArticle[];

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
          ) => ({
            url:
              `${siteUrl}/articles/${article.slug}`,

            lastModified:
              article.updatedAt ||
              article.createdAt ||
              new Date(),

            changeFrequency:
              "monthly" as const,

            priority:
              0.8,
          })
        );

    /* ===================================================
       BOOKS / LIBRARY
    =================================================== */

    const books =
      bookDocuments as unknown as
        SitemapBook[];

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
          ) => ({
            url:
              `${siteUrl}/library/${book.slug}`,

            lastModified:
              book.updatedAt ||
              book.createdAt ||
              new Date(),

            changeFrequency:
              "monthly" as const,

            priority:
              0.8,
          })
        );
  } catch (
    error
  ) {
    /*
      IMPORTANT:

      Sitemap should still return
      static/category URLs even if
      MongoDB temporarily fails.

      This prevents the entire
      sitemap.xml from crashing.
    */

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