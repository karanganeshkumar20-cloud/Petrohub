"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";

import Link from "next/link";

import {
  signIn,
} from "next-auth/react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* =========================================================
   PAGE
========================================================= */

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <LoginLoading />
      }
    >
      <LoginContent />
    </Suspense>
  );
}

/* =========================================================
   LOGIN CONTENT
========================================================= */

function LoginContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const callbackUrl =
    getSafeCallbackUrl(
      searchParams.get(
        "callbackUrl"
      )
    );

  const queryError =
    getQueryErrorMessage(
      searchParams.get(
        "error"
      )
    );

  /* =====================================================
     LOGIN
  ===================================================== */

  async function handleLogin(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      !normalizedEmail
    ) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (
      !password
    ) {
      setError(
        "Please enter your password."
      );

      return;
    }

    setLoading(
      true
    );

    setError(
      ""
    );

    try {
      const result =
        await signIn(
          "credentials",
          {
            email:
              normalizedEmail,

            password,

            redirect:
              false,
          }
        );

      if (
        !result
      ) {
        throw new Error(
          "Unable to sign in. Please try again."
        );
      }

      if (
        result.error
      ) {
        setError(
          getLoginErrorMessage(
            result.error
          )
        );

        return;
      }

      router.push(
        callbackUrl
      );

      router.refresh();
    } catch (loginError) {
      console.error(
        "Login error:",
        loginError
      );

      setError(
        loginError instanceof
          Error
          ? loginError.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  const visibleError =
    error ||
    queryError;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden border-b border-slate-800 px-5 py-16 sm:px-6 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_460px] lg:items-center">
          {/* INTRO */}

          <div>
            <p className="font-semibold uppercase tracking-[0.22em] text-orange-500">
              PetroHub Account
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Sign in to your
              engineering
              dashboard.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Access saved
              engineering
              resources, reading
              history, account
              settings and your
              personal PetroHub
              workspace.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <FeatureCard
                title="Saved Knowledge"
                description="Keep useful articles and library resources in one place."
              />

              <FeatureCard
                title="Reading History"
                description="Return to engineering content you viewed previously."
              />

              <FeatureCard
                title="Account Settings"
                description="Manage your profile and password securely."
              />

              <FeatureCard
                title="Engineering Platform"
                description="Access articles, resources, categories and formulas."
              />
            </div>
          </div>

          {/* LOGIN CARD */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-400">
                Welcome Back
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Login to PetroHub
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Enter your
                registered email
                and password.
              </p>
            </div>

            {/* ERROR */}

            {visibleError && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4"
              >
                <p className="font-semibold text-red-300">
                  Unable to sign in
                </p>

                <p className="mt-1 text-sm leading-6 text-red-400">
                  {
                    visibleError
                  }
                </p>
              </div>
            )}

            <form
              onSubmit={
                handleLogin
              }
              className="mt-7"
            >
              {/* EMAIL */}

              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-300"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target
                      .value
                  )
                }
                autoComplete="email"
                required
                disabled={
                  loading
                }
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {/* PASSWORD */}

              <div className="mt-5">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-300"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event.target
                          .value
                      )
                    }
                    autoComplete="current-password"
                    required
                    disabled={
                      loading
                    }
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    disabled={
                      loading
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 transition hover:text-orange-400 disabled:opacity-50"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            {/* REGISTER */}

            <div className="mt-7 border-t border-slate-800 pt-6">
              <p className="text-center text-sm text-slate-400">
                Don't have a
                PetroHub account?
              </p>

              <Link
                href="/register"
                className="mt-3 block rounded-xl border border-slate-700 px-5 py-3 text-center font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                Create Account
              </Link>
            </div>

            {/* HELP */}

            <p className="mt-5 text-center text-xs leading-5 text-slate-600">
              If your account has
              been blocked or you
              cannot access it,
              contact PetroHub
              support.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="font-bold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {
          description
        }
      </p>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoginLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <p className="font-semibold text-orange-400">
            Loading login...
          </p>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   CALLBACK URL
========================================================= */

function getSafeCallbackUrl(
  value: string | null
) {
  if (
    !value
  ) {
    return "/profile";
  }

  /*
   * Only allow local paths.
   * Prevent external redirect URLs.
   */
  if (
    !value.startsWith(
      "/"
    ) ||
    value.startsWith(
      "//"
    )
  ) {
    return "/profile";
  }

  return value;
}

/* =========================================================
   LOGIN ERROR
========================================================= */

function getLoginErrorMessage(
  error: string
) {
  const normalized =
    error.toLowerCase();

  if (
    normalized.includes(
      "blocked"
    ) ||
    error ===
      "AccountBlocked"
  ) {
    return "Your PetroHub account has been blocked. Please contact the administrator.";
  }

  if (
    error ===
      "CredentialsSignin" ||
    normalized.includes(
      "invalid email"
    ) ||
    normalized.includes(
      "password"
    )
  ) {
    return "Invalid email or password.";
  }

  return "Unable to sign in. Please check your details and try again.";
}

/* =========================================================
   QUERY ERROR
========================================================= */

function getQueryErrorMessage(
  error: string | null
) {
  if (
    !error
  ) {
    return "";
  }

  if (
    error ===
    "AccountBlocked"
  ) {
    return "Your PetroHub account has been blocked. Please contact the administrator.";
  }

  if (
    error ===
    "CredentialsSignin"
  ) {
    return "Invalid email or password.";
  }

  return "";
}