import mongoose, { Model, Schema } from "mongoose";

export interface IBook {
  title: string;
  slug: string;

  author: string;
  description: string;
  category: string;

  contentType:
    | "book"
    | "manual"
    | "standard"
    | "note"
    | "download";

  coverImage: string;

  resourceType: "hosted" | "external";

  fileUrl: string;
  filePublicId: string;

  externalUrl: string;

  pages: number;
  edition: string;
  publisher: string;
  year?: number;

  license: string;
  source: string;
  sourceUrl: string;

  status: "Draft" | "Published";

  featured: boolean;

  views: number;
  downloads: number;
}

const BookSchema = new Schema<IBook>(
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
      index: true,
    },

    author: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    contentType: {
      type: String,
      enum: [
        "book",
        "manual",
        "standard",
        "note",
        "download",
      ],
      default: "book",
      index: true,
    },

    coverImage: {
      type: String,
      default: "",
    },

    resourceType: {
      type: String,
      enum: ["hosted", "external"],
      default: "hosted",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    filePublicId: {
      type: String,
      default: "",
    },

    externalUrl: {
      type: String,
      default: "",
    },

    pages: {
      type: Number,
      default: 0,
    },

    edition: {
      type: String,
      default: "",
    },

    publisher: {
      type: String,
      default: "",
    },

    year: {
      type: Number,
    },

    license: {
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

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const BookModel: Model<IBook> =
  (mongoose.models.Book as Model<IBook>) ||
  mongoose.model<IBook>("Book", BookSchema);