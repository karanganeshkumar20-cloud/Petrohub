import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getServerSession,
} from "next-auth";

import mongoose from "mongoose";

import {
  authOptions,
} from "@/lib/auth";

import {
  connectDB,
} from "@/lib/mongodb";

import User from "@/models/User";

import {
  ReadingHistoryModel,
} from "@/models/ReadingHistory";

export const runtime =
  "nodejs";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: RouteProps
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
          message:
            "Login required",
        },
        {
          status: 401,
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
            "Invalid history ID",
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

    const userId =
      user.get(
        "_id"
      ) as
        mongoose.Types.ObjectId;

    const deleted =
      await ReadingHistoryModel.findOneAndDelete(
        {
          _id:
            new mongoose.Types.ObjectId(
              id
            ),

          userId,
        }
      );

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,

          message:
            "History item not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "History item removed",
    });
  } catch (error) {
    console.error(
      "History item DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to remove history item",
      },
      {
        status: 500,
      }
    );
  }
}