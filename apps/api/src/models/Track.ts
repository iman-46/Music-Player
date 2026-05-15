import { Schema } from "mongoose";

export const trackSchema = new Schema(
  {
    album: {
      artist: String,
      artwork: String,
      id: String,
      title: String,
      year: Number,
    },
    artist: { type: String, required: true },
    artists: [
      {
        id: String,
        image: String,
        name: String,
      },
    ],
    artwork: String,
    durationSeconds: Number,
    explicit: Boolean,
    genres: { type: [String], default: [] },
    id: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    title: { type: String, required: true },
    youtubeId: { type: String, required: true },
  },
  { _id: false },
);
