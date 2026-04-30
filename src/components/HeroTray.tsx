"use client";

/* eslint-disable @next/next/no-img-element */
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { heroes, roleLabels } from "@/lib/mock-data";
import type { Hero, HeroRole } from "@/lib/types";

const roles: Array<HeroRole | "all"> = ["all", "tank", "damage", "support"];

export function HeroTray() {
  const [role, setRole] = useState<HeroRole | "all">("all");
  const filtered = useMemo(() => heroes.filter((hero) => role === "all" || hero.role === role), [role]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 p-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Hero tray</p>
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
      </div>
      <div className="grid flex-1 auto-rows-max grid-cols-2 gap-3 overflow-y-auto p-4">
        {filtered.map((hero) => (
          <DraggableHero key={hero.id} hero={hero} />
        ))}
      </div>
    </div>
  );
}

function DraggableHero({ hero }: { hero: Hero }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tray-${hero.id}`,
    data: { heroId: hero.id },
  });

  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`group text-left ${isDragging ? "opacity-40" : "opacity-100"}`}
      {...listeners}
      {...attributes}
    >
      <span className="block aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 group-hover:border-zinc-400">
        <img src={hero.iconUrl ?? hero.portraitUrl} alt="" className="h-full w-full object-cover" />
      </span>
      <span className="mt-2 block truncate text-xs font-semibold text-zinc-900">{hero.name}</span>
      <span className="block text-[10px] uppercase tracking-[0.14em] text-zinc-500">{roleLabels[hero.role]}</span>
    </button>
  );
}
