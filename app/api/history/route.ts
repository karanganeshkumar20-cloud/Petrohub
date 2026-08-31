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

import User from "@/models/User";
import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

import {
  ReadingHistoryModel,
} from "@/models/ReadingHistory";

export const runtime =
  "nodejs";

type HistoryUser = {
  _id:
    mongoose.Types.ObjectId;

  isBlocked?: boolean;
};

/* =========================
   GET HISTORY
========================= */

export async function GET() {
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
        HistoryUser | null;

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

    const history =
      await ReadingHistoryModel.find({
        userId:
          user._id,
      })
        .sort({
          lastViewedAt: -1,
        })
        .limit(50)
        .lean();

    const articleIds =
      history
        .filter(
          (item) =>
            item.itemType ===
            "article"
        )
        .map(
          (item) =>
            item.itemId
        );

    const bookIds =
      history
        .filter(
          (item) =>
            item.itemType ===
            "book"
        )
        .map(
          (item) =>
            item.itemId
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
            "_id title slug summary category featuredImage author"
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
            "_id title slug description category coverImage author contentType"
          )
          .lean(),
      ]);

    const articleMap =
      new Map(
        articles.map(
          (article) => [
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
          (book) => [
            String(
              book._id
            ),

            book,
          ]
        )
      );

    const items =
      history
        .map(
          (record) => {
            const itemId =
              String(
                record.itemId
              );

            const item =
              record.itemType ===
              "article"
                ? articleMap.get(
                    itemId
                  )
                : bookMap.get(
                    itemId
                  );

            if (!item) {
              return null;
            }

            return {
              historyId:
                String(
                  record._id
                ),

              itemType:
                record.itemType,

              itemId,

              viewCount:
                record.viewCount,

              lastViewedAt:
                record.lastViewedAt,

              item,
            };
          }
        )
        .filter(
          (
            item
          ): item is NonNullable<
            typeof item
          > =>
            item !==
            null
        );

    const articleCount =
      history.filter(
        (item) =>
          item.itemType ===
          "article"
      ).length;

    const resourceCount =
      history.filter(
        (item) =>
          item.itemType ===
          "book"
      ).length;

    return NextResponse.json({
      success: true,

      total:
        items.length,

      articleCount,

      resourceCount,

      items,
    });
  } catch (error) {
    console.error(
      "History GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load reading history",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   ADD / UPDATE HISTORY
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
      body?.itemType;

    const itemId =
      body?.itemId;

    if (
      itemType !==
        "article" &&
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

    if (
      typeof itemId !==
        "string" ||
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
        HistoryUser | null;

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

    /* VERIFY ITEM EXISTS */

    const exists =
      itemType ===
      "article"
        ? await Article.exists({
            _id:
              objectId,

            status:
              "Published",
          })
        : await BookModel.exists({
            _id:
              objectId,

            status:
              "Published",
          });

    if (!exists) {
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

    const now =
      new Date();

    const history =
      await ReadingHistoryModel.findOneAndUpdate(
        {
          userId:
            user._id,

          itemType,

          itemId:
            objectId,
        },

        {
          $set: {
            lastViewedAt:
              now,
          },

          $inc: {
            viewCount: 1,
          },
        },

        {
          new: true,

          upsert: true,

          setDefaultsOnInsert:
            true,
        }
      );

    return NextResponse.json({
      success: true,

      historyId:
        String(
          history._id
        ),

      viewCount:
        history.viewCount,

      lastViewedAt:
        history.lastViewedAt,
    });
  } catch (error) {
    console.error(
      "History POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to update reading history",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   CLEAR ALL HISTORY
========================= */

export async function DELETE() {
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
        HistoryUser | null;

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

    const result =
      await ReadingHistoryModel.deleteMany(
        {
          userId:
            user._id,
        }
      );

    return NextResponse.json({
      success: true,

      deletedCount:
        result.deletedCount,

      message:
        "Reading history cleared successfully",
    });
  } catch (error) {
    console.error(
      "History DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to clear reading history",
      },
      {
        status: 500,
      }
    );
  }
}