import type { MetadataRoute } from "next";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

type SitemapDocument = {
  slug: string;
  updatedAt?: Date;
  createdAt?: Date;
};

const PRODUCTION_URL =
  "https://petrohub-dlor.vercel.app";

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  // Production-la localhost accidentally configured
  // aagirundhaalum correct public URL use pannum.
  if (
    process.env.NODE_ENV === "production" &&
    (!configuredUrl ||
      configuredUrl.includes("localhost") ||
      configuredUrl.includes("127.0.0.1"))
  ) {
    return PRODUCTION_URL;
  }

  return (
    configuredUrl ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    getSiteUrl();

  const now =
    new Date();

  /* =====================================================
     STATIC PAGES
  ===================================================== */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/library`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  /* =====================================================
     CATEGORY PAGES
  ===================================================== */

  const categories = [
    "hse",
    "oil-gas",
    "mechanical",
    "civil",
    "electrical",
    "instrumentation",
    "process",
    "geology",
  ];

  const categoryPages: MetadataRoute.Sitemap =
    categories.map((category) => ({
      url:
        `${siteUrl}/categories/${category}`,

      lastModified:
        now,

      changeFrequency:
        "weekly",

      priority:
        0.7,
    }));

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
        status: "Published",
      })
        .select(
          "slug updatedAt createdAt"
        )
        .lean(),

      BookModel.find({
        status: "Published",
      })
        .select(
          "slug updatedAt createdAt"
        )
        .lean(),
    ]);

    const articles =
      articleDocuments as unknown as SitemapDocument[];

    const books =
      bookDocuments as unknown as SitemapDocument[];

    articlePages =
      articles
        .filter(
          (article) =>
            Boolean(article.slug)
        )
        .map(
          (article) => ({
            url:
              `${siteUrl}/articles/${article.slug}`,

            lastModified:
              article.updatedAt ||
              article.createdAt ||
              now,

            changeFrequency:
              "monthly",

            priority:
              0.8,
          })
        );

    libraryPages =
      books
        .filter(
          (book) =>
            Boolean(book.slug)
        )
        .map(
          (book) => ({
            url:
              `${siteUrl}/library/${book.slug}`,

            lastModified:
              book.updatedAt ||
              book.createdAt ||
              now,

            changeFrequency:
              "monthly",

            priority:
              0.8,
          })
        );
  } catch (error) {
    console.error(
      "Unable to load dynamic sitemap URLs:",
      error
    );
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...articlePages,
    ...libraryPages,
  ];
}