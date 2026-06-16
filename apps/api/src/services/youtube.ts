import type {
  AlbumSummary,
  ArtistSummary,
  SearchResponse,
  Track,
} from "@aurora/shared";
import { env } from "../config/env.js";

const demoTracks: Track[] = [
  {
    id: "yt-lofi-study",
    youtubeId: "jfKfPfyJRdk",
    title: "Lofi Study Radio",
    artist: "Lofi Girl",
    artists: [{ id: "lofi-girl", name: "Lofi Girl" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    genres: ["lofi", "focus", "chill"],
  },
  {
    id: "yt-chillhop",
    youtubeId: "5yx6BWlEVcY",
    title: "Chillhop Essentials",
    artist: "Chillhop Music",
    artists: [{ id: "chillhop-music", name: "Chillhop Music" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/5yx6BWlEVcY/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=5yx6BWlEVcY",
    genres: ["lofi", "hip hop", "chill"],
  },
  {
    id: "yt-synthwave",
    youtubeId: "4xDzrJKXOOY",
    title: "Synthwave Radio",
    artist: "ThePrimeThanatos",
    artists: [{ id: "prime-thanatos", name: "ThePrimeThanatos" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    genres: ["synthwave", "electronic"],
  },
  {
    id: "yt-house",
    youtubeId: "36YnV9STBqc",
    title: "Deep House Radio",
    artist: "Selected",
    artists: [{ id: "selected", name: "Selected" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/36YnV9STBqc/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=36YnV9STBqc",
    genres: ["house", "electronic", "dance"],
  },
  {
    id: "yt-ambient",
    youtubeId: "lTRiuFIWV54",
    title: "Ambient Study Music",
    artist: "Ambient Worlds",
    artists: [{ id: "ambient-worlds", name: "Ambient Worlds" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/lTRiuFIWV54/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=lTRiuFIWV54",
    genres: ["ambient", "study", "cinematic"],
  },
  {
    id: "yt-jazz",
    youtubeId: "Dx5qFachd3A",
    title: "Coffee Jazz",
    artist: "Relax Music",
    artists: [{ id: "relax-music", name: "Relax Music" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/Dx5qFachd3A/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=Dx5qFachd3A",
    genres: ["jazz", "coffee", "chill"],
  },
  {
    id: "yt-classical",
    youtubeId: "mIYzp5rcTvU",
    title: "Classical Focus",
    artist: "HALIDONMUSIC",
    artists: [{ id: "halidonmusic", name: "HALIDONMUSIC" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/mIYzp5rcTvU/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=mIYzp5rcTvU",
    genres: ["classical", "focus", "study"],
  },
  {
    id: "yt-indie",
    youtubeId: "b9v1sI6JX4E",
    title: "Indie Pop Radio",
    artist: "alexrainbirdMusic",
    artists: [{ id: "alexrainbirdmusic", name: "alexrainbirdMusic" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/b9v1sI6JX4E/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=b9v1sI6JX4E",
    genres: ["indie", "pop", "acoustic"],
  },
  {
    id: "yt-workout",
    youtubeId: "K4DyBUG242c",
    title: "Workout Electronic Mix",
    artist: "NoCopyrightSounds",
    artists: [{ id: "nocopyrightsounds", name: "NoCopyrightSounds" }],
    durationSeconds: 3600,
    artwork: "https://i.ytimg.com/vi/K4DyBUG242c/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=K4DyBUG242c",
    genres: ["workout", "electronic", "dance"],
  },
];

export async function searchYouTubeMusic(
  query: string,
  pageToken?: string,
): Promise<SearchResponse> {
  const normalized = query.toLowerCase();

  // No API key — filter demo tracks locally
  if (!env.YOUTUBE_API_KEY) {
    const tracks = demoTracks.filter((track) =>
      [track.title, track.artist, ...(track.genres ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
    return buildSearchResponse(query, tracks.length ? tracks : demoTracks);
  }

  try {
    const params = new URLSearchParams({
      key: env.YOUTUBE_API_KEY,
      maxResults: "20",
      part: "snippet",
      q: `${query} music`,
      type: "video",
      videoCategoryId: "10",
      videoEmbeddable: "true",
      videoSyndicated: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[YouTube] search failed (${response.status}): ${errBody}`);
      // Fall through to demo fallback below
      throw new Error(`YouTube API ${response.status}`);
    }

    const data = (await response.json()) as YouTubeSearchResult;
    const tracks = data.items.map((item) => ({
      id: `yt-${item.id.videoId}`,
      youtubeId: item.id.videoId,
      title: stripOfficialVideoSuffix(item.snippet.title),
      artist: item.snippet.channelTitle,
      artists: [
        { id: slug(item.snippet.channelTitle), name: item.snippet.channelTitle },
      ],
      artwork:
        item.snippet.thumbnails.maxres?.url ??
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url,
      sourceUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      genres: ["music"],
    }));

    return {
      ...buildSearchResponse(query, tracks),
      nextPageToken: data.nextPageToken,
    };
  } catch (err) {
    // Graceful fallback: return demo tracks filtered by query
    console.error("[YouTube] Falling back to demo tracks:", err);
    const tracks = demoTracks.filter((track) =>
      [track.title, track.artist, ...(track.genres ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
    return buildSearchResponse(query, tracks.length ? tracks : demoTracks);
  }
}

export async function getTrendingTracks() {
  if (!env.YOUTUBE_API_KEY) {
    return demoTracks;
  }

  const params = new URLSearchParams({
    chart: "mostPopular",
    key: env.YOUTUBE_API_KEY,
    maxResults: "20",
    part: "snippet,contentDetails,statistics",
    videoCategoryId: "10",
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`,
  );
  if (!response.ok) {
    throw new HttpError(
      502,
      "YouTube trending request failed",
      await response.text(),
    );
  }

  const data = (await response.json()) as YouTubeVideoResult;
  return data.items.map((item) => ({
    id: `yt-${item.id}`,
    youtubeId: item.id,
    title: stripOfficialVideoSuffix(item.snippet.title),
    artist: item.snippet.channelTitle,
    artists: [
      { id: slug(item.snippet.channelTitle), name: item.snippet.channelTitle },
    ],
    artwork:
      item.snippet.thumbnails.maxres?.url ??
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url,
    sourceUrl: `https://www.youtube.com/watch?v=${item.id}`,
    genres: ["trending", "music"],
  })) satisfies Track[];
}

export function getDemoTracks() {
  return demoTracks;
}

function buildSearchResponse(query: string, tracks: Track[]): SearchResponse {
  const artists = dedupeBy(
    tracks.flatMap(
      (track) =>
        track.artists ?? [{ id: slug(track.artist), name: track.artist }],
    ),
    "id",
  ) as ArtistSummary[];
  const albums = tracks
    .filter((track) => track.album)
    .map((track) => track.album as AlbumSummary);

  return {
    albums: dedupeBy(albums, "id"),
    artists,
    playlists: [],
    query,
    tracks,
  };
}

function dedupeBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return Array.from(new Map(items.map((item) => [item[key], item])).values());
}

function stripOfficialVideoSuffix(title: string) {
  return title.replace(/\s*\((official|lyrics?).*?\)\s*/gi, "").trim();
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Thumbnail = { url: string };

type YouTubeSearchResult = {
  nextPageToken?: string;
  items: Array<{
    id: { videoId: string };
    snippet: {
      channelTitle: string;
      thumbnails: { medium?: Thumbnail; high?: Thumbnail; maxres?: Thumbnail };
      title: string;
    };
  }>;
};

type YouTubeVideoResult = {
  items: Array<{
    id: string;
    snippet: {
      channelTitle: string;
      thumbnails: { medium?: Thumbnail; high?: Thumbnail; maxres?: Thumbnail };
      title: string;
    };
  }>;
};
