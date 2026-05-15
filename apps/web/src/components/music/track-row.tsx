"use client";

import type { Track } from "@aurora/shared";
import { GripVertical, Heart, ListPlus, Play } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { usePlayerStore } from "@/stores/player-store";
import { musicApi } from "@/lib/api";

export function TrackRow({
  draggable,
  index,
  queue,
  track,
  onPlay,
}: {
  draggable?: boolean;
  index?: number;
  queue?: Track[];
  track: Track;
  onPlay?: () => void;
}) {
  const play = usePlayerStore((state) => state.play);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const token = useAuthStore((state) => state.token);

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/[0.07]">
      <div className="flex items-center gap-3">
        {draggable ? (
          <GripVertical className="h-4 w-4 text-muted" />
        ) : (
          <span className="w-4 text-sm text-muted">{index}</span>
        )}
        <Image
          src={track.artwork ?? "/icon-192.png"}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-md object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{track.title}</p>
        <p className="truncate text-sm text-muted">{track.artist}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="rounded-full p-2 text-muted hover:bg-white/10 hover:text-white"
          onClick={() => token && musicApi.like(track, token)}
          title="Like"
        >
          <Heart className="h-4 w-4" />
        </button>
        <button
          className="rounded-full p-2 text-muted hover:bg-white/10 hover:text-white"
          onClick={() => addToQueue(track)}
          title="Add to queue"
        >
          <ListPlus className="h-4 w-4" />
        </button>
        <button
          className="rounded-full bg-white p-2 text-background hover:scale-105"
          onClick={() => (onPlay ? onPlay() : play(track, queue))}
          title="Play"
        >
          <Play className="h-4 w-4 fill-current" />
        </button>
      </div>
    </div>
  );
}
