import fs from "node:fs";
import path from "node:path";

import {
  MongoClient,
} from "mongodb";

/* =========================================================
   LOAD .env.local
========================================================= */

function loadEnvFile() {
  const envPath =
    path.join(
      process.cwd(),
      ".env.local"
    );

  if (
    !fs.existsSync(
      envPath
    )
  ) {
    return;
  }

  const content =
    fs.readFileSync(
      envPath,
      "utf8"
    );

  for (
    const rawLine of
    content.split(/\r?\n/)
  ) {
    const line =
      rawLine.trim();

    if (
      !line ||
      line.startsWith(
        "#"
      )
    ) {
      continue;
    }

    const equalsIndex =
      line.indexOf("=");

    if (
      equalsIndex <=
      0
    ) {
      continue;
    }

    const key =
      line
        .slice(
          0,
          equalsIndex
        )
        .trim();

    let value =
      line
        .slice(
          equalsIndex +
            1
        )
        .trim();

    if (
      (
        value.startsWith(
          '"'
        ) &&
        value.endsWith(
          '"'
        )
      ) ||
      (
        value.startsWith(
          "'"
        ) &&
        value.endsWith(
          "'"
        )
      )
    ) {
      value =
        value.slice(
          1,
          -1
        );
    }

    if (
      !process.env[
        key
      ]
    ) {
      process.env[
        key
      ] =
        value;
    }
  }
}

loadEnvFile();

/* =========================================================
   FORMULAS FROM UPLOADED PETROLEUM FORMULA SHEET
========================================================= */

