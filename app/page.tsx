import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import RotatingHeroText from "@/components/RotatingHeroText";

import { connectDB } from "@/lib/mongodb";

import Article from "@/models/Article";
import { BookModel } from "@/models/Book";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type ArticleData = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  category: string;
  featuredImage?: string;
  featured?: boolean;
  views?: number;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
};

type LibraryResource = {
  _id: string;
  title: string;
  slug: string;

  author?: string;
  description?: string;

  category: string;

  contentType?:
    | "book"
    | "manual"
    | "standard"
    | "note"
    | "download";

  resourceType?: "hosted" | "external";

  coverImage?: string;

  featured?: boolean;

  views?: number;
  downloads?: number;

  publisher?: string;
  year?: number;

  createdAt?: string;
  updatedAt?: string;
};

/* =========================================================
   SITE URL
========================================================= */

const PRODUCTION_URL = "https://petrohub-dlor.vercel.app";

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (
    process.env.NODE_ENV === "production" &&
    (!configuredUrl ||
      configuredUrl.includes("localhost") ||
      configuredUrl.includes("127.0.0.1"))
  ) {
    return PRODUCTION_URL;
  }

  return (
    configuredUrl || "http://localhost:3000"
  ).replace(/\/+$/, "");
}

/* =========================================================
   SEO
========================================================= */

export const metadata: Metadata = {
  title: "Engineering Knowledge Platform",

  description:
    "PetroHub is an engineering knowledge, formulas and calculation platform for Oil & Gas, HSE, Mechanical, Electrical, Instrumentation, Process, Civil and Geology professionals, students and engineers.",

  keywords: [
    "PetroHub",
    "Engineering Knowledge Platform",
    "Engineering Articles",
    "Engineering Formulas",
    "Engineering Calculators",
    "Engineering Library",
    "Oil and Gas Engineering",
    "Petroleum Engineering",
    "HSE",
    "Safety Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Instrumentation Engineering",
    "Process Engineering",
    "Civil Engineering",
    "Geology",
    "Engineering Resources",
    "Technical Manuals",
  ],

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PetroHub",

    title: "PetroHub | Engineering Knowledge Platform",

    description:
      "Explore engineering articles, formulas, calculators, manuals and professional technical resources across multiple engineering disciplines.",
  },

  twitter: {
    card: "summary_large_image",

    title: "PetroHub | Engineering Knowledge Platform",

    description:
      "Engineering articles, formulas, calculators and professional technical resources in one platform.",
  },
};

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  {
    name: "HSE",
    slug: "hse",
    description:
      "Safety, HIRA, PTW, LOTO, incident prevention and workplace risk management.",
  },

  {
    name: "Oil & Gas",
    slug: "oil-gas",
    description:
      "Drilling, production, reservoir engineering and petroleum operations.",
  },

  {
    name: "Mechanical",
    slug: "mechanical",
    description:
      "Piping, rotating equipment, maintenance, corrosion and mechanical systems.",
  },

  {
    name: "Electrical",
    slug: "electrical",
    description:
      "Electrical safety, isolation, power systems and industrial equipment.",
  },

  {
    name: "Instrumentation",
    slug: "instrumentation",
    description:
      "Sensors, transmitters, calibration, measurement and industrial control.",
  },

  {
    name: "Process",
    slug: "process",
    description:
      "Process engineering, HAZOP, process safety and industrial operations.",
  },

  {
    name: "Civil",
    slug: "civil",
    description:
      "Construction, structural systems, site practices and civil engineering.",
  },

  {
    name: "Geology",
    slug: "geology",
    description:
      "Petroleum geology, reservoirs, formations and subsurface knowledge.",
  },
];

/* =========================================================
   DATABASE
========================================================= */

