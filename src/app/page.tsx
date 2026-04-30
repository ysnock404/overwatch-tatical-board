/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { maps, heroes } from "@/lib/mock-data";
import { assetUrl } from "@/lib/assets";

export default function Home() {
  return (
    <AppShell>
      <main className="mx-auto grid min-h-[calc(100dvh-73px)] max-w-[1440px] grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
            <Link href={`/board/${maps[0].id}`} className="rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:border-zinc-400">
              Start board
            </Link>
          </div>
        </section>
        <section className="grid gap-4 lg:pl-8">
          <div className="border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.45)]">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">Liquipedia data</span>
              <span className="text-sm text-zinc-500">{heroes.length} heroes / {maps.length} maps</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {maps.map((map) => (
                <Link key={map.id} href={`/board/${map.id}`} className="group border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-400">
                  <div className="aspect-[4/3] overflow-hidden bg-white">
                    <img src={assetUrl(map.imageUrl)} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-3 text-sm font-semibold group-hover:text-zinc-600">{map.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
