"use client";

import {
  ArrowUpRight,
  Circle,
  Cursor,
  IdentificationBadge,
  SquaresFour,
  TextT,
  Trash,
} from "@phosphor-icons/react";
import { useBoardStore } from "@/lib/board-store";
import type { Tool } from "@/lib/types";

const tools: Array<{ id: Tool; label: string; icon: typeof Cursor }> = [
  { id: "select", label: "Select", icon: Cursor },
  { id: "arrow", label: "Arrow", icon: ArrowUpRight },
  { id: "zone", label: "Zone", icon: Circle },
  { id: "text", label: "Text", icon: TextT },
];

const colors = ["#0284c7", "#e11d48", "#f59e0b", "#16a34a", "#f4f4f5"];
const widths = [3, 5, 8, 12];
const tokenSizes = [
  { label: "S", value: 42 },
  { label: "M", value: 56 },
  { label: "L", value: 68 },
];

export function ToolBar() {
  const tool = useBoardStore((state) => state.tool);
  const drawingColor = useBoardStore((state) => state.drawingColor);
  const strokeWidth = useBoardStore((state) => state.strokeWidth);
  const heroTokenSize = useBoardStore((state) => state.heroTokenSize);
  const showHeroRoles = useBoardStore((state) => state.showHeroRoles);
  const showGrid = useBoardStore((state) => state.showGrid);
  const setTool = useBoardStore((state) => state.setTool);
  const setDrawingColor = useBoardStore((state) => state.setDrawingColor);
  const setStrokeWidth = useBoardStore((state) => state.setStrokeWidth);
  const setHeroTokenSize = useBoardStore((state) => state.setHeroTokenSize);
  const setShowHeroRoles = useBoardStore((state) => state.setShowHeroRoles);
  const setShowGrid = useBoardStore((state) => state.setShowGrid);
  const deleteSelected = useBoardStore((state) => state.deleteSelected);

  return (
    <div className="flex h-16 items-center justify-between gap-3 overflow-x-auto border-b border-zinc-200 bg-white px-4">
      <div className="flex shrink-0 items-center gap-1">
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
      <div className="flex shrink-0 items-center gap-2 border-l border-zinc-200 pl-3">
        <div className="flex items-center gap-1">
          {colors.map((color) => (
            <button
              key={color}
              title={`Color ${color}`}
              onClick={() => setDrawingColor(color)}
              className={`h-8 w-8 rounded-md border ${drawingColor === color ? "border-zinc-950" : "border-zinc-200"}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <select
          title="Line width"
          value={strokeWidth}
          onChange={(event) => setStrokeWidth(Number(event.target.value))}
          className="h-10 rounded-md border border-zinc-200 bg-white px-2 text-sm font-semibold text-zinc-700"
        >
          {widths.map((width) => (
            <option key={width} value={width}>
              {width}px
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white p-1" title="Hero token size">
          {tokenSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => setHeroTokenSize(size.value)}
              className={`h-8 min-w-8 rounded px-2 text-xs font-bold ${
                heroTokenSize === size.value ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
        <IconButton
          label={showHeroRoles ? "Hide hero roles" : "Show hero roles"}
          onClick={() => setShowHeroRoles(!showHeroRoles)}
          icon={IdentificationBadge}
          active={showHeroRoles}
        />
        <IconButton label={showGrid ? "Hide grid" : "Show grid"} onClick={() => setShowGrid(!showGrid)} icon={SquaresFour} active={showGrid} />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <IconButton label="Delete selected" onClick={deleteSelected} icon={Trash} />
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  icon: Icon,
  active = false,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Cursor;
  active?: boolean;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-md border ${
        active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950"
      }`}
    >
      <Icon size={19} weight="bold" />
    </button>
  );
}
