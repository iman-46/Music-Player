import { EntityDetailsView } from "@/features/music/entity-details-view";

export default function ArtistPage({ params }: { params: { id: string } }) {
  return <EntityDetailsView type="artist" id={params.id} />;
}
