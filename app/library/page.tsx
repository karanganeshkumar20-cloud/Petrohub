import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LibraryBrowser from "@/components/library/LibraryBrowser";

import { connectDB } from "@/lib/mongodb";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type ContentType =
  | "book"
  | "manual"
  | "standard"
  | "note"
  | "download";

type ResourceType =
  | "hosted"
  | "external";

type LibraryBook = {
  _id: string;

  title: string;

  slug: string;

  description?: string;

  category: string;

  contentType?: ContentType;

  resourceType?: ResourceType;

  coverImage?: string;

  author?: string;

  publisher?: string;

  edition?: string;

  year?: number;

  pages?: number;

  fileUrl?: string;

  filePublicId?: string;

  externalUrl?: string;

  source?: string;

  sourceUrl?: string;

  license?: string;

  status?: string;

  featured?: boolean;

  views?: number;

  downloads?: number;

  createdAt?: string;

  updatedAt?: string;
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
   SEO METADATA
========================================================= */

export const metadata: Metadata = {
  /*
   * Root layout already uses:
   * "%s | PetroHub"
   */

  title:
    "Engineering Library",

  description:
    "Explore PetroHub's engineering library with books, manuals, technical notes, standards and professional resources for Oil & Gas, HSE and multidisciplinary engineering.",

  keywords: [
    "Engineering Library",

    "Engineering Books",

    "Engineering Resources",

    "Technical Manuals",

    "Oil and Gas Books",

    "Petroleum Engineering Books",

    "HSE Resources",

    "Safety Manuals",

    "Mechanical Engineering Books",

    "Electrical Engineering Resources",

    "Process Engineering",

    "Instrumentation Engineering",

    "Civil Engineering",

    "Geology Resources",

    "PetroHub",
  ],

  alternates: {
    canonical:
      "/library",
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

      "max-video-preview":
        -1,
    },
  },

  openGraph: {
    type:
      "website",

    locale:
      "en_US",

    url:
      "/library",

    siteName:
      "PetroHub",

    title:
      "Engineering Library | PetroHub",

    description:
      "Browse engineering books, manuals, technical notes, standards and professional learning resources across Oil & Gas, HSE and engineering disciplines.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Engineering Library | PetroHub",

    description:
      "Engineering books, manuals, technical resources and professional learning material from PetroHub.",
  },
};

/* =========================================================
   GET BOOKS
========================================================= */

async function getBooks(): Promise<
  LibraryBook[]
> {
  try {
    await connectDB();

    const documents =
      await BookModel.find({
        status:
          "Published",
      })
        .sort({
          featured:
            -1,

          createdAt:
            -1,
        })
        .lean();

    return JSON.parse(
      JSON.stringify(
        documents
      )
    ) as LibraryBook[];
  } catch (error) {
    console.error(
      "Library fetch error:",
      error
    );

    return [];
  }
}

/* =========================================================
   LIBRARY PAGE
========================================================= */

