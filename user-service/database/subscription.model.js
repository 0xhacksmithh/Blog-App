import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // author is also a user
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ["email", "sms", "whatsapp"],
      required: true,
    },

    contact: {
      type: String, // email OR phone
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index({ user: 1, author: 1 }, { unique: true });

subscriptionSchema.index({ author: 1, isActive: 1 }); // get subscribers of author
subscriptionSchema.index({ user: 1, isActive: 1 }); // get authors followed by user

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
