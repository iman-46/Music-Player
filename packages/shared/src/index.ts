export type ID = string;

export type ImageSet = {
  small?: string;
  medium?: string;
  large?: string;
};

export type ArtistSummary = {
  id: ID;
  name: string;
  image?: string;
};

export type AlbumSummary = {
  id: ID;
  title: string;
  artist: string;
  artwork?: string;
  year?: number;
};

export type Track = {
  id: ID;
  youtubeId: string;
  title: string;
  artist: string;
  artists?: ArtistSummary[];
  album?: AlbumSummary;
  durationSeconds?: number;
  artwork?: string;
  sourceUrl: string;
  explicit?: boolean;
  genres?: string[];
};

export type Playlist = {
  id: ID;
  name: string;
  description?: string;
  ownerId: ID;
  ownerName?: string;
  collaborative: boolean;
  isPublic: boolean;
  coverUrl?: string;
  tracks: Track[];
  createdAt?: string;
  updatedAt?: string;
};

export type UserProfile = {
  id: ID;
  email: string;
  displayName: string;
  avatarUrl?: string;
  favoriteGenres: string[];
  theme: "spotify" | "midnight" | "contrast";
  role: "user" | "admin";
};

export type AuthResponse = {
  token: string;
  user: UserProfile;
};

export type SearchResponse = {
  query: string;
  nextPageToken?: string;
  tracks: Track[];
  artists: ArtistSummary[];
  albums: AlbumSummary[];
  playlists: Playlist[];
};

export type RecommendationReason =
  | "recently_played"
  | "favorite_genre"
  | "similar_artist"
  | "trending";

export type Recommendation = {
  track: Track;
  score: number;
  reason: RecommendationReason;
};

export type PlaybackMode = "off" | "one" | "all";
