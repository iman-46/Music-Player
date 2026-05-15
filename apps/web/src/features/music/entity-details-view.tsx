"use client";

import { useQuery } from "@tanstack/react-query";
import { TrackCard } from "@/components/music/track-card";
import { PageHeader } from "@/components/ui/page-header";
import { musicApi } from "@/lib/api";

export function EntityDetailsView({
  id,
  type,
}: {
  id: string;
  type: "album" | "artist";
}) {
  const label = decodeURIComponent(id).replace(/-/g, " ");
  const results = useQuery({
    queryKey: [type, id],
    queryFn: () => musicApi.search(label),
  });
  const tracks = results.data?.tracks ?? [];

  return (
    <div>
      <PageHeader eyebrow={type} title={titleCase(label)} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} queue={tracks} />
        ))}
      </div>
    </div>
  );
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
