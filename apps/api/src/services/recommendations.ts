import type { Recommendation, Track } from "@aurora/shared";
import {
  LikedSongModel,
  ListeningHistoryModel,
  RecentlyPlayedModel,
} from "../models/Listening.js";
import { getDemoTracks, getTrendingTracks } from "./youtube.js";

export async function buildRecommendations(
  userId: string,
): Promise<Recommendation[]> {
  const [history, liked, recent, trending] = await Promise.all([
    ListeningHistoryModel.find({ user: userId })
      .sort({ listenedAt: -1 })
      .limit(50)
      .lean(),
    LikedSongModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    RecentlyPlayedModel.find({ user: userId })
      .sort({ playedAt: -1 })
      .limit(25)
      .lean(),
    getTrendingTracks().catch(() => getDemoTracks()),
  ]);

  const genreWeights = new Map<string, number>();
  const artistWeights = new Map<string, number>();

  for (const item of [...history, ...liked, ...recent]) {
    for (const genre of item.track.genres ?? []) {
      genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + 1);
    }
    artistWeights.set(
      item.track.artist,
      (artistWeights.get(item.track.artist) ?? 0) + 1,
    );
  }

  const scored = trending.map((track) => {
    const genreScore = (track.genres ?? []).reduce(
      (score, genre) => score + (genreWeights.get(genre) ?? 0),
      0,
    );
    const artistScore = artistWeights.get(track.artist) ?? 0;
    const reason =
      artistScore > 0
        ? "similar_artist"
        : genreScore > 0
          ? "favorite_genre"
          : "trending";
    return {
      reason,
      score: 1 + genreScore * 2 + artistScore * 3,
      track,
    } satisfies Recommendation;
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 20);
}

export function compactTracks(tracks: Track[]) {
  return Array.from(new Map(tracks.map((track) => [track.id, track])).values());
}
