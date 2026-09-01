import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import ContactForm from "@/components/contact/ContactForm";

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
   SEO
========================================================= */

export const metadata: Metadata = {
  /*
   * Root layout already adds:
   * "%s | PetroHub"
   */

  title:
    "Contact PetroHub",

  description:
    "Contact PetroHub regarding engineering content, technical resources, corrections, resource requests, collaborations, account support or general enquiries.",

  keywords: [
    "Contact PetroHub",
    "PetroHub Support",
    "Engineering Resource Request",
    "Engineering Content Feedback",
    "Technical Content Correction",
    "PetroHub Collaboration",
  ],

  alternates: {
    canonical:
      "/contact",
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
      "/contact",

    siteName:
      "PetroHub",

    title:
      "Contact PetroHub | Engineering Knowledge Platform",

    description:
      "Contact PetroHub for technical content feedback, engineering resource requests, collaboration or platform support.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Contact PetroHub | Engineering Knowledge Platform",

    description:
      "Get in touch with PetroHub regarding engineering content, resources, corrections, collaborations or platform support.",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function ContactPage() {
  const siteUrl =
    getSiteUrl();

  const contactUrl =
    `${siteUrl}/contact`;

  /* =====================================================
     STRUCTURED DATA
  ===================================================== */

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "ContactPage",

        "@id":
          `${contactUrl}#webpage`,

        url:
          contactUrl,

        name:
          "Contact PetroHub",

        headline:
          "Contact PetroHub",

        description:
          "Contact PetroHub regarding engineering content, technical resources, corrections, collaborations, resource requests and platform support.",

        inLanguage:
          "en",

        isPartOf: {
          "@type":
            "WebSite",

          "@id":
            `${siteUrl}/#website`,

          name:
            "PetroHub",

          url:
            siteUrl,
        },

        about: {
          "@type":
            "Organization",

          "@id":
            `${siteUrl}/#organization`,

          name:
            "PetroHub",

          url:
            siteUrl,
        },
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${contactUrl}#breadcrumb`,

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
              "Contact PetroHub",

            item:
              contactUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* STRUCTURED DATA */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ).replace(
              /</g,
              "\\u003c"
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

          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-slate-300">
              Contact
            </span>
          </div>

          <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
            Contact PetroHub
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
            Have a question,
            suggestion or resource
            request?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Contact PetroHub regarding
            technical content, engineering
            resources, corrections,
            collaborations or general
            platform enquiries.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600"
            >
              Search PetroHub
            </Link>

            <Link
              href="/articles"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Browse Articles
            </Link>

            <Link
              href="/library"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Engineering Library
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          CONTACT
      ================================================= */}

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          {/* LEFT */}

          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Get in Touch
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              We would like to hear
              from you.
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Use the contact form for
              questions, suggestions,
              technical corrections,
              resource requests or
              general enquiries related
              to PetroHub.
            </p>

            <div className="mt-8 space-y-4">
              <ContactTopic
                title="Content Feedback"
                description="Report technical corrections or suggest improvements to PetroHub content."
              />

              <ContactTopic
                title="Resource Requests"
                description="Suggest useful engineering manuals, references or official industry resources."
              />

              <ContactTopic
                title="Collaboration"
                description="Contact PetroHub regarding technical contribution or professional collaboration."
              />

              <ContactTopic
                title="Platform Support"
                description="Report website, account, library or technical issues."
              />
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="font-semibold text-white">
                Looking for engineering
                information?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Try PetroHub Search before
                submitting a request.
              </p>

              <Link
                href="/search"
                className="mt-4 inline-block font-semibold text-orange-400 transition hover:text-orange-300"
              >
                Search PetroHub →
              </Link>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="font-semibold text-white">
                Explore before contacting
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link
                  href="/categories"
                  className="font-semibold text-orange-400 transition hover:text-orange-300"
                >
                  Categories →
                </Link>

                <Link
                  href="/articles"
                  className="font-semibold text-orange-400 transition hover:text-orange-300"
                >
                  Articles →
                </Link>

                <Link
                  href="/library"
                  className="font-semibold text-orange-400 transition hover:text-orange-300"
                >
                  Library →
                </Link>
              </div>
            </div>
          </div>

          {/* FORM */}

          <div>
            <ContactForm />

            <p className="mt-4 text-xs leading-6 text-slate-500">
              Please do not submit
              passwords, financial
              information or other
              sensitive personal
              information through this
              form.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   CONTACT TOPIC
========================================================= */

function ContactTopic({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}