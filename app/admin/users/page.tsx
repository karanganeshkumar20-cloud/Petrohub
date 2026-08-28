import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import UsersManager from "../../../components/admin/UsersManager";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

async function getUsers() {
  await connectDB();

  const users = await User.find()
    .select(
      "_id name email role image isBlocked createdAt updatedAt"
    )
    .sort({
      createdAt: -1,
    })
    .lean();

  return JSON.parse(
    JSON.stringify(users)
  );
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
            PetroHub CMS
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Manage Users
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            Manage PetroHub users, roles and account access.
          </p>

          <div className="mt-10">
            <UsersManager initialUsers={users} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}