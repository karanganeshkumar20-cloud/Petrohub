import mongoose, {
  Model,
  Schema,
} from "mongoose";

export interface IContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;

  status:
    | "Unread"
    | "Read"
    | "Resolved";

  createdAt?: Date;
  updatedAt?: Date;
}

const ContactMessageSchema =
  new Schema<IContactMessage>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 150,
      },

      subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },

      status: {
        type: String,
        enum: [
          "Unread",
          "Read",
          "Resolved",
        ],
        default: "Unread",
      },
    },
    {
      timestamps: true,
    }
  );

export const ContactMessageModel:
  Model<IContactMessage> =
  (mongoose.models
    .ContactMessage as Model<IContactMessage>) ||
  mongoose.model<IContactMessage>(
    "ContactMessage",
    ContactMessageSchema
  );