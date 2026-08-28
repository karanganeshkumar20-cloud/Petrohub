import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getToken } from "next-auth/jwt";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type ProxyUser = {
  role?: string;
  isBlocked?: boolean;
};

export async function proxy(
  request: NextRequest
) {
  const { pathname } =
    request.nextUrl;

  /*
   * Protected areas
   */

  const isAdminRoute =
    pathname.startsWith(
      "/admin"
    );

  const isProfileRoute =
    pathname.startsWith(
      "/profile"
    );

  if (
    !isAdminRoute &&
    !isProfileRoute
  ) {
    return NextResponse.next();
  }

  /*
   * Read JWT
   */

  const token =
    await getToken({
      req: request,
      secret:
        process.env
          .NEXTAUTH_SECRET,
    });

  /*
   * Not logged in
   */

  if (!token) {
    const loginUrl =
      new URL(
        "/login",
        request.url
      );

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  /*
   * Email required for live
   * database account check
   */

  const email =
    typeof token.email ===
    "string"
      ? token.email
          .trim()
          .toLowerCase()
      : "";

  if (!email) {
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );
  }

  try {
    /*
     * IMPORTANT:
     * Check current user status
     * directly from MongoDB.
     *
     * This prevents an old JWT
     * from keeping access after
     * account block or role change.
     */

    await connectDB();

    const dbUser =
      (await User.findOne({
        email,
      })
        .select(
          "role isBlocked"
        )
        .lean()) as
        | ProxyUser
        | null;

    /*
     * Account deleted
     */

    if (!dbUser) {
      const loginUrl =
        new URL(
          "/login",
          request.url
        );

      loginUrl.searchParams.set(
        "error",
        "AccountUnavailable"
      );

      return NextResponse.redirect(
        loginUrl
      );
    }

    /*
     * Account blocked
     */

    if (
      dbUser.isBlocked ===
      true
    ) {
      const loginUrl =
        new URL(
          "/login",
          request.url
        );

      loginUrl.searchParams.set(
        "error",
        "AccountBlocked"
      );

      return NextResponse.redirect(
        loginUrl
      );
    }

    /*
     * Admin authorization
     *
     * Use live MongoDB role,
     * not old JWT role.
     */

    if (
      isAdminRoute &&
      dbUser.role !==
        "admin"
    ) {
      return NextResponse.redirect(
        new URL(
          "/",
          request.url
        )
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error(
      "Proxy authentication error:",
      error
    );

    /*
     * Fail closed for protected
     * account/admin areas.
     */

    return new NextResponse(
      "Authentication service temporarily unavailable.",
      {
        status: 503,
      }
    );
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
  ],
};