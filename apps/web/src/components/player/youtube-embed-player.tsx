"use client";

import { useEffect, useId, useRef, useState } from "react";
import { musicApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { usePlayerStore } from "@/stores/player-store";

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
    auroraYouTubePlayer?: YouTubePlayer;
  }
}

type YouTubeNamespace = {
  Player: new (
    elementId: string,
    options: YouTubePlayerOptions,
  ) => YouTubePlayer;
  PlayerState: {
    ENDED: number;
    PAUSED: number;
    PLAYING: number;
  };
};

type YouTubePlayerOptions = {
  events: {
    onError?: (event: { data: number }) => void;
    onReady?: (event: { target: YouTubePlayer }) => void;
    onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
  };
  height: string;
  playerVars: Record<string, number | string>;
  videoId?: string;
  width: string;
};

type YouTubePlayer = {
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideoById: (videoId: string) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
};

let apiReadyPromise: Promise<YouTubeNamespace> | undefined;

export function YouTubeEmbedPlayer({ visible = false }: { visible?: boolean }) {
  if (visible) return <VisibleYouTubeFrame />;
  return <YouTubeApiPlayer />;
}

function VisibleYouTubeFrame() {
  const current = usePlayerStore((state) => state.current);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const videoId = current?.youtubeId ?? "";

  if (!current) return null;

  const params = new URLSearchParams({
    autoplay: isPlaying ? "1" : "0",
    controls: "1",
    enablejsapi: "1",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
  });

  return (
    <iframe
      key={videoId}
      title={`YouTube player for ${current.title}`}
      className="aspect-video w-full rounded-md bg-black"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      src={`https://www.youtube.com/embed/${videoId}?${params}`}
    />
  );
}

function YouTubeApiPlayer() {
  const elementId = useStableElementId();
  const token = useAuthStore((state) => state.token);
  const current = usePlayerStore((state) => state.current);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const next = usePlayerStore((state) => state.next);
  const repeat = usePlayerStore((state) => state.repeat);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const videoId = current?.youtubeId ?? "";
  const playerRef = useRef<YouTubePlayer | null>(null);
  const currentRef = useRef(current);
  const repeatRef = useRef(repeat);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    if (current && token) {
      musicApi.recordPlay(current, token).catch(() => undefined);
    }
  }, [current?.id, token]);

  useEffect(() => {
    let cancelled = false;

    getYouTubeIframeApi().then((YT) => {
      if (cancelled || !elementId || playerRef.current) return;

      playerRef.current = new YT.Player(elementId, {
        height: "100%",
        width: "100%",
        videoId: videoId || "jfKfPfyJRdk",
        playerVars: {
          controls: 0,
          enablejsapi: 1,
          modestbranding: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            window.auroraYouTubePlayer = event.target;
            event.target.setVolume(Math.round(volume * 100));
            if (videoId) {
              if (isPlaying) event.target.loadVideoById(videoId);
              else event.target.cueVideoById(videoId);
            }
            setReady(true);
          },
          onStateChange: (event) => {
            if (!window.YT) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
              setDuration(
                event.target.getDuration() ||
                  currentRef.current?.durationSeconds ||
                  0,
              );
            }
            if (event.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false);
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              if (repeatRef.current === "one") {
                event.target.seekTo(0, true);
                event.target.playVideo();
              } else {
                next();
              }
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (window.auroraYouTubePlayer === playerRef.current) {
        window.auroraYouTubePlayer = undefined;
      }
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [elementId]);

  useEffect(() => {
    playerRef.current?.setVolume(Math.round(volume * 100));
  }, [volume]);

  useEffect(() => {
    if (!ready) return;

    function onCommand(event: Event) {
      const detail = (
        event as CustomEvent<{ args?: unknown[]; command: string }>
      ).detail;
      const player = playerRef.current;
      if (!player || !detail?.command) return;

      if (detail.command === "playVideo") {
        player.unMute();
        player.setVolume(Math.round(volume * 100));
        player.playVideo();
      }
      if (detail.command === "pauseVideo") player.pauseVideo();
      if (detail.command === "seekTo")
        player.seekTo(Number(detail.args?.[0] ?? 0), true);
      if (detail.command === "loadAndPlay") {
        const id = detail.args?.[0] as string;
        if (id) {
          player.unMute();
          player.setVolume(Math.round(volume * 100));
          player.loadVideoById(id);
        }
      }
    }

    window.addEventListener("aurora-player-command", onCommand);
    return () => window.removeEventListener("aurora-player-command", onCommand);
  }, [ready, volume]);

  useEffect(() => {
    if (!ready || !videoId) return;

    const handle = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const duration = player.getDuration();
      if (Number.isFinite(duration) && duration > 0) setDuration(duration);
      const currentTime = player.getCurrentTime();
      if (Number.isFinite(currentTime)) setCurrentTime(currentTime);
    }, 500);

    return () => window.clearInterval(handle);
  }, [ready, setCurrentTime, setDuration, videoId]);

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[-1] h-10 w-10 overflow-hidden opacity-[0.01]">
      <div id={elementId} className="h-full w-full" />
    </div>
  );
}

function getYouTubeIframeApi() {
  apiReadyPromise ??= loadYouTubeIframeApi();
  return apiReadyPromise;
}

function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.resolve(undefined as unknown as YouTubeNamespace);
  }

  if (window.YT?.Player) return Promise.resolve(window.YT);

  return new Promise<YouTubeNamespace>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT!);
    };

    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

function useStableElementId() {
  return `youtube-player-${useId().replace(/:/g, "")}`;
}
