import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  cache,
  type ReactNode,
} from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import BookViewTracker from "@/components/library/BookViewTracker";
import BookDownloadButton from "@/components/library/BookDownloadButton";

import { connectDB } from "@/lib/mongodb";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type BookPageData = {
  _id: string;

  title: string;

  slug: string;

  description?: string;

  category: string;

  contentType?: string;

  resourceType:
    | "hosted"
    | "external";

  coverImage?: string;

  author?: string;

  publisher?: string;

  edition?: string;

  year?: number;

  pages?: number;

  fileUrl?: string;

  externalUrl?: string;

  source?: string;

  sourceUrl?: string;

  license?: string;

  featured?: boolean;

  views?: number;

  downloads?: number;

  createdAt?: string;

  updatedAt?: string;
};

type RelatedBookData = {
  _id: string;

  title: string;

  slug: string;

  category: string;

  contentType?: string;

  coverImage?: string;

  author?: string;
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
   TEXT HELPERS
========================================================= */

function cleanText(
  value?: string
) {
  return (
    value || ""
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function createDescription(
  book: BookPageData
) {
  const description =
    cleanText(
      book.description
    );

  if (
    description
  ) {
    return description.slice(
      0,
      155
    );
  }

  return `Explore ${book.title} in the PetroHub Engineering Library. Access engineering knowledge, technical references and professional learning resources.`;
}

function toIsoDate(
  value?: string
) {
  if (!value) {
    return undefined;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  return date.toISOString();
}

/* =========================================================
   GET RESOURCE
========================================================= */

const getBook = cache(
  async (
    slug: string
  ): Promise<BookPageData | null> => {
    await connectDB();

    const book =
      await BookModel.findOne({
        slug,
        status:
          "Published",
      }).lean();

    if (!book) {
      return null;
    }

    return JSON.parse(
      JSON.stringify(
        book
      )
    ) as BookPageData;
  }
);

/* =========================================================
   SEO METADATA
========================================================= */

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const book =
    await getBook(
      slug
    );

  if (!book) {
    return {
      title:
        "Resource Not Found",

      description:
        "The requested PetroHub library resource could not be found.",

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

  const canonicalUrl =
    `${siteUrl}/library/${book.slug}`;

  /*
   * Root layout already uses:
   *
   * template: "%s | PetroHub"
   *
   * So don't add "| PetroHub"
   * to metadata.title here.
   */

  const socialTitle =
    `${book.title} | PetroHub`;

  const description =
    createDescription(
      book
    );

  const keywords = [
    book.title,

    book.category,

    book.author,

    book.publisher,

    book.contentType,

    "PetroHub",

    "Engineering Library",

    "Engineering Resources",

    "Technical Resources",
  ].filter(
    (
      value
    ): value is string =>
      Boolean(value)
  );

  const publishedTime =
    toIsoDate(
      book.createdAt
    );

  const modifiedTime =
    toIsoDate(
      book.updatedAt
    );

  return {
    title:
      book.title,

    description,

    keywords,

    alternates: {
      canonical:
        canonicalUrl,
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
        "article",

      url:
        canonicalUrl,

      siteName:
        "PetroHub",

      locale:
        "en_US",

      title:
        socialTitle,

      description,

      publishedTime,

      modifiedTime,

      images:
        book.coverImage
          ? [
              {
                url:
                  book.coverImage,

                alt:
                  book.title,
              },
            ]
          : [],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        socialTitle,

      description,

      images:
        book.coverImage
          ? [
              book.coverImage,
            ]
          : [],
    },
  };
}

/* =========================================================
   RELATED RESOURCES
========================================================= */

async function getRelatedBooks(
  category: string,
  bookId: string
): Promise<
  RelatedBookData[]
> {
  await connectDB();

  const books =
    await BookModel.find({
      status:
        "Published",

      category,

      _id: {
        $ne:
          bookId,
      },
    })
      .sort({
        featured:
          -1,

        createdAt:
          -1,
      })
      .limit(
        4
      )
      .select(
        "_id title slug category contentType coverImage author"
      )
      .lean();

  return JSON.parse(
    JSON.stringify(
      books
    )
  ) as RelatedBookData[];
}

/* =========================================================
   PAGE
========================================================= */

export default async function BookPage({
  params,
}: Props) {
  const {
    slug,
  } = await params;

  const book =
    await getBook(
      slug
    );

  if (!book) {
    notFound();
  }

  const relatedBooks =
    await getRelatedBooks(
      book.category,
      book._id
    );

  const siteUrl =
    getSiteUrl();

  const resourceUrl =
    `${siteUrl}/library/${book.slug}`;

  const dateCreated =
    toIsoDate(
      book.createdAt
    );

  const dateModified =
    toIsoDate(
      book.updatedAt
    );

  /* =====================================================
     STRUCTURED DATA
  ===================================================== */

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          book.contentType ===
          "book"
            ? "Book"
            : "CreativeWork",

        "@id":
          `${resourceUrl}#resource`,

        name:
          book.title,

        headline:
          book.title,

        description:
          book.description ||
          createDescription(
            book
          ),

        url:
          resourceUrl,

        mainEntityOfPage: {
          "@type":
            "WebPage",

          "@id":
            resourceUrl,
        },

        image:
          book.coverImage ||
          undefined,

        author:
          book.author
            ? {
                "@type":
                  "Person",

                name:
                  book.author,
              }
            : undefined,

        publisher:
          book.publisher
            ? {
                "@type":
                  "Organization",

                name:
                  book.publisher,
              }
            : {
                "@type":
                  "Organization",

                name:
                  "PetroHub",
              },

        dateCreated,

        dateModified,

        datePublished:
          book.year
            ? String(
                book.year
              )
            : dateCreated,

        inLanguage:
          "en",

        genre:
          book.category,

        educationalUse:
          "Professional and educational reference",

        isAccessibleForFree:
          book.resourceType ===
          "hosted"
            ? true
            : undefined,

        encodingFormat:
          book.resourceType ===
            "hosted" &&
          book.fileUrl
            ? "application/pdf"
            : undefined,

        sameAs:
          book.sourceUrl ||
          book.externalUrl ||
          undefined,
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${resourceUrl}#breadcrumb`,

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
              `${siteUrl}/library`,
          },

          {
            "@type":
              "ListItem",

            position:
              3,

            name:
              book.title,

            item:
              resourceUrl,
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
          VIEW TRACKER
      ================================================= */}

      <BookViewTracker
        bookId={
          book._id
        }
      />

      {/* =================================================
          RESOURCE DETAILS
      ================================================= */}

      <section className="border-b border-slate-800 px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 transition hover:text-orange-300"
          >
            ← Back to Library
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[320px_1fr] xl:gap-14">
            {/* COVER */}

            <div>
              <div className="sticky top-24">
                {book.coverImage ? (
                  <img
                    src={
                      book.coverImage
                    }
                    alt={
                      book.title
                    }
                    className="w-full rounded-2xl border border-slate-800 object-cover shadow-2xl"
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
                    No Cover Available
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <QuickStat
                    label="Views"
                    value={
                      book.views ??
                      0
                    }
                  />

                  <QuickStat
                    label="Downloads"
                    value={
                      book.downloads ??
                      0
                    }
                  />
                </div>
              </div>
            </div>

            {/* DETAILS */}

            <div>
              <div className="flex flex-wrap gap-2">
                <Badge orange>
                  {
                    book.category
                  }
                </Badge>

                <Badge>
                  {getContentTypeLabel(
                    book.contentType
                  )}
                </Badge>

                <Badge>
                  {book.resourceType ===
                  "external"
                    ? "Official External Resource"
                    : "Hosted PDF"}
                </Badge>

                {book.featured && (
                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-400">
                    ★ Featured
                  </span>
                )}
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">
                {
                  book.title
                }
              </h1>

              {book.author && (
                <p className="mt-4 text-lg text-slate-400">
                  By{" "}
                  <span className="font-semibold text-slate-300">
                    {
                      book.author
                    }
                  </span>
                </p>
              )}

              {book.description && (
                <div className="mt-7 max-w-4xl">
                  <p className="whitespace-pre-line text-lg leading-8 text-slate-300">
                    {
                      book.description
                    }
                  </p>
                </div>
              )}

              {/* ACTIONS */}

              <div className="mt-8 flex flex-wrap gap-3">
                {book.resourceType ===
                  "hosted" &&
                  book.fileUrl && (
                    <>
                      <a
                        href="#reader"
                        className="rounded-xl border border-orange-500 px-6 py-3 font-bold text-orange-400 transition hover:bg-orange-500/10"
                      >
                        Read Online
                      </a>

                      <BookDownloadButton
                        bookId={
                          book._id
                        }
                      />
                    </>
                  )}

                {book.resourceType ===
                  "external" &&
                  book.externalUrl && (
                    <a
                      href={
                        book.externalUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
                    >
                      Visit Official Source →
                    </a>
                  )}

                {book.sourceUrl && (
                  <a
                    href={
                      book.sourceUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900"
                  >
                    Source Information
                  </a>
                )}
              </div>

              {/* METADATA */}

              <div className="mt-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Resource Information
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Meta
                    label="Content Type"
                    value={getContentTypeLabel(
                      book.contentType
                    )}
                  />

                  <Meta
                    label="Category"
                    value={
                      book.category
                    }
                  />

                  <Meta
                    label="Publisher"
                    value={
                      book.publisher
                    }
                  />

                  <Meta
                    label="Edition"
                    value={
                      book.edition
                    }
                  />

                  <Meta
                    label="Year"
                    value={
                      book.year
                        ? String(
                            book.year
                          )
                        : ""
                    }
                  />

                  <Meta
                    label="Pages"
                    value={
                      book.pages
                        ? String(
                            book.pages
                          )
                        : ""
                    }
                  />
                </div>
              </div>

              {/* SOURCE */}

              {(book.source ||
                book.license) && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h2 className="font-bold">
                      Source & Rights
                    </h2>
                  </div>

                  <div className="space-y-5 p-6">
                    {book.source && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Source
                        </p>

                        <p className="mt-2 text-slate-300">
                          {
                            book.source
                          }
                        </p>
                      </div>
                    )}

                    {book.license && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          License / Rights
                        </p>

                        <p className="mt-2 leading-6 text-slate-300">
                          {
                            book.license
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DISCLAIMER */}

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-sm leading-6 text-slate-400">
                  PetroHub provides
                  engineering resources
                  for educational and
                  professional reference
                  purposes. Ownership,
                  copyright and usage
                  rights remain with the
                  respective authors,
                  publishers or source
                  organizations where
                  applicable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          PDF READER
      ================================================= */}

      {book.resourceType ===
        "hosted" &&
        book.fileUrl && (
          <section
            id="reader"
            className="border-b border-slate-800 px-6 py-16"
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                    Online Reader
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">
                    Read Online
                  </h2>

                  <p className="mt-3 text-slate-400">
                    Read this resource
                    directly from
                    PetroHub.
                  </p>
                </div>

                <BookDownloadButton
                  bookId={
                    book._id
                  }
                />
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {
                        book.title
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      PDF Document
                    </p>
                  </div>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    Hosted
                  </span>
                </div>

                <iframe
                  src={
                    book.fileUrl
                  }
                  title={
                    book.title
                  }
                  className="h-[80vh] min-h-[600px] w-full bg-white"
                />
              </div>
            </div>
          </section>
        )}

      {/* =================================================
          RELATED RESOURCES
      ================================================= */}

      {relatedBooks.length >
        0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Continue Learning
            </p>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">
                  Related Resources
                </h2>

                <p className="mt-3 text-slate-400">
                  More resources from{" "}
                  {
                    book.category
                  }
                  .
                </p>
              </div>

              <Link
                href="/library"
                className="font-semibold text-orange-400 hover:text-orange-300"
              >
                Browse Library →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedBooks.map(
                (
                  item
                ) => (
                  <Link
                    key={
                      item._id
                    }
                    href={`/library/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-orange-500/50"
                  >
                    <div className="relative">
                      {item.coverImage ? (
                        <img
                          src={
                            item.coverImage
                          }
                          alt={
                            item.title
                          }
                          loading="lazy"
                          className="aspect-[3/4] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[3/4] items-center justify-center bg-slate-800 text-slate-500">
                          No Cover
                        </div>
                      )}

                      <span className="absolute left-3 top-3 rounded-full bg-slate-950/90 px-3 py-1 text-xs font-semibold text-orange-400">
                        {getContentTypeLabel(
                          item.contentType
                        )}
                      </span>
                    </div>

                    <div className="p-5">
                      <span className="text-sm font-semibold text-orange-400">
                        {
                          item.category
                        }
                      </span>

                      <h3 className="mt-3 line-clamp-2 font-bold leading-6 transition group-hover:text-orange-400">
                        {
                          item.title
                        }
                      </h3>

                      {item.author && (
                        <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                          {
                            item.author
                          }
                        </p>
                      )}

                      <p className="mt-5 text-sm font-semibold text-orange-400">
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

      <Footer />
    </main>
  );
}

/* =========================================================
   META CARD
========================================================= */

function Meta({
  label,
  value,
}: {
  label: string;

  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   QUICK STAT
========================================================= */

function QuickStat({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
      <p className="text-xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({
  children,
  orange = false,
}: {
  children:
    ReactNode;

  orange?:
    boolean;
}) {
  return (
    <span
      className={
        orange
          ? "rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400"
          : "rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400"
      }
    >
      {children}
    </span>
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