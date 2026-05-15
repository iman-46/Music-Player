import { PlaylistDetailsView } from "@/features/library/playlist-details-view";

export default function PlaylistPage({ params }: { params: { id: string } }) {
  return <PlaylistDetailsView id={params.id} />;
}
