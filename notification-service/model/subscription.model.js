import mongoose from "mongoose";

const notificationSubSchema = new mongoose.Schema(
  {
    authorId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      enum: ["email", "sms", "whatsapp"],
      required: true,
    },

    contact: {
      type: String, // email or phone
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

notificationSubSchema.index({ authorId: 1, userId: 1 }, { unique: true });

notificationSubSchema.index({ authorId: 1, isActive: 1 });

export const NotificationSub = mongoose.model(
  "NotificationSub",
  notificationSubSchema,
);
