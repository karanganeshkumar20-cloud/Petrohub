import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
   CATEGORIES
========================================================= */

const categories = [
  {
    name: "HSE",
    slug: "hse",

    description:
      "Workplace safety, HIRA, Permit to Work, LOTO, incident investigation, risk assessment and occupational health.",

    keywords: [
      "HSE",
      "Safety Engineering",
      "HIRA",
      "Permit to Work",
      "LOTO",
      "Risk Assessment",
    ],
  },

  {
    name: "Oil & Gas",
    slug: "oil-gas",

    description:
      "Petroleum engineering, drilling, production, reservoir engineering and upstream oil and gas operations.",

    keywords: [
      "Oil and Gas",
      "Petroleum Engineering",
      "Drilling Engineering",
      "Production Engineering",
      "Reservoir Engineering",
    ],
  },

  {
    name: "Mechanical",
    slug: "mechanical",

    description:
      "Mechanical equipment, piping, maintenance, rotating equipment, corrosion and engineering practices.",

    keywords: [
      "Mechanical Engineering",
      "Piping",
      "Rotating Equipment",
      "Maintenance",
      "Corrosion",
    ],
  },

  {
    name: "Electrical",
    slug: "electrical",

    description:
      "Electrical safety, power systems, isolation, protection systems and industrial electrical equipment.",

    keywords: [
      "Electrical Engineering",
      "Electrical Safety",
      "Power Systems",
      "Electrical Isolation",
      "Protection Systems",
    ],
  },

  {
    name: "Instrumentation",
    slug: "instrumentation",

    description:
      "Instrumentation, sensors, transmitters, calibration, measurement and industrial control systems.",

    keywords: [
      "Instrumentation Engineering",
      "Sensors",
      "Transmitters",
      "Calibration",
      "Process Control",
    ],
  },

  {
    name: "Process",
    slug: "process",

    description:
      "Process engineering, process safety, HAZOP, industrial operations and plant systems.",

    keywords: [
      "Process Engineering",
      "Process Safety",
      "HAZOP",
      "Plant Operations",
      "Industrial Process",
    ],
  },

  {
    name: "Civil",
    slug: "civil",

    description:
      "Construction practices, structural systems, civil engineering fundamentals and site activities.",

    keywords: [
      "Civil Engineering",
      "Construction Engineering",
      "Structural Engineering",
      "Site Engineering",
    ],
  },

  {
    name: "Geology",
    slug: "geology",

    description:
      "Petroleum geology, formations, reservoirs, subsurface interpretation and geological knowledge.",

    keywords: [
      "Geology",
      "Petroleum Geology",
      "Reservoir Geology",
      "Subsurface",
      "Geological Formations",
    ],
  },
];

/* =========================================================
   SEO METADATA
========================================================= */

