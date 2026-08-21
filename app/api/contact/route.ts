import {
  NextRequest,
  NextResponse,
} from "next/server";

import { connectDB } from "@/lib/mongodb";

import {
  ContactMessageModel,
} from "@/models/ContactMessage";

export const runtime = "nodejs";

function isValidEmail(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const name =
      typeof body.name ===
      "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email ===
      "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const subject =
      typeof body.subject ===
      "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body.message ===
      "string"
        ? body.message.trim()
        : "";

    /*
     * Honeypot field.
     * Normal users never fill this.
     */
    const website =
      typeof body.website ===
      "string"
        ? body.website.trim()
        : "";

    if (website) {
      return NextResponse.json({
        success: true,
        message:
          "Message received successfully.",
      });
    }

    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please complete all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      subject.length > 150
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      message.length < 10
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a little more detail in your message.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      message.length > 5000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message must be shorter than 5000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    await ContactMessageModel.create({
      name,
      email,
      subject,
      message,
      status: "Unread",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you. Your message has been received.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Contact form error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send your message. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}