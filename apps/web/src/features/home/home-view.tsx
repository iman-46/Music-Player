"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthPanel } from "@/components/auth/auth-panel";
import { TrackCard } from "@/components/music/track-card";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { musicApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function HomeView() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: () => musicApi.trending(),
  });
  const recommendations = useQuery({
    enabled: Boolean(token),
    queryKey: ["recommendations", token],
    queryFn: () => musicApi.recommendations(token!),
  });

  if (!token) {
    return (
      <div className="grid min-h-[70vh] items-center gap-8 lg:grid-cols-[1fr_28rem]">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-primary">
            Iman's Music
          </p>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Search, queue, like, playlist, and personalize music with a legal
            embedded playback model.
          </p>
        </div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={`Hi ${user?.displayName ?? "there"}`}
        title="Good evening"
      >
        <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-muted">
          PWA ready
        </div>
      </PageHeader>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Recommended for you</h2>
        {recommendations.isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {(recommendations.data?.recommendations ?? []).map((item) => (
              <TrackCard
                key={item.track.id}
                track={item.track}
                queue={recommendations.data?.recommendations.map(
                  (row) => row.track,
                )}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black">Trending now</h2>
        {trending.isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {(trending.data?.tracks ?? []).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                queue={trending.data?.tracks}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
