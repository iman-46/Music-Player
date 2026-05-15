import { EntityDetailsView } from "@/features/music/entity-details-view";

export default function AlbumPage({ params }: { params: { id: string } }) {
  return <EntityDetailsView type="album" id={params.id} />;
}
