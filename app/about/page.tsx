import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title:
    "About PetroHub | Engineering Knowledge Platform",

  description:
    "Learn about PetroHub, an engineering knowledge platform for engineers, HSE professionals, technical professionals and students.",

  alternates: {
    canonical: "/about",
  },
};

const disciplines = [
  {
    title: "HSE",
    description:
      "Safety, HIRA, PTW, LOTO, incident investigation and workplace risk management.",
  },
  {
    title: "Oil & Gas",
    description:
      "Drilling, production, reservoir engineering and petroleum operations.",
  },
  {
    title: "Mechanical",
    description:
      "Piping, equipment, maintenance, corrosion and mechanical engineering.",
  },
  {
    title: "Electrical",
    description:
      "Electrical safety, power systems, isolation and industrial equipment.",
  },
  {
    title: "Instrumentation",
    description:
      "Sensors, transmitters, calibration, measurement and control systems.",
  },
  {
    title: "Process",
    description:
      "Process engineering, HAZOP, process safety and industrial operations.",
  },
  {
    title: "Civil",
    description:
      "Construction practices, structural systems and civil engineering.",
  },
  {
    title: "Geology",
    description:
      "Petroleum geology, formations, reservoirs and subsurface knowledge.",
  },
];

const principles = [
  {
    number: "01",
    title: "Practical Knowledge",
    description:
      "Focus on engineering information that professionals and students can apply in real-world situations.",
  },
  {
    number: "02",
    title: "Clear Learning",
    description:
      "Present technical topics in a structured and understandable format.",
  },
  {
    number: "03",
    title: "Responsible Resources",
    description:
      "Host appropriate resources and direct users to official sources where required.",
  },
  {
    number: "04",
    title: "Continuous Learning",
    description:
      "Build a growing knowledge base across engineering and industrial disciplines.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-slate-800 px-6 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="font-semibold uppercase tracking-[0.25em] text-orange-500">
              About PetroHub
            </p>

            <h1 className="mt-5 text-5xl font-extrabold leading-tight md:text-6xl">
              Engineering knowledge
              <span className="block text-orange-500">
                built for practical learning.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-400">
              PetroHub brings practical
              engineering articles,
              professional references and
              technical resources together
              in one accessible knowledge
              platform.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/articles"
                className="rounded-xl bg-orange-500 px-7 py-3.5 font-bold text-white transition hover:bg-orange-600"
              >
                Explore Articles
              </Link>

              <Link
                href="/library"
                className="rounded-xl border border-slate-700 px-7 py-3.5 font-bold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                Open Library
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM */}

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              The Platform
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              What is PetroHub?
            </h2>

            <div className="mt-6 space-y-5 leading-8 text-slate-400">
              <p>
                PetroHub is designed for
                engineers, HSE
                professionals, technical
                personnel and students who
                want practical access to
                engineering knowledge.
              </p>

              <p>
                The platform combines
                technical articles with
                books, manuals, notes,
                downloadable documents and
                official engineering
                resources.
              </p>

              <p>
                PetroHub connects multiple
                engineering disciplines so
                users can learn beyond a
                single field and understand
                related industrial subjects.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              value="8"
              label="Engineering Disciplines"
            />

            <InfoCard
              value="Articles"
              label="Practical Knowledge"
            />

            <InfoCard
              value="Library"
              label="Technical Resources"
            />

            <InfoCard
              value="Search"
              label="Unified Knowledge Search"
            />
          </div>
        </div>
      </section>

      {/* MISSION */}

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-10">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Our Mission
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Make engineering knowledge
              easier to access.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Organize practical technical
              information into a platform
              where users can learn,
              search, read and access
              professional resources
              without unnecessary
              complexity.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-10">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Our Vision
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Build a trusted engineering
              knowledge hub.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Grow PetroHub into a useful
              professional reference
              platform covering technical
              learning, safety knowledge,
              industrial resources and
              engineering disciplines.
            </p>
          </div>
        </div>
      </section>

      {/* DISCIPLINES */}

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                Engineering Knowledge
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Disciplines on PetroHub
              </h2>
            </div>

            <Link
              href="/categories"
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              Explore Categories →
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {disciplines.map(
              (discipline) => (
                <div
                  key={
                    discipline.title
                  }
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-lg font-black text-orange-400">
                    {discipline.title.charAt(
                      0
                    )}
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {
                      discipline.title
                    }
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {
                      discipline.description
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            Platform Principles
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            How PetroHub approaches
            knowledge.
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {principles.map(
              (principle) => (
                <div
                  key={
                    principle.number
                  }
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-7"
                >
                  <span className="font-black text-orange-500">
                    {
                      principle.number
                    }
                  </span>

                  <h3 className="mt-4 text-2xl font-bold">
                    {
                      principle.title
                    }
                  </h3>

                  <p className="mt-4 leading-7 text-slate-400">
                    {
                      principle.description
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* RESOURCE POLICY */}

      <section className="border-b border-slate-800 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              Resource Policy
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Responsible access to
              engineering resources.
            </h2>

            <div className="mt-6 max-w-4xl space-y-4 leading-8 text-slate-400">
              <p>
                PetroHub may host resources
                that can appropriately be
                distributed while directing
                users to official publishers
                or organizations for
                externally controlled
                materials.
              </p>

              <p>
                Copyright and ownership of
                third-party materials remain
                with their respective
                authors, publishers and
                organizations.
              </p>

              <p>
                PetroHub information is for
                educational and professional
                reference and does not
                replace applicable laws,
                standards, manufacturer
                requirements or competent
                professional advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Start Exploring
                </p>

                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  Explore engineering
                  knowledge on PetroHub.
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="rounded-xl bg-orange-500 px-7 py-3.5 font-bold text-white hover:bg-orange-600"
                >
                  Search PetroHub
                </Link>

                <Link
                  href="/contact"
                  className="rounded-xl border border-slate-700 px-7 py-3.5 font-bold text-slate-300 hover:border-orange-500 hover:text-orange-400"
                >
                  Contact Us
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

function InfoCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-2xl font-extrabold text-orange-400">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}