"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  signOut,
  useSession,
} from "next-auth/react";

import {
  usePathname,
} from "next/navigation";

/* =========================================================
   PRIMARY NAVIGATION
========================================================= */

const navigation = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Articles",
    href: "/articles",
  },
  {
    name: "Library",
    href: "/library",
  },
  {
    name: "Categories",
    href: "/categories",
  },
  {
    name: "Formulas",
    href: "/formulas",
  },
];

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const {
    data: session,
    status,
  } = useSession();

  const pathname =
    usePathname();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  /* =====================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ===================================================== */

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* =====================================================
     ESCAPE KEY
  ===================================================== */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setMobileOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =====================================================
     USER ROLE
  ===================================================== */

  const role = (
    session?.user as
      | {
          role?: string;
        }
      | undefined
  )?.role;

  const isAdmin =
    role === "admin";

  /* =====================================================
     ACTIVE LINK
  ===================================================== */

  function isActive(
    href: string
  ) {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-800/80
        bg-slate-950/90
        backdrop-blur-xl
      "
    >
      <nav
        aria-label="Primary navigation"
        className="
          mx-auto
          flex
          h-[72px]
          max-w-7xl
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
        "
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <Link
          href="/"
          aria-label="PetroHub home"
          className="
            group
            flex
            min-w-0
            shrink
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-orange-500
              text-lg
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

          <div className="min-w-0 leading-none">
            <p
              className="
                truncate
                text-xl
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
                hidden
                truncate
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-slate-500
                sm:block
              "
            >
              Engineering Knowledge
            </p>
          </div>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <div
          className="
            hidden
            items-center
            gap-1
            xl:flex
          "
        >
          {navigation.map(
            (item) => {
              const active =
                isActive(
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={
                    active
                      ? `
                        rounded-lg
                        bg-orange-500/10
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-orange-400
                      `
                      : `
                        rounded-lg
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-slate-300
                        transition
                        hover:bg-slate-900
                        hover:text-white
                      `
                  }
                >
                  {item.name}
                </Link>
              );
            }
          )}
        </div>

        {/* =================================================
            DESKTOP ACTIONS
        ================================================= */}

        <div
          className="
            hidden
            shrink-0
            items-center
            gap-2
            xl:flex
          "
        >
          {/* SEARCH */}

          <Link
            href="/search"
            aria-label="Search PetroHub"
            title="Search PetroHub"
            className={
              pathname.startsWith(
                "/search"
              )
                ? `
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-orange-500
                  bg-orange-500/10
                  text-orange-400
                `
                : `
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-slate-700
                  text-slate-300
                  transition
                  hover:border-orange-500
                  hover:text-orange-400
                `
            }
          >
            <SearchIcon />
          </Link>

          {/* PETROHUB AI */}

          <Link
            href="/ai"
            className={
              pathname.startsWith(
                "/ai"
              )
                ? `
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-orange-500
                  bg-orange-500/10
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-orange-400
                `
                : `
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-orange-500/40
                  bg-orange-500/5
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-orange-400
                  transition
                  hover:border-orange-500
                  hover:bg-orange-500/10
                `
            }
          >
            <SparklesIcon />

            <span>
              PetroHub AI
            </span>
          </Link>

          {/* ACCOUNT */}

          {status ===
          "loading" ? (
            <div
              className="
                h-10
                w-24
                animate-pulse
                rounded-lg
                bg-slate-800
              "
            />
          ) : session ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={
                    pathname.startsWith(
                      "/admin"
                    )
                      ? `
                        rounded-lg
                        border
                        border-orange-500
                        bg-orange-500/10
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-orange-400
                      `
                      : `
                        rounded-lg
                        border
                        border-slate-700
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-slate-300
                        transition
                        hover:border-orange-500
                        hover:text-orange-400
                      `
                  }
                >
                  Admin
                </Link>
              )}

              <Link
                href="/profile"
                className={
                  pathname.startsWith(
                    "/profile"
                  )
                    ? `
                      rounded-lg
                      border
                      border-orange-500
                      bg-orange-500/10
                      px-3
                      py-2
                      text-sm
                      font-semibold
                      text-orange-400
                    `
                    : `
                      rounded-lg
                      border
                      border-slate-700
                      px-3
                      py-2
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:border-orange-500
                      hover:text-orange-400
                    `
                }
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={() =>
                  signOut({
                    callbackUrl:
                      "/",
                  })
                }
                className="
                  rounded-lg
                  bg-orange-500
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-slate-950
                  transition
                  hover:bg-orange-400
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="
                  rounded-lg
                  border
                  border-slate-700
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:border-orange-500
                  hover:text-orange-400
                "
              >
                Login
              </Link>

              <Link
                href="/register"
                className="
                  rounded-lg
                  bg-orange-500
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-slate-950
                  transition
                  hover:bg-orange-400
                "
              >
                Join Free
              </Link>
            </>
          )}
        </div>

        {/* =================================================
            MOBILE / TABLET MENU BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (current) =>
                !current
            )
          }
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={
            mobileOpen
          }
          aria-controls="petrohub-mobile-menu"
          className="
            relative
            z-[60]
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-orange-500
            bg-orange-500
            text-slate-950
            shadow-lg
            shadow-orange-500/20
            transition
            hover:bg-orange-400
            xl:hidden
          "
        >
          {mobileOpen ? (
            <CloseIcon />
          ) : (
            <MenuIcon />
          )}
        </button>
      </nav>

      {/* =================================================
          MOBILE / TABLET MENU
      ================================================= */}

      {mobileOpen && (
        <div
          id="petrohub-mobile-menu"
          className="
            border-t
            border-slate-800
            bg-slate-950
            xl:hidden
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              py-5
              sm:px-6
            "
          >
            {/* SEARCH */}

            <Link
              href="/search"
              className="
                mb-4
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-700
                bg-slate-900/70
                px-4
                py-3
                font-semibold
                text-slate-300
                transition
                hover:border-orange-500
                hover:text-orange-400
              "
            >
              <SearchIcon />

              Search PetroHub
            </Link>

            {/* PRIMARY LINKS */}

            <div className="space-y-1">
              {navigation.map(
                (item) => {
                  const active =
                    isActive(
                      item.href
                    );

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                      className={
                        active
                          ? `
                            block
                            rounded-xl
                            bg-orange-500/10
                            px-4
                            py-3
                            font-semibold
                            text-orange-400
                          `
                          : `
                            block
                            rounded-xl
                            px-4
                            py-3
                            font-semibold
                            text-slate-300
                            transition
                            hover:bg-slate-900
                            hover:text-white
                          `
                      }
                    >
                      {
                        item.name
                      }
                    </Link>
                  );
                }
              )}
            </div>

            {/* PETROHUB AI */}

            <Link
              href="/ai"
              className="
                mt-3
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-orange-500/40
                bg-orange-500/5
                px-4
                py-3
                font-semibold
                text-orange-400
                transition
                hover:border-orange-500
                hover:bg-orange-500/10
              "
            >
              <SparklesIcon />

              PetroHub AI
            </Link>

            <div
              className="
                my-5
                border-t
                border-slate-800
              "
            />

            {/* ACCOUNT */}

            {status ===
            "loading" ? (
              <div
                className="
                  h-12
                  animate-pulse
                  rounded-xl
                  bg-slate-900
                "
              />
            ) : session ? (
              <div className="space-y-3">
                <div
                  className="
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900/70
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >
                    Signed in as
                  </p>

                  <p
                    className="
                      mt-2
                      truncate
                      font-semibold
                      text-white
                    "
                  >
                    {session.user
                      ?.name ||
                      session.user
                        ?.email ||
                      "PetroHub User"}
                  </p>

                  {isAdmin && (
                    <span
                      className="
                        mt-2
                        inline-block
                        rounded-full
                        bg-orange-500/10
                        px-3
                        py-1
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-orange-400
                      "
                    >
                      Admin
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="
                      block
                      rounded-xl
                      border
                      border-orange-500/40
                      bg-orange-500/10
                      px-4
                      py-3
                      text-center
                      font-semibold
                      text-orange-400
                      transition
                      hover:bg-orange-500/20
                    "
                  >
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="
                    block
                    rounded-xl
                    border
                    border-slate-700
                    px-4
                    py-3
                    text-center
                    font-semibold
                    text-white
                    transition
                    hover:border-orange-500
                    hover:text-orange-400
                  "
                >
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    signOut({
                      callbackUrl:
                        "/",
                    })
                  }
                  className="
                    w-full
                    rounded-xl
                    bg-orange-500
                    px-4
                    py-3
                    font-bold
                    text-slate-950
                    transition
                    hover:bg-orange-400
                  "
                >
                  Logout
                </button>
              </div>
            ) : (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <Link
                  href="/login"
                  className="
                    rounded-xl
                    border
                    border-slate-700
                    px-4
                    py-3
                    text-center
                    font-semibold
                    text-white
                    transition
                    hover:border-orange-500
                    hover:text-orange-400
                  "
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="
                    rounded-xl
                    bg-orange-500
                    px-4
                    py-3
                    text-center
                    font-bold
                    text-slate-950
                    transition
                    hover:bg-orange-400
                  "
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
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
    >
      <circle
        cx="11"
        cy="11"
        r="8"
      />

      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* =========================================================
   AI ICON
========================================================= */

function SparklesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.8 4.2L6 9l4.2 1.8L12 15l1.8-4.2L18 9l-4.2-1.8L12 3Z" />

      <path d="m19 15-.9 2.1L16 18l2.1.9L19 21l.9-2.1L22 18l-2.1-.9L19 15Z" />
    </svg>
  );
}

/* =========================================================
   MENU ICON
========================================================= */

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

/* =========================================================
   CLOSE ICON
========================================================= */

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}