"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";

export function KeyboardShortcuts() {
  const { next, previous, setPlaying } = usePlayerStore();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (event.code === "Space") {
        event.preventDefault();
        usePlayerStore.setState((state) => ({ isPlaying: !state.isPlaying }));
      }
      if (event.code === "ArrowRight" && event.altKey) next();
      if (event.code === "ArrowLeft" && event.altKey) previous();
      if (event.code === "KeyM") setPlaying(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, previous, setPlaying]);

  return null;
}
