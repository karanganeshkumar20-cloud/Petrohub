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

import FormulaModel from "@/models/Formula";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
   ARRAY
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
   GET
========================================================= */

export async function GET(
  request: NextRequest,
  context: RouteContext
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
          success: false,
          message:
            "Invalid formula ID",
        },
        {
          status: 400,
        }
      );
    }

    const formula =
      await FormulaModel.findById(
        id
      ).lean();

    if (!formula) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Formula not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      formula,
    });
  } catch (error) {
    console.error(
      "Admin formula GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load formula",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE
========================================================= */

export async function PUT(
  request: NextRequest,
  context: RouteContext
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
          success: false,
          message:
            "Invalid formula ID",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const name =
      body.name?.trim();

    const domain =
      body.domain?.trim();

    const formulaText =
      body.formulaText?.trim();

    if (
      !name ||
      !domain ||
      !formulaText
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, domain and formula are required",
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

    const duplicate =
      await FormulaModel.findOne({
        slug,
        _id: {
          $ne: id,
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another formula already uses this slug",
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
      await FormulaModel.findByIdAndUpdate(
        id,
        {
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
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!formula) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Formula not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Formula updated successfully",
      formula,
    });
  } catch (error) {
    console.error(
      "Admin formula PUT error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update formula",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: RouteContext
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
          success: false,
          message:
            "Invalid formula ID",
        },
        {
          status: 400,
        }
      );
    }

    const formula =
      await FormulaModel.findByIdAndDelete(
        id
      );

    if (!formula) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Formula not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Formula deleted successfully",
    });
  } catch (error) {
    console.error(
      "Admin formula DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete formula",
      },
      {
        status: 500,
      }
    );
  }
}