export const metadata: Metadata = {
  /*
   * Root layout already adds:
   * "%s | PetroHub"
   */

  title:
    "Engineering Categories",

  description:
    "Explore PetroHub engineering knowledge across HSE, Oil & Gas, Mechanical, Electrical, Instrumentation, Process, Civil and Geology.",

  keywords: [
    "Engineering Categories",
    "Engineering Knowledge",
    "Engineering Articles",
    "Engineering Resources",
    "Oil and Gas Engineering",
    "HSE",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Instrumentation Engineering",
    "Process Engineering",
    "Civil Engineering",
    "Geology",
    "PetroHub",
  ],

  alternates: {
    canonical:
      "/categories",
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
      "/categories",

    siteName:
      "PetroHub",

    title:
      "Engineering Categories | PetroHub",

    description:
      "Browse PetroHub knowledge across HSE, Oil & Gas, Mechanical, Electrical, Instrumentation, Process, Civil and Geology.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Engineering Categories | PetroHub",

    description:
      "Explore engineering knowledge, articles and professional resources by discipline on PetroHub.",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function CategoriesPage() {
  const siteUrl =
    getSiteUrl();

  const categoriesUrl =
    `${siteUrl}/categories`;

  /* =====================================================
     STRUCTURED DATA
  ===================================================== */

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "CollectionPage",

        "@id":
          `${categoriesUrl}#collection`,

        url:
          categoriesUrl,

        name:
          "Engineering Categories",

        headline:
          "Explore Engineering Categories",

        description:
          "Engineering knowledge across HSE, Oil & Gas, Mechanical, Electrical, Instrumentation, Process, Civil and Geology.",

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
            categories.length,

          itemListElement:
            categories.map(
              (
                category,
                index
              ) => ({
                "@type":
                  "ListItem",

                position:
                  index + 1,

                name:
                  category.name,

                description:
                  category.description,

                url:
                  `${siteUrl}/categories/${category.slug}`,
              })
            ),
        },
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${categoriesUrl}#breadcrumb`,

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
              "Engineering Categories",

            item:
              categoriesUrl,
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
          {/* BREADCRUMB */}

          <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-slate-300">
              Categories
            </span>
          </div>

          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Engineering Disciplines
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold md:text-5xl">
            Explore Engineering Categories
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Browse PetroHub engineering
            articles, technical knowledge
            and professional resources by
            discipline.
          </p>

          {/* ACTIONS */}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/articles"
              className="rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600"
            >
              Browse Articles →
            </Link>

            <Link
              href="/library"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Engineering Library
            </Link>

            <Link
              href="/search"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Search PetroHub
            </Link>
          </div>

          <div className="mt-8">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
              {categories.length} Engineering Disciplines
            </span>
          </div>
        </div>
      </section>

      {/* =================================================
          CATEGORIES
      ================================================= */}

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Knowledge Areas
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Engineering Disciplines
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-slate-400">
              Select an engineering
              discipline to explore
              technical articles,
              professional knowledge and
              related resources.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(
              (
                category
              ) => (
                <Link
                  key={
                    category.slug
                  }
                  href={`/categories/${category.slug}`}
                  className="group flex min-h-[270px] flex-col rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-orange-500/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-xl font-extrabold text-orange-400">
                      {category.name.charAt(
                        0
                      )}
                    </div>

                    <span className="text-xl text-slate-600 transition group-hover:text-orange-400">
                      →
                    </span>
                  </div>

                  <h2 className="mt-6 text-2xl font-bold transition group-hover:text-orange-400">
                    {
                      category.name
                    }
                  </h2>

                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                    {
                      category.description
                    }
                  </p>

                  <p className="mt-6 text-sm font-semibold text-orange-400">
                    Explore{" "}
                    {
                      category.name
                    }{" "}
                    →
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          PLATFORM LINKS
      ================================================= */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Continue Exploring
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            More PetroHub Knowledge
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Link
              href="/articles"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-orange-500/50"
            >
              <h3 className="text-xl font-bold transition group-hover:text-orange-400">
                Engineering Articles
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Read practical technical
                articles and professional
                engineering guidance.
              </p>

              <p className="mt-5 font-semibold text-orange-400">
                Browse Articles →
              </p>
            </Link>

            <Link
              href="/library"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-orange-500/50"
            >
              <h3 className="text-xl font-bold transition group-hover:text-orange-400">
                Engineering Library
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Explore books, manuals,
                technical notes and
                engineering resources.
              </p>

              <p className="mt-5 font-semibold text-orange-400">
                Browse Library →
              </p>
            </Link>

            <Link
              href="/search"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-orange-500/50"
            >
              <h3 className="text-xl font-bold transition group-hover:text-orange-400">
                Search PetroHub
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Search articles,
                engineering resources
                and technical content
                from one place.
              </p>

              <p className="mt-5 font-semibold text-orange-400">
                Start Searching →
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          SEARCH CTA
      ================================================= */}

      <section className="border-t border-slate-800 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Find Knowledge
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Looking for something specific?
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  Search PetroHub articles,
                  books, manuals, standards
                  and technical resources
                  from one place.
                </p>
              </div>

              <Link
                href="/search"
                className="shrink-0 rounded-xl bg-orange-500 px-7 py-3.5 text-center font-bold text-white transition hover:bg-orange-600"
              >
                Search PetroHub →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}