const formulas = [
  {
    name:
      "Hydrostatic Pressure from Mud Weight",

    slug:
      "hydrostatic-pressure-from-mud-weight",

    domain:
      "Drilling Engineering",

    subDomain:
      "Well Control",

    formulaText:
      "HP = 0.052 × MW × TVD",

    formulaLatex:
      "HP = 0.052\\,MW\\,TVD",

    description:
      "Hydrostatic pressure calculated from mud weight and true vertical depth.",
  },

  {
    name:
      "Equivalent Circulating Density",

    slug:
      "equivalent-circulating-density",

    domain:
      "Drilling Engineering",

    subDomain:
      "Drilling Hydraulics",

    formulaText:
      "ECD = MW + ΔPa / (0.052 × TVD)",

    formulaLatex:
      "ECD = MW + \\frac{\\Delta P_a}{0.052\\,TVD}",

    description:
      "Equivalent circulating density including annular pressure-loss contribution.",
  },

  {
    name:
      "Velocity of Fluid in Annulus",

    slug:
      "velocity-of-fluid-in-annulus",

    domain:
      "Drilling Engineering",

    subDomain:
      "Drilling Hydraulics",

    formulaText:
      "va = Q / [2.448(Do² - Dp²)]",

    formulaLatex:
      "v_a = \\frac{Q}{2.448\\left(D_o^2-D_p^2\\right)}",

    description:
      "Annular fluid velocity based on flow rate and annular geometry.",
  },

  {
    name:
      "Initial Circulating Pressure",

    slug:
      "initial-circulating-pressure",

    domain:
      "Drilling Engineering",

    subDomain:
      "Well Control",

    formulaText:
      "ICP = SCRP + SIDPP",

    formulaLatex:
      "ICP = SCRP + SIDPP",

    description:
      "Initial circulating pressure from slow circulating rate pressure and shut-in drillpipe pressure.",
  },

  {
    name:
      "Darcy's Law for Linear Single-Phase Flow",

    slug:
      "darcy-law-linear-single-phase-flow",

    domain:
      "Reservoir Engineering",

    subDomain:
      "Fluid Flow in Porous Media",

    formulaText:
      "q = 0.001127 × k × A × ΔP / (μ × L)",

    formulaLatex:
      "q = \\frac{0.001127\\,kA\\Delta P}{\\mu L}",

    description:
      "Linear single-phase porous-media flow relationship.",
  },

  {
    name:
      "Steady-State Radial Liquid Flow Rate",

    slug:
      "steady-state-radial-liquid-flow-rate",

    domain:
      "Reservoir Engineering",

    subDomain:
      "Fluid Flow in Porous Media",

    formulaText:
      "qo = 0.00708kh(pe - pwf) / [μoBo(ln(re/rw) + s)]",

    formulaLatex:
      "q_o = \\frac{0.00708\\,kh\\left(p_e-p_{wf}\\right)}{\\mu_o B_o\\left[\\ln\\left(r_e/r_w\\right)+s\\right]}",

    description:
      "Steady-state radial liquid flow-rate equation for reservoir flow.",
  },

  {
    name:
      "Joshi Horizontal Well Productivity Index",

    slug:
      "joshi-horizontal-well-productivity-index",

    domain:
      "Reservoir Engineering",

    subDomain:
      "Well Performance",

    formulaText:
      "Jh = 0.00708khh / {μoBo[ln(Rh) + (βh/L)ln(βh/(2rw)) + s]}",

    formulaLatex:
      "J_h = \\frac{0.00708\\,k_h h}{\\mu_o B_o\\left[\\ln R_h + \\frac{\\beta h}{L}\\ln\\left(\\frac{\\beta h}{2r_w}\\right)+s\\right]}",

    description:
      "Horizontal-well productivity-index relationship shown in the supplied formula sheet.",
  },

  {
    name:
      "Vogel Inflow Performance Relationship",

    slug:
      "vogel-inflow-performance-relationship",

    domain:
      "Production Engineering",

    subDomain:
      "Inflow Performance",

    formulaText:
      "qo = qmax[1 - 0.2(pwf/Pr) - 0.8(pwf/Pr)²]",

    formulaLatex:
      "q_o = q_{max}\\left[1-0.2\\left(\\frac{P_{wf}}{P_r}\\right)-0.8\\left(\\frac{P_{wf}}{P_r}\\right)^2\\right]",

    description:
      "Vogel inflow-performance relationship for oil-well production.",
  },

  {
    name:
      "Gas Formation Volume Factor",

    slug:
      "gas-formation-volume-factor",

    domain:
      "Reservoir Engineering",

    subDomain:
      "PVT Properties",

    formulaText:
      "Bg = 0.02827 × zT / P",

    formulaLatex:
      "B_g = 0.02827\\frac{zT}{P}",

    description:
      "Gas formation volume factor correlation shown in the supplied formula sheet.",
  },

  {
    name:
      "Vasquez-Beggs Solution Gas-Oil Ratio from Pressure",

    slug:
      "vasquez-beggs-solution-gas-oil-ratio",

    domain:
      "Phase Behavior and Thermodynamics",

    subDomain:
      "PVT Properties",

    formulaText:
      "Rs = C1 γg P^C2 exp[(C3 API)/(T + 460)]",

    formulaLatex:
      "R_s = C_1\\gamma_g P^{C_2}\\exp\\left(\\frac{C_3 API}{T+460}\\right)",

    description:
      "Vasquez-Beggs solution gas-oil ratio correlation from pressure.",
  },

  {
    name:
      "Beggs-Robinson Live Oil Viscosity Correlation",

    slug:
      "beggs-robinson-live-oil-viscosity",

    domain:
      "Phase Behavior and Thermodynamics",

    subDomain:
      "Fluid Properties",

    formulaText:
      "μo = A × μod^B",

    formulaLatex:
      "\\mu_o = A\\mu_{od}^{B}",

    description:
      "Beggs-Robinson live-oil viscosity correlation shown in the supplied formula sheet.",
  },

  {
    name:
      "Archie Water Saturation from Resistivity Logs",

    slug:
      "archie-water-saturation",

    domain:
      "Petrophysics",

    subDomain:
      "Resistivity Logs",

    formulaText:
      "Sw = [(a/φ^m)(Rw/Rt)]^(1/n)",

    formulaLatex:
      "S_w = \\left[\\left(\\frac{a}{\\phi^m}\\right)\\left(\\frac{R_w}{R_t}\\right)\\right]^{1/n}",

    description:
      "Archie water-saturation equation using porosity and resistivity measurements.",
  },

  {
    name:
      "Indonesian Water Saturation from Shaly Sand Logs",

    slug:
      "indonesian-water-saturation",

    domain:
      "Petrophysics",

    subDomain:
      "Resistivity Logs",

    formulaText:
      "Sw = [sqrt(1/Rt) / (Vsh^(1-0.5Vsh)/sqrt(Rsh) + sqrt(φ^m/(aRw)))]^(2/n)",

    formulaLatex:
      "S_w = \\left[\\frac{\\sqrt{1/R_t}}{\\frac{V_{sh}^{1-0.5V_{sh}}}{\\sqrt{R_{sh}}}+\\sqrt{\\frac{\\phi^m}{aR_w}}}\\right]^{2/n}",

    description:
      "Indonesian water-saturation relationship for shaly-sand resistivity interpretation.",
  },

  {
    name:
      "API RP 14E Erosional Velocity",

    slug:
      "api-rp-14e-erosional-velocity",

    domain:
      "Production Engineering",

    subDomain:
      "Well Performance",

    formulaText:
      "Ve = C / sqrt(ρm)",

    formulaLatex:
      "V_e = \\frac{C}{\\sqrt{\\rho_m}}",

    description:
      "API RP 14E erosional-velocity relationship shown in the supplied formula sheet.",
  },

  {
    name:
      "Carter Leakoff Volume for Hydraulic Fracturing",

    slug:
      "carter-leakoff-volume-hydraulic-fracturing",

    domain:
      "Production Engineering",

    subDomain:
      "Hydraulic Fracturing",

    formulaText:
      "VL = AL(2CL√t + Sp)",

    formulaLatex:
      "V_L = A_L\\left(2C_L\\sqrt{t}+S_p\\right)",

    description:
      "Carter leakoff-volume relationship for hydraulic-fracturing treatment analysis.",
  },
];

