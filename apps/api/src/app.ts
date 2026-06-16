import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { lyricsRouter } from "./routes/lyrics.js";
import { musicRouter } from "./routes/music.js";
import { playlistsRouter } from "./routes/playlists.js";
import { usersRouter } from "./routes/users.js";
import { errorHandler, notFound } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, mobile apps)
        if (!origin) return callback(null, true);
        // In development, allow any localhost port
        if (env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        // In production, only allow the configured origin
        if (origin === env.CLIENT_ORIGIN) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(rateLimit({ limit: 400, standardHeaders: true, windowMs: 60_000 }));

  app.get("/health", (_req, res) =>
    res.json({ ok: true, service: "aurora-api" }),
  );
  app.use("/api/auth", authRouter);
  app.use("/api/lyrics", lyricsRouter);
  app.use("/api/music", musicRouter);
  app.use("/api/playlists", playlistsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/admin", adminRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
