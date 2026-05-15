"use client";

import type { Track } from "@aurora/shared";
import { motion } from "framer-motion";
import { ListPlus, Play } from "lucide-react";
import Image from "next/image";
import { usePlayerStore } from "@/stores/player-store";

export function TrackCard({ queue, track }: { queue?: Track[]; track: Track }) {
  const play = usePlayerStore((state) => state.play);
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="group rounded-lg border border-white/8 bg-white/[0.045] p-3 transition hover:bg-white/[0.08]"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-white/10">
        <Image
          src={track.artwork ?? "/icon-192.png"}
          alt=""
          fill
          sizes="220px"
          className="object-cover"
        />
        <button
          onClick={() => play(track, queue)}
          className="absolute bottom-3 right-3 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-primary text-background opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100"
          title={`Play ${track.title}`}
        >
          <Play className="h-5 w-5 fill-current" />
        </button>
      </div>
      <div className="mt-3 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{track.title}</h3>
          <p className="truncate text-sm text-muted">{track.artist}</p>
        </div>
        <button
          onClick={() => addToQueue(track)}
          className="rounded-full p-2 text-muted transition hover:bg-white/10 hover:text-white"
          title="Add to queue"
        >
          <ListPlus className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
