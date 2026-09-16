import {
  getServerSession,
} from "next-auth";

import type {
  Session,
} from "next-auth";

import {
  authOptions,
} from "@/lib/auth";

/* =========================================================
   TYPES
========================================================= */

type AdminUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
};

export type AdminAuthResult = {
  authorized: boolean;

  session:
    | Session
    | null;

  user:
    | AdminUser
    | null;

  status: number;

  message: string;
};

/* =========================================================
   REQUIRE ADMIN
========================================================= */

export async function requireAdmin(): Promise<AdminAuthResult> {
  const session =
    await getServerSession(
      authOptions
    );

  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (!session?.user) {
    return {
      authorized:
        false,

      session:
        null,

      user:
        null,

      status:
        401,

      message:
        "Unauthorized",
    };
  }

  const user =
    session.user as AdminUser;

  /* =====================================================
     LOGGED IN BUT NOT ADMIN
  ===================================================== */

  if (
    user.role !==
    "admin"
  ) {
    return {
      authorized:
        false,

      session,

      user,

      status:
        403,

      message:
        "Admin access required",
    };
  }

  /* =====================================================
     ADMIN
  ===================================================== */

  return {
    authorized:
      true,

    session,

    user,

    status:
      200,

    message:
      "Authorized",
  };
}