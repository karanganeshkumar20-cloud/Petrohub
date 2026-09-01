import mongoose, {
  Model,
  Schema,
} from "mongoose";

export type AnalyticsGoalMetric =
  | "users"
  | "views"
  | "downloads"
  | "bookmarks";

export interface IAnalyticsGoal {
  metric: AnalyticsGoalMetric;

  target: number;

  period: "monthly";

  createdAt: Date;

  updatedAt: Date;
}

const AnalyticsGoalSchema =
  new Schema<IAnalyticsGoal>(
    {
      metric: {
        type: String,

        enum: [
          "users",
          "views",
          "downloads",
          "bookmarks",
        ],

        required: true,

        unique: true,

        index: true,
      },

      target: {
        type: Number,

        required: true,

        default: 0,

        min: 0,
      },

      period: {
        type: String,

        enum: [
          "monthly",
        ],

        default:
          "monthly",

        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

export const AnalyticsGoalModel:
  Model<IAnalyticsGoal> =
    (mongoose.models
      .AnalyticsGoal as
      Model<IAnalyticsGoal>) ||
    mongoose.model<IAnalyticsGoal>(
      "AnalyticsGoal",
      AnalyticsGoalSchema
    );