export default async function LibraryPage() {
  const books =
    await getBooks();

  const featuredBooks =
    books.filter(
      (book) =>
        book.featured
    );

  const categoryCount =
    new Set(
      books
        .map(
          (book) =>
            book.category
        )
        .filter(Boolean)
    ).size;

  /* =====================================================
     COUNTS
  ===================================================== */

  const counts = {
    all:
      books.length,

    book:
      books.filter(
        (item) =>
          (
            item.contentType ||
            "book"
          ) ===
          "book"
      ).length,

    manual:
      books.filter(
        (item) =>
          item.contentType ===
          "manual"
      ).length,

    standard:
      books.filter(
        (item) =>
          item.contentType ===
          "standard"
      ).length,

    note:
      books.filter(
        (item) =>
          item.contentType ===
          "note"
      ).length,

    download:
      books.filter(
        (item) =>
          item.contentType ===
          "download"
      ).length,
  };

  /* =====================================================
     SEO STRUCTURED DATA
  ===================================================== */

  const siteUrl =
    getSiteUrl();

  const libraryUrl =
    `${siteUrl}/library`;

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "CollectionPage",

        "@id":
          `${libraryUrl}#collection`,

        url:
          libraryUrl,

        name:
          "Engineering Library",

        headline:
          "PetroHub Engineering Library",

        description:
          "Engineering books, manuals, standards, technical notes and professional resources across Oil & Gas, HSE and engineering disciplines.",

        inLanguage:
          "en",

        isPartOf: {
          "@type":
            "WebSite",

          name:
            "PetroHub",

          url:
            siteUrl,
        },

        mainEntity: {
          "@type":
            "ItemList",

          numberOfItems:
            books.length,

          itemListElement:
            books.map(
              (
                book,
                index
              ) => ({
                "@type":
                  "ListItem",

                position:
                  index + 1,

                name:
                  book.title,

                url:
                  `${siteUrl}/library/${book.slug}`,
              })
            ),
        },
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${libraryUrl}#breadcrumb`,

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
              "Engineering Library",

            item:
              libraryUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* =================================================
          STRUCTURED DATA
      ================================================= */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          {/* Breadcrumb */}

          <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-slate-300">
              Library
            </span>
          </div>

          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub Library
          </p>

          <h1 className="mt-3 max-w-4xl text-4xl font-extrabold md:text-5xl">
            Engineering Library
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Explore engineering books,
            manuals, standards, notes
            and legally available
            technical resources across
            Oil & Gas, HSE and
            multidisciplinary
            engineering.
          </p>

          {/* ACTIONS */}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600"
            >
              Search PetroHub →
            </Link>

            <Link
              href="/articles"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Engineering Articles
            </Link>

            <Link
              href="/categories"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Browse Categories
            </Link>
          </div>

          {/* STATS */}

          <div className="mt-9 flex flex-wrap gap-3">
            <LibraryStat
              label="Resources"
              value={
                books.length
              }
            />

            <LibraryStat
              label="Featured"
              value={
                featuredBooks.length
              }
            />

            <LibraryStat
              label="Categories"
              value={
                categoryCount
              }
            />

            <LibraryStat
              label="Books"
              value={
                counts.book
              }
            />
          </div>
        </div>
      </section>

      {/* =================================================
          FEATURED
      ================================================= */}

      {featuredBooks.length >
        0 && (
        <section className="border-b border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Recommended
            </p>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="text-3xl font-bold">
                  Featured Resources
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  Selected engineering
                  resources recommended
                  for PetroHub readers.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredBooks
                .slice(
                  0,
                  3
                )
                .map(
                  (
                    book
                  ) => (
                    <Link
                      key={
                        book._id
                      }
                      href={`/library/${book.slug}`}
                      className="group flex gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-orange-500/50"
                    >
                      {/* COVER */}

                      {book.coverImage ? (
                        <img
                          src={
                            book.coverImage
                          }
                          alt={
                            book.title
                          }
                          loading="lazy"
                          className="h-40 w-28 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-40 w-28 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-center text-xs text-slate-500">
                          No Cover
                        </div>
                      )}

                      {/* CONTENT */}

                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                            {
                              book.category
                            }
                          </span>

                          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                            {getContentTypeLabel(
                              book.contentType
                            )}
                          </span>
                        </div>

                        <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-7 transition group-hover:text-orange-400">
                          {
                            book.title
                          }
                        </h3>

                        {book.author && (
                          <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                            {
                              book.author
                            }
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>
                            {book.views ??
                              0}{" "}
                            views
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {book.downloads ??
                              0}{" "}
                            downloads
                          </span>
                        </div>

                        <p className="mt-4 text-sm font-semibold text-orange-400">
                          View resource →
                        </p>
                      </div>
                    </Link>
                  )
                )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          BROWSE
      ================================================= */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Browse
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Explore Engineering Resources
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Filter PetroHub resources by
            type, engineering category,
            title, author or technical
            topic.
          </p>

          <LibraryBrowser
            books={
              books
            }
            counts={
              counts
            }
          />
        </div>
      </section>

      {/* =================================================
          CONTENT TYPES
      ================================================= */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Resource Types
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Technical Knowledge in
            Multiple Formats
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ResourceTypeCard
              title="Books"
              count={
                counts.book
              }
            />

            <ResourceTypeCard
              title="Manuals"
              count={
                counts.manual
              }
            />

            <ResourceTypeCard
              title="Standards"
              count={
                counts.standard
              }
            />

            <ResourceTypeCard
              title="Notes"
              count={
                counts.note
              }
            />

            <ResourceTypeCard
              title="Downloads"
              count={
                counts.download
              }
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   LIBRARY STAT
========================================================= */

function LibraryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
      <span className="text-2xl font-bold">
        {value}
      </span>

      <span className="ml-2 text-sm text-slate-500">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   RESOURCE TYPE CARD
========================================================= */

function ResourceTypeCard({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-3xl font-bold">
        {count}
      </p>

      <p className="mt-2 font-semibold text-slate-300">
        {title}
      </p>
    </div>
  );
}

/* =========================================================
   CONTENT TYPE LABEL
========================================================= */

function getContentTypeLabel(
  contentType?: string
) {
  switch (
    contentType
  ) {
    case "manual":
      return "Manual";

    case "standard":
      return "Standard";

    case "note":
      return "Note";

    case "download":
      return "Download";

    default:
      return "Book";
  }
}