async function getHomepageData() {
  try {
    await connectDB();

    const [
      articleDocuments,
      featuredResourceDocuments,
      popularResourceDocuments,
      articleCount,
      resourceCount,
    ] = await Promise.all([
      Article.find({
        status: "Published",
      })
        .select(
          "_id title slug summary category featuredImage featured views author createdAt updatedAt"
        )
        .sort({
          featured: -1,
          createdAt: -1,
        })
        .limit(6)
        .lean(),

      BookModel.find({
        status: "Published",
        featured: true,
      })
        .select(
          "_id title slug author description category contentType resourceType coverImage featured views downloads publisher year createdAt updatedAt"
        )
        .sort({
          createdAt: -1,
        })
        .limit(4)
        .lean(),

      BookModel.find({
        status: "Published",
      })
        .select(
          "_id title slug author description category contentType resourceType coverImage featured views downloads publisher year createdAt updatedAt"
        )
        .sort({
          views: -1,
          downloads: -1,
          createdAt: -1,
        })
        .limit(4)
        .lean(),

      Article.countDocuments({
        status: "Published",
      }),

      BookModel.countDocuments({
        status: "Published",
      }),
    ]);

    const articles = JSON.parse(
      JSON.stringify(articleDocuments)
    ) as ArticleData[];

    const featuredResources = JSON.parse(
      JSON.stringify(featuredResourceDocuments)
    ) as LibraryResource[];

    const popularResources = JSON.parse(
      JSON.stringify(popularResourceDocuments)
    ) as LibraryResource[];

    return {
      articles,
      featuredResources,
      popularResources,
      articleCount,
      resourceCount,
    };
  } catch (error) {
    console.error("Homepage data fetch error:", error);

    return {
      articles: [] as ArticleData[],
      featuredResources: [] as LibraryResource[],
      popularResources: [] as LibraryResource[],
      articleCount: 0,
      resourceCount: 0,
    };
  }
}

/* =========================================================
   HOMEPAGE
========================================================= */

