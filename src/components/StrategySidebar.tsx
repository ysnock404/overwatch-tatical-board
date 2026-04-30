"use client";

import { DownloadSimple, FileArrowUp, Files, Plus } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { createEmptyStrategy, useBoardStore } from "@/lib/board-store";
import type { Strategy } from "@/lib/types";
import { loadStrategies, saveStrategyToStorage } from "./BoardEditor";

export function StrategySidebar({ mapId }: { mapId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [saved, setSaved] = useState<Strategy[]>(() => loadStrategies(mapId));
  const strategy = useBoardStore((state) => state.strategy);
  const setStrategy = useBoardStore((state) => state.setStrategy);
  const renameStrategy = useBoardStore((state) => state.renameStrategy);

  const refresh = () => setSaved(loadStrategies(mapId));

  const saveCurrent = () => {
    if (!strategy) return;
    saveStrategyToStorage(strategy);
    refresh();
  };

  const newStrategy = () => {
    setStrategy(createEmptyStrategy(mapId, "New strategy"));
  };

  const duplicate = () => {
    if (!strategy) return;
    const copy = {
      ...strategy,
      id: crypto.randomUUID(),
      name: `${strategy.name} copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveStrategyToStorage(copy);
    setStrategy(copy);
    refresh();
  };

  const exportJson = () => {
    if (!strategy) return;
    const blob = new Blob([JSON.stringify(strategy, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${strategy.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const imported = JSON.parse(text) as Strategy;
    const next = { ...imported, id: imported.id || crypto.randomUUID(), mapId };
    saveStrategyToStorage(next);
    setStrategy(next);
    refresh();
  };

  return (
    <section className="border-b border-zinc-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Strategy</p>
        <button title="New strategy" onClick={newStrategy} className="grid h-9 w-9 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50">
          <Plus size={18} weight="bold" />
        </button>
      </div>
      <label className="mt-4 block text-xs font-semibold text-zinc-600" htmlFor="strategy-name">
        Name
      </label>
      <input
        id="strategy-name"
        value={strategy?.name ?? ""}
        onChange={(event) => renameStrategy(event.target.value)}
        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950"
      />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={saveCurrent} className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-white">
          Save
        </button>
        <button onClick={duplicate} className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold">
          <Files className="mr-2 inline" size={16} weight="bold" />
          Duplicate
        </button>
        <button onClick={exportJson} className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold">
          <DownloadSimple className="mr-2 inline" size={16} weight="bold" />
          JSON
        </button>
        <button onClick={() => inputRef.current?.click()} className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold">
          <FileArrowUp className="mr-2 inline" size={16} weight="bold" />
          Import
        </button>
      </div>
      <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Saved</p>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {saved.length === 0 ? <p className="text-sm text-zinc-500">No saved strategies yet.</p> : null}
          {saved.map((item) => (
            <button
              key={item.id}
              onClick={() => setStrategy(item)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                strategy?.id === item.id ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              <span className="block truncate font-semibold">{item.name}</span>
              <span className="block truncate text-xs opacity-70">{new Date(item.updatedAt).toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
