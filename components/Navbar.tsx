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
   NAVIGATION
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
    name: "Search",
    href: "/search",
  },
  {
    name: "PetroHub AI",
    href: "/ai",
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
      return (
        pathname === "/"
      );
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
        border-slate-800
        bg-slate-950/95
        backdrop-blur-xl
      "
    >
      {/* =================================================
          MAIN NAVBAR
      ================================================= */}

      <nav
        className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          gap-4
          px-4
          py-4
          sm:px-6
        "
      >
        {/* ===============================================
            LOGO
        =============================================== */}

        <Link
          href="/"
          className="
            group
            flex
            shrink-0
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-orange-500
              text-lg
              font-black
              text-white
              shadow-lg
              shadow-orange-500/10
            "
          >
            P
          </div>

          <div>
            <p
              className="
                text-xl
                font-extrabold
                tracking-tight
                text-white
                transition
                group-hover:text-orange-400
              "
            >
              Petro

              <span className="text-orange-500">
                Hub
              </span>
            </p>

            <p
              className="
                hidden
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-slate-500
                xl:block
              "
            >
              Engineering Knowledge
            </p>
          </div>
        </Link>

        {/* ===============================================
            DESKTOP NAVIGATION
        =============================================== */}

        <div
          className="
            hidden
            items-center
            gap-1
            lg:flex
          "
        >
          {navigation.map(
            (item) => {
              const active =
                isActive(
                  item.href
                );

              const isAI =
                item.href ===
                "/ai";

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
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
                      : isAI
                      ? `
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
                      : `
                        rounded-lg
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-slate-300
                        transition
                        hover:bg-slate-900
                        hover:text-orange-400
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

        {/* ===============================================
            DESKTOP ACCOUNT
        =============================================== */}

        <div
          className="
            hidden
            shrink-0
            items-center
            gap-2
            md:flex
          "
        >
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
              {/* ADMIN */}

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

              {/* PROFILE */}

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

              {/* LOGOUT */}

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
                  text-white
                  transition
                  hover:bg-orange-600
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* LOGIN */}

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

              {/* REGISTER */}

              <Link
                href="/register"
                className="
                  rounded-lg
                  bg-orange-500
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-orange-600
                "
              >
                Join Free
              </Link>
            </>
          )}
        </div>

        {/* ===============================================
            MOBILE MENU BUTTON
        =============================================== */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (current) =>
                !current
            )
          }
          aria-label="Toggle navigation menu"
          aria-expanded={
            mobileOpen
          }
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            border-slate-700
            text-slate-300
            transition
            hover:border-orange-500
            hover:text-orange-400
            md:hidden
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
          MOBILE MENU
      ================================================= */}

      {mobileOpen && (
        <div
          className="
            border-t
            border-slate-800
            bg-slate-950
            md:hidden
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-5
              py-5
            "
          >
            {/* ===========================================
                MOBILE LINKS
            =========================================== */}

            <div className="space-y-1">
              {navigation.map(
                (item) => {
                  const active =
                    isActive(
                      item.href
                    );

                  const isAI =
                    item.href ===
                      "/ai";

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
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
                          : isAI
                          ? `
                            block
                            rounded-xl
                            border
                            border-orange-500/30
                            bg-orange-500/5
                            px-4
                            py-3
                            font-semibold
                            text-orange-400
                            transition
                            hover:bg-orange-500/10
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
                            hover:text-orange-400
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

            {/* DIVIDER */}

            <div
              className="
                my-5
                border-t
                border-slate-800
              "
            />

            {/* ===========================================
                MOBILE ACCOUNT
            =========================================== */}

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
                {/* USER INFO */}

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900
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

                {/* ADMIN */}

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

                {/* PROFILE */}

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

                {/* LOGOUT */}

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
                    font-semibold
                    text-white
                    transition
                    hover:bg-orange-600
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
                    font-semibold
                    text-white
                    transition
                    hover:bg-orange-600
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
   MENU ICON
========================================================= */

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}