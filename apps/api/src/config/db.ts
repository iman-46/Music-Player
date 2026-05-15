import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.warn("Failed to connect to MongoDB. Some features like history and playlists will be unavailable:", err instanceof Error ? err.message : err);
  }
}
