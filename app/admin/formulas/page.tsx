import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import FormulaManager from "@/components/admin/FormulaManager";

export default function AdminFormulasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.22em] text-orange-500">
            PetroHub Engineering Tools
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Formula Management
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Review, verify and publish engineering formulas.
            Public calculators may only use verified formulas
            connected to trusted deterministic calculation engines.
          </p>

          <div className="mt-10">
            <FormulaManager />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}