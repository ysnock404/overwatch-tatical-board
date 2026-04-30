"use client";

/* eslint-disable @next/next/no-img-element */
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useRef, useState } from "react";
import { heroes, roleLabels } from "@/lib/mock-data";
import { assetUrl } from "@/lib/assets";
import { useBoardStore } from "@/lib/board-store";
import type { Hero, HeroRole } from "@/lib/types";

const roles: Array<HeroRole | "all"> = ["all", "tank", "damage", "support"];

export function HeroTray({ onPickHero }: { onPickHero: (heroId: string) => void }) {
  const [role, setRole] = useState<HeroRole | "all">("all");
  const [query, setQuery] = useState("");
  const team = useBoardStore((state) => state.team);
  const setTeam = useBoardStore((state) => state.setTeam);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return heroes.filter((hero) => {
      const matchesRole = role === "all" || hero.role === role;
      const matchesQuery = normalizedQuery.length === 0 || hero.name.toLowerCase().includes(normalizedQuery);
      return matchesRole && matchesQuery;
    });
  }, [query, role]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-zinc-200 p-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Hero tray</p>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search hero"
          className="mt-4 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-950"
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {roles.map((item) => (
            <button
              key={item}
              onClick={() => setRole(item)}
              className={`rounded-md border px-2 py-2 text-xs font-semibold ${
                role === item ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {item === "all" ? "All" : roleLabels[item]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setTeam(team === "blue" ? "red" : "blue")}
          className={`mt-3 w-full rounded-md border px-3 py-2 text-sm font-semibold text-white ${
            team === "blue" ? "border-sky-700 bg-sky-700" : "border-rose-700 bg-rose-700"
          }`}
        >
          {team === "blue" ? "Blue team" : "Red team"}
        </button>
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-2 gap-3 overflow-y-auto overscroll-contain p-4">
        {filtered.map((hero) => (
          <DraggableHero key={hero.id} hero={hero} onPickHero={onPickHero} />
        ))}
        {filtered.length === 0 ? <p className="col-span-2 text-sm text-zinc-500">No heroes found.</p> : null}
      </div>
    </div>
  );
}

function DraggableHero({ hero, onPickHero }: { hero: Hero; onPickHero: (heroId: string) => void }) {
  const draggedRef = useRef(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tray-${hero.id}`,
    data: { heroId: hero.id },
  });

  useEffect(() => {
    if (isDragging) draggedRef.current = true;
  }, [isDragging]);

  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`group text-left ${isDragging ? "opacity-40" : "opacity-100"}`}
      onClick={() => {
        if (!isDragging && !draggedRef.current) onPickHero(hero.id);
        window.setTimeout(() => {
          draggedRef.current = false;
        }, 0);
      }}
      {...listeners}
      {...attributes}
    >
      <span className="block aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 group-hover:border-zinc-400">
        <img src={assetUrl(hero.iconUrl ?? hero.portraitUrl)} alt="" className="h-full w-full object-cover" />
      </span>
      <span className="mt-2 block truncate text-xs font-semibold text-zinc-900">{hero.name}</span>
      <span className="block text-[10px] uppercase tracking-[0.14em] text-zinc-500">{roleLabels[hero.role]}</span>
    </button>
  );
}
