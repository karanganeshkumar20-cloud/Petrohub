import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardCard from "@/components/DashboardCard";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <h1>Please login first.</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-bold">
          Welcome, {session.user?.name} 👋
        </h1>

        <p className="mt-2 text-gray-400">
          {session.user?.email}
        </p>

        <p className="mt-1 text-orange-400 font-medium">
          Role: {(session.user as any).role}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <DashboardCard
            title="Articles Read"
            value={0}
          />

          <DashboardCard
            title="Saved Articles"
            value={0}
          />

          <DashboardCard
            title="My Articles"
            value={0}
          />

        </div>

        <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-semibold">
            Quick Actions
          </h2>

          <div className="mt-6 flex flex-wrap gap-4">

            <button className="rounded-lg bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-600">
              Browse Articles
            </button>

            <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700">
              Categories
            </button>

            <button className="rounded-lg bg-green-600 px-5 py-3 font-semibold hover:bg-green-700">
              Edit Profile
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}