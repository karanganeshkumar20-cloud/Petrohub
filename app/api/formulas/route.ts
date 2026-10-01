import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import FormulaModel from "@/models/Formula";

/* =========================================================
   GET VERIFIED PUBLIC FORMULAS
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    const searchParams =
      request.nextUrl.searchParams;

    const domain =
      searchParams
        .get("domain")
        ?.trim();

    const query =
      searchParams
        .get("q")
        ?.trim();

    const filter: Record<
      string,
      unknown
    > = {
      status:
        "Published",

      verificationStatus:
        "verified",
    };

    if (domain) {
      filter.domain =
        domain;
    }

    if (query) {
      filter.$or = [
        {
          name: {
            $regex:
              query,

            $options:
              "i",
          },
        },

        {
          description: {
            $regex:
              query,

            $options:
              "i",
          },
        },

        {
          subDomain: {
            $regex:
              query,

            $options:
              "i",
          },
        },
      ];
    }

    const formulas =
      await FormulaModel.find(
        filter
      )
        .select(
          [
            "name",
            "slug",
            "domain",
            "subDomain",
            "description",
            "formulaText",
            "formulaLatex",
            "variables",
            "supportedUnits",
            "assumptions",
            "limitations",
            "calculationKey",
            "featured",
            "views",
            "createdAt",
            "updatedAt",
          ].join(" ")
        )
        .sort({
          featured:
            -1,

          name:
            1,
        })
        .lean();

    return NextResponse.json({
      success:
        true,

      count:
        formulas.length,

      formulas,
    });
  } catch (error) {
    console.error(
      "Formula API error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to load formulas",
      },
      {
        status:
          500,
      }
    );
  }
}