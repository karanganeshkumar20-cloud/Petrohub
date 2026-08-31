import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getServerSession,
} from "next-auth";

import bcrypt from "bcryptjs";

import {
  authOptions,
} from "@/lib/auth";

import {
  connectDB,
} from "@/lib/mongodb";

import User from "@/models/User";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Login required",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const currentPassword =
      typeof body?.currentPassword ===
      "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body?.newPassword ===
      "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body?.confirmPassword ===
      "string"
        ? body.confirmPassword
        : "";

    /* =========================
       VALIDATION
    ========================= */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All password fields are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newPassword.length < 8
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be at least 8 characters",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newPassword.length > 128
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password is too long",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New passwords do not match",
        },
        {
          status: 400,
        }
      );
    }

    if (
      currentPassword ===
      newPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be different from current password",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const email =
      session.user.email
        .trim()
        .toLowerCase();

    /*
     * Password field must be loaded
     * so that we can verify the
     * current password.
     */
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      user.get(
        "isBlocked"
      ) === true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Account blocked",
        },
        {
          status: 403,
        }
      );
    }

    const storedPassword =
      user.get(
        "password"
      );

    if (
      typeof storedPassword !==
      "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password information is unavailable",
        },
        {
          status: 500,
        }
      );
    }

    /* =========================
       VERIFY CURRENT PASSWORD
    ========================= */

    const validPassword =
      await bcrypt.compare(
        currentPassword,
        storedPassword
      );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Current password is incorrect",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       HASH NEW PASSWORD
    ========================= */

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    user.set(
      "password",
      hashedPassword
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Password change error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to change password",
      },
      {
        status: 500,
      }
    );
  }
}