export default async function HomePage() {
  const siteUrl = getSiteUrl();

  const {
    articles,
    featuredResources,
    popularResources,
    articleCount,
    resourceCount,
  } = await getHomepageData();

  const featuredArticle =
    articles.find((article) => article.featured) || articles[0];

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "PetroHub",
        url: siteUrl,

        description:
          "PetroHub is an engineering knowledge platform providing articles, formulas, calculators, professional references and technical resources.",
      },

      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "PetroHub",

        description:
          "Engineering knowledge and calculation platform for Oil & Gas, HSE and engineering professionals and students.",

        publisher: {
          "@id": `${siteUrl}/#organization`,
        },

        inLanguage: "en",

        potentialAction: {
          "@type": "SearchAction",

          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },

          "query-input": "required name=search_term_string",
        },
      },

      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,

        name: "PetroHub | Engineering Knowledge Platform",

        description:
          "Explore engineering articles, formulas, calculators, manuals and professional resources across multiple engineering disciplines.",

        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },

        about: {
          "@id": `${siteUrl}/#organization`,
        },

        inLanguage: "en",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="
          relative
          w-full
          overflow-hidden
          border-b
          border-slate-800
          bg-slate-950
        "
      >
        {/* Background */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-orange-500/[0.08]
            via-slate-950
            to-slate-950
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -left-64
            -top-64
            h-[700px]
            w-[700px]
            rounded-full
            bg-orange-500/[0.07]
            blur-3xl
          "
        />

        {/* Full-width hero wrapper */}

        <div
          className="
            relative
            mx-auto
            w-full
            max-w-[1500px]
            px-5
            py-14
            sm:px-8
            md:px-10
            lg:px-12
            lg:py-16
            xl:px-14
            2xl:px-8
          "
        >
          {/* Main Hero Grid */}

          <div
            className="
              grid
              w-full
              items-start
              gap-10
              lg:grid-cols-[minmax(0,1fr)_330px]
              xl:grid-cols-[minmax(0,1fr)_360px]
              xl:gap-12
            "
          >
            {/* ===============================
                LEFT HERO
            =============================== */}

            <div className="min-w-0">
              {/* Eyebrow */}

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-orange-500/40
                  bg-orange-500/[0.05]
                  px-3
                  py-1.5
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-orange-400
                  sm:text-xs
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    bg-orange-500
                  "
                />

                Engineering Knowledge Platform
              </div>

              {/* Heading */}

              <h1
                className="
                  mt-7
                  font-extrabold
                  leading-[1.02]
                  tracking-[-0.035em]
                  text-white
                  sm:mt-8
                "
              >
                <span
                  className="
                    block
                    text-[46px]
                    sm:text-6xl
                    md:text-7xl
                    lg:text-[64px]
                    xl:text-[72px]
                    2xl:text-[78px]
                    xl:whitespace-nowrap
                  "
                >
                  Learn Engineering.
                </span>

                <span
                  className="
                    mt-2
                    block
                    min-h-[1.08em]
                    text-[43px]
                    text-orange-500
                    sm:text-6xl
                    md:text-7xl
                    lg:text-[60px]
                    xl:text-[68px]
                    2xl:text-[74px]
                    xl:whitespace-nowrap
                  "
                >
                  <RotatingHeroText />
                </span>
              </h1>

              {/* Description */}

              <p
                className="
                  mt-7
                  max-w-[920px]
                  text-base
                  leading-7
                  text-slate-400
                  sm:text-lg
                  sm:leading-8
                  lg:text-[18px]
                  xl:text-[19px]
                "
              >
                Explore engineering articles, formulas,
                calculators, technical references and professional
                resources across Oil &amp; Gas, HSE and multiple
                engineering disciplines.
              </p>

              {/* Actions */}

              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  gap-3
                "
              >
                <Link
                  href="/formulas"
                  className="
                    whitespace-nowrap
                    rounded-xl
                    bg-orange-500
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-slate-950
                    transition
                    hover:bg-orange-400
                    sm:text-base
                  "
                >
                  Open Calculators
                </Link>

                <Link
                  href="/articles"
                  className="
                    whitespace-nowrap
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-900/60
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:border-orange-500
                    hover:text-orange-400
                    sm:text-base
                  "
                >
                  Explore Articles
                </Link>

                <Link
                  href="/library"
                  className="
                    whitespace-nowrap
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-950/30
                    px-6
                    py-3.5
                    text-sm
                    font-semibold
                    text-slate-300
                    transition
                    hover:border-orange-500
                    hover:text-orange-400
                    sm:text-base
                  "
                >
                  Engineering Library
                </Link>
              </div>

              {/* Search */}

              <form
                action="/search"
                method="GET"
                role="search"
                className="
                  mt-8
                  w-full
                  max-w-[960px]
                "
              >
                <label
                  htmlFor="petrohub-home-search"
                  className="sr-only"
                >
                  Search PetroHub
                </label>

                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-900/80
                    p-2
                    shadow-xl
                    shadow-black/10
                    sm:flex-row
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      flex-1
                      items-center
                      gap-3
                      rounded-xl
                      bg-slate-950
                      px-4
                    "
                  >
                    <SearchIcon />

                    <input
                      id="petrohub-home-search"
                      type="search"
                      name="q"
                      required
                      autoComplete="off"
                      placeholder="Search formulas, HIRA, drilling, reservoir..."
                      className="
                        min-w-0
                        flex-1
                        bg-transparent
                        py-4
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-slate-500
                        sm:text-base
                      "
                    />
                  </div>

                  <button
                    type="submit"
                    className="
                      shrink-0
                      whitespace-nowrap
                      rounded-xl
                      bg-orange-500
                      px-7
                      py-4
                      text-sm
                      font-semibold
                      text-slate-950
                      transition
                      hover:bg-orange-400
                      sm:text-base
                    "
                  >
                    Search PetroHub
                  </button>
                </div>
              </form>

              {/* Popular Searches */}

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    mr-1
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  Popular
                </span>

                {[
                  "HIRA",
                  "LOTO",
                  "Drilling",
                  "Reservoir",
                  "Well Control",
                ].map((keyword) => (
                  <Link
                    key={keyword}
                    href={`/search?q=${encodeURIComponent(
                      keyword
                    )}`}
                    className="
                      whitespace-nowrap
                      rounded-full
                      border
                      border-slate-700
                      bg-slate-950/40
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-slate-300
                      transition
                      hover:border-orange-500
                      hover:text-orange-400
                    "
                  >
                    {keyword}
                  </Link>
                ))}
              </div>
            </div>

            {/* ===============================
                ENGINEERING WORKSPACE
            =============================== */}

            <aside
              className="
                hidden
                w-full
                rounded-3xl
                border
                border-slate-800
                bg-slate-900/80
                p-5
                shadow-2xl
                shadow-black/20
                backdrop-blur
                lg:block
                xl:p-6
              "
            >
              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-orange-500
                "
              >
                Engineering Workspace
              </p>

              <h2
                className="
                  mt-3
                  text-2xl
                  font-bold
                  leading-tight
                  text-white
                "
              >
                What do you want to do?
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                Jump directly into PetroHub tools and technical
                resources.
              </p>

              <div className="mt-5 space-y-3">
                <WorkspaceLink
                  href="/formulas"
                  title="Engineering Calculators"
                  description="Petroleum and engineering formulas with calculation tools."
                />

                <WorkspaceLink
                  href="/ai"
                  title="PetroHub AI"
                  description="Ask engineering and technical questions."
                />

                <WorkspaceLink
                  href="/library"
                  title="Engineering Library"
                  description="Manuals, technical references and engineering resources."
                />

                <WorkspaceLink
                  href="/categories"
                  title="Browse Disciplines"
                  description="Explore knowledge by engineering category."
                />
              </div>
            </aside>
          </div>

          {/* ===============================
              STATS
          =============================== */}

          <div
            className="
              mt-10
              grid
              gap-4
              sm:grid-cols-3
            "
          >
            <HeroStat
              value={articleCount}
              label="Published Articles"
            />

            <HeroStat
              value={resourceCount}
              label="Library Resources"
            />

            <HeroStat
              value={categories.length}
              label="Engineering Disciplines"
            />
          </div>
        </div>
      </section>

      {/* =================================================
          FEATURED LIBRARY
      ================================================= */}

      {featuredResources.length > 0 && (
        <section
          className="
            border-b
            border-slate-800
            px-5
            py-16
            sm:px-8
          "
        >
          <div className="mx-auto max-w-[1400px]">
            <SectionHeader
              eyebrow="Featured Resources"
              title="Engineering Library"
              description="Selected books, manuals, standards and technical resources from the PetroHub Library."
              href="/library"
              linkLabel="Explore Library"
            />

            <div
              className="
                mt-8
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {featuredResources.map((resource) => (
                <LibraryCard
                  key={resource._id}
                  resource={resource}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          FEATURED ARTICLE
      ================================================= */}

      {featuredArticle && (
        <section
          className="
            border-b
            border-slate-800
            px-5
            py-16
            sm:px-8
          "
        >
          <div className="mx-auto max-w-[1400px]">
            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.2em]
                text-orange-500
              "
            >
              Featured Knowledge
            </p>

            <h2
              className="
                mt-3
                text-3xl
                font-bold
                sm:text-4xl
              "
            >
              Featured Article
            </h2>

            <Link
              href={`/articles/${featuredArticle.slug}`}
              className="
                group
                mt-8
                grid
                overflow-hidden
                rounded-3xl
                border
                border-slate-800
                bg-slate-900
                transition
                hover:border-orange-500/50
                lg:grid-cols-2
              "
            >
              {featuredArticle.featuredImage ? (
                <div
                  className="
                    relative
                    min-h-[280px]
                    overflow-hidden
                    bg-slate-800
                    sm:min-h-[340px]
                  "
                >
                  <Image
                    src={featuredArticle.featuredImage}
                    alt={featuredArticle.title}
                    width={1200}
                    height={800}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="
                      h-full
                      min-h-[280px]
                      w-full
                      object-cover
                      transition
                      duration-300
                      group-hover:scale-[1.02]
                      sm:min-h-[340px]
                    "
                  />
                </div>
              ) : (
                <div
                  className="
                    flex
                    min-h-[280px]
                    items-center
                    justify-center
                    bg-slate-800
                    text-2xl
                    font-extrabold
                    text-slate-400
                    sm:min-h-[340px]
                  "
                >
                  PetroHub
                </div>
              )}

              <div
                className="
                  flex
                  flex-col
                  justify-center
                  p-7
                  sm:p-9
                  md:p-11
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      rounded-full
                      bg-orange-500/10
                      px-3
                      py-1
                      text-sm
                      font-semibold
                      text-orange-400
                    "
                  >
                    {featuredArticle.category}
                  </span>

                  <span
                    className="
                      rounded-full
                      border
                      border-slate-700
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Article
                  </span>
                </div>

                <h3
                  className="
                    mt-5
                    text-2xl
                    font-bold
                    leading-tight
                    transition
                    group-hover:text-orange-400
                    sm:text-3xl
                    xl:text-4xl
                  "
                >
                  {featuredArticle.title}
                </h3>

                {featuredArticle.summary && (
                  <p
                    className="
                      mt-5
                      line-clamp-4
                      text-base
                      leading-7
                      text-slate-400
                      sm:text-lg
                    "
                  >
                    {featuredArticle.summary}
                  </p>
                )}

                <div
                  className="
                    mt-7
                    flex
                    flex-wrap
                    items-center
                    gap-5
                    text-sm
                  "
                >
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      font-semibold
                      text-orange-400
                    "
                  >
                    Read article
                    <ArrowRightIcon />
                  </span>

                  <span className="text-slate-400">
                    {featuredArticle.views ?? 0} views
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* =================================================
          CATEGORIES
      ================================================= */}

      <section
        className="
          border-b
          border-slate-800
          px-5
          py-16
          sm:px-8
        "
      >
        <div className="mx-auto max-w-[1400px]">
          <SectionHeader
            eyebrow="Disciplines"
            title="Explore Engineering Categories"
            description="Find knowledge, formulas and technical resources based on your engineering discipline."
            href="/categories"
            linkLabel="View all categories"
          />

          <div
            className="
              mt-8
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-900
                  p-6
                  transition
                  hover:-translate-y-1
                  hover:border-orange-500/50
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <h3
                    className="
                      text-xl
                      font-bold
                      transition
                      group-hover:text-orange-400
                    "
                  >
                    {category.name}
                  </h3>

                  <span
                    className="
                      text-slate-500
                      transition
                      group-hover:text-orange-400
                    "
                  >
                    <ArrowRightIcon />
                  </span>
                </div>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-slate-400
                  "
                >
                  {category.description}
                </p>

                <p
                  className="
                    mt-5
                    text-sm
                    font-semibold
                    text-orange-400
                  "
                >
                  Explore category
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================
          LATEST ARTICLES
      ================================================= */}

      <section
        className="
          border-b
          border-slate-800
          px-5
          py-16
          sm:px-8
        "
      >
        <div className="mx-auto max-w-[1400px]">
          <SectionHeader
            eyebrow="Latest Knowledge"
            title="Latest Articles"
            description="Practical engineering knowledge, safety guidance and technical learning from PetroHub."
            href="/articles"
            linkLabel="Browse all articles"
          />

          {articles.length === 0 ? (
            <EmptyState
              title="No articles available"
              description="Published articles will appear here automatically."
            />
          ) : (
            <div
              className="
                mt-8
                grid
                gap-6
                md:grid-cols-2
                lg:grid-cols-3
              "
            >
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  articleId={article._id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          POPULAR RESOURCES
      ================================================= */}

      {popularResources.length > 0 && (
        <section
          className="
            border-b
            border-slate-800
            px-5
            py-16
            sm:px-8
          "
        >
          <div className="mx-auto max-w-[1400px]">
            <SectionHeader
              eyebrow="Popular Resources"
              title="Most Viewed in the Library"
              description="Discover the engineering resources PetroHub readers are exploring."
              href="/library"
              linkLabel="Browse Library"
            />

            <div
              className="
                mt-8
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {popularResources.map((resource) => (
                <LibraryCard
                  key={resource._id}
                  resource={resource}
                  showStats
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          CTA
      ================================================= */}

      <section
        className="
          px-5
          py-16
          sm:px-8
          sm:py-20
        "
      >
        <div className="mx-auto max-w-[1400px]">
          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-7
              sm:p-9
              md:p-12
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                h-64
                w-64
                rounded-full
                bg-orange-500/10
                blur-3xl
              "
            />

            <div
              className="
                relative
                grid
                gap-8
                lg:grid-cols-2
                lg:items-center
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-orange-500
                  "
                >
                  PetroHub
                </p>

                <h2
                  className="
                    mt-3
                    max-w-3xl
                    text-3xl
                    font-bold
                    md:text-4xl
                  "
                >
                  Engineering knowledge, calculations and
                  resources in one place.
                </h2>

                <p
                  className="
                    mt-5
                    max-w-3xl
                    leading-7
                    text-slate-400
                  "
                >
                  Learn from practical engineering articles,
                  calculate using trusted engineering tools and
                  explore technical references through PetroHub.
                </p>
              </div>

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  lg:justify-end
                "
              >
                <Link
                  href="/formulas"
                  className="
                    whitespace-nowrap
                    rounded-xl
                    bg-orange-500
                    px-7
                    py-3.5
                    text-center
                    font-bold
                    text-slate-950
                    transition
                    hover:bg-orange-400
                  "
                >
                  Open Calculators
                </Link>

                <Link
                  href="/search"
                  className="
                    whitespace-nowrap
                    rounded-xl
                    border
                    border-slate-700
                    px-7
                    py-3.5
                    text-center
                    font-bold
                    text-slate-300
                    transition
                    hover:border-orange-500
                    hover:text-orange-400
                  "
                >
                  Search PetroHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   WORKSPACE LINK
========================================================= */

function WorkspaceLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        block
        rounded-2xl
        border
        border-slate-800
        bg-slate-950/40
        p-4
        transition
        hover:border-orange-500/50
        hover:bg-slate-950/70
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <h3
            className="
              text-sm
              font-bold
              text-white
              transition
              group-hover:text-orange-400
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-2
              text-xs
              leading-5
              text-slate-400
            "
          >
            {description}
          </p>
        </div>

        <span
          className="
            mt-0.5
            shrink-0
            text-slate-500
            transition
            group-hover:translate-x-1
            group-hover:text-orange-400
          "
        >
          <ArrowRightIcon />
        </span>
      </div>
    </Link>
  );
}

/* =========================================================
   LIBRARY CARD
========================================================= */

function LibraryCard({
  resource,
  showStats = false,
}: {
  resource: LibraryResource;
  showStats?: boolean;
}) {
  return (
    <Link
      href={`/library/${resource.slug}`}
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        transition
        hover:-translate-y-1
        hover:border-orange-500/50
      "
    >
      <div
        className="
          relative
          overflow-hidden
          bg-slate-800
        "
      >
        {resource.coverImage ? (
          <Image
            src={resource.coverImage}
            alt={resource.title}
            width={600}
            height={800}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="
              aspect-[3/4]
              w-full
              object-cover
              transition
              duration-300
              group-hover:scale-[1.03]
            "
          />
        ) : (
          <div
            className="
              flex
              aspect-[3/4]
              items-center
              justify-center
              text-xl
              font-bold
              text-slate-400
            "
          >
            PetroHub
          </div>
        )}

        {resource.featured && (
          <span
            className="
              absolute
              left-3
              top-3
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-yellow-500
              px-3
              py-1
              text-xs
              font-bold
              text-slate-950
            "
          >
            <StarIcon />
            Featured
          </span>
        )}

        <span
          className="
            absolute
            right-3
            top-3
            rounded-full
            bg-slate-950/90
            px-3
            py-1
            text-xs
            font-semibold
            text-orange-400
          "
        >
          {getContentTypeLabel(resource.contentType)}
        </span>
      </div>

      <div className="p-5">
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <span
            className="
              text-sm
              font-semibold
              text-orange-400
            "
          >
            {resource.category}
          </span>

          <span
            aria-hidden="true"
            className="
              h-1
              w-1
              rounded-full
              bg-slate-600
            "
          />

          <span
            className="
              text-xs
              font-semibold
              text-slate-400
            "
          >
            {resource.resourceType === "hosted"
              ? "Hosted PDF"
              : resource.resourceType === "external"
                ? "Official Source"
                : "Library Resource"}
          </span>
        </div>

        <h3
          className="
            mt-3
            line-clamp-2
            text-lg
            font-bold
            leading-6
            transition
            group-hover:text-orange-400
          "
        >
          {resource.title}
        </h3>

        {resource.author && (
          <p
            className="
              mt-2
              line-clamp-1
              text-sm
              text-slate-400
            "
          >
            By {resource.author}
          </p>
        )}

        {showStats && (
          <div
            className="
              mt-5
              flex
              gap-4
              border-t
              border-slate-800
              pt-4
              text-xs
              text-slate-400
            "
          >
            <span>{resource.views ?? 0} views</span>

            <span>{resource.downloads ?? 0} downloads</span>
          </div>
        )}

        <p
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-orange-400
          "
        >
          View resource
          <ArrowRightIcon />
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-5
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      <div>
        <p
          className="
            text-sm
            font-semibold
            uppercase
            tracking-[0.2em]
            text-orange-500
          "
        >
          {eyebrow}
        </p>

        <h2
          className="
            mt-3
            text-3xl
            font-bold
            sm:text-4xl
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-3
            max-w-3xl
            text-base
            leading-7
            text-slate-400
          "
        >
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="
          inline-flex
          shrink-0
          items-center
          gap-2
          font-semibold
          text-orange-400
          transition
          hover:text-orange-300
        "
      >
        {linkLabel}
        <ArrowRightIcon />
      </Link>
    </div>
  );
}

/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900/70
        p-5
        transition
        hover:border-slate-700
      "
    >
      <p
        className="
          text-3xl
          font-extrabold
          text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-2
          text-sm
          font-medium
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        mt-8
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-8
        sm:p-10
      "
    >
      <h3 className="text-xl font-bold">{title}</h3>

      <p className="mt-3 text-slate-400">{description}</p>
    </div>
  );
}

/* =========================================================
   SEARCH ICON
========================================================= */

function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-slate-500"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* =========================================================
   ARROW
========================================================= */

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/* =========================================================
   STAR
========================================================= */

function StarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z" />
    </svg>
  );
}

/* =========================================================
   CONTENT TYPE
========================================================= */

function getContentTypeLabel(contentType?: string) {
  switch (contentType) {
    case "manual":
      return "Manual";

    case "standard":
      return "Standard";

    case "note":
      return "Note";

    case "download":
      return "Download";

    case "book":
      return "Book";

    default:
      return "Resource";
  }
}