import mongoose, {
  Schema,
} from "mongoose";

/* =========================================================
   PRIVATE RESEARCH SOURCE
========================================================= */

const ResearchSourceSchema =
  new Schema(
    {
      title: {
        type: String,
        default: "",
      },

      url: {
        type: String,
        required: true,
      },

      domain: {
        type: String,
        default: "",
      },

      sourceType: {
        type: String,

        enum: [
          "citation",
          "web_search",
        ],

        default:
          "web_search",
      },

      verified: {
        type: Boolean,
        default: false,
      },

      capturedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   KNOWLEDGE GAP
========================================================= */

const AIKnowledgeGapSchema =
  new Schema(
    {
      topicKey: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      exampleQuestion: {
        type: String,
        required: true,
      },

      latestQuestion: {
        type: String,
        required: true,
      },

      intent: {
        type: String,

        enum: [
          "concept",
          "formula",
          "calculation",
          "safety",
          "other",
        ],

        default:
          "concept",
      },

      hitCount: {
        type: Number,
        default: 1,
      },

      latestAnswerPreview: {
        type: String,
        default: "",
      },

      draftArticleId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "Article",

        default:
          null,
      },

      status: {
        type: String,

        enum: [
          "needs_review",
          "reviewing",
          "published",
          "rejected",
        ],

        default:
          "needs_review",
      },

      /*
        Private backend provenance.
        Never expose this field through
        public article APIs.
      */

      researchOrigin: {
        type: String,

        default:
          "petrohub_research",
      },

      /*
        Private web research sources.

        These URLs are intended for
        PetroHub admin review only.
      */

      researchSources: {
        type: [
          ResearchSourceSchema,
        ],

        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

/* =========================================================
   INDEXES
========================================================= */

AIKnowledgeGapSchema.index({
  hitCount: -1,
  updatedAt: -1,
});

AIKnowledgeGapSchema.index({
  "researchSources.domain": 1,
});

/* =========================================================
   MODEL
========================================================= */

export const AIKnowledgeGapModel =
  mongoose.models
    .AIKnowledgeGap ||
  mongoose.model(
    "AIKnowledgeGap",
    AIKnowledgeGapSchema
  );