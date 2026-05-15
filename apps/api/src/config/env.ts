import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_SECRET: z
    .string()
    .min(24)
    .default("dev-secret-change-me-before-production"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/aurora-music"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  YOUTUBE_API_KEY: z.string().optional(),
});

export const env = schema.parse(process.env);
