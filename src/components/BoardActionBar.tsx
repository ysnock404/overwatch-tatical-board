"use client";

import { Eraser, FloppyDisk, ImageSquare } from "@phosphor-icons/react";
import { saveStrategyToStorage } from "./BoardEditor";
import { useBoardStore } from "@/lib/board-store";

export function BoardActionBar() {
  const strategy = useBoardStore((state) => state.strategy);
  const clearObjects = useBoardStore((state) => state.clearObjects);
  const resetView = useBoardStore((state) => state.resetView);

  const exportPng = () => {
    window.dispatchEvent(new CustomEvent("export-board-png"));
  };

  return (
    <div className="flex h-14 items-center justify-end gap-2 border-t border-zinc-200 bg-white px-4">
      <button onClick={exportPng} className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
        Export PNG
      </button>
      <button
        onClick={() => strategy && saveStrategyToStorage(strategy)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-500"
      >
        <FloppyDisk className="mr-2 inline" size={18} weight="bold" />
        Save
      </button>
      <button
        onClick={resetView}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-500"
      >
        <ImageSquare className="mr-2 inline" size={18} weight="bold" />
        Reset view
      </button>
      <button
        onClick={clearObjects}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-500"
      >
        <Eraser className="mr-2 inline" size={18} weight="bold" />
        Clear board
      </button>
    </div>
  );
}
