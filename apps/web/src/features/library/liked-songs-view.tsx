"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthPanel } from "@/components/auth/auth-panel";
import { TrackRow } from "@/components/music/track-row";
import { PageHeader } from "@/components/ui/page-header";
import { musicApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function LikedSongsView() {
  const token = useAuthStore((state) => state.token);
  const liked = useQuery({
    enabled: Boolean(token),
    queryKey: ["liked", token],
    queryFn: () => musicApi.liked(token!),
  });

  if (!token) return <AuthPanel />;
  const tracks = liked.data?.tracks ?? [];

  return (
    <div>
      <PageHeader eyebrow="Collection" title="Liked Songs" />
      <div className="glass rounded-lg p-3">
        {tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            index={index + 1}
            track={track}
            queue={tracks}
          />
        ))}
      </div>
    </div>
  );
}
