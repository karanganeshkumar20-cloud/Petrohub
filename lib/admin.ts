import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      authorized: false,
      status: 401,
      message: "Please login first",
    };
  }

  const role = (session.user as { role?: string }).role;

  if (role !== "admin") {
    return {
      authorized: false,
      status: 403,
      message: "Admin access required",
    };
  }

  return {
    authorized: true,
    status: 200,
    message: "Authorized",
  };
}