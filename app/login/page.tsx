"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      alert("Invalid Email or Password");
      return;
    }

    alert("Login Successful ✅");
    router.push("/profile");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="mx-auto flex max-w-md flex-col px-6 py-20">
        <h1 className="text-center text-4xl font-bold">
          Login to PetroHub
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Access your engineering knowledge dashboard.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <label className="text-sm text-gray-300">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-orange-500"
          />

          <label className="mt-5 block text-sm text-gray-300">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-orange-500"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-orange-500 py-3 font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-6 text-center text-gray-400">
            Don't have an account?

            <Link
              href="/register"
              className="ml-2 text-orange-500 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}