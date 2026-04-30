/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { maps, modeLabels } from "@/lib/mock-data";

export function MapSelector() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {maps.map((map) => (
        <Link key={map.id} href={`/board/${map.id}`} className="border border-zinc-200 bg-white p-3 hover:border-zinc-400">
          <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
            <img src={map.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-semibold">{map.name}</span>
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{modeLabels[map.mode]}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
