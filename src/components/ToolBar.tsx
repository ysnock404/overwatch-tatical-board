"use client";

import {
  ArrowCounterClockwise,
  ArrowClockwise,
  ArrowUpRight,
  Circle,
  Cursor,
  Copy,
  Eraser,
  FloppyDisk,
  ImageSquare,
  TextT,
  Trash,
  UsersThree,
} from "@phosphor-icons/react";
import { saveStrategyToStorage } from "./BoardEditor";
import { useBoardStore } from "@/lib/board-store";
import type { Tool } from "@/lib/types";

const tools: Array<{ id: Tool; label: string; icon: typeof Cursor }> = [
  { id: "select", label: "Select", icon: Cursor },
  { id: "hero", label: "Add hero", icon: UsersThree },
  { id: "arrow", label: "Arrow", icon: ArrowUpRight },
  { id: "zone", label: "Zone", icon: Circle },
  { id: "text", label: "Text", icon: TextT },
];

export function ToolBar() {
  const tool = useBoardStore((state) => state.tool);
  const team = useBoardStore((state) => state.team);
  const strategy = useBoardStore((state) => state.strategy);
  const setTool = useBoardStore((state) => state.setTool);
  const setTeam = useBoardStore((state) => state.setTeam);
  const deleteSelected = useBoardStore((state) => state.deleteSelected);
  const duplicateSelected = useBoardStore((state) => state.duplicateSelected);
  const clearObjects = useBoardStore((state) => state.clearObjects);
  const undo = useBoardStore((state) => state.undo);
  const redo = useBoardStore((state) => state.redo);
  const resetView = useBoardStore((state) => state.resetView);

  const exportPng = () => {
    window.dispatchEvent(new CustomEvent("export-board-png"));
  };

  return (
    <div className="flex h-16 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4">
      <div className="flex items-center gap-1">
        {tools.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              title={item.label}
              onClick={() => setTool(item.id)}
              className={`grid h-10 w-10 place-items-center rounded-md border ${
                tool === item.id ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Icon size={20} weight="bold" />
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTeam(team === "blue" ? "red" : "blue")}
          className={`rounded-md border px-3 py-2 text-sm font-semibold text-white ${
            team === "blue" ? "border-sky-700 bg-sky-700" : "border-rose-700 bg-rose-700"
          }`}
        >
          {team === "blue" ? "Blue team" : "Red team"}
        </button>
        <IconButton label="Undo" onClick={undo} icon={ArrowCounterClockwise} />
        <IconButton label="Redo" onClick={redo} icon={ArrowClockwise} />
        <IconButton label="Duplicate" onClick={duplicateSelected} icon={Copy} />
        <IconButton label="Delete selected" onClick={deleteSelected} icon={Trash} />
        <IconButton label="Clear board" onClick={clearObjects} icon={Eraser} />
        <IconButton label="Reset view" onClick={resetView} icon={ImageSquare} />
        <button
          onClick={() => strategy && saveStrategyToStorage(strategy)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-500"
        >
          <FloppyDisk className="mr-2 inline" size={18} weight="bold" />
          Save
        </button>
        <button onClick={exportPng} className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
          Export PNG
        </button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Cursor;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950"
    >
      <Icon size={19} weight="bold" />
    </button>
  );
}
