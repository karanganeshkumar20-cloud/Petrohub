import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactMessagesManager from "@/components/admin/ContactMessagesManager";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  ContactMessageModel,
} from "@/models/ContactMessage";

export const dynamic =
  "force-dynamic";

/* =========================================================
   LOAD CONTACT MESSAGES
========================================================= */

async function getMessages() {
  await connectDB();

  const messages =
    await ContactMessageModel.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

  return JSON.parse(
    JSON.stringify(
      messages
    )
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function AdminMessagesPage() {
  const messages =
    await getMessages();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
                PetroHub Communication
              </p>

              <h1 className="mt-3 text-4xl font-black">
                Contact Inbox
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-400">
                Review enquiries
                submitted through the
                PetroHub contact form,
                manage their status
                and respond directly
                by email.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-xl border border-slate-700 px-5 py-3 text-center text-sm font-bold text-slate-300 transition hover:border-orange-500 hover:text-white"
            >
              Admin Dashboard
            </Link>
          </div>

          <div className="mt-10">
            <ContactMessagesManager
              initialMessages={
                messages
              }
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}