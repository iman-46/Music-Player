"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { TrackRow } from "@/components/music/track-row";
import { PageHeader } from "@/components/ui/page-header";
import { musicApi } from "@/lib/api";
import { fallbackTracks, filterFallbackTracks } from "@/lib/fallback-tracks";
import type { Track } from "@aurora/shared";
import { usePlayerStore } from "@/stores/player-store";

export function SearchView() {
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(
      () => setQuery(term.trim()),
      350,
    );
    return () => window.clearTimeout(handle);
  }, [term]);

  const results = useInfiniteQuery({
    getNextPageParam: (page) => page.nextPageToken,
    initialPageParam: undefined as string | undefined,
    queryKey: ["search", query],
    queryFn: ({ pageParam }) => musicApi.search(query, pageParam),
    enabled: query.length > 0,
  });

  const apiTracks = results.data?.pages.flatMap((page) => page.tracks) ?? [];
  const tracks = apiTracks.length
    ? apiTracks
    : filterFallbackTracks(query).length
      ? filterFallbackTracks(query)
      : fallbackTracks;

  const play = usePlayerStore((state) => state.play);
  const appendQueue = usePlayerStore((state) => state.appendQueue);

  async function handlePlayFromSearch(track: Track) {
    play(track);
    try {
      const response = await musicApi.search(`${track.artist} songs`);
      const similarTracks = response.tracks.filter((t) => t.id !== track.id);
      appendQueue(similarTracks);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Search" title="Find music">
        <label className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            className="w-full rounded-full border border-white/10 bg-white px-12 py-3 text-background outline-none"
            placeholder="Songs, artists, albums, playlists"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
        </label>
      </PageHeader>

      <div className="glass rounded-lg p-3">
        {/* Only show the error banner when a real API call fails */}
        {results.isError && query.length > 0 && (
          <p className="mb-3 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-100">
            Search is temporarily unavailable — showing matching starter tracks instead.
          </p>
        )}

        {/* Empty state before the user has typed anything */}
        {!query && (
          <p className="py-6 text-center text-sm text-muted">
            Start typing to search for songs, artists, or albums.
          </p>
        )}

        {/* Track list */}
        {query &&
          tracks.map((track, index) => (
            <TrackRow
              key={`${track.id}-${index}`}
              index={index + 1}
              track={track}
              onPlay={() => handlePlayFromSearch(track)}
            />
          ))}

        {/* No results */}
        {query && !results.isLoading && tracks.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            No results for &ldquo;{query}&rdquo;.
          </p>
        )}

        {results.hasNextPage && (
          <button
            className="mt-4 w-full rounded-full bg-white/10 px-4 py-3 font-bold transition hover:bg-white/15"
            onClick={() => results.fetchNextPage()}
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
