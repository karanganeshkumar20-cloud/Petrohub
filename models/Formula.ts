import {
  Schema,
  model,
  models,
} from "mongoose";

/* =========================================================
   VARIABLE
========================================================= */

const FormulaVariableSchema =
  new Schema(
    {
      symbol: {
        type: String,
        required: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      unit: {
        type: String,
        default: "",
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   SOURCE
========================================================= */

const FormulaSourceSchema =
  new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      url: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   FORMULA
========================================================= */

const FormulaSchema =
  new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
      },

      domain: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      subDomain: {
        type: String,
        default: "",
        trim: true,
        index: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      formulaText: {
        type: String,
        required: true,
        trim: true,
      },

      formulaLatex: {
        type: String,
        default: "",
        trim: true,
      },

      variables: {
        type: [
          FormulaVariableSchema,
        ],
        default: [],
      },

      supportedUnits: {
        type: [String],
        default: [],
      },

      assumptions: {
        type: [String],
        default: [],
      },

      limitations: {
        type: [String],
        default: [],
      },

      /*
        Important:
        This is NOT executable JavaScript.

        Later the calculator engine will use
        this key to select a trusted,
        hard-coded TypeScript calculation.
      */

      calculationKey: {
        type: String,
        default: "",
        trim: true,
        index: true,
      },

      verificationStatus: {
        type: String,

        enum: [
          "unverified",
          "under_review",
          "verified",
          "rejected",
        ],

        default:
          "unverified",

        index: true,
      },

      sources: {
        type: [
          FormulaSourceSchema,
        ],
        default: [],
      },

      generatedByAI: {
        type: Boolean,
        default: false,
      },

      featured: {
        type: Boolean,
        default: false,
      },

      status: {
        type: String,

        enum: [
          "Draft",
          "Published",
        ],

        default:
          "Draft",

        index: true,
      },

      views: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      timestamps: true,
    }
  );

/* =========================================================
   INDEXES
========================================================= */

FormulaSchema.index({
  domain: 1,
  subDomain: 1,
  status: 1,
});

FormulaSchema.index({
  verificationStatus: 1,
  status: 1,
});

FormulaSchema.index({
  name: "text",
  description: "text",
  domain: "text",
  subDomain: "text",
});

/* =========================================================
   MODEL
========================================================= */

export const FormulaModel =
  models.Formula ||
  model(
    "Formula",
    FormulaSchema
  );

export default FormulaModel;