import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getServerSession,
} from "next-auth";

import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";

import {
  BookmarkModel,
} from "@/models/Bookmark";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================
   DELETE BOOKMARK
========================= */

export async function DELETE(
  _request: NextRequest,
  { params }: RouteProps
) {
  try {
    /* =========================
       SESSION CHECK
    ========================= */

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
          message:
            "Login required",
        },
        {
          status: 401,
        }
      );
    }

    /* =========================
       BOOKMARK ID
    ========================= */

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
            "Invalid bookmark ID",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /* =========================
       FIND CURRENT USER
    ========================= */

    const user =
      await User.findOne({
        email:
          session.user.email
            .trim()
            .toLowerCase(),
      })
        .select(
          "_id isBlocked"
        )
        .exec();

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

    /* =========================
       BLOCKED USER CHECK
    ========================= */

    const isBlocked =
      user.get(
        "isBlocked"
      ) === true;

    if (isBlocked) {
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

    /*
     * Explicit user ID extraction.
     * This avoids Mongoose lean()
     * TypeScript union issues.
     */

    const userId =
      user.get(
        "_id"
      ) as mongoose.Types.ObjectId;

    /* =========================
       DELETE BOOKMARK
    ========================= */

    const bookmark =
      await BookmarkModel.findOneAndDelete(
        {
          _id:
            new mongoose.Types.ObjectId(
              id
            ),

          userId:
            userId,
        }
      );

    if (!bookmark) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bookmark not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      saved: false,
      message:
        "Bookmark removed successfully",
    });
  } catch (error) {
    console.error(
      "Bookmark DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to remove bookmark",
      },
      {
        status: 500,
      }
    );
  }
}