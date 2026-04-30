"use client";

import { useDroppable } from "@dnd-kit/core";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Arrow, Circle, Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text as KonvaText } from "react-konva";
import type Konva from "konva";
import { heroes, roleLabels } from "@/lib/mock-data";
import { useBoardStore } from "@/lib/board-store";
import type { GameMap, HeroObject } from "@/lib/types";

const boardWidth = 1600;
const boardHeight = 1000;
const teamColors = {
  blue: "#0369a1",
  red: "#be123c",
};

export function TacticalBoard({ map }: { map: GameMap }) {
  const { setNodeRef } = useDroppable({ id: "tactical-board" });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [size, setSize] = useState({ width: 1000, height: 700 });
  const [mapImage] = useCanvasImage(map.blueprintUrl ?? map.imageUrl);
  const [spaceDown, setSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [draftArrow, setDraftArrow] = useState<number[] | null>(null);
  const strategy = useBoardStore((state) => state.strategy);
  const selectedId = useBoardStore((state) => state.selectedId);
  const tool = useBoardStore((state) => state.tool);
  const team = useBoardStore((state) => state.team);
  const stageScale = useBoardStore((state) => state.stageScale);
  const stageX = useBoardStore((state) => state.stageX);
  const stageY = useBoardStore((state) => state.stageY);
  const setView = useBoardStore((state) => state.setView);
  const setSelectedId = useBoardStore((state) => state.setSelectedId);
  const addObject = useBoardStore((state) => state.addObject);
  const updateObject = useBoardStore((state) => state.updateObject);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(320, entry.contentRect.width),
        height: Math.max(420, entry.contentRect.height),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpaceDown(true);
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const exportPng = () => {
      const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
      if (!uri) return;
      const link = document.createElement("a");
      link.href = uri;
      link.download = `${strategy?.name ?? "strategy"}.png`;
      link.click();
    };
    window.addEventListener("export-board-png", exportPng);
    return () => window.removeEventListener("export-board-png", exportPng);
  }, [strategy?.name]);

  const screenToBoard = () => {
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - stageX) / stageScale,
      y: (pointer.y - stageY) / stageScale,
    };
  };

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;

    const oldScale = stageScale;
    const scaleBy = 1.06;
    const nextScale = event.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.min(3, Math.max(0.35, nextScale));
    const mousePointTo = {
      x: (pointer.x - stageX) / oldScale,
      y: (pointer.y - stageY) / oldScale,
    };

    setView({
      scale: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    const isBackground = event.target === event.target.getStage();
    if (event.evt.button === 2 || spaceDown) {
      setIsPanning(true);
      return;
    }

    const point = screenToBoard();
    if (!point) return;

    if (tool === "select" && isBackground) {
      setSelectedId(null);
    }

    if (tool === "hero") {
      addObject({
        id: crypto.randomUUID(),
        type: "hero",
        heroId: heroes[0].id,
        team,
        x: point.x,
        y: point.y,
      });
    }

    if (tool === "arrow") {
      setDraftArrow([point.x, point.y, point.x, point.y]);
    }

    if (tool === "zone") {
      addObject({
        id: crypto.randomUUID(),
        type: "zone",
        x: point.x,
        y: point.y,
        radius: 96,
        color: team === "blue" ? "#0284c7" : "#e11d48",
        opacity: 0.2,
      });
    }

    if (tool === "text") {
      const text = window.prompt("Note text", "Rotate through main");
      if (text?.trim()) {
        addObject({
          id: crypto.randomUUID(),
          type: "text",
          x: point.x,
          y: point.y,
          text: text.trim(),
        });
      }
    }
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      setView({
        x: stageX + event.evt.movementX,
        y: stageY + event.evt.movementY,
        scale: stageScale,
      });
      return;
    }

    if (!draftArrow) return;
    const point = screenToBoard();
    if (!point) return;
    setDraftArrow([draftArrow[0], draftArrow[1], point.x, point.y]);
  };

  const handleMouseUp = () => {
    if (draftArrow) {
      const distance = Math.hypot(draftArrow[2] - draftArrow[0], draftArrow[3] - draftArrow[1]);
      if (distance > 20) {
        addObject({
          id: crypto.randomUUID(),
          type: "arrow",
          points: draftArrow,
          color: team === "blue" ? "#0284c7" : "#e11d48",
        });
      }
      setDraftArrow(null);
    }
    setIsPanning(false);
  };

  const objects = strategy?.objects ?? [];

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node;
        setNodeRef(node);
      }}
      className="h-full w-full"
      onContextMenu={(event) => event.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={stageX}
        y={stageY}
        scaleX={stageScale}
        scaleY={stageScale}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Layer listening={false}>
          <Rect x={0} y={0} width={boardWidth} height={boardHeight} fill="#18181b" />
          {mapImage ? <KonvaImage image={mapImage} x={0} y={0} width={boardWidth} height={boardHeight} /> : null}
          <BoardGrid />
        </Layer>
        <Layer>
          {objects.filter((object) => object.type === "zone").map((object) => (
            <Circle
              key={object.id}
              x={object.x}
              y={object.y}
              radius={object.radius}
              fill={object.color}
              opacity={object.opacity}
              stroke={object.color}
              strokeWidth={selectedId === object.id ? 5 : 2}
              draggable={tool === "select"}
              onClick={() => setSelectedId(object.id)}
              onDragEnd={(event) => updateObject(object.id, { x: event.target.x(), y: event.target.y() })}
            />
          ))}
          {objects.filter((object) => object.type === "arrow").map((object) => (
            <Arrow
              key={object.id}
              points={object.points}
              pointerLength={20}
              pointerWidth={18}
              stroke={object.color}
              fill={object.color}
              strokeWidth={selectedId === object.id ? 8 : 5}
              lineCap="round"
              lineJoin="round"
              onClick={() => setSelectedId(object.id)}
            />
          ))}
          {draftArrow ? (
            <Arrow points={draftArrow} pointerLength={20} pointerWidth={18} stroke="#f4f4f5" fill="#f4f4f5" strokeWidth={4} dash={[12, 8]} />
          ) : null}
        </Layer>
        <Layer>
          {objects.filter((object): object is HeroObject => object.type === "hero").map((object) => (
            <HeroToken
              key={object.id}
              object={object}
              selected={selectedId === object.id}
              onSelect={() => setSelectedId(object.id)}
              onMove={(x, y) => updateObject(object.id, { x, y })}
            />
          ))}
        </Layer>
        <Layer>
          {objects.filter((object) => object.type === "text").map((object) => (
            <KonvaText
              key={object.id}
              x={object.x}
              y={object.y}
              text={object.text}
              fontFamily="var(--font-geist-sans)"
              fontSize={28}
              fontStyle="700"
              fill="#fafafa"
              padding={10}
              draggable={tool === "select"}
              onClick={() => setSelectedId(object.id)}
              onDblClick={() => {
                const next = window.prompt("Note text", object.text);
                if (next?.trim()) updateObject(object.id, { text: next.trim() });
              }}
              onDragEnd={(event) => updateObject(object.id, { x: event.target.x(), y: event.target.y() })}
              shadowColor="#18181b"
              shadowBlur={8}
              stroke={selectedId === object.id ? "#facc15" : undefined}
              strokeWidth={selectedId === object.id ? 1 : 0}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

function HeroToken({
  object,
  selected,
  onSelect,
  onMove,
}: {
  object: HeroObject;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const hero = useMemo(() => heroes.find((item) => item.id === object.heroId), [object.heroId]);
  const [image] = useCanvasImage(hero?.iconUrl ?? hero?.portraitUrl ?? "");
  const border = teamColors[object.team];

  if (!hero) return null;

  return (
    <Group
      x={object.x}
      y={object.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => onMove(event.target.x(), event.target.y())}
    >
      <Circle radius={34} fill="#ffffff" stroke={selected ? "#facc15" : border} strokeWidth={selected ? 6 : 4} />
      {image ? <KonvaImage image={image} x={-28} y={-28} width={56} height={56} cornerRadius={28} /> : null}
      <Rect x={-33} y={31} width={66} height={20} fill={border} cornerRadius={4} />
      <KonvaText x={-33} y={34} width={66} text={roleLabels[hero.role]} align="center" fill="#ffffff" fontSize={11} fontStyle="700" />
    </Group>
  );
}

function BoardGrid() {
  const lines = [];
  for (let x = 0; x <= boardWidth; x += 100) {
    lines.push(<Line key={`v-${x}`} points={[x, 0, x, boardHeight]} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />);
  }
  for (let y = 0; y <= boardHeight; y += 100) {
    lines.push(<Line key={`h-${y}`} points={[0, y, boardWidth, y]} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />);
  }
  return <>{lines}</>;
}

function useCanvasImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => setImage(img);
    return () => setImage(null);
  }, [src]);

  return [image] as const;
}
