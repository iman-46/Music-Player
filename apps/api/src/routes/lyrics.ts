import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/http.js";

export const lyricsRouter = Router();

lyricsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { artist, title } = z
      .object({ artist: z.string(), title: z.string() })
      .parse(req.query);
    res.json({
      artist,
      title,
      lyrics:
        "Lyrics integration placeholder. Connect a licensed lyrics provider such as Musixmatch, Genius, or LRCLIB and respect each provider's display terms.",
    });
  }),
);
