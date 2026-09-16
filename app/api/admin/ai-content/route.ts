import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getServerSession,
} from "next-auth";

import {
  authOptions,
} from "@/lib/auth";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  AIKnowledgeGapModel,
} from "@/models/AIKnowledgeGap";

import "@/models/Article";

export const dynamic =
  "force-dynamic";

const allowedStatuses = [
  "needs_review",
  "reviewing",
  "published",
  "rejected",
] as const;

/* =========================================================
   ADMIN CHECK
========================================================= */

async function checkAdmin() {
  const session =
    await getServerSession(
      authOptions
    );

  const user =
    session?.user as
      | {
          id?: string;

          email?:
            | string
            | null;

          role?: string;
        }
      | undefined;

  if (
    !user ||
    user.role !==
      "admin"
  ) {
    return null;
  }

  return user;
}

/* =========================================================
   GET KNOWLEDGE GAPS
========================================================= */

export async function GET() {
  try {
    const admin =
      await checkAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    await connectDB();

    const gaps =
      await AIKnowledgeGapModel.find(
        {}
      )
        .populate({
          path:
            "draftArticleId",

          select:
            "_id title slug status category updatedAt createdAt",
        })
        .sort({
          hitCount: -1,

          updatedAt: -1,
        })
        .lean();

    const serialized =
      JSON.parse(
        JSON.stringify(
          gaps
        )
      );

    const sources =
      serialized.flatMap(
        (
          gap: any
        ) =>
          Array.isArray(
            gap
              .researchSources
          )
            ? gap
                .researchSources
            : []
      );

    const stats = {
      total:
        serialized.length,

      needsReview:
        serialized.filter(
          (
            gap: any
          ) =>
            gap.status ===
            "needs_review"
        ).length,

      reviewing:
        serialized.filter(
          (
            gap: any
          ) =>
            gap.status ===
            "reviewing"
        ).length,

      rejected:
        serialized.filter(
          (
            gap: any
          ) =>
            gap.status ===
            "rejected"
        ).length,

      totalQuestions:
        serialized.reduce(
          (
            total:
              number,

            gap:
              any
          ) =>
            total +
            Number(
              gap.hitCount ||
                0
            ),
          0
        ),

      drafts:
        serialized.filter(
          (
            gap: any
          ) =>
            Boolean(
              gap
                .draftArticleId
            )
        ).length,

      sources:
        sources.length,

      verifiedSources:
        sources.filter(
          (
            source:
              any
          ) =>
            Boolean(
              source
                .verified
            )
        ).length,
    };

    return NextResponse.json({
      success: true,

      stats,

      gaps:
        serialized,
    });
  } catch (error) {
    console.error(
      "Admin knowledge gaps GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load knowledge gaps.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH
========================================================= */

export async function PATCH(
  request:
    NextRequest
) {
  try {
    const admin =
      await checkAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const id =
      typeof body.id ===
      "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Knowledge gap ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    /* =====================================================
       VERIFY / UNVERIFY PRIVATE SOURCE
    ===================================================== */

    if (
      body.action ===
      "verify_source"
    ) {
      const sourceUrl =
        typeof body
          .sourceUrl ===
        "string"
          ? body
              .sourceUrl
              .trim()
          : "";

      const verified =
        body.verified ===
        true;

      if (!sourceUrl) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              "Source URL is required.",
          },
          {
            status:
              400,
          }
        );
      }

      const gap =
        await AIKnowledgeGapModel.findOneAndUpdate(
          {
            _id:
              id,

            "researchSources.url":
              sourceUrl,
          },

          {
            $set: {
              "researchSources.$.verified":
                verified,
            },
          },

          {
            new:
              true,
          }
        )
          .populate({
            path:
              "draftArticleId",

            select:
              "_id title slug status category updatedAt createdAt",
          })
          .lean();

      if (!gap) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              "Knowledge gap or research source not found.",
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

        gap:
          JSON.parse(
            JSON.stringify(
              gap
            )
          ),
      });
    }

    /* =====================================================
       UPDATE GAP STATUS
    ===================================================== */

    const status =
      typeof body.status ===
      "string"
        ? body.status.trim()
        : "";

    if (
      !allowedStatuses.includes(
        status as
          (typeof allowedStatuses)[number]
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid status.",
        },
        {
          status:
            400,
        }
      );
    }

    const gap =
      await AIKnowledgeGapModel.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new:
            true,
        }
      )
        .populate({
          path:
            "draftArticleId",

          select:
            "_id title slug status category updatedAt createdAt",
        })
        .lean();

    if (!gap) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Knowledge gap not found.",
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

      gap:
        JSON.parse(
          JSON.stringify(
            gap
          )
        ),
    });
  } catch (error) {
    console.error(
      "Admin knowledge gap PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to update knowledge gap.",
      },
      {
        status:
          500,
      }
    );
  }
}