import mongoose, {
  Model,
  Schema,
} from "mongoose";

export type AnalyticsItemType =
  | "article"
  | "book";

export type AnalyticsEventType =
  | "view"
  | "download";

export interface IAnalyticsEvent {
  eventType:
    AnalyticsEventType;

  itemType:
    AnalyticsItemType;

  itemId:
    mongoose.Types.ObjectId;

  userId?:
    mongoose.Types.ObjectId | null;

  visitorId: string;

  occurredAt: Date;

  createdAt: Date;

  updatedAt: Date;
}

const AnalyticsEventSchema =
  new Schema<IAnalyticsEvent>(
    {
      eventType: {
        type: String,

        enum: [
          "view",
          "download",
        ],

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

      userId: {
        type:
          Schema.Types
            .ObjectId,

        ref: "User",

        default: null,

        index: true,
      },

      visitorId: {
        type: String,

        required: true,

        index: true,
      },

      occurredAt: {
        type: Date,

        default: Date.now,

        required: true,

        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

/* =========================================================
   GENERAL ANALYTICS INDEX
========================================================= */

AnalyticsEventSchema.index({
  eventType: 1,
  itemType: 1,
  occurredAt: -1,
});

/* =========================================================
   VISITOR / CONTENT INDEX
========================================================= */

AnalyticsEventSchema.index({
  visitorId: 1,
  itemType: 1,
  itemId: 1,
  eventType: 1,
  occurredAt: -1,
});

/* =========================================================
   USER INDEX
========================================================= */

AnalyticsEventSchema.index({
  userId: 1,
  eventType: 1,
  occurredAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

export const AnalyticsEventModel:
  Model<IAnalyticsEvent> =
  (mongoose.models
    .AnalyticsEvent as
    Model<IAnalyticsEvent>) ||
  mongoose.model<IAnalyticsEvent>(
    "AnalyticsEvent",
    AnalyticsEventSchema
  );