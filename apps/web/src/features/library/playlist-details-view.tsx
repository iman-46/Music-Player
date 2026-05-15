"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Track } from "@aurora/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TrackRow } from "@/components/music/track-row";
import { PageHeader } from "@/components/ui/page-header";
import { playlistsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function PlaylistDetailsView({ id }: { id: string }) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const playlist = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => playlistsApi.get(id),
  });
  const reorder = useMutation({
    mutationFn: (trackIds: string[]) =>
      playlistsApi.reorder(id, trackIds, token!),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["playlist", id] }),
  });

  const data = playlist.data?.playlist;
  const tracks = data?.tracks ?? [];

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !token) return;
    const oldIndex = tracks.findIndex((track) => track.id === active.id);
    const newIndex = tracks.findIndex((track) => track.id === over.id);
    reorder.mutate(
      arrayMove(tracks, oldIndex, newIndex).map((track) => track.id),
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Playlist" title={data?.name ?? "Loading playlist"}>
        <p className="text-sm text-muted">{tracks.length} tracks</p>
      </PageHeader>
      <DndContext onDragEnd={onDragEnd}>
        <SortableContext
          items={tracks.map((track) => track.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="glass rounded-lg p-3">
            {tracks.map((track, index) => (
              <SortableTrackRow
                key={track.id}
                index={index + 1}
                track={track}
                queue={tracks}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableTrackRow({
  index,
  queue,
  track,
}: {
  index: number;
  queue: Track[];
  track: Track;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <TrackRow draggable index={index} track={track} queue={queue} />
    </div>
  );
}
