import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/");
    console.log("DB Connection Sucessful");
  } catch (error) {
    console.log("DB Connection Failed");
  }
};
