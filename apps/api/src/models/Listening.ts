import { Schema, model } from "mongoose";
import { trackSchema } from "./Track.js";

const likedSongSchema = new Schema(
  {
    track: { type: trackSchema, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

likedSongSchema.index({ user: 1, "track.id": 1 }, { unique: true });

const historySchema = new Schema(
  {
    completed: { type: Boolean, default: false },
    listenedAt: { type: Date, default: Date.now, index: true },
    progressSeconds: { type: Number, default: 0 },
    track: { type: trackSchema, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const recentlyPlayedSchema = new Schema(
  {
    playedAt: { type: Date, default: Date.now, index: true },
    track: { type: trackSchema, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

recentlyPlayedSchema.index({ user: 1, "track.id": 1 }, { unique: true });

const followingArtistSchema = new Schema(
  {
    artist: {
      id: { type: String, required: true },
      image: String,
      name: { type: String, required: true },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

followingArtistSchema.index({ user: 1, "artist.id": 1 }, { unique: true });

export const LikedSongModel = model("LikedSong", likedSongSchema);
export const ListeningHistoryModel = model("ListeningHistory", historySchema);
export const RecentlyPlayedModel = model(
  "RecentlyPlayed",
  recentlyPlayedSchema,
);
export const FollowingArtistModel = model(
  "FollowingArtist",
  followingArtistSchema,
);
