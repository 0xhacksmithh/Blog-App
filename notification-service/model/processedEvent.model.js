import mongoose from "mongoose";

const schema = new mongoose.Schema({
  eventId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const ProcessedEvent = mongoose.model("ProcessedEvent", schema);
