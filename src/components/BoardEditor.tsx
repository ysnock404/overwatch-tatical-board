"use client";

/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { BoardActionBar } from "./BoardActionBar";
import { HeroTray } from "./HeroTray";
import { LayerPanel } from "./LayerPanel";
import { StrategySidebar } from "./StrategySidebar";
import { ToolBar } from "./ToolBar";
import { heroes } from "@/lib/mock-data";
import { assetUrl } from "@/lib/assets";
import { createEmptyStrategy, useBoardStore } from "@/lib/board-store";
import type { GameMap, HeroObject, Strategy } from "@/lib/types";

const TacticalBoard = dynamic(() => import("./TacticalBoard").then((mod) => mod.TacticalBoard), {
  ssr: false,
});

export default function BoardEditor({ map }: { map: GameMap }) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [activeHeroId, setActiveHeroId] = useState<string | null>(null);
  const strategy = useBoardStore((state) => state.strategy);
  const setStrategy = useBoardStore((state) => state.setStrategy);
  const addObject = useBoardStore((state) => state.addObject);
  const team = useBoardStore((state) => state.team);
  const stageX = useBoardStore((state) => state.stageX);
  const stageY = useBoardStore((state) => state.stageY);
  const stageScale = useBoardStore((state) => state.stageScale);

  const activeHero = useMemo(() => heroes.find((hero) => hero.id === activeHeroId), [activeHeroId]);

  useEffect(() => {
    const saved = loadStrategies(map.id);
    setStrategy(saved[0] ?? createEmptyStrategy(map.id, `${map.name} plan`));
  }, [map.id, map.name, setStrategy]);

  const handleDragStart = (event: DragStartEvent) => {
    const heroId = event.active.data.current?.heroId;
    if (typeof heroId === "string") {
      setActiveHeroId(heroId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const heroId = event.active.data.current?.heroId;
    const translated = event.active.rect.current.translated;
    const boardRect = boardRef.current?.getBoundingClientRect();

    if (typeof heroId === "string" && translated && boardRect && event.over?.id === "tactical-board") {
      const centerX = translated.left + translated.width / 2;
      const centerY = translated.top + translated.height / 2;
      addObject({
        id: crypto.randomUUID(),
        type: "hero",
        heroId,
        team,
        x: (centerX - boardRect.left - stageX) / stageScale,
        y: (centerY - boardRect.top - stageY) / stageScale,
      } satisfies HeroObject);
    }

    setActiveHeroId(null);
  };

  const handlePickHero = (heroId: string) => {
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    addObject({
      id: crypto.randomUUID(),
      type: "hero",
      heroId,
      team,
      x: (boardRect.width / 2 - stageX) / stageScale,
      y: (boardRect.height / 2 - stageY) / stageScale,
    } satisfies HeroObject);
  };

  return (
    <AppShell>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveHeroId(null)}>
        <main className="grid h-[calc(100dvh-73px)] min-h-0 grid-cols-1 overflow-hidden bg-zinc-100 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="min-h-0 border-r border-zinc-200 bg-white">
            <HeroTray onPickHero={handlePickHero} />
          </aside>
          <section className="min-h-0 min-w-0">
            <ToolBar />
            <div ref={boardRef} className="h-[calc(100dvh-191px)] min-h-[520px] overflow-hidden bg-zinc-900">
              {strategy ? <TacticalBoard map={map} /> : null}
            </div>
            <BoardActionBar />
          </section>
          <aside className="min-h-0 overflow-y-auto border-l border-zinc-200 bg-white">
            <StrategySidebar mapId={map.id} />
            <LayerPanel />
          </aside>
        </main>
        <DragOverlay>
          {activeHero ? (
            <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-zinc-950 bg-white shadow-xl">
              <img src={assetUrl(activeHero.iconUrl ?? activeHero.portraitUrl)} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </AppShell>
  );
}

export function storageKey(mapId: string) {
  return `strategies:${mapId}`;
}

export function loadStrategies(mapId: string): Strategy[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(storageKey(mapId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStrategyToStorage(strategy: Strategy) {
  const all = loadStrategies(strategy.mapId);
  const next = [strategy, ...all.filter((item) => item.id !== strategy.id)];
  localStorage.setItem(storageKey(strategy.mapId), JSON.stringify(next));
}
