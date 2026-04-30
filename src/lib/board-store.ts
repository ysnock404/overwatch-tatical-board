"use client";

import { create } from "zustand";
import type { BoardObject, Strategy, Team, Tool } from "./types";

const boardPrefsCookie = "owtb_board_prefs";
const cookieMaxAge = 60 * 60 * 24 * 365;

type BoardPrefs = {
  tool: Tool;
  team: Team;
  stageScale: number;
  stageX: number;
  stageY: number;
  drawingColor: string;
  strokeWidth: number;
  heroTokenSize: number;
  showHeroRoles: boolean;
  showGrid: boolean;
};

type BoardState = {
  strategy: Strategy | null;
  selectedId: string | null;
  tool: Tool;
  team: Team;
  stageScale: number;
  stageX: number;
  stageY: number;
  drawingColor: string;
  strokeWidth: number;
  heroTokenSize: number;
  showHeroRoles: boolean;
  showGrid: boolean;
  history: BoardObject[][];
  future: BoardObject[][];
  setStrategy: (strategy: Strategy) => void;
  renameStrategy: (name: string) => void;
  setTool: (tool: Tool) => void;
  setTeam: (team: Team) => void;
  setSelectedId: (id: string | null) => void;
  setView: (view: { x: number; y: number; scale: number }) => void;
  setDrawingColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setHeroTokenSize: (size: number) => void;
  setShowHeroRoles: (enabled: boolean) => void;
  setShowGrid: (enabled: boolean) => void;
  resetView: () => void;
  addObject: (object: BoardObject) => void;
  updateObject: (id: string, patch: Partial<BoardObject>) => void;
  updateSelected: (patch: Partial<BoardObject>) => void;
  deleteObject: (id: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  clearObjects: () => void;
  undo: () => void;
  redo: () => void;
};

const stamp = (strategy: Strategy): Strategy => ({
  ...strategy,
  updatedAt: new Date().toISOString(),
});

const defaultPrefs: BoardPrefs = {
  tool: "select",
  team: "blue",
  stageScale: 1,
  stageX: 0,
  stageY: 0,
  drawingColor: "#0284c7",
  strokeWidth: 5,
  heroTokenSize: 56,
  showHeroRoles: true,
  showGrid: true,
};

const isTool = (value: unknown): value is Tool => value === "select" || value === "arrow" || value === "zone" || value === "text";
const isTeam = (value: unknown): value is Team => value === "blue" || value === "red";

const finiteNumber = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
const booleanValue = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

const readBoardPrefs = (): BoardPrefs => {
  if (typeof document === "undefined") return defaultPrefs;

  const raw = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${boardPrefsCookie}=`))
    ?.split("=")[1];

  if (!raw) return defaultPrefs;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<BoardPrefs>;
    return {
      tool: isTool(parsed.tool) ? parsed.tool : defaultPrefs.tool,
      team: isTeam(parsed.team) ? parsed.team : defaultPrefs.team,
      stageScale: finiteNumber(parsed.stageScale, defaultPrefs.stageScale),
      stageX: finiteNumber(parsed.stageX, defaultPrefs.stageX),
      stageY: finiteNumber(parsed.stageY, defaultPrefs.stageY),
      drawingColor: typeof parsed.drawingColor === "string" ? parsed.drawingColor : defaultPrefs.drawingColor,
      strokeWidth: finiteNumber(parsed.strokeWidth, defaultPrefs.strokeWidth),
      heroTokenSize: finiteNumber(parsed.heroTokenSize, defaultPrefs.heroTokenSize),
      showHeroRoles: booleanValue(parsed.showHeroRoles, defaultPrefs.showHeroRoles),
      showGrid: booleanValue(parsed.showGrid, defaultPrefs.showGrid),
    };
  } catch {
    return defaultPrefs;
  }
};

const boardPrefsFromState = (state: BoardState): BoardPrefs => ({
  tool: state.tool,
  team: state.team,
  stageScale: state.stageScale,
  stageX: state.stageX,
  stageY: state.stageY,
  drawingColor: state.drawingColor,
  strokeWidth: state.strokeWidth,
  heroTokenSize: state.heroTokenSize,
  showHeroRoles: state.showHeroRoles,
  showGrid: state.showGrid,
});

const writeBoardPrefs = (prefs: BoardPrefs) => {
  if (typeof document === "undefined") return;
  document.cookie = `${boardPrefsCookie}=${encodeURIComponent(JSON.stringify(prefs))}; path=/; max-age=${cookieMaxAge}; SameSite=Lax`;
};

const persistBoardPrefs = (state: BoardState, patch: Partial<BoardPrefs>) => {
  writeBoardPrefs({ ...boardPrefsFromState(state), ...patch });
};

const initialPrefs = readBoardPrefs();

export const useBoardStore = create<BoardState>((set, get) => ({
  strategy: null,
  selectedId: null,
  tool: initialPrefs.tool,
  team: initialPrefs.team,
  stageScale: initialPrefs.stageScale,
  stageX: initialPrefs.stageX,
  stageY: initialPrefs.stageY,
  drawingColor: initialPrefs.drawingColor,
  strokeWidth: initialPrefs.strokeWidth,
  heroTokenSize: initialPrefs.heroTokenSize,
  showHeroRoles: initialPrefs.showHeroRoles,
  showGrid: initialPrefs.showGrid,
  history: [],
  future: [],
  setStrategy: (strategy) =>
    set({
      strategy,
      selectedId: null,
      history: [],
      future: [],
    }),
  renameStrategy: (name) =>
    set((state) =>
      state.strategy ? { strategy: stamp({ ...state.strategy, name }) } : state,
    ),
  setTool: (tool) => {
    persistBoardPrefs(get(), { tool });
    set({ tool, selectedId: tool === "select" ? get().selectedId : null });
  },
  setTeam: (team) => {
    persistBoardPrefs(get(), { team });
    set({ team });
  },
  setSelectedId: (selectedId) => set({ selectedId }),
  setView: ({ x, y, scale }) => {
    persistBoardPrefs(get(), { stageX: x, stageY: y, stageScale: scale });
    set({ stageX: x, stageY: y, stageScale: scale });
  },
  setDrawingColor: (drawingColor) => {
    persistBoardPrefs(get(), { drawingColor });
    set({ drawingColor });
  },
  setStrokeWidth: (strokeWidth) => {
    persistBoardPrefs(get(), { strokeWidth });
    set({ strokeWidth });
  },
  setHeroTokenSize: (heroTokenSize) => {
    persistBoardPrefs(get(), { heroTokenSize });
    set({ heroTokenSize });
  },
  setShowHeroRoles: (showHeroRoles) => {
    persistBoardPrefs(get(), { showHeroRoles });
    set({ showHeroRoles });
  },
  setShowGrid: (showGrid) => {
    persistBoardPrefs(get(), { showGrid });
    set({ showGrid });
  },
  resetView: () => {
    persistBoardPrefs(get(), { stageX: 0, stageY: 0, stageScale: 1 });
    set({ stageX: 0, stageY: 0, stageScale: 1 });
  },
  addObject: (object) =>
    set((state) => {
      if (!state.strategy) return state;
      return {
        history: [...state.history, state.strategy.objects],
        future: [],
        selectedId: object.id,
        strategy: stamp({
          ...state.strategy,
          objects: [...state.strategy.objects, object],
        }),
      };
    }),
  updateObject: (id, patch) =>
    set((state) => {
      if (!state.strategy) return state;
      return {
        strategy: stamp({
          ...state.strategy,
          objects: state.strategy.objects.map((object) =>
            object.id === id ? ({ ...object, ...patch } as BoardObject) : object,
          ),
        }),
      };
    }),
  updateSelected: (patch) => {
    const selectedId = get().selectedId;
    if (!selectedId) return;
    get().updateObject(selectedId, patch);
  },
  deleteObject: (id) =>
    set((state) => {
      if (!state.strategy) return state;
      return {
        history: [...state.history, state.strategy.objects],
        future: [],
        selectedId: state.selectedId === id ? null : state.selectedId,
        strategy: stamp({
          ...state.strategy,
          objects: state.strategy.objects.filter((object) => object.id !== id),
        }),
      };
    }),
  deleteSelected: () =>
    set((state) => {
      if (!state.strategy || !state.selectedId) return state;
      return {
        history: [...state.history, state.strategy.objects],
        future: [],
        selectedId: null,
        strategy: stamp({
          ...state.strategy,
          objects: state.strategy.objects.filter((object) => object.id !== state.selectedId),
        }),
      };
    }),
  duplicateSelected: () =>
    set((state) => {
      if (!state.strategy || !state.selectedId) return state;
      const object = state.strategy.objects.find((item) => item.id === state.selectedId);
      if (!object) return state;
      const copy =
        object.type === "arrow"
          ? ({ ...object, id: crypto.randomUUID(), points: object.points.map((point) => point + 32) } as BoardObject)
          : ({ ...object, id: crypto.randomUUID(), x: object.x + 32, y: object.y + 32 } as BoardObject);
      return {
        history: [...state.history, state.strategy.objects],
        future: [],
        selectedId: copy.id,
        strategy: stamp({
          ...state.strategy,
          objects: [...state.strategy.objects, copy],
        }),
      };
    }),
  clearObjects: () =>
    set((state) => {
      if (!state.strategy) return state;
      return {
        history: [...state.history, state.strategy.objects],
        future: [],
        selectedId: null,
        strategy: stamp({ ...state.strategy, objects: [] }),
      };
    }),
  undo: () =>
    set((state) => {
      if (!state.strategy || state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      return {
        future: [state.strategy.objects, ...state.future],
        history: state.history.slice(0, -1),
        selectedId: null,
        strategy: stamp({ ...state.strategy, objects: previous }),
      };
    }),
  redo: () =>
    set((state) => {
      if (!state.strategy || state.future.length === 0) return state;
      const next = state.future[0];
      return {
        history: [...state.history, state.strategy.objects],
        future: state.future.slice(1),
        selectedId: null,
        strategy: stamp({ ...state.strategy, objects: next }),
      };
    }),
}));

export const createEmptyStrategy = (mapId: string, name = "Untitled strategy"): Strategy => {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name,
    mapId,
    objects: [],
    createdAt: now,
    updatedAt: now,
  };
};
