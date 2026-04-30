import { notFound } from "next/navigation";
import { maps } from "@/lib/mock-data";
import BoardEditor from "@/components/BoardEditor";

export default async function BoardPage({ params }: { params: Promise<{ mapId: string }> }) {
  const { mapId } = await params;
  const map = maps.find((item) => item.id === mapId);

  if (!map) {
    notFound();
  }

  return <BoardEditor map={map} />;
}
