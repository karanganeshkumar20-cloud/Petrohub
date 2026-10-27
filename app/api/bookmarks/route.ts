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

import {
  bookmarkTargetExists,
  isBookmarkItemType,
  loadSavedItems,
} from "@/lib/saved-items";

import User from "@/models/User";

import {
  BookmarkModel,
} from "@/models/Bookmark";

export const runtime =
  "nodejs";

type BookmarkUser = {
  _id:
    mongoose.Types.ObjectId;

  isBlocked?:
    boolean;
};

/* =========================================================
   GET CURRENT USER
========================================================= */

async function getCurrentUser() {
  const session =
    await getServerSession(
      authOptions
    );

  if (
    !session?.user?.email
  ) {
    return {
      error:
        "Login required",

      status:
        401,

      user:
        null,
    };
  }

  await connectDB();

  const user =
    (await User.findOne({
      email:
        session.user.email
          .trim()
          .toLowerCase(),
    })
      .select(
        "_id isBlocked"
      )
      .lean()) as
      BookmarkUser |
      null;

  if (!user) {
    return {
      error:
        "User not found",

      status:
        404,

      user:
        null,
    };
  }

  if (
    user.isBlocked ===
    true
  ) {
    return {
      error:
        "Account blocked",

      status:
        403,

      user:
        null,
    };
  }

  return {
    error:
      "",

    status:
      200,

    user,
  };
}

/* =========================================================
   GET BOOKMARKS
========================================================= */

export async function GET(
  request:
    NextRequest
) {
  try {
    const current =
      await getCurrentUser();

    if (
      !current.user
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            current.error,
        },
        {
          status:
            current.status,
        }
      );
    }

    const params =
      request.nextUrl
        .searchParams;

    const rawItemType =
      params.get(
        "itemType"
      );

    const itemId =
      params.get(
        "itemId"
      );

    /* =====================================================
       CHECK ONE BOOKMARK
    ===================================================== */

    if (
      rawItemType &&
      itemId
    ) {
      if (
        !isBookmarkItemType(
          rawItemType
        )
      ) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              "Invalid bookmark type",
          },
          {
            status:
              400,
          }
        );
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          itemId
        )
      ) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              "Invalid item ID",
          },
          {
            status:
              400,
          }
        );
      }

      const bookmark =
        await BookmarkModel.findOne({
          userId:
            current.user._id,

          itemType:
            rawItemType,

          itemId:
            new mongoose.Types.ObjectId(
              itemId
            ),
        }).lean();

      return NextResponse.json({
        success:
          true,

        saved:
          Boolean(
            bookmark
          ),

        bookmarkId:
          bookmark
            ? String(
                bookmark._id
              )
            : null,
      });
    }

    /* =====================================================
       ALL SAVED ITEMS
    ===================================================== */

    const bookmarks =
      await loadSavedItems(
        current.user._id
      );

    return NextResponse.json({
      success:
        true,

      bookmarks,
    });
  } catch (error) {
    console.error(
      "Bookmark GET error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to load bookmarks",
      },
      {
        status:
          500,
      }
    );
  }
}

/* =========================================================
   SAVE BOOKMARK
========================================================= */

export async function POST(
  request:
    NextRequest
) {
  try {
    const current =
      await getCurrentUser();

    if (
      !current.user
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            current.error,
        },
        {
          status:
            current.status,
        }
      );
    }

    const body =
      await request.json();

    const rawItemType =
      typeof body?.itemType ===
      "string"
        ? body.itemType
        : "";

    const itemId =
      typeof body?.itemId ===
      "string"
        ? body.itemId
        : "";

    if (
      !isBookmarkItemType(
        rawItemType
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid bookmark type",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        itemId
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid item ID",
        },
        {
          status:
            400,
        }
      );
    }

    const objectId =
      new mongoose.Types.ObjectId(
        itemId
      );

    /*
     * Article:
     *   Published only
     *
     * Book:
     *   Published only
     *
     * Formula:
     *   Published + Verified only
     */
    const targetExists =
      await bookmarkTargetExists(
        rawItemType,
        objectId
      );

    if (
      !targetExists
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            rawItemType ===
            "formula"
              ? "Verified formula not found"
              : rawItemType ===
                  "article"
                ? "Article not found"
                : "Resource not found",
        },
        {
          status:
            404,
        }
      );
    }

    const existing =
      await BookmarkModel.findOne({
        userId:
          current.user._id,

        itemType:
          rawItemType,

        itemId:
          objectId,
      });

    if (
      existing
    ) {
      return NextResponse.json({
        success:
          true,

        saved:
          true,

        bookmarkId:
          String(
            existing._id
          ),

        message:
          "Already saved",
      });
    }

    const bookmark =
      await BookmarkModel.create({
        userId:
          current.user._id,

        itemType:
          rawItemType,

        itemId:
          objectId,
      });

    return NextResponse.json(
      {
        success:
          true,

        saved:
          true,

        bookmarkId:
          String(
            bookmark._id
          ),

        message:
          "Saved successfully",
      },
      {
        status:
          201,
      }
    );
  } catch (error) {
    /*
     * Unique database index
     * protects against races.
     */
    if (
      error &&
      typeof error ===
        "object" &&
      "code" in error &&
      (
        error as {
          code?: number;
        }
      ).code ===
        11000
    ) {
      return NextResponse.json({
        success:
          true,

        saved:
          true,

        message:
          "Already saved",
      });
    }

    console.error(
      "Bookmark POST error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to save bookmark",
      },
      {
        status:
          500,
      }
    );
  }
}