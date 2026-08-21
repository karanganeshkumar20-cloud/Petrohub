import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import ContactMessagesManager from "@/components/admin/ContactMessagesManager";

import { connectDB } from "@/lib/mongodb";

import {
  ContactMessageModel,
} from "@/models/ContactMessage";

export const dynamic =
  "force-dynamic";

async function getMessages() {
  await connectDB();

  const messages =
    await ContactMessageModel.find()
      .sort({
        createdAt: -1,
      })
      .lean();

  return JSON.parse(
    JSON.stringify(messages)
  );
}

export default async function AdminMessagesPage() {
  const messages =
    await getMessages();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
              PetroHub CMS
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Contact Messages
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-slate-400">
              Review messages
              submitted through the
              PetroHub contact form,
              update their status and
              remove messages that are
              no longer required.
            </p>
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