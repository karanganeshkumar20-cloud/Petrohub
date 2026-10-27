import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import FormulaModel from "@/models/Formula";

export const runtime =
  "nodejs";

/* =========================================================
   RESOLVE VERIFIED FORMULA ID
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const slug =
      request.nextUrl
        .searchParams
        .get("slug")
        ?.trim()
        .toLowerCase() || "";

    if (
      !slug ||
      slug.length > 150 ||
      !/^[a-z0-9-]+$/.test(
        slug
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Invalid formula slug",
        },
        {
          status:
            400,
        }
      );
    }

    await connectDB();

    const formula =
      await FormulaModel.findOne({
        slug,

        status:
          "Published",

        verificationStatus:
          "verified",
      })
        .select(
          "_id"
        )
        .lean();

    if (!formula) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Verified formula not found",
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

      formulaId:
        String(
          (
            formula as {
              _id:
                unknown;
            }
          )._id
        ),
    });
  } catch (error) {
    console.error(
      "Formula bookmark target error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to resolve formula",
      },
      {
        status:
          500,
      }
    );
  }
}