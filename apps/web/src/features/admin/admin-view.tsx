"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthPanel } from "@/components/auth/auth-panel";
import { PageHeader } from "@/components/ui/page-header";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function AdminView() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const overview = useQuery({
    enabled: Boolean(token && user?.role === "admin"),
    queryKey: ["admin", token],
    queryFn: () => adminApi.overview(token!),
  });

  if (!token) return <AuthPanel />;
  if (user?.role !== "admin") {
    return (
      <div>
        <PageHeader eyebrow="Admin" title="Admin access required" />
        <p className="text-muted">
          Your account is authenticated, but it does not have the admin role.
        </p>
      </div>
    );
  }

  const stats = overview.data;
  return (
    <div>
      <PageHeader eyebrow="Admin" title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Users" value={stats?.users ?? 0} />
        <Stat label="Playlists" value={stats?.playlists ?? 0} />
        <Stat label="Liked songs" value={stats?.likedSongs ?? 0} />
        <Stat label="Plays" value={stats?.plays ?? 0} />
      </div>
      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.05] p-5">
        <h2 className="mb-4 text-xl font-black">Trending analytics</h2>
        <div className="space-y-2">
          {(stats?.topTracks ?? []).map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2"
            >
              <span>{track.title}</span>
              <span className="text-muted">{track.plays} plays</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
