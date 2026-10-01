import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  requireAdmin,
} from "@/lib/admin";

import FormulaModel from "@/models/Formula";

/* =========================================================
   TRUSTED CALCULATION ENGINES
========================================================= */

const SUPPORTED_CALCULATION_KEYS = [
  "bernoulli",
  "darcy-weisbach",
  "hydrostatic-pressure",
  "ecd",
  "annular-velocity",
  "initial-circulating-pressure",
];

/* =========================================================
   SLUG
========================================================= */

function createSlug(
  value: string
) {
  return value
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
   CLEAN ARRAY
========================================================= */

function cleanStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(
      (
        item
      ) =>
        String(
          item
        ).trim()
    )
    .filter(Boolean);
}

/* =========================================================
   GET ALL FORMULAS Ã¢â‚¬â€ ADMIN
========================================================= */

export async function GET() {
  try {
    const admin =
      await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }

    await connectDB();

    const formulas =
      await FormulaModel.find()
        .sort({
          updatedAt: -1,
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      formulas,
    });
  } catch (error) {
    console.error(
      "Admin formulas GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load formulas",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE FORMULA
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }

    await connectDB();

    const body =
      await request.json();

    const name =
      body.name?.trim();

    const domain =
      body.domain?.trim();

    const formulaText =
      body.formulaText?.trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Formula name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!domain) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Domain is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!formulaText) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Formula expression is required",
        },
        {
          status: 400,
        }
      );
    }

    const slug =
      createSlug(
        body.slug?.trim() ||
          name
      );

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create formula slug",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await FormulaModel.findOne({
        slug,
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A formula with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    const verificationStatus =
      [
        "unverified",
        "under_review",
        "verified",
        "rejected",
      ].includes(
        body.verificationStatus
      )
        ? body.verificationStatus
        : "unverified";

    const calculationKey =
      body.calculationKey
        ?.trim() || "";

    const requestedStatus =
      body.status ===
      "Published"
        ? "Published"
        : "Draft";

    /*
      Public publishing is only
      permitted for verified formulas
      connected to a trusted engine.
    */

    if (
      requestedStatus ===
      "Published"
    ) {
      if (
        verificationStatus !==
        "verified"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only verified formulas can be published",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !SUPPORTED_CALCULATION_KEYS.includes(
          calculationKey
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Published formulas must use a trusted calculation engine",
          },
          {
            status: 400,
          }
        );
      }
    }

    const formula =
      await FormulaModel.create({
        name,
        slug,

        domain,

        subDomain:
          body.subDomain
            ?.trim() ||
          "",

        description:
          body.description
            ?.trim() ||
          "",

        formulaText,

        formulaLatex:
          body.formulaLatex
            ?.trim() ||
          "",

        variables:
          Array.isArray(
            body.variables
          )
            ? body.variables
                .map(
                  (
                    variable: {
                      symbol?: string;
                      name?: string;
                      unit?: string;
                      description?: string;
                    }
                  ) => ({
                    symbol:
                      variable.symbol
                        ?.trim() ||
                      "",

                    name:
                      variable.name
                        ?.trim() ||
                      "",

                    unit:
                      variable.unit
                        ?.trim() ||
                      "",

                    description:
                      variable.description
                        ?.trim() ||
                      "",
                  })
                )
                .filter(
                  (
                    variable: {
                      symbol: string;
                      name: string;
                    }
                  ) =>
                    Boolean(
                      variable.symbol &&
                        variable.name
                    )
                )
            : [],

        supportedUnits:
          cleanStringArray(
            body.supportedUnits
          ),

        assumptions:
          cleanStringArray(
            body.assumptions
          ),

        limitations:
          cleanStringArray(
            body.limitations
          ),

        calculationKey,

        verificationStatus,

        sources:
          Array.isArray(
            body.sources
          )
            ? body.sources
                .map(
                  (
                    source: {
                      name?: string;
                      url?: string;
                    }
                  ) => ({
                    name:
                      source.name
                        ?.trim() ||
                      "",

                    url:
                      source.url
                        ?.trim() ||
                      "",
                  })
                )
                .filter(
                  (
                    source: {
                      name: string;
                    }
                  ) =>
                    Boolean(
                      source.name
                    )
                )
            : [],

        generatedByAI:
          Boolean(
            body.generatedByAI
          ),

        featured:
          Boolean(
            body.featured
          ),

        status:
          requestedStatus,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Formula created successfully",
        formula,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Admin formula POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create formula",
      },
      {
        status: 500,
      }
    );
  }
}
