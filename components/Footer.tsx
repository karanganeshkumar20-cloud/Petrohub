import Link from "next/link";

const platformLinks = [
  {
    name: "Articles",
    href: "/articles",
  },
  {
    name: "Engineering Library",
    href: "/library",
  },
  {
    name: "Categories",
    href: "/categories",
  },
  {
    name: "Search",
    href: "/search",
  },
];

const categoryLinks = [
  {
    name: "HSE",
    href: "/categories/hse",
  },
  {
    name: "Oil & Gas",
    href: "/categories/oil-gas",
  },
  {
    name: "Mechanical",
    href: "/categories/mechanical",
  },
  {
    name: "Electrical",
    href: "/categories/electrical",
  },
  {
    name: "Instrumentation",
    href: "/categories/instrumentation",
  },
  {
    name: "Process",
    href: "/categories/process",
  },
];

const companyLinks = [
  {
    name: "About PetroHub",
    href: "/about",
  },
  {
    name: "Contact",
    href: "/contact",
  },
  {
    name: "Login",
    href: "/login",
  },
  {
    name: "Create Account",
    href: "/register",
  },
];

export default function Footer() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      {/* MAIN FOOTER */}

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* BRAND */}

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-xl font-black text-slate-950">
                P
              </div>

              <div>
                <p className="text-2xl font-extrabold tracking-tight text-white">
                  Petro
                  <span className="text-orange-500">
                    Hub
                  </span>
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Engineering Knowledge
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              PetroHub is an engineering
              knowledge platform providing
              practical articles, technical
              learning and professional
              resources across multiple
              engineering disciplines.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <FooterBadge>
                Engineering
              </FooterBadge>

              <FooterBadge>
                HSE
              </FooterBadge>

              <FooterBadge>
                Oil & Gas
              </FooterBadge>

              <FooterBadge>
                Technical Resources
              </FooterBadge>
            </div>
          </div>

          {/* PLATFORM */}

          <FooterColumn
            title="Platform"
            links={platformLinks}
          />

          {/* DISCIPLINES */}

          <FooterColumn
            title="Disciplines"
            links={categoryLinks}
          />

          {/* PETROHUB */}

          <FooterColumn
            title="PetroHub"
            links={companyLinks}
          />
        </div>

        {/* RESOURCE DISCLAIMER */}

        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
            Resource Notice
          </p>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-400">
            PetroHub provides engineering
            information and resources for
            educational and professional
            reference purposes. Copyright,
            ownership and usage rights of
            third-party materials remain
            with their respective authors,
            publishers and source
            organizations.
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-400">
            Â© {currentYear} PetroHub.
            All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/about"
              className="transition hover:text-orange-400"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-orange-400"
            >
              Contact
            </Link>

            <Link
              href="/library"
              className="transition hover:text-orange-400"
            >
              Library
            </Link>

            <Link
              href="/search"
              className="transition hover:text-orange-400"
            >
              Search
            </Link>

            <Link
              href="/"
              className="font-semibold text-orange-400 transition hover:text-orange-300"
            >
              Back to top â†‘
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================
   FOOTER COLUMN
========================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;

  links: {
    name: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h2 className="font-bold text-white">
        {title}
      </h2>

      <div className="mt-5 space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block text-sm transition hover:translate-x-1 hover:text-orange-400"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* =========================
   FOOTER BADGE
========================= */

function FooterBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400">
      {children}
    </span>
  );
}