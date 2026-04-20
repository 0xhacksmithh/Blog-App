import mongoose from "mongoose";
import { db_uri } from "../config/index.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(db_uri);
    console.log("DB Connection Sucessful");
  } catch (error) {
    console.log("DB Connection Failed");
  }
};
