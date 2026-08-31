import mongoose, {
  Model,
  Schema,
} from "mongoose";

export interface IReadingHistory {
  userId:
    mongoose.Types.ObjectId;

  itemType:
    | "article"
    | "book";

  itemId:
    mongoose.Types.ObjectId;

  lastViewedAt: Date;

  viewCount: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const ReadingHistorySchema =
  new Schema<IReadingHistory>(
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

      lastViewedAt: {
        type: Date,

        default:
          Date.now,

        index: true,
      },

      viewCount: {
        type: Number,

        default: 1,

        min: 1,
      },
    },

    {
      timestamps: true,
    }
  );

/*
 * One history record per
 * user + resource.
 */

ReadingHistorySchema.index(
  {
    userId: 1,
    itemType: 1,
    itemId: 1,
  },

  {
    unique: true,
  }
);

export const ReadingHistoryModel:
  Model<IReadingHistory> =
    (mongoose.models
      .ReadingHistory as
      Model<IReadingHistory>) ||
    mongoose.model<IReadingHistory>(
      "ReadingHistory",
      ReadingHistorySchema
    );