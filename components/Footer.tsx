import Link from "next/link";

/* =========================================================
   FOOTER LINKS
========================================================= */

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
    name: "Formulas & Calculators",
    href: "/formulas",
  },
  {
    name: "Categories",
    href: "/categories",
  },
  {
    name: "Search",
    href: "/search",
  },
  {
    name: "PetroHub AI",
    href: "/ai",
  },
];

const disciplineLinks = [
  {
    name: "Oil & Gas",
    href: "/categories/oil-gas",
  },
  {
    name: "HSE",
    href: "/categories/hse",
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
  {
    name: "Civil",
    href: "/categories/civil",
  },
  {
    name: "Geology",
    href: "/categories/geology",
  },
];

const petroHubLinks = [
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

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer
      className="
        border-t
        border-slate-800
        bg-slate-950
        text-slate-400
      "
    >
      {/* =================================================
          MAIN FOOTER
      ================================================= */}

      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          py-14
          sm:px-6
          lg:py-16
        "
      >
        <div
          className="
            grid
            gap-12
            sm:grid-cols-2
            lg:grid-cols-[1.5fr_1fr_1fr_1fr]
          "
        >
          {/* ===============================================
              BRAND
          =============================================== */}

          <div>
            <Link
              href="/"
              aria-label="PetroHub home"
              className="
                group
                inline-flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-500
                  text-xl
                  font-black
                  text-slate-950
                  shadow-lg
                  shadow-orange-500/10
                  transition
                  group-hover:bg-orange-400
                "
              >
                P
              </div>

              <div>
                <p
                  className="
                    text-2xl
                    font-extrabold
                    tracking-tight
                    text-white
                  "
                >
                  Petro
                  <span className="text-orange-500">
                    Hub
                  </span>
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-slate-500
                  "
                >
                  Engineering Knowledge
                </p>
              </div>
            </Link>

            <p
              className="
                mt-5
                max-w-md
                text-sm
                leading-7
                text-slate-400
              "
            >
              PetroHub is an engineering
              knowledge and calculation
              platform for students,
              professionals and engineers
              across Oil &amp; Gas, HSE and
              multiple engineering
              disciplines.
            </p>

            {/* BADGES */}

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2
              "
            >
              <FooterBadge>
                Engineering
              </FooterBadge>

              <FooterBadge>
                Oil &amp; Gas
              </FooterBadge>

              <FooterBadge>
                HSE
              </FooterBadge>

              <FooterBadge>
                Calculators
              </FooterBadge>
            </div>

            {/* QUICK CTA */}

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
                  rounded-xl
                  bg-orange-500
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-slate-950
                  transition
                  hover:bg-orange-400
                "
              >
                Open Calculators
              </Link>

              <Link
                href="/ai"
                className="
                  rounded-xl
                  border
                  border-slate-700
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:border-orange-500
                  hover:text-orange-400
                "
              >
                PetroHub AI
              </Link>
            </div>
          </div>

          {/* ===============================================
              PLATFORM
          =============================================== */}

          <FooterColumn
            title="Platform"
            links={
              platformLinks
            }
          />

          {/* ===============================================
              DISCIPLINES
          =============================================== */}

          <FooterColumn
            title="Disciplines"
            links={
              disciplineLinks
            }
          />

          {/* ===============================================
              PETROHUB
          =============================================== */}

          <FooterColumn
            title="PetroHub"
            links={
              petroHubLinks
            }
          />
        </div>

        {/* =================================================
            ENGINEERING NOTICE
        ================================================= */}

        <div
          className="
            mt-12
            grid
            gap-5
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/50
            p-5
            md:grid-cols-2
            md:p-6
          "
        >
          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-orange-500
              "
            >
              Engineering Notice
            </p>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-400
              "
            >
              PetroHub formulas,
              calculators and technical
              information are provided for
              educational and professional
              reference purposes. Results
              should be independently
              verified before engineering,
              operational or safety-critical
              use.
            </p>
          </div>

          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-orange-500
              "
            >
              Resource Notice
            </p>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-400
              "
            >
              Copyright and usage rights
              for third-party books,
              manuals, standards and other
              resources remain with their
              respective authors,
              publishers and source
              organizations.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          BOTTOM BAR
      ================================================= */}

      <div
        className="
          border-t
          border-slate-800
          bg-slate-950
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-4
            px-4
            py-6
            text-sm
            sm:px-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <p className="text-slate-400">
              &copy; {currentYear} PetroHub.
              All rights reserved.
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-600
              "
            >
              Engineering knowledge,
              calculations and professional
              resources in one platform.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-5
              gap-y-3
            "
          >
            <Link
              href="/about"
              className="
                transition
                hover:text-orange-400
              "
            >
              About
            </Link>

            <Link
              href="/contact"
              className="
                transition
                hover:text-orange-400
              "
            >
              Contact
            </Link>

            <Link
              href="/formulas"
              className="
                transition
                hover:text-orange-400
              "
            >
              Formulas
            </Link>

            <Link
              href="/library"
              className="
                transition
                hover:text-orange-400
              "
            >
              Library
            </Link>

            <Link
              href="/search"
              className="
                transition
                hover:text-orange-400
              "
            >
              Search
            </Link>

            <Link
              href="/"
              className="
                font-semibold
                text-orange-400
                transition
                hover:text-orange-300
              "
            >
              Back to top &uarr;
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

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
      <h2
        className="
          text-sm
          font-bold
          uppercase
          tracking-[0.12em]
          text-white
        "
      >
        {title}
      </h2>

      <div
        className="
          mt-5
          space-y-3
        "
      >
        {links.map(
          (link) => (
            <Link
              key={
                link.href
              }
              href={
                link.href
              }
              className="
                block
                text-sm
                transition
                hover:translate-x-1
                hover:text-orange-400
              "
            >
              {link.name}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FOOTER BADGE
========================================================= */

function FooterBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="
        rounded-full
        border
        border-slate-800
        bg-slate-900
        px-3
        py-1.5
        text-xs
        font-semibold
        text-slate-400
      "
    >
      {children}
    </span>
  );
}
