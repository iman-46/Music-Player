"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { playlistsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { AuthPanel } from "@/components/auth/auth-panel";

export function LibraryView() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const playlists = useQuery({
    enabled: Boolean(token),
    queryKey: ["playlists", token],
    queryFn: () => playlistsApi.list(token!),
  });
  const create = useMutation({
    mutationFn: () => playlistsApi.create("New Playlist", token!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["playlists"] }),
  });

  if (!token) return <AuthPanel />;

  return (
    <div>
      <PageHeader eyebrow="Library" title="Your playlists">
        <button
          className="rounded-full bg-primary px-5 py-3 font-black text-background"
          onClick={() => create.mutate()}
        >
          Create playlist
        </button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(playlists.data?.playlists ?? []).map((playlist) => (
          <Link
            key={playlist.id}
            href={`/playlists/${playlist.id}`}
            className="rounded-lg border border-white/10 bg-white/[0.05] p-5 transition hover:bg-white/[0.08]"
          >
            <h2 className="text-xl font-black">{playlist.name}</h2>
            <p className="mt-2 text-sm text-muted">
              {playlist.description || `${playlist.tracks.length} tracks`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
