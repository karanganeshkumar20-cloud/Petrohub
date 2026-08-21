import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title:
    "Contact PetroHub | Engineering Knowledge Platform",

  description:
    "Contact PetroHub regarding engineering content, technical resources, corrections, collaborations or general enquiries.",

  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
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
        </div>
      </section>

      {/* CONTACT */}

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
                className="mt-4 inline-block font-semibold text-orange-400 hover:text-orange-300"
              >
                Search PetroHub →
              </Link>
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