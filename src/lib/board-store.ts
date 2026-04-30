"use client";

import { create } from "zustand";
import type { BoardObject, Strategy, Team, Tool } from "./types";

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

export const useBoardStore = create<BoardState>((set, get) => ({
  strategy: null,
  selectedId: null,
  tool: "select",
  team: "blue",
  stageScale: 1,
  stageX: 0,
  stageY: 0,
  drawingColor: "#0284c7",
  strokeWidth: 5,
  heroTokenSize: 68,
  showGrid: true,
  history: [],
  future: [],
  setStrategy: (strategy) =>
    set({
      strategy,
      selectedId: null,
      history: [],
      future: [],
      tool: "select",
      stageScale: 1,
      stageX: 0,
      stageY: 0,
    }),
  renameStrategy: (name) =>
    set((state) =>
      state.strategy ? { strategy: stamp({ ...state.strategy, name }) } : state,
    ),
  setTool: (tool) => set({ tool, selectedId: tool === "select" ? get().selectedId : null }),
  setTeam: (team) => set({ team }),
  setSelectedId: (selectedId) => set({ selectedId }),
  setView: ({ x, y, scale }) => set({ stageX: x, stageY: y, stageScale: scale }),
  setDrawingColor: (drawingColor) => set({ drawingColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setHeroTokenSize: (heroTokenSize) => set({ heroTokenSize }),
  setShowGrid: (showGrid) => set({ showGrid }),
  resetView: () => set({ stageX: 0, stageY: 0, stageScale: 1 }),
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
