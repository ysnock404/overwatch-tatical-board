"use client";

import { heroes, roleLabels } from "@/lib/mock-data";
import { useBoardStore } from "@/lib/board-store";

export function LayerPanel() {
  const strategy = useBoardStore((state) => state.strategy);
  const selectedId = useBoardStore((state) => state.selectedId);
  const setSelectedId = useBoardStore((state) => state.setSelectedId);
  const objects = strategy?.objects ?? [];

  return (
    <section className="p-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Layers</p>
      <div className="mt-4 max-h-[44dvh] space-y-2 overflow-y-auto">
        {objects.length === 0 ? <p className="text-sm text-zinc-500">Drop heroes or draw objects on the board.</p> : null}
        {objects.map((object, index) => {
          const hero = object.type === "hero" ? heroes.find((item) => item.id === object.heroId) : null;
          const label =
            object.type === "hero"
              ? `${hero?.name ?? object.heroId} / ${hero ? roleLabels[hero.role] : "Hero"}`
              : object.type === "arrow"
                ? "Arrow path"
                : object.type === "zone"
                  ? "Control zone"
                  : object.text;

          return (
            <button
              key={object.id}
              onClick={() => setSelectedId(object.id)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                selectedId === object.id ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
            >
              <span className="block truncate font-semibold">{label}</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.14em] opacity-60">
                {index + 1} / {object.type}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
