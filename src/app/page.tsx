/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { maps, heroes } from "@/lib/mock-data";
import { assetUrl } from "@/lib/assets";

export default function Home() {
  const animatedMaps = [...maps, ...maps];
  const defaultMap = maps.find((map) => map.id === "kings-row") ?? maps[0];

  return (
    <AppShell>
      <main className="mx-auto grid min-h-[calc(100dvh-73px)] max-w-[1440px] grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Strategy workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
            Tactical boards for Overwatch map plans.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
            Pick a map, place hero tokens, draw rotations and zones, then save or export your strategy from the browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/maps" className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800">
              Open maps
            </Link>
            <Link href={`/board/${defaultMap.id}`} className="rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:border-zinc-400">
              Start board
            </Link>
          </div>
        </section>
        <section className="grid gap-4 lg:pl-8">
          <div className="border border-zinc-200 bg-white p-4 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.45)]">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">Liquipedia data</span>
              <span className="text-sm text-zinc-500">{heroes.length} heroes / {maps.length} maps</span>
            </div>
            <div className="home-map-reel mt-4 h-[520px] overflow-hidden md:h-[620px] lg:h-[calc(100dvh-190px)]">
              <div className="home-map-track grid grid-cols-2 gap-3 pb-3">
                {animatedMaps.map((map, index) => (
                  <Link
                    key={`${map.id}-${index}`}
                    href={`/board/${map.id}`}
                    aria-hidden={index >= maps.length}
                    tabIndex={index >= maps.length ? -1 : 0}
                    className="home-map-card group border border-zinc-200 bg-zinc-50 p-3 hover:border-zinc-400"
                    style={{ animationDelay: `${(index % 12) * 70}ms` }}
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-white">
                      <img src={assetUrl(map.imageUrl)} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    </div>
                    <div className="mt-2 truncate text-sm font-semibold group-hover:text-zinc-600">{map.name}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
