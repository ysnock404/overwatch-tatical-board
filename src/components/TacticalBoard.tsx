"use client";

import { useDroppable } from "@dnd-kit/core";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Arrow, Circle, Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text as KonvaText } from "react-konva";
import type Konva from "konva";
import { heroes, roleLabels } from "@/lib/mock-data";
import { assetUrl } from "@/lib/assets";
import { useBoardStore } from "@/lib/board-store";
import type { ArrowObject, GameMap, HeroObject, TextObject, ZoneObject } from "@/lib/types";

const fallbackBoard = { width: 1600, height: 1000 };
const gridSize = 50;
const teamColors = {
  blue: "#0369a1",
  red: "#be123c",
};

export function TacticalBoard({ map }: { map: GameMap }) {
  const { setNodeRef } = useDroppable({ id: "tactical-board" });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [size, setSize] = useState({ width: 1000, height: 700 });
  const [mapImage] = useCanvasImage(assetUrl(map.blueprintUrl ?? map.imageUrl));
  const [spaceDown, setSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [draftArrow, setDraftArrow] = useState<number[] | null>(null);
  const strategy = useBoardStore((state) => state.strategy);
  const selectedId = useBoardStore((state) => state.selectedId);
  const tool = useBoardStore((state) => state.tool);
  const drawingColor = useBoardStore((state) => state.drawingColor);
  const strokeWidth = useBoardStore((state) => state.strokeWidth);
  const heroTokenSize = useBoardStore((state) => state.heroTokenSize);
  const showHeroRoles = useBoardStore((state) => state.showHeroRoles);
  const showGrid = useBoardStore((state) => state.showGrid);
  const stageScale = useBoardStore((state) => state.stageScale);
  const stageX = useBoardStore((state) => state.stageX);
  const stageY = useBoardStore((state) => state.stageY);
  const setView = useBoardStore((state) => state.setView);
  const setSelectedId = useBoardStore((state) => state.setSelectedId);
  const addObject = useBoardStore((state) => state.addObject);
  const updateObject = useBoardStore((state) => state.updateObject);
  const deleteObject = useBoardStore((state) => state.deleteObject);
  const deleteSelected = useBoardStore((state) => state.deleteSelected);
  const undo = useBoardStore((state) => state.undo);
  const redo = useBoardStore((state) => state.redo);
  const boardSize = useMemo(() => {
    if (!mapImage) return fallbackBoard;
    const maxWidth = 1800;
    const scale = Math.min(1, maxWidth / mapImage.naturalWidth);
    return {
      width: Math.round(mapImage.naturalWidth * scale),
      height: Math.round(mapImage.naturalHeight * scale),
    };
  }, [mapImage]);

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

  const snapPoint = (point: { x: number; y: number }) => {
    return point;
  };

  useEffect(() => {
    const isTyping = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
    };

    const down = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setSpaceDown(true);
      }
      if (isTyping(event.target)) return;
      if (event.key === "Backspace" || event.key === "Delete") deleteSelected();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))) {
        event.preventDefault();
        redo();
      }
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
  }, [deleteSelected, redo, undo]);

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
    return snapPoint({
      x: (pointer.x - stageX) / stageScale,
      y: (pointer.y - stageY) / stageScale,
    });
  };

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;

    const shouldZoom = event.evt.ctrlKey || event.evt.metaKey || event.evt.altKey;
    if (!shouldZoom) {
      setView({
        scale: stageScale,
        x: stageX - event.evt.deltaX,
        y: stageY - event.evt.deltaY,
      });
      return;
    }

    const oldScale = stageScale;
    const scaleBy = Math.abs(event.evt.deltaY) < 10 ? 1.02 : 1.06;
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
    if (event.evt.button === 1 || event.evt.button === 2 || spaceDown) {
      setIsPanning(true);
      return;
    }

    const point = screenToBoard();
    if (!point) return;

    if (isBackground) {
      setSelectedId(null);
    }

    if (tool !== "select" && !isBackground) {
      return;
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
        color: drawingColor,
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
          color: drawingColor,
          fontSize: 28,
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
          color: drawingColor,
          strokeWidth,
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
          <Rect x={0} y={0} width={boardSize.width} height={boardSize.height} fill="#18181b" />
          {mapImage ? <KonvaImage image={mapImage} x={0} y={0} width={boardSize.width} height={boardSize.height} /> : null}
          {showGrid ? <BoardGrid width={boardSize.width} height={boardSize.height} /> : null}
        </Layer>
        <Layer>
          {objects.filter((object): object is ZoneObject => object.type === "zone").map((object) => (
            <ZoneShape
              key={object.id}
              object={object}
              selected={selectedId === object.id}
              canEdit
              snapPoint={snapPoint}
              onSelect={() => setSelectedId(object.id)}
              onUpdate={(patch) => updateObject(object.id, patch)}
            />
          ))}
          {objects.filter((object): object is ArrowObject => object.type === "arrow").map((object) => (
            <ArrowShape
              key={object.id}
              object={object}
              selected={selectedId === object.id}
              canEdit
              snapPoint={snapPoint}
              onSelect={() => setSelectedId(object.id)}
              onUpdate={(patch) => updateObject(object.id, patch)}
            />
          ))}
          {draftArrow ? (
            <Arrow points={draftArrow} pointerLength={20} pointerWidth={18} stroke={drawingColor} fill={drawingColor} strokeWidth={strokeWidth} dash={[12, 8]} />
          ) : null}
        </Layer>
        <Layer>
          {objects.filter((object): object is HeroObject => object.type === "hero").map((object) => (
            <HeroToken
              key={object.id}
              object={object}
              selected={selectedId === object.id}
              size={heroTokenSize}
              showRole={showHeroRoles}
              onSelect={() => setSelectedId(object.id)}
              onRemove={() => deleteObject(object.id)}
              snapPoint={snapPoint}
              onMove={(x, y) => updateObject(object.id, { x, y })}
            />
          ))}
        </Layer>
        <Layer>
          {objects.filter((object): object is TextObject => object.type === "text").map((object) => (
            <TextNote
              key={object.id}
              object={object}
              selected={selectedId === object.id}
              canEdit
              snapPoint={snapPoint}
              onSelect={() => setSelectedId(object.id)}
              onUpdate={(patch) => updateObject(object.id, patch)}
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
  size,
  showRole,
  onSelect,
  onRemove,
  onMove,
  snapPoint,
}: {
  object: HeroObject;
  selected: boolean;
  size: number;
  showRole: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMove: (x: number, y: number) => void;
  snapPoint: (point: { x: number; y: number }) => { x: number; y: number };
}) {
  const hero = useMemo(() => heroes.find((item) => item.id === object.heroId), [object.heroId]);
  const [image] = useCanvasImage(assetUrl(hero?.iconUrl ?? hero?.portraitUrl));
  const border = teamColors[object.team];
  const radius = size / 2;
  const strokeWidth = selected ? 5 : 4;
  const badgeHeight = Math.max(13, Math.round(size * 0.24));
  const badgeWidth = Math.max(42, Math.round(size * 0.86));
  const badgeY = radius - badgeHeight - strokeWidth;
  const roleFontSize = Math.max(7, Math.round(size * 0.14));

  if (!hero) return null;

  return (
    <Group
      x={object.x}
      y={object.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onContextMenu={(event) => {
        event.evt.preventDefault();
        event.cancelBubble = true;
        onRemove();
      }}
      onDragEnd={(event) => {
        const point = snapPoint({ x: event.target.x(), y: event.target.y() });
        event.target.position(point);
        onMove(point.x, point.y);
      }}
      rotation={object.rotation ?? 0}
    >
      {image ? <KonvaImage image={image} x={-radius} y={-radius} width={size} height={size} cornerRadius={radius} /> : null}
      <Circle radius={radius} fill="transparent" stroke={selected ? "#facc15" : border} strokeWidth={strokeWidth} />
      {showRole ? (
        <>
          <Rect x={-badgeWidth / 2} y={badgeY} width={badgeWidth} height={badgeHeight} fill={border} cornerRadius={4} opacity={0.92} />
          <KonvaText
            x={-badgeWidth / 2}
            y={badgeY + Math.max(2, Math.round(badgeHeight * 0.18))}
            width={badgeWidth}
            text={roleLabels[hero.role]}
            align="center"
            fill="#ffffff"
            fontSize={roleFontSize}
            fontStyle="700"
          />
        </>
      ) : null}
    </Group>
  );
}

function ArrowShape({
  object,
  selected,
  canEdit,
  snapPoint,
  onSelect,
  onUpdate,
}: {
  object: ArrowObject;
  selected: boolean;
  canEdit: boolean;
  snapPoint: (point: { x: number; y: number }) => { x: number; y: number };
  onSelect: () => void;
  onUpdate: (patch: Partial<ArrowObject>) => void;
}) {
  const width = object.strokeWidth ?? 5;
  const updatePoint = (index: 0 | 1, point: { x: number; y: number }) => {
    const snapped = snapPoint(point);
    const next = [...object.points];
    next[index * 2] = snapped.x;
    next[index * 2 + 1] = snapped.y;
    onUpdate({ points: next });
  };

  return (
    <Group>
      <Arrow
        points={object.points}
        pointerLength={22}
        pointerWidth={20}
        stroke={object.color}
        fill={object.color}
        strokeWidth={selected ? width + 3 : width}
        dash={object.dashed ? [18, 12] : undefined}
        lineCap="round"
        lineJoin="round"
        hitStrokeWidth={24}
        draggable={canEdit}
        onMouseDown={(event) => {
          event.cancelBubble = true;
        }}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) => {
          const dx = event.target.x();
          const dy = event.target.y();
          event.target.position({ x: 0, y: 0 });
          onUpdate({
            points: object.points.map((value, index) => value + (index % 2 === 0 ? dx : dy)),
          });
        }}
      />
      {selected ? (
        <>
          <ControlHandle x={object.points[0]} y={object.points[1]} color={object.color} onDragMove={(point) => updatePoint(0, point)} />
          <ControlHandle x={object.points[2]} y={object.points[3]} color={object.color} onDragMove={(point) => updatePoint(1, point)} />
        </>
      ) : null}
    </Group>
  );
}

function ZoneShape({
  object,
  selected,
  canEdit,
  snapPoint,
  onSelect,
  onUpdate,
}: {
  object: ZoneObject;
  selected: boolean;
  canEdit: boolean;
  snapPoint: (point: { x: number; y: number }) => { x: number; y: number };
  onSelect: () => void;
  onUpdate: (patch: Partial<ZoneObject>) => void;
}) {
  return (
    <Group>
      <Circle
        x={object.x}
        y={object.y}
        radius={object.radius}
        fill={object.color}
        opacity={object.opacity}
        stroke={object.color}
        strokeWidth={selected ? 5 : 2}
        draggable={canEdit}
        onMouseDown={(event) => {
          event.cancelBubble = true;
        }}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(event) => {
          const point = snapPoint({ x: event.target.x(), y: event.target.y() });
          onUpdate({ x: point.x, y: point.y });
        }}
        onDragEnd={(event) => {
          const point = snapPoint({ x: event.target.x(), y: event.target.y() });
          event.target.position(point);
          onUpdate({ x: point.x, y: point.y });
        }}
      />
      {selected ? (
        <ControlHandle
          x={object.x + object.radius}
          y={object.y}
          color={object.color}
          onDragMove={(point) => {
            const radius = Math.max(16, Math.hypot(point.x - object.x, point.y - object.y));
            onUpdate({ radius });
          }}
        />
      ) : null}
    </Group>
  );
}