/* =========================================================
   MAIN
========================================================= */

async function main() {
  const uri =
    process.env
      .MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing from .env.local"
    );
  }

  const client =
    new MongoClient(
      uri
    );

  try {
    await client.connect();

    const db =
      client.db();

    const collection =
      db.collection(
        "formulas"
      );

    let inserted = 0;
    let existing = 0;

    for (
      const formula of
      formulas
    ) {
      const now =
        new Date();

      const result =
        await collection.updateOne(
          {
            slug:
              formula.slug,
          },
          {
            $setOnInsert: {
              ...formula,

              variables:
                [],

              supportedUnits:
                [],

              assumptions:
                [],

              limitations:
                [],

              calculationKey:
                "",

              verificationStatus:
                "under_review",

              sources: [
                {
                  name:
                    "Petroleum Engineering Formula Sheet",
                  url:
                    "",
                },
              ],

              generatedByAI:
                false,

              featured:
                false,

              status:
                "Draft",

              views:
                0,

              createdAt:
                now,

              updatedAt:
                now,
            },
          },
          {
            upsert:
              true,
          }
        );

      if (
        result.upsertedCount ===
        1
      ) {
        inserted +=
          1;

        console.log(
          `Added: ${formula.name}`
        );
      } else {
        existing +=
          1;

        console.log(
          `Already exists: ${formula.name}`
        );
      }
    }

    console.log("");
    console.log(
      "PetroHub petroleum formula seed complete."
    );

    console.log(
      `Inserted: ${inserted}`
    );

    console.log(
      `Existing: ${existing}`
    );

    console.log(
      `Source formulas: ${formulas.length}`
    );
  } finally {
    await client.close();
  }
}

main().catch(
  (
    error
  ) => {
    console.error(
      "Formula seed failed:",
      error
    );

    process.exitCode =
      1;
  }
);