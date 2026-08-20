import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF file is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF files are allowed",
        },
        {
          status: 400,
        }
      );
    }

    const maxSize = 25 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF must be smaller than 25 MB",
        },
        {
          status: 400,
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "petrohub/library",
          resource_type: "raw",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error("Cloudinary returned no result")
            );
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      stream.end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        message: "PDF uploaded successfully",
        url: result.secure_url,
        publicId: result.public_id,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("PDF upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "PDF upload failed",
      },
      {
        status: 500,
      }
    );
  }
}