import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_35%)]" />

      <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
            Engineering knowledge, simplified
          </span>

          <h1 className="mt-7 text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Learn. Explore.
            <span className="block text-orange-500">Build Expertise.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            PetroHub is a modern knowledge platform for Oil & Gas, HSE,
            Mechanical, Electrical, Civil, Process and Instrumentation
            professionals.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/articles"
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Explore Articles
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-slate-700 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              Create Free Account
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-400">
            <div>
              <p className="text-2xl font-bold text-white">8+</p>
              <p>Engineering categories</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p>Free to explore</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p>Knowledge access</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-orange-950/20">
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Featured Topic</p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Permit to Work System
                </h2>
              </div>

              <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm font-semibold text-orange-400">
                HSE
              </span>
            </div>

            <p className="mt-5 leading-7 text-slate-400">
              Understand the purpose, responsibilities, control measures and
              safe implementation of a permit to work system.
            </p>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm font-semibold text-slate-300">
                What you will learn
              </p>

              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <p>✓ Types of permits</p>
                <p>✓ Roles and responsibilities</p>
                <p>✓ Hazard control process</p>
                <p>✓ Permit closure requirements</p>
              </div>
            </div>

            <Link
              href="/articles"
              className="mt-6 inline-block font-semibold text-orange-400 hover:text-orange-300"
            >
              Read featured article →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}