function TextNote({
  object,
  selected,
  canEdit,
  snapPoint,
  onSelect,
  onUpdate,
}: {
  object: TextObject;
  selected: boolean;
  canEdit: boolean;
  snapPoint: (point: { x: number; y: number }) => { x: number; y: number };
  onSelect: () => void;
  onUpdate: (patch: Partial<TextObject>) => void;
}) {
  return (
    <KonvaText
      x={object.x}
      y={object.y}
      text={object.text}
      fontFamily="var(--font-geist-sans)"
      fontSize={object.fontSize ?? 28}
      fontStyle="700"
      fill={object.color ?? "#fafafa"}
      padding={10}
      draggable={canEdit}
      onMouseDown={(event) => {
        event.cancelBubble = true;
      }}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={() => {
        const next = window.prompt("Note text", object.text);
        if (next?.trim()) onUpdate({ text: next.trim() });
      }}
      onDragEnd={(event) => {
        const point = snapPoint({ x: event.target.x(), y: event.target.y() });
        event.target.position(point);
        onUpdate({ x: point.x, y: point.y });
      }}
      onDragMove={(event) => {
        const point = snapPoint({ x: event.target.x(), y: event.target.y() });
        onUpdate({ x: point.x, y: point.y });
      }}
      shadowColor="#18181b"
      shadowBlur={8}
      stroke={selected ? "#facc15" : undefined}
      strokeWidth={selected ? 1 : 0}
    />
  );
}

function ControlHandle({
  x,
  y,
  color,
  onDragMove,
}: {
  x: number;
  y: number;
  color: string;
  onDragMove: (point: { x: number; y: number }) => void;
}) {
  return (
    <Circle
      x={x}
      y={y}
      radius={11}
      fill="#fafafa"
      stroke={color}
      strokeWidth={4}
      draggable
      onMouseDown={(event) => {
        event.cancelBubble = true;
      }}
      onDragMove={(event) => {
        event.cancelBubble = true;
        onDragMove({ x: event.target.x(), y: event.target.y() });
      }}
    />
  );
}

function BoardGrid({ width, height }: { width: number; height: number }) {
  const lines = [];
  for (let x = 0; x <= width; x += gridSize) {
    const strong = x % (gridSize * 4) === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={strong ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.09)"}
        strokeWidth={1}
      />,
    );
  }
  for (let y = 0; y <= height; y += gridSize) {
    const strong = y % (gridSize * 4) === 0;
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={strong ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.09)"}
        strokeWidth={1}
      />,
    );
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
