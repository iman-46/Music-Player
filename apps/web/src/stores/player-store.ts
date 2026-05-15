"use client";

import type { PlaybackMode, Track } from "@aurora/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PlayerState = {
  crossfadeSeconds: number;
  current?: Track;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  isMini: boolean;
  isPlaying: boolean;
  queue: Track[];
  repeat: PlaybackMode;
  shuffle: boolean;
  sleepTimerMinutes?: number;
  volume: number;
  addToQueue: (track: Track) => void;
  next: () => void;
  play: (track: Track, queue?: Track[]) => void;
  previous: () => void;
  setCrossfade: (seconds: number) => void;
  setCurrentTime: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  setFullscreen: (value: boolean) => void;
  setMini: (value: boolean) => void;
  setPlaying: (value: boolean) => void;
  setSleepTimer: (minutes?: number) => void;
  setVolume: (volume: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  appendQueue: (tracks: Track[]) => void;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      crossfadeSeconds: 3,
      currentTime: 0,
      duration: 0,
      isFullscreen: false,
      isMini: false,
      isPlaying: false,
      queue: [],
      repeat: "off",
      shuffle: false,
      volume: 0.82,
      addToQueue: (track) =>
        set((state) => ({ queue: [...state.queue, track] })),
      next: () => {
        const { current, queue, repeat, shuffle } = get();
        if (!current) return;
        if (repeat === "one") {
          set({ currentTime: 0, isPlaying: true });
          if (typeof window !== "undefined" && window.auroraYouTubePlayer) {
            window.auroraYouTubePlayer.seekTo(0, true);
            window.auroraYouTubePlayer.playVideo();
          }
          return;
        }
        const index = queue.findIndex((track) => track.id === current.id);
        const nextIndex = shuffle
          ? Math.floor(Math.random() * queue.length)
          : index + 1;
        const nextTrack =
          queue[nextIndex] ?? (repeat === "all" ? queue[0] : undefined);
        set({
          current: nextTrack,
          currentTime: 0,
          duration: nextTrack?.durationSeconds ?? 0,
          isPlaying: Boolean(nextTrack),
        });
        if (
          nextTrack &&
          typeof window !== "undefined" &&
          window.auroraYouTubePlayer
        ) {
          window.auroraYouTubePlayer.unMute();
          window.auroraYouTubePlayer.loadVideoById(nextTrack.youtubeId);
        }
      },
      play: (track, queue = []) => {
        set({
          current: track,
          currentTime: 0,
          duration: track.durationSeconds ?? 0,
          isPlaying: true,
          queue: queue.length ? queue : [track],
        });
        if (typeof window !== "undefined" && window.auroraYouTubePlayer) {
          window.auroraYouTubePlayer.unMute();
          window.auroraYouTubePlayer.loadVideoById(track.youtubeId);
        }
      },
      previous: () => {
        const { current, queue } = get();
        const index = queue.findIndex((track) => track.id === current?.id);
        const previousTrack = queue[Math.max(index - 1, 0)] ?? current;
        set({
          current: previousTrack,
          currentTime: 0,
          duration: previousTrack?.durationSeconds ?? 0,
          isPlaying: true,
        });
        if (
          previousTrack &&
          typeof window !== "undefined" &&
          window.auroraYouTubePlayer
        ) {
          window.auroraYouTubePlayer.unMute();
          window.auroraYouTubePlayer.loadVideoById(previousTrack.youtubeId);
        }
      },
      setCrossfade: (crossfadeSeconds) => set({ crossfadeSeconds }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setFullscreen: (isFullscreen) => set({ isFullscreen }),
      setMini: (isMini) => set({ isMini }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setSleepTimer: (sleepTimerMinutes) => set({ sleepTimerMinutes }),
      setVolume: (volume) => set({ volume }),
      toggleRepeat: () =>
        set((state) => ({
          repeat:
            state.repeat === "off"
              ? "all"
              : state.repeat === "all"
                ? "one"
                : "off",
        })),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      appendQueue: (tracks) =>
        set((state) => ({ queue: [...state.queue, ...tracks] })),
    }),
    {
      name: "aurora-player",
      partialize: ({ current, queue, repeat, shuffle, volume }) => ({
        current,
        queue,
        repeat,
        shuffle,
        volume,
      }),
    },
  ),
);
