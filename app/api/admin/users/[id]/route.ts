import {
  NextRequest,
  NextResponse,
} from "next/server";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";
import { authOptions } from "@/lib/auth";

import User from "@/models/User";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   UPDATE USER
   - Change role
   - Block / Unblock
========================================================= */

export async function PATCH(
  request: NextRequest,
  { params }: RouteProps
) {
  try {
    const admin = await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
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

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    await connectDB();

    const user =
      await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const isSelf =
      user.email.toLowerCase() ===
      session.user.email.toLowerCase();

    /* =========================
       ROLE CHANGE
    ========================= */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "role"
      )
    ) {
      if (
        !["user", "admin"].includes(
          body.role
        )
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

      if (isSelf) {
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

      /*
       * Protect final admin
       */

      if (
        user.role === "admin" &&
        body.role === "user"
      ) {
        const adminCount =
          await User.countDocuments({
            role: "admin",
          });

        if (adminCount <= 1) {
          return NextResponse.json(
            {
              success: false,
              message:
                "The final administrator cannot be demoted.",
            },
            {
              status: 400,
            }
          );
        }
      }

      user.role = body.role;
    }

    /* =========================
       BLOCK / UNBLOCK
    ========================= */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "isBlocked"
      )
    ) {
      if (
        typeof body.isBlocked !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid block status",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Admin cannot block themselves
       */

      if (isSelf) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You cannot block your own account.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Protect final admin
       */

      if (
        user.role === "admin" &&
        body.isBlocked === true
      ) {
        const activeAdminCount =
          await User.countDocuments({
            role: "admin",
            isBlocked: {
              $ne: true,
            },
          });

        if (activeAdminCount <= 1) {
          return NextResponse.json(
            {
              success: false,
              message:
                "The final active administrator cannot be blocked.",
            },
            {
              status: 400,
            }
          );
        }
      }

      user.isBlocked =
        body.isBlocked;
    }

    await user.save();

    return NextResponse.json({
      success: true,

      message:
        "User updated successfully",

      user: {
        _id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        isBlocked:
          user.isBlocked === true,
      },
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

/* =========================================================
   DELETE USER
========================================================= */

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
          message: admin.message,
        },
        {
          status: admin.status,
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

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const user =
      await User.findById(id);

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

    const isSelf =
      user.email.toLowerCase() ===
      session.user.email.toLowerCase();

    if (isSelf) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot delete your own account.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Protect final admin
     */

    if (
      user.role === "admin"
    ) {
      const adminCount =
        await User.countDocuments({
          role: "admin",
        });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            message:
              "The final administrator cannot be deleted.",
          },
          {
            status: 400,
          }
        );
      }
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