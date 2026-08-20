import type { MetadataRoute } from "next";

import { connectDB } from "@/lib/mongodb";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  /*
   * STATIC PAGES
   */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${siteUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${siteUrl}/library`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  /*
   * CATEGORY PAGES
   */

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
      url: `${siteUrl}/categories/${category}`,

      lastModified: new Date(),

      changeFrequency:
        "weekly" as const,

      priority: 0.7,
    }));

  /*
   * LIBRARY RESOURCES FROM MONGODB
   */

  let libraryPages: MetadataRoute.Sitemap = [];

  try {
    await connectDB();

    const books = await BookModel.find({
      status: "Published",
    })
      .select(
        "slug updatedAt createdAt"
      )
      .lean();

    libraryPages = books.map(
      (book: any) => ({
        url: `${siteUrl}/library/${book.slug}`,

        lastModified:
          book.updatedAt ||
          book.createdAt ||
          new Date(),

        changeFrequency:
          "monthly" as const,

        priority: 0.8,
      })
    );
  } catch (error) {
    console.error(
      "Unable to generate library sitemap:",
      error
    );
  }

  /*
   * FINAL SITEMAP
   */

  return [
    ...staticPages,
    ...categoryPages,
    ...libraryPages,
  ];
}