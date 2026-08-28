import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getServerSession,
} from "next-auth";

import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";
import Article from "@/models/Article";
import { BookModel } from "@/models/Book";

import {
  BookmarkModel,
} from "@/models/Bookmark";

export const runtime = "nodejs";

type BookmarkUser = {
  _id: mongoose.Types.ObjectId;
  isBlocked?: boolean;
};

/* =========================
   GET BOOKMARKS
========================= */

export async function GET(
  request: NextRequest
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

    await connectDB();

    const user = (await User.findOne({
      email:
        session.user.email
          .trim()
          .toLowerCase(),
    })
      .select(
        "_id isBlocked"
      )
      .lean()) as BookmarkUser | null;

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
      user.isBlocked ===
      true
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

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const itemType =
      searchParams.get(
        "itemType"
      );

    const itemId =
      searchParams.get(
        "itemId"
      );

    /* =========================
       CHECK SINGLE BOOKMARK
    ========================= */

    if (
      itemType &&
      itemId
    ) {
      if (
        ![
          "article",
          "book",
        ].includes(
          itemType
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid bookmark type",
          },
          {
            status: 400,
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
            success: false,
            message:
              "Invalid item ID",
          },
          {
            status: 400,
          }
        );
      }

      const bookmark =
        await BookmarkModel.findOne(
          {
            userId:
              user._id,

            itemType,

            itemId:
              new mongoose.Types.ObjectId(
                itemId
              ),
          }
        ).lean();

      return NextResponse.json({
        success: true,

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

    /* =========================
       GET ALL BOOKMARKS
    ========================= */

    const bookmarks =
      await BookmarkModel.find(
        {
          userId:
            user._id,
        }
      )
        .sort({
          createdAt: -1,
        })
        .lean();

    const articleIds =
      bookmarks
        .filter(
          (
            bookmark
          ) =>
            bookmark.itemType ===
            "article"
        )
        .map(
          (
            bookmark
          ) =>
            bookmark.itemId
        );

    const bookIds =
      bookmarks
        .filter(
          (
            bookmark
          ) =>
            bookmark.itemType ===
            "book"
        )
        .map(
          (
            bookmark
          ) =>
            bookmark.itemId
        );

    const [
      articles,
      books,
    ] =
      await Promise.all([
        Article.find({
          _id: {
            $in:
              articleIds,
          },

          status:
            "Published",
        })
          .select(
            "_id title slug summary category featuredImage author createdAt"
          )
          .lean(),

        BookModel.find({
          _id: {
            $in:
              bookIds,
          },

          status:
            "Published",
        })
          .select(
            "_id title slug author description category coverImage contentType createdAt"
          )
          .lean(),
      ]);

    const articleMap =
      new Map(
        articles.map(
          (
            article
          ) => [
            String(
              article._id
            ),
            article,
          ]
        )
      );

    const bookMap =
      new Map(
        books.map(
          (
            book
          ) => [
            String(
              book._id
            ),
            book,
          ]
        )
      );

    const items =
      bookmarks
        .map(
          (
            bookmark
          ) => {
            const id =
              String(
                bookmark.itemId
              );

            const item =
              bookmark.itemType ===
              "article"
                ? articleMap.get(
                    id
                  )
                : bookMap.get(
                    id
                  );

            if (!item) {
              return null;
            }

            return {
              bookmarkId:
                String(
                  bookmark._id
                ),

              itemType:
                bookmark.itemType,

              savedAt:
                bookmark.createdAt,

              item,
            };
          }
        )
        .filter(
          (
            item
          ) =>
            item !== null
        );

    return NextResponse.json({
      success: true,
      bookmarks:
        items,
    });
  } catch (error) {
    console.error(
      "Bookmark GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load bookmarks",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   SAVE BOOKMARK
========================= */

export async function POST(
  request: NextRequest
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

    const body =
      await request.json();

    const itemType =
      typeof body.itemType ===
      "string"
        ? body.itemType
        : "";

    const itemId =
      typeof body.itemId ===
      "string"
        ? body.itemId
        : "";

    if (
      ![
        "article",
        "book",
      ].includes(
        itemType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid bookmark type",
        },
        {
          status: 400,
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
          success: false,
          message:
            "Invalid item ID",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const user = (await User.findOne({
      email:
        session.user.email
          .trim()
          .toLowerCase(),
    })
      .select(
        "_id isBlocked"
      )
      .lean()) as BookmarkUser | null;

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
      user.isBlocked ===
      true
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

    const objectId =
      new mongoose.Types.ObjectId(
        itemId
      );

    /* =========================
       VERIFY CONTENT
    ========================= */

    if (
      itemType ===
      "article"
    ) {
      const articleExists =
        await Article.exists({
          _id:
            objectId,

          status:
            "Published",
        });

      if (
        !articleExists
      ) {
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

    if (
      itemType ===
      "book"
    ) {
      const bookExists =
        await BookModel.exists({
          _id:
            objectId,

          status:
            "Published",
        });

      if (
        !bookExists
      ) {
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
       DUPLICATE CHECK
    ========================= */

    const existing =
      await BookmarkModel.findOne(
        {
          userId:
            user._id,

          itemType,

          itemId:
            objectId,
        }
      );

    if (existing) {
      return NextResponse.json({
        success: true,
        saved: true,

        bookmarkId:
          String(
            existing._id
          ),

        message:
          "Already saved",
      });
    }

    /* =========================
       CREATE BOOKMARK
    ========================= */

    const bookmark =
      await BookmarkModel.create(
        {
          userId:
            user._id,

          itemType,

          itemId:
            objectId,
        }
      );

    return NextResponse.json(
      {
        success: true,
        saved: true,

        bookmarkId:
          String(
            bookmark._id
          ),

        message:
          "Saved successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    /*
     * Mongo duplicate index protection
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
      ).code === 11000
    ) {
      return NextResponse.json({
        success: true,
        saved: true,
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
        success: false,
        message:
          "Unable to save bookmark",
      },
      {
        status: 500,
      }
    );
  }
}