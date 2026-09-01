import { randomUUID } from "crypto";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import Article from "@/models/Article";
import User from "@/models/User";
import { BookModel } from "@/models/Book";
import { AnalyticsEventModel } from "@/models/AnalyticsEvent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   SETTINGS
========================================================= */

const VISITOR_COOKIE =
  "petrohub_visitor_id";

const VIEW_COOLDOWN_MINUTES =
  30;

/* =========================================================
   TYPES
========================================================= */

type TrackBody = {
  itemType?:
    | "article"
    | "book";

  itemId?: string;
};

type AnalyticsUser = {
  _id:
    | mongoose.Types.ObjectId
    | string;

  isBlocked?: boolean;
};

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /* =========================
       READ BODY
    ========================= */

    const body =
      (await request.json()) as TrackBody;

    const {
      itemType,
      itemId,
    } = body;

    /* =========================
       VALIDATE ITEM TYPE
    ========================= */

    if (
      itemType !== "article" &&
      itemType !== "book"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid item type",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       VALIDATE ID
    ========================= */

    if (
      !itemId ||
      !mongoose.Types.ObjectId.isValid(
        itemId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid item ID",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       DATABASE
    ========================= */

    await connectDB();

    const objectId =
      new mongoose.Types.ObjectId(
        itemId
      );

    /* =========================
       VERIFY ARTICLE
    ========================= */

    if (
      itemType ===
      "article"
    ) {
      const article =
        await Article.findOne({
          _id: objectId,
          status:
            "Published",
        })
          .select("_id")
          .lean();

      if (!article) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Article not found",
          },
          {
            status: 404,
          }
        );
      }
    }

    /* =========================
       VERIFY BOOK / RESOURCE
    ========================= */

    if (
      itemType === "book"
    ) {
      const book =
        await BookModel.findOne({
          _id: objectId,
          status:
            "Published",
        })
          .select("_id")
          .lean();

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
          .lean()) as AnalyticsUser | null;

      /*
        Only attach userId when
        the user still exists and
        is not blocked.
      */

      if (
        user &&
        !user.isBlocked
      ) {
        userId =
          new mongoose.Types.ObjectId(
            String(
              user._id
            )
          );
      }
    }

    /* =========================
       COOLDOWN TIME
    ========================= */

    const cooldownStart =
      new Date(
        Date.now() -
          VIEW_COOLDOWN_MINUTES *
            60 *
            1000
      );

    /* =========================
       DUPLICATE CHECK
    ========================= */

    const existingEvent =
      await AnalyticsEventModel.findOne(
        {
          eventType:
            "view",

          itemType,

          itemId:
            objectId,

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
       DUPLICATE RESPONSE
    ========================= */

    if (existingEvent) {
      const response =
        NextResponse.json({
          success: true,

          tracked: false,

          duplicate: true,

          message:
            "View already tracked recently",
        });

      /*
        This normally won't be
        required for duplicate
        events, but keeping it
        here is safe.
      */

      if (newVisitor) {
        setVisitorCookie(
          response,
          visitorId
        );
      }

      return response;
    }

    /* =========================
       CREATE ANALYTICS EVENT
    ========================= */

    await AnalyticsEventModel.create(
      {
        eventType:
          "view",

        itemType,

        itemId:
          objectId,

        userId,

        visitorId,

        occurredAt:
          new Date(),
      }
    );

    /* =========================
       SUCCESS RESPONSE
    ========================= */

    const response =
      NextResponse.json({
        success: true,

        tracked: true,

        duplicate: false,
      });

    /* =========================
       SAVE VISITOR COOKIE
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
      "Analytics tracking error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to track analytics",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   VISITOR COOKIE HELPER
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