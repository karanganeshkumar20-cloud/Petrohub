import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getServerSession,
} from "next-auth";

import {
  authOptions,
} from "@/lib/auth";

import {
  connectDB,
} from "@/lib/mongodb";

import User from "@/models/User";

export const runtime = "nodejs";

/* =========================
   GET PROFILE
========================= */

export async function GET() {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Login required",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const user =
      await User.findOne({
        email:
          session.user.email
            .trim()
            .toLowerCase(),
      })
        .select(
          "_id name email role image isBlocked"
        )
        .lean();

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

    const typedUser =
      user as {
        _id: unknown;
        name?: string;
        email?: string;
        role?: string;
        image?: string;
        isBlocked?: boolean;
      };

    if (
      typedUser.isBlocked ===
      true
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Account blocked",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({
      success: true,

      user: {
        id: String(
          typedUser._id
        ),

        name:
          typedUser.name || "",

        email:
          typedUser.email || "",

        role:
          typedUser.role ||
          "user",

        image:
          typedUser.image || "",
      },
    });
  } catch (error) {
    console.error(
      "Profile GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load profile",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   UPDATE PROFILE
========================= */

export async function PATCH(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Login required",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const name =
      typeof body?.name ===
      "string"
        ? body.name.trim()
        : "";

    const image =
      typeof body?.image ===
      "string"
        ? body.image.trim()
        : "";

    /* =========================
       VALIDATION
    ========================= */

    if (
      name.length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name must contain at least 2 characters",
        },
        {
          status: 400,
        }
      );
    }

    if (
      name.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name is too long",
        },
        {
          status: 400,
        }
      );
    }

    if (
      image &&
      !/^https?:\/\//i.test(
        image
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid profile image URL",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const user =
      await User.findOne({
        email:
          session.user.email
            .trim()
            .toLowerCase(),
      });

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

    if (
      user.get(
        "isBlocked"
      ) === true
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Account blocked",
        },
        {
          status: 403,
        }
      );
    }

    user.set(
      "name",
      name
    );

    user.set(
      "image",
      image
    );

    await user.save();

    return NextResponse.json({
      success: true,

      message:
        "Profile updated successfully",

      user: {
        id: String(
          user.get("_id")
        ),

        name:
          user.get("name"),

        email:
          user.get("email"),

        role:
          user.get("role"),

        image:
          user.get("image") || "",
      },
    });
  } catch (error) {
    console.error(
      "Profile PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update profile",
      },
      {
        status: 500,
      }
    );
  }
}