import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import cloudinary from "@/lib/cloudinary";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.email) {
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
          "_id isBlocked"
        )
        .exec();

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

    const cloudName =
      process.env
        .CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env
        .CLOUDINARY_API_KEY;

    const apiSecret =
      process.env
        .CLOUDINARY_API_SECRET;

    if (
      !cloudName ||
      !apiKey ||
      !apiSecret
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cloudinary configuration is incomplete",
        },
        {
          status: 500,
        }
      );
    }

    const timestamp =
      Math.round(
        Date.now() / 1000
      );

    const folder =
      "petrohub/profiles";

    const signature =
      cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
        },
        apiSecret
      );

    return NextResponse.json({
      success: true,
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
    });
  } catch (error) {
    console.error(
      "Profile image signature error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to prepare profile image upload",
      },
      {
        status: 500,
      }
    );
  }
}