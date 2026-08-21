import {
  NextRequest,
  NextResponse,
} from "next/server";

import mongoose from "mongoose";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  requireAdmin,
} from "@/lib/admin";

import {
  ContactMessageModel,
} from "@/models/ContactMessage";

export const runtime =
  "nodejs";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================
   UPDATE MESSAGE
========================= */

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: RouteProps
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
            "Invalid message ID",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const status =
      typeof body.status ===
      "string"
        ? body.status
        : "";

    const allowedStatuses = [
      "Unread",
      "Read",
      "Resolved",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid message status",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const message =
      await ContactMessageModel.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
        }
      );

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Message status updated",

      data: message,
    });
  } catch (error) {
    console.error(
      "Contact message update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update message",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   DELETE MESSAGE
========================= */

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: RouteProps
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
            "Invalid message ID",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const message =
      await ContactMessageModel.findByIdAndDelete(
        id
      );

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Contact message deleted",
    });
  } catch (error) {
    console.error(
      "Contact message delete error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete message",
      },
      {
        status: 500,
      }
    );
  }
}