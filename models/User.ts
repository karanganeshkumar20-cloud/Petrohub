import mongoose, {
  Schema,
  model,
  models,
} from "mongoose";

const UserSchema =
  new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        enum: [
          "user",
          "admin",
        ],
        default: "user",
      },

      image: {
        type: String,
        default: "",
      },

      isBlocked: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

export default (
  models.User ||
  model(
    "User",
    UserSchema
  )
);