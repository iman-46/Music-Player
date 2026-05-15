import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  LikedSongModel,
  ListeningHistoryModel,
  RecentlyPlayedModel,
} from "../models/Listening.js";
import { PlaylistModel } from "../models/Playlist.js";
import { toUserProfile, UserModel } from "../models/User.js";
import { asyncHandler } from "../utils/http.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [users, playlists, likedSongs, plays, recent] = await Promise.all([
      UserModel.countDocuments(),
      PlaylistModel.countDocuments(),
      LikedSongModel.countDocuments(),
      ListeningHistoryModel.countDocuments(),
      RecentlyPlayedModel.find().sort({ playedAt: -1 }).limit(25).lean(),
    ]);

    const topTracks = aggregateTracks(recent.map((row) => row.track));
    res.json({ likedSongs, playlists, plays, topTracks, users });
  }),
);

adminRouter.get(
  "/users",
  asyncHandler(async (req, res) => {
    const page = z.coerce.number().min(1).default(1).parse(req.query.page);
    const limit = 25;
    const [users, total] = await Promise.all([
      UserModel.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      UserModel.countDocuments(),
    ]);
    res.json({ page, total, users: users.map(toUserProfile) });
  }),
);

adminRouter.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const body = z
      .object({ role: z.enum(["user", "admin"]).optional() })
      .parse(req.body);
    const user = await UserModel.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    res.json({ user: user ? toUserProfile(user) : null });
  }),
);

adminRouter.get(
  "/playlist-reports",
  asyncHandler(async (_req, res) => {
    const playlists = await PlaylistModel.find()
      .populate("owner", "displayName")
      .sort({ updatedAt: -1 })
      .limit(100);
    res.json({
      playlists: playlists.map((playlist) => ({
        id: playlist.id,
        collaborative: playlist.collaborative,
        isPublic: playlist.isPublic,
        name: playlist.name,
        trackCount: playlist.tracks.length,
        updatedAt: playlist.updatedAt,
      })),
    });
  }),
);

function aggregateTracks<
  T extends { id: string; title: string; artist: string },
>(tracks: T[]) {
  const counts = new Map<
    string,
    { artist: string; plays: number; title: string }
  >();
  for (const track of tracks) {
    const existing = counts.get(track.id) ?? {
      artist: track.artist,
      plays: 0,
      title: track.title,
    };
    existing.plays += 1;
    counts.set(track.id, existing);
  }
  return Array.from(counts.entries())
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 10);
}
