import {
  randomUUID,
} from "crypto";

import mongoose from "mongoose";

import {
  getServerSession,
} from "next-auth";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  authOptions,
} from "@/lib/auth";

import {
  connectDB,
} from "@/lib/mongodb";

import User from "@/models/User";

import {
  BookModel,
} from "@/models/Book";

import {
  AnalyticsEventModel,
} from "@/models/AnalyticsEvent";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* =========================================================
   SETTINGS
========================================================= */

const VISITOR_COOKIE =
  "petrohub_visitor_id";

/*
  Prevent accidental repeated
  download clicks from inflating
  analytics.

  The user can still access the
  file during the cooldown.
*/

const DOWNLOAD_COOLDOWN_MINUTES =
  10;

/* =========================================================
   TYPES
========================================================= */

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type AnalyticsUser = {
  _id:
    | mongoose.Types.ObjectId
    | string;

  isBlocked?: boolean;
};

type DownloadBook = {
  _id:
    | mongoose.Types.ObjectId
    | string;

  title?: string;

  fileUrl?: string;

  resourceType?: string;

  status?: string;
};

/* =========================================================
   GET DOWNLOAD
========================================================= */

export async function GET(
  request: NextRequest,
  {
    params,
  }: RouteProps
) {
  try {
    const {
      id,
    } = await params;

    /* =========================
       VALIDATE ID
    ========================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid resource ID",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const bookId =
      new mongoose.Types.ObjectId(
        id
      );

    /* =========================
       LOAD RESOURCE
    ========================= */

    const book =
      (await BookModel.findOne({
        _id: bookId,

        status:
          "Published",

        resourceType:
          "hosted",
      })
        .select(
          "_id title fileUrl resourceType status"
        )
        .lean()) as
        | DownloadBook
        | null;

    if (!book) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Resource not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!book.fileUrl) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Download file is not available",
        },
        {
          status: 404,
        }
      );
    }

    /* =========================
       VISITOR ID
    ========================= */

    const existingVisitorId =
      request.cookies.get(
        VISITOR_COOKIE
      )?.value;

    const visitorId =
      existingVisitorId ??
      randomUUID();

    const newVisitor =
      !existingVisitorId;

    /* =========================
       LOGGED-IN USER
    ========================= */

    const session =
      await getServerSession(
        authOptions
      );

    let userId:
      | mongoose.Types.ObjectId
      | null = null;

    if (
      session?.user?.email
    ) {
      const email =
        session.user.email
          .trim()
          .toLowerCase();

      const user =
        (await User.findOne({
          email,
        })
          .select(
            "_id isBlocked"
          )
          .lean()) as
          | AnalyticsUser
          | null;

      /*
        A blocked user should not
        be allowed to download.
      */

      if (
        user?.isBlocked
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Your account is blocked",
          },
          {
            status: 403,
          }
        );
      }

      if (user) {
        userId =
          new mongoose.Types.ObjectId(
            String(
              user._id
            )
          );
      }
    }

    /* =========================
       DUPLICATE PROTECTION
    ========================= */

    const cooldownStart =
      new Date(
        Date.now() -
          DOWNLOAD_COOLDOWN_MINUTES *
            60 *
            1000
      );

    const recentDownload =
      await AnalyticsEventModel.findOne(
        {
          eventType:
            "download",

          itemType:
            "book",

          itemId:
            bookId,

          visitorId,

          occurredAt: {
            $gte:
              cooldownStart,
          },
        }
      )
        .select("_id")
        .lean();

    /* =========================
       NEW DOWNLOAD EVENT
    ========================= */

    if (!recentDownload) {
      /*
        Increment public
        all-time download counter.
      */

      await BookModel.updateOne(
        {
          _id: bookId,
        },
        {
          $inc: {
            downloads: 1,
          },
        }
      );

      /*
        Store dated analytics
        event for 7/30/90-day
        reporting.
      */

      await AnalyticsEventModel.create(
        {
          eventType:
            "download",

          itemType:
            "book",

          itemId:
            bookId,

          userId,

          visitorId,

          occurredAt:
            new Date(),
        }
      );
    }

    /* =========================
       RESPONSE
    ========================= */

    const response =
      NextResponse.json({
        success: true,

        tracked:
          !recentDownload,

        duplicate:
          Boolean(
            recentDownload
          ),

        fileUrl:
          book.fileUrl,

        title:
          book.title || "",
      });

    /* =========================
       VISITOR COOKIE
    ========================= */

    if (newVisitor) {
      setVisitorCookie(
        response,
        visitorId
      );
    }

    return response;
  } catch (error) {
    console.error(
      "Book download error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to process download",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   VISITOR COOKIE
========================================================= */

function setVisitorCookie(
  response: NextResponse,
  visitorId: string
) {
  response.cookies.set(
    VISITOR_COOKIE,
    visitorId,
    {
      httpOnly: true,

      sameSite: "lax",

      secure:
        process.env
          .NODE_ENV ===
        "production",

      path: "/",

      /*
        1 year
      */

      maxAge:
        60 *
        60 *
        24 *
        365,
    }
  );
}