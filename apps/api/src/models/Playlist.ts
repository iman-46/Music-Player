import { Schema, model } from "mongoose";
import { trackSchema } from "./Track.js";

const playlistSchema = new Schema(
  {
    collaborative: { type: Boolean, default: false },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    coverUrl: String,
    description: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shareSlug: { type: String, unique: true, sparse: true },
    tracks: { type: [trackSchema], default: [] },
  },
  { timestamps: true },
);

export const PlaylistModel = model("Playlist", playlistSchema);

export function toPlaylist(playlist: any) {
  const owner = playlist.owner as unknown as {
    _id?: string;
    id?: string;
    displayName?: string;
  };
  return {
    id: playlist.id,
    collaborative: playlist.collaborative,
    coverUrl: playlist.coverUrl,
    createdAt: playlist.createdAt?.toISOString(),
    description: playlist.description,
    isPublic: playlist.isPublic,
    name: playlist.name,
    ownerId: owner?.id ?? String(playlist.owner),
    ownerName: owner?.displayName,
    tracks: playlist.tracks,
    updatedAt: playlist.updatedAt?.toISOString(),
  };
}
