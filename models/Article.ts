import mongoose, { Schema, models, model } from "mongoose";

const ArticleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    summary: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    featuredImage: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "PetroHub",
    },

    sourceUrl: {
      type: String,
      default: "",
    },

    license: {
      type: String,
      default: "",
    },

    author: {
      type: String,
      default: "PetroHub Team",
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Article || model("Article", ArticleSchema);