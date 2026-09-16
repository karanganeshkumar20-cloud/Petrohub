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

import Article from "@/models/Article";

import {
  AIKnowledgeGapModel,
} from "@/models/AIKnowledgeGap";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   CREATE SLUG
========================================================= */

function createSlug(
  title: string
): string {
  return title
    .toLowerCase()
    .trim()
    .replace(
      /[\/\\]+/g,
      "-"
    )
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}

/* =========================================================
   SYNC AI KNOWLEDGE GAP STATUS
========================================================= */

async function syncKnowledgeGapStatus({
  articleId,
  articleStatus,
}: {
  articleId: string;

  articleStatus:
    | "Draft"
    | "Published";
}) {
  try {
    const objectId =
      new mongoose.Types.ObjectId(
        articleId
      );

    if (
      articleStatus ===
      "Published"
    ) {
      const result =
        await AIKnowledgeGapModel.updateMany(
          {
            draftArticleId:
              objectId,
          },
          {
            $set: {
              status:
                "published",
            },
          }
        );

      if (
        result.matchedCount >
        0
      ) {
        console.log(
          `PetroHub AI knowledge gap published sync: ${articleId}`
        );
      }

      return;
    }

    /*
      If an AI-linked article is moved
      from Published back to Draft,
      return the topic to review.
    */

    const result =
      await AIKnowledgeGapModel.updateMany(
        {
          draftArticleId:
            objectId,

          status:
            "published",
        },
        {
          $set: {
            status:
              "needs_review",
          },
        }
      );

    if (
      result.matchedCount >
      0
    ) {
      console.log(
        `PetroHub AI knowledge gap draft sync: ${articleId}`
      );
    }
  } catch (error) {
    /*
      A secondary knowledge-gap sync
      must not break article saving.
    */

    console.error(
      "PetroHub AI knowledge gap sync error:",
      error
    );
  }
}

/* =========================================================
   CLEAR AI ARTICLE LINK
========================================================= */

async function clearKnowledgeGapArticleLink(
  articleId: string
) {
  try {
    const objectId =
      new mongoose.Types.ObjectId(
        articleId
      );

    const result =
      await AIKnowledgeGapModel.updateMany(
        {
          draftArticleId:
            objectId,
        },
        {
          $set: {
            draftArticleId:
              null,

            status:
              "needs_review",
          },
        }
      );

    if (
      result.matchedCount >
      0
    ) {
      console.log(
        `PetroHub AI article link cleared: ${articleId}`
      );
    }
  } catch (error) {
    console.error(
      "PetroHub AI article unlink error:",
      error
    );
  }
}

/* =========================================================
   GET ARTICLE
========================================================= */

export async function GET(
  request:
    NextRequest,

  context:
    RouteContext
) {
  try {
    await connectDB();

    const {
      id,
    } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid article ID",
        },
        {
          status:
            400,
        }
      );
    }

    const article =
      await Article.findById(
        id
      ).lean();

    if (!article) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Article not found",
        },
        {
          status:
            404,
        }
      );
    }

    return NextResponse.json({
      success:
        true,

      article,
    });
  } catch (error) {
    console.error(
      "Get article error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to fetch article",
      },
      {
        status:
          500,
      }
    );
  }
}

/* =========================================================
   UPDATE ARTICLE
========================================================= */

export async function PUT(
  request:
    NextRequest,

  context:
    RouteContext
) {
  try {
    /* =====================================================
       ADMIN CHECK
    ===================================================== */

    const admin =
      await requireAdmin();

    if (
      !admin.authorized
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            admin.message,
        },
        {
          status:
            admin.status,
        }
      );
    }

    await connectDB();

    const {
      id,
    } =
      await context.params;

    /* =====================================================
       VALIDATE ID
    ===================================================== */

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid article ID",
        },
        {
          status:
            400,
        }
      );
    }

    /* =====================================================
       REQUEST BODY
    ===================================================== */

    const body =
      await request.json();

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !body.title?.trim()
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Title is required",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !body.category?.trim()
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Category is required",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !body.content?.trim()
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Content is required",
        },
        {
          status:
            400,
        }
      );
    }

    /* =====================================================
       SLUG
    ===================================================== */

    const newSlug =
      createSlug(
        body.title
      );

    if (!newSlug) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Unable to create a valid article slug",
        },
        {
          status:
            400,
        }
      );
    }

    /* =====================================================
       DUPLICATE ARTICLE
    ===================================================== */

    const duplicateArticle =
      await Article.findOne({
        slug:
          newSlug,

        _id: {
          $ne:
            id,
        },
      });

    if (
      duplicateArticle
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Another article already uses this title",
        },
        {
          status:
            409,
        }
      );
    }

    /* =====================================================
       ARTICLE STATUS
    ===================================================== */

    const articleStatus:
      | "Draft"
      | "Published" =
      body.status ===
      "Draft"
        ? "Draft"
        : "Published";

    /* =====================================================
       UPDATE ARTICLE
    ===================================================== */

    const article =
      await Article.findByIdAndUpdate(
        id,
        {
          title:
            body.title.trim(),

          slug:
            newSlug,

          summary:
            body.summary
              ?.trim() ||
            "",

          content:
            body.content,

          category:
            body.category
              .trim(),

          tags:
            Array.isArray(
              body.tags
            )
              ? body.tags
                  .map(
                    (
                      tag:
                        string
                    ) =>
                      tag.trim()
                  )
                  .filter(
                    Boolean
                  )
              : [],

          featuredImage:
            body.featuredImage ||
            "",

          source:
            body.source
              ?.trim() ||
            "PetroHub",

          sourceUrl:
            body.sourceUrl
              ?.trim() ||
            "",

          license:
            body.license
              ?.trim() ||
            "",

          author:
            body.author
              ?.trim() ||
            "PetroHub Team",

          status:
            articleStatus,

          featured:
            Boolean(
              body.featured
            ),
        },
        {
          new:
            true,

          runValidators:
            true,
        }
      );

    if (!article) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Article not found",
        },
        {
          status:
            404,
        }
      );
    }

    /* =====================================================
       AI KNOWLEDGE GAP SYNC
    ===================================================== */

    await syncKnowledgeGapStatus({
      articleId:
        article._id.toString(),

      articleStatus,
    });

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success:
        true,

      message:
        articleStatus ===
        "Published"
          ? "Article published successfully"
          : "Article updated successfully",

      article,
    });
  } catch (error) {
    console.error(
      "Update article error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to update article",
      },
      {
        status:
          500,
      }
    );
  }
}

/* =========================================================
   DELETE ARTICLE
========================================================= */

export async function DELETE(
  request:
    NextRequest,

  context:
    RouteContext
) {
  try {
    /* =====================================================
       ADMIN CHECK
    ===================================================== */

    const admin =
      await requireAdmin();

    if (
      !admin.authorized
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            admin.message,
        },
        {
          status:
            admin.status,
        }
      );
    }

    await connectDB();

    const {
      id,
    } =
      await context.params;

    /* =====================================================
       VALIDATE ID
    ===================================================== */

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid article ID",
        },
        {
          status:
            400,
        }
      );
    }

    /* =====================================================
       DELETE ARTICLE
    ===================================================== */

    const article =
      await Article.findByIdAndDelete(
        id
      );

    if (!article) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Article not found",
        },
        {
          status:
            404,
        }
      );
    }

    /* =====================================================
       CLEAR AI KNOWLEDGE LINK
    ===================================================== */

    await clearKnowledgeGapArticleLink(
      id
    );

    return NextResponse.json({
      success:
        true,

      message:
        "Article deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete article error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to delete article",
      },
      {
        status:
          500,
      }
    );
  }
}