import mongoose, {
  Schema,
} from "mongoose";

const AIQueryLogSchema =
  new Schema(
    {
      userId: {
        type: String,
        required: true,
        index: true,
      },

      email: {
        type: String,
        default: "",
      },

      question: {
        type: String,
        required: true,
      },

      normalizedQuestion: {
        type: String,
        required: true,
        index: true,
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

      mode: {
        type: String,

        enum: [
          "petrohub",
          "web",
          "hybrid",
        ],

        default:
          "petrohub",
      },

      hadLocalSources: {
        type: Boolean,
        default: false,
      },

      localSourceCount: {
        type: Number,
        default: 0,
      },

      usedWebSearch: {
        type: Boolean,
        default: false,
      },

      answerPreview: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

AIQueryLogSchema.index({
  createdAt: -1,
});

export const AIQueryLogModel =
  mongoose.models
    .AIQueryLog ||
  mongoose.model(
    "AIQueryLog",
    AIQueryLogSchema
  );