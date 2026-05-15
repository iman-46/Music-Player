"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Tv,
  Volume2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Equalizer } from "@/components/player/equalizer";
import { YouTubeEmbedPlayer } from "@/components/player/youtube-embed-player";
import { usePlayerStore } from "@/stores/player-store";

export function PlayerBar() {
  const player = usePlayerStore();
  const track = player.current;
  const [showYouTubeAudio, setShowYouTubeAudio] = useState(false);
  const duration = player.duration || track?.durationSeconds || 240;

  useEffect(() => {
    if (!player.sleepTimerMinutes) return;
    const handle = window.setTimeout(
      () => player.setPlaying(false),
      player.sleepTimerMinutes * 60_000,
    );
    return () => window.clearTimeout(handle);
  }, [player.sleepTimerMinutes, player.setPlaying]);

  function togglePlayback() {
    const nextState = !player.isPlaying;
    player.setPlaying(nextState);
    if (typeof window !== "undefined" && window.auroraYouTubePlayer) {
      if (nextState) window.auroraYouTubePlayer.playVideo();
      else window.auroraYouTubePlayer.pauseVideo();
    }
  }

  function seekTo(seconds: number) {
    player.setCurrentTime(seconds);
    if (typeof window !== "undefined" && window.auroraYouTubePlayer) {
      window.auroraYouTubePlayer.seekTo(seconds, true);
    }
  }

  return (
    <>
      <YouTubeEmbedPlayer />
      <AnimatePresence>
        {track && (
          <motion.footer
            className="glass fixed inset-x-0 bottom-0 z-50 grid min-h-24 grid-cols-1 items-center gap-4 px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:px-6"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
          >
            <div className="flex min-w-0 items-center gap-4">
              <Image
                src={track.artwork ?? "/icon-192.png"}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-md object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {player.isPlaying && <Equalizer />}
                  <p className="truncate font-semibold">{track.title}</p>
                </div>
                <p className="truncate text-sm text-muted">{track.artist}</p>
              </div>
              <button
                className="rounded-full p-2 text-muted transition hover:bg-white/10 hover:text-white"
                title="Like"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <IconButton
                  active={player.shuffle}
                  label="Shuffle"
                  onClick={player.toggleShuffle}
                  icon={Shuffle}
                />
                <IconButton
                  label="Previous"
                  onClick={player.previous}
                  icon={SkipBack}
                />
                <button
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-background transition hover:scale-105"
                  onClick={togglePlayback}
                  title={player.isPlaying ? "Pause" : "Play"}
                >
                  {player.isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                </button>
                <IconButton
                  label="Next"
                  onClick={player.next}
                  icon={SkipForward}
                />
                <IconButton
                  active={player.repeat !== "off"}
                  label={`Repeat ${player.repeat}`}
                  onClick={player.toggleRepeat}
                  icon={Repeat}
                />
              </div>
              <div className="flex w-full min-w-72 items-center gap-2 text-xs text-muted">
                <span>{formatTime(player.currentTime)}</span>
                <input
                  aria-label="Seek"
                  className="h-1 flex-1 cursor-pointer accent-primary"
                  max={duration}
                  min={0}
                  step={1}
                  type="range"
                  value={Math.min(player.currentTime, duration)}
                  onChange={(event) => seekTo(Number(event.target.value))}
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="hidden items-center justify-end gap-3 md:flex">
              <Volume2 className="h-5 w-5 text-muted" />
              <input
                aria-label="Volume"
                className="accent-primary"
                max={1}
                min={0}
                step={0.01}
                type="range"
                value={player.volume}
                onChange={(event) =>
                  player.setVolume(Number(event.target.value))
                }
              />
              <IconButton
                label={player.isMini ? "Expand mini player" : "Mini player"}
                onClick={() => player.setMini(!player.isMini)}
                icon={player.isMini ? Maximize2 : Minimize2}
              />
              <IconButton
                label="Fullscreen player"
                onClick={() => player.setFullscreen(true)}
                icon={Maximize2}
              />
              <IconButton
                active={showYouTubeAudio}
                label="Enable YouTube audio"
                onClick={() => setShowYouTubeAudio((value) => !value)}
                icon={Tv}
              />
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
      {track && showYouTubeAudio && (
        <div className="glass fixed bottom-28 right-4 z-40 w-[min(24rem,calc(100vw-2rem))] rounded-lg p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">YouTube audio bridge</p>
            <button
              className="rounded-full p-2 text-muted hover:bg-white/10 hover:text-white"
              onClick={() => setShowYouTubeAudio(false)}
              title="Hide YouTube audio bridge"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <YouTubeEmbedPlayer visible />
          <p className="mt-2 text-xs text-muted">
            Click play inside this YouTube frame if the bottom player cannot
            start audio.
          </p>
        </div>
      )}
      {track && player.isFullscreen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-6">
          <button
            className="absolute right-6 top-6 rounded-full bg-white/10 p-3"
            onClick={() => player.setFullscreen(false)}
            title="Close fullscreen player"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
          <div className="w-full max-w-xl text-center">
            <Image
              src={track.artwork ?? "/icon-192.png"}
              alt=""
              width={520}
              height={520}
              className="mx-auto aspect-square rounded-lg object-cover shadow-2xl"
            />
            <h2 className="mt-6 text-4xl font-black">{track.title}</h2>
            <p className="mt-2 text-lg text-muted">{track.artist}</p>
          </div>
        </div>
      )}
    </>
  );
}

function IconButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full p-2 transition hover:bg-white/10 hover:text-white ${active ? "text-primary" : "text-muted"}`}
      onClick={onClick}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function formatTime(seconds?: number) {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
}
