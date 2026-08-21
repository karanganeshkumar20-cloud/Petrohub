import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
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

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env.CLOUDINARY_API_KEY;

    const apiSecret =
      process.env.CLOUDINARY_API_SECRET;

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

    const timestamp = Math.round(
      Date.now() / 1000
    );

    const folder =
      "petrohub/articles";

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
      "Image signature error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create image upload signature",
      },
      {
        status: 500,
      }
    );
  }
}