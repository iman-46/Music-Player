import type {
  AuthResponse,
  Playlist,
  Recommendation,
  SearchResponse,
  Track,
  UserProfile,
} from "@aurora/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.message ?? "Request failed", response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const musicApi = {
  liked: (token: string) => api<{ tracks: Track[] }>("/music/liked", {}, token),
  like: (track: Track, token: string) =>
    api(
      "/music/liked",
      { body: JSON.stringify({ track }), method: "POST" },
      token,
    ),
  recommendations: (token: string) =>
    api<{ recommendations: Recommendation[] }>(
      "/music/recommendations",
      {},
      token,
    ),
  recordPlay: (track: Track, token: string) =>
    api(
      "/music/history",
      {
        body: JSON.stringify({ completed: false, progressSeconds: 0, track }),
        method: "POST",
      },
      token,
    ),
  search: (query: string, pageToken?: string) =>
    api<SearchResponse>(
      `/music/search?q=${encodeURIComponent(query)}${pageToken ? `&pageToken=${pageToken}` : ""}`,
    ),
  trending: () => api<{ tracks: Track[] }>("/music/trending"),
  unlike: (trackId: string, token: string) =>
    api(`/music/liked/${trackId}`, { method: "DELETE" }, token),
};

export const authApi = {
  login: (email: string, password: string) =>
    api<AuthResponse>("/auth/login", {
      body: JSON.stringify({ email, password }),
      method: "POST",
    }),
  me: (token: string) => api<{ user: UserProfile }>("/auth/me", {}, token),
  register: (displayName: string, email: string, password: string) =>
    api<AuthResponse>("/auth/register", {
      body: JSON.stringify({ displayName, email, password }),
      method: "POST",
    }),
};

export const playlistsApi = {
  addTrack: (playlistId: string, track: Track, token: string) =>
    api<{ playlist: Playlist }>(
      `/playlists/${playlistId}/tracks`,
      { body: JSON.stringify({ track }), method: "POST" },
      token,
    ),
  create: (name: string, token: string) =>
    api<{ playlist: Playlist }>(
      "/playlists",
      { body: JSON.stringify({ name }), method: "POST" },
      token,
    ),
  get: (id: string) => api<{ playlist: Playlist }>(`/playlists/${id}`),
  list: (token: string) =>
    api<{ playlists: Playlist[] }>("/playlists", {}, token),
  removeTrack: (playlistId: string, trackId: string, token: string) =>
    api<{ playlist: Playlist }>(
      `/playlists/${playlistId}/tracks/${trackId}`,
      { method: "DELETE" },
      token,
    ),
  reorder: (playlistId: string, trackIds: string[], token: string) =>
    api<{ playlist: Playlist }>(
      `/playlists/${playlistId}/reorder`,
      { body: JSON.stringify({ trackIds }), method: "PATCH" },
      token,
    ),
};

export const adminApi = {
  overview: (token: string) =>
    api<{
      likedSongs: number;
      playlists: number;
      plays: number;
      topTracks: Array<{ id: string; plays: number; title: string }>;
      users: number;
    }>("/admin/overview", {}, token),
};
