import mongoose, {
  Model,
  Schema,
} from "mongoose";

export interface IBookmark {
  userId: mongoose.Types.ObjectId;

  itemType:
    | "article"
    | "book";

  itemId: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

const BookmarkSchema =
  new Schema<IBookmark>(
    {
      userId: {
        type:
          Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      itemType: {
        type: String,
        enum: [
          "article",
          "book",
        ],
        required: true,
        index: true,
      },

      itemId: {
        type:
          Schema.Types
            .ObjectId,
        required: true,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

/*
 * Prevent duplicate bookmarks
 */

BookmarkSchema.index(
  {
    userId: 1,
    itemType: 1,
    itemId: 1,
  },
  {
    unique: true,
  }
);

export const BookmarkModel: Model<IBookmark> =
  (mongoose.models
    .Bookmark as Model<IBookmark>) ||
  mongoose.model<IBookmark>(
    "Bookmark",
    BookmarkSchema
  );