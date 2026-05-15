import type { Track } from "@aurora/shared";

export const fallbackTracks: Track[] = [
  {
    id: "yt-lofi-study",
    youtubeId: "jfKfPfyJRdk",
    title: "Lofi Study Radio",
    artist: "Lofi Girl",
    artwork: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    genres: ["lofi", "focus", "chill"],
  },
  {
    id: "yt-chillhop",
    youtubeId: "5yx6BWlEVcY",
    title: "Chillhop Essentials",
    artist: "Chillhop Music",
    artwork: "https://i.ytimg.com/vi/5yx6BWlEVcY/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=5yx6BWlEVcY",
    genres: ["lofi", "hip hop", "chill"],
  },
  {
    id: "yt-synthwave",
    youtubeId: "4xDzrJKXOOY",
    title: "Synthwave Radio",
    artist: "ThePrimeThanatos",
    artwork: "https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    genres: ["synthwave", "electronic"],
  },
  {
    id: "yt-house",
    youtubeId: "36YnV9STBqc",
    title: "Deep House Radio",
    artist: "Selected",
    artwork: "https://i.ytimg.com/vi/36YnV9STBqc/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=36YnV9STBqc",
    genres: ["house", "electronic", "dance"],
  },
  {
    id: "yt-jazz",
    youtubeId: "Dx5qFachd3A",
    title: "Coffee Jazz",
    artist: "Relax Music",
    artwork: "https://i.ytimg.com/vi/Dx5qFachd3A/hqdefault.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=Dx5qFachd3A",
    genres: ["jazz", "coffee", "chill"],
  },
];

export function filterFallbackTracks(query: string) {
  const normalized = query.toLowerCase();
  return fallbackTracks.filter((track) =>
    [track.title, track.artist, ...(track.genres ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}
