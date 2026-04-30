"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { maps, modeLabels } from "@/lib/mock-data";
import type { MapMode } from "@/lib/types";

const modes: Array<MapMode | "all"> = ["all", "control", "escort", "hybrid", "push", "flashpoint", "clash"];

export default function MapsPage() {
  const [mode, setMode] = useState<MapMode | "all">("all");
  const filtered = useMemo(() => maps.filter((map) => mode === "all" || map.mode === mode), [mode]);

  return (
    <AppShell>
      <main className="mx-auto max-w-[1440px] px-5 py-8">
        <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Map selection</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Maps</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {modes.map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  mode === item
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-500"
                }`}
              >
                {item === "all" ? "All" : modeLabels[item]}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((map) => (
            <article key={map.id} className="border border-zinc-200 bg-white">
              <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
                <img src={map.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{map.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{modeLabels[map.mode]}</p>
                  </div>
                  <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs uppercase text-zinc-600">
                    {map.mode}
                  </span>
                </div>
                <Link
                  href={`/board/${map.id}`}
                  className="mt-5 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Open tactical board
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
