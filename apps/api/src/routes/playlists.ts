import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { PlaylistModel, toPlaylist } from "../models/Playlist.js";
import { asyncHandler, HttpError } from "../utils/http.js";

export const playlistsRouter = Router();

const playlistSchema = z.object({
  collaborative: z.boolean().default(false),
  description: z.string().max(500).default(""),
  isPublic: z.boolean().default(true),
  name: z.string().min(1).max(120),
});

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

playlistsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const playlists = await PlaylistModel.find({
      $or: [
        { owner: req.user!.id },
        { collaborators: req.user!.id },
        { isPublic: true },
      ],
    })
      .populate("owner", "displayName")
      .sort({ updatedAt: -1 });
    res.json({ playlists: playlists.map(toPlaylist) });
  }),
);

playlistsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = playlistSchema.parse(req.body);
    const playlist = await PlaylistModel.create({
      ...body,
      owner: req.user!.id,
      tracks: [],
    });
    res.status(201).json({ playlist: toPlaylist(playlist) });
  }),
);

playlistsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const playlist = await PlaylistModel.findById(req.params.id).populate(
      "owner",
      "displayName",
    );
    if (!playlist || !playlist.isPublic)
      throw new HttpError(404, "Playlist not found");
    res.json({ playlist: toPlaylist(playlist) });
  }),
);

playlistsRouter.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = playlistSchema.partial().parse(req.body);
    const playlist = await PlaylistModel.findOneAndUpdate(
      { _id: req.params.id, owner: req.user!.id },
      body,
      { new: true },
    );
    if (!playlist) throw new HttpError(404, "Playlist not found");
    res.json({ playlist: toPlaylist(playlist) });
  }),
);

playlistsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await PlaylistModel.deleteOne({ _id: req.params.id, owner: req.user!.id });
    res.status(204).end();
  }),
);

playlistsRouter.post(
  "/:id/tracks",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const track = trackSchema.parse(req.body.track);
    const playlist = await writablePlaylist(req.params.id, req.user!.id);
    if (!playlist.tracks.some((item) => item.id === track.id)) {
      playlist.tracks.push(track);
      await playlist.save();
    }
    res.status(201).json({ playlist: toPlaylist(playlist) });
  }),
);

playlistsRouter.delete(
  "/:id/tracks/:trackId",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const playlist = await writablePlaylist(req.params.id, req.user!.id);
    playlist.tracks = playlist.tracks.filter(
      (track) => track.id !== req.params.trackId,
    );
    await playlist.save();
    res.json({ playlist: toPlaylist(playlist) });
  }),
);

playlistsRouter.patch(
  "/:id/reorder",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { trackIds } = z
      .object({ trackIds: z.array(z.string()) })
      .parse(req.body);
    const playlist = await writablePlaylist(req.params.id, req.user!.id);
    const byId = new Map(playlist.tracks.map((track) => [track.id, track]));
    playlist.tracks = trackIds
      .map((id) => byId.get(id))
      .filter(Boolean) as typeof playlist.tracks;
    await playlist.save();
    res.json({ playlist: toPlaylist(playlist) });
  }),
);

async function writablePlaylist(id: string, userId: string) {
  const playlist = await PlaylistModel.findOne({
    _id: id,
    $or: [{ owner: userId }, { collaborative: true, collaborators: userId }],
  });
  if (!playlist) throw new HttpError(404, "Playlist not found or not editable");
  return playlist;
}
