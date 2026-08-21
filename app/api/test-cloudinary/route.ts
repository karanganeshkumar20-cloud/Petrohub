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

    if (!cloudName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "CLOUDINARY_CLOUD_NAME is missing",
        },
        {
          status: 500,
        }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "CLOUDINARY_API_KEY is missing",
        },
        {
          status: 500,
        }
      );
    }

    if (!apiSecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "CLOUDINARY_API_SECRET is missing",
        },
        {
          status: 500,
        }
      );
    }

    const result =
      await cloudinary.api.ping();

    return NextResponse.json({
      success: true,
      message:
        "Cloudinary connection successful",
      cloudName,
      apiKeyPresent: true,
      apiSecretPresent: true,
      cloudinaryStatus:
        result?.status || "ok",
    });
  } catch (error: any) {
    console.error(
      "Cloudinary diagnostic error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Cloudinary connection failed",
        httpCode:
          error?.http_code || null,
      },
      {
        status: 500,
      }
    );
  }
}