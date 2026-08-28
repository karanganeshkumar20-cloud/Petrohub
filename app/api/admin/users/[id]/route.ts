import {
  NextRequest,
  NextResponse,
} from "next/server";

import mongoose from "mongoose";

import {
  getServerSession,
} from "next-auth";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";

import User from "@/models/User";

import {
  authOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteProps
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        {
          success: false,
          message:
            admin.message,
        },
        {
          status:
            admin.status,
        }
      );
    }

    const { id } =
      await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user ID",
        },
        {
          status: 400,
        }
      );
    }

    const session =
      await getServerSession(
        authOptions
      );

    const body =
      await request.json();

    const role =
      typeof body.role ===
      "string"
        ? body.role
        : "";

    if (
      ![
        "user",
        "admin",
      ].includes(role)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user role",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const user =
      await User.findById(
        id
      );

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
      session?.user?.email &&
      user.email.toLowerCase() ===
        session.user.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot change your own role.",
        },
        {
          status: 400,
        }
      );
    }

    user.role = role;

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "User role updated",
    });
  } catch (error) {
    console.error(
      "Admin user update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update user",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteProps
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        {
          success: false,
          message:
            admin.message,
        },
        {
          status:
            admin.status,
        }
      );
    }

    const { id } =
      await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user ID",
        },
        {
          status: 400,
        }
      );
    }

    const session =
      await getServerSession(
        authOptions
      );

    await connectDB();

    const user =
      await User.findById(
        id
      );

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
      session?.user?.email &&
      user.email.toLowerCase() ===
        session.user.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot delete your own account from the admin panel.",
        },
        {
          status: 400,
        }
      );
    }

    await User.findByIdAndDelete(
      id
    );

    return NextResponse.json({
      success: true,
      message:
        "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "Admin user delete error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete user",
      },
      {
        status: 500,
      }
    );
  }
}