import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import {
  FollowingArtistModel,
  LikedSongModel,
  ListeningHistoryModel,
  RecentlyPlayedModel,
} from "../models/Listening.js";
import { buildRecommendations } from "../services/recommendations.js";
import { getTrendingTracks, searchYouTubeMusic } from "../services/youtube.js";
import { asyncHandler } from "../utils/http.js";

export const musicRouter = Router();

const trackSchema = z.object({
  album: z.any().optional(),
  artist: z.string(),
  artists: z.array(z.any()).optional(),
  artwork: z.string().optional(),
  durationSeconds: z.number().optional(),
  explicit: z.boolean().optional(),
  genres: z.array(z.string()).optional(),
  id: z.string(),
  sourceUrl: z.string(),
  title: z.string(),
  youtubeId: z.string(),
});

musicRouter.get(
  "/search",
  asyncHandler(async (req, res) => {
    const query = z.string().min(1).parse(req.query.q);
    const pageToken = z.string().optional().parse(req.query.pageToken);
    res.json(await searchYouTubeMusic(query, pageToken));
  }),
);

musicRouter.get(
  "/trending",
  asyncHandler(async (_req, res) => {
    res.json({ tracks: await getTrendingTracks() });
  }),
);

musicRouter.get(
  "/recommendations",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json({ recommendations: await buildRecommendations(req.user!.id) });
  }),
);

musicRouter.get(
  "/liked",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const rows = await LikedSongModel.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ tracks: rows.map((row) => row.track) });
  }),
);

musicRouter.post(
  "/liked",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const track = trackSchema.parse(req.body.track);
    await LikedSongModel.updateOne(
      { user: req.user!.id, "track.id": track.id },
      { $set: { track } },
      { upsert: true },
    );
    res.status(201).json({ ok: true });
  }),
);

musicRouter.delete(
  "/liked/:trackId",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await LikedSongModel.deleteOne({
      user: req.user!.id,
      "track.id": req.params.trackId,
    });
    res.status(204).end();
  }),
);

musicRouter.get(
  "/recently-played",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const rows = await RecentlyPlayedModel.find({ user: req.user!.id })
      .sort({ playedAt: -1 })
      .limit(50)
      .lean();
    res.json({ tracks: rows.map((row) => row.track) });
  }),
);

musicRouter.post(
  "/history",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = z
      .object({
        completed: z.boolean().default(false),
        progressSeconds: z.number().default(0),
        track: trackSchema,
      })
      .parse(req.body);
    await ListeningHistoryModel.create({ ...body, user: req.user!.id });
    await RecentlyPlayedModel.updateOne(
      { user: req.user!.id, "track.id": body.track.id },
      { $set: { playedAt: new Date(), track: body.track } },
      { upsert: true },
    );
    res.status(201).json({ ok: true });
  }),
);

musicRouter.post(
  "/following-artists",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const artist = z
      .object({
        id: z.string(),
        image: z.string().optional(),
        name: z.string(),
      })
      .parse(req.body.artist);
    await FollowingArtistModel.updateOne(
      { user: req.user!.id, "artist.id": artist.id },
      { $set: { artist } },
      { upsert: true },
    );
    res.status(201).json({ ok: true });
  }),
);
