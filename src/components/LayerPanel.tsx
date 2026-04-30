"use client";

import type { ReactNode } from "react";
import { heroes, roleLabels } from "@/lib/mock-data";
import { useBoardStore } from "@/lib/board-store";
import type { ArrowObject, BoardObject, HeroObject, TextObject, ZoneObject } from "@/lib/types";

const colors = ["#0284c7", "#e11d48", "#f59e0b", "#16a34a", "#f4f4f5"];

export function LayerPanel() {
  const strategy = useBoardStore((state) => state.strategy);
  const selectedId = useBoardStore((state) => state.selectedId);
  const setSelectedId = useBoardStore((state) => state.setSelectedId);
  const updateSelected = useBoardStore((state) => state.updateSelected);
  const objects = strategy?.objects ?? [];
  const selected = objects.find((object) => object.id === selectedId) ?? null;

  return (
    <>
      <section className="border-b border-zinc-200 p-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Properties</p>
        <div className="mt-4">
          {selected ? <Properties object={selected} onUpdate={updateSelected} /> : <p className="text-sm text-zinc-500">Select an object to edit its details.</p>}
        </div>
      </section>
      <section className="p-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Layers</p>
        <div className="mt-4 max-h-[34dvh] space-y-2 overflow-y-auto">
          {objects.length === 0 ? <p className="text-sm text-zinc-500">Drop heroes or draw objects on the board.</p> : null}
          {objects.map((object, index) => {
            const hero = object.type === "hero" ? heroes.find((item) => item.id === object.heroId) : null;
            const label = layerLabel(object);

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
                  {hero ? ` / ${roleLabels[hero.role]}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

function layerLabel(object: BoardObject) {
  if (object.type === "hero") {
    return heroes.find((item) => item.id === object.heroId)?.name ?? object.heroId;
  }
  if (object.type === "arrow") return "Arrow path";
  if (object.type === "zone") return "Control zone";
  return object.text;
}

function Properties({
  object,
  onUpdate,
}: {
  object: BoardObject;
  onUpdate: (patch: Partial<BoardObject>) => void;
}) {
  if (object.type === "hero") return <HeroProperties object={object} onUpdate={onUpdate} />;
  if (object.type === "arrow") return <ArrowProperties object={object} onUpdate={onUpdate} />;
  if (object.type === "zone") return <ZoneProperties object={object} onUpdate={onUpdate} />;
  return <TextProperties object={object} onUpdate={onUpdate} />;
}

function HeroProperties({
  object,
  onUpdate,
}: {
  object: HeroObject;
  onUpdate: (patch: Partial<BoardObject>) => void;
}) {
  const hero = heroes.find((item) => item.id === object.heroId);
  const heroTokenSize = useBoardStore((state) => state.heroTokenSize);
  const setHeroTokenSize = useBoardStore((state) => state.setHeroTokenSize);
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{hero?.name ?? object.heroId}</p>
      <SelectField label="Team" value={object.team} onChange={(value) => onUpdate({ team: value as HeroObject["team"] })}>
        <option value="blue">Blue</option>
        <option value="red">Red</option>
      </SelectField>
      <NumberField label="Rotation" value={object.rotation ?? 0} min={-180} max={180} step={15} onChange={(rotation) => onUpdate({ rotation })} />
      <NumberField label="Token size" value={heroTokenSize} min={36} max={82} step={2} onChange={setHeroTokenSize} />
    </div>
  );
}

function ArrowProperties({
  object,
  onUpdate,
}: {
  object: ArrowObject;
  onUpdate: (patch: Partial<BoardObject>) => void;
}) {
  return (
    <div className="space-y-3">
      <ColorField value={object.color} onChange={(color) => onUpdate({ color })} />
      <NumberField label="Width" value={object.strokeWidth ?? 5} min={2} max={16} step={1} onChange={(strokeWidth) => onUpdate({ strokeWidth })} />
      <label className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold">
        Dashed
        <input type="checkbox" checked={object.dashed ?? false} onChange={(event) => onUpdate({ dashed: event.target.checked })} />
      </label>
    </div>
  );
}

function ZoneProperties({
  object,
  onUpdate,
}: {
  object: ZoneObject;
  onUpdate: (patch: Partial<BoardObject>) => void;
}) {
  return (
    <div className="space-y-3">
      <ColorField value={object.color} onChange={(color) => onUpdate({ color })} />
      <NumberField label="Radius" value={Math.round(object.radius)} min={16} max={600} step={8} onChange={(radius) => onUpdate({ radius })} />
      <NumberField label="Opacity" value={Math.round(object.opacity * 100)} min={5} max={70} step={5} onChange={(opacity) => onUpdate({ opacity: opacity / 100 })} />
    </div>
  );
}

function TextProperties({
  object,
  onUpdate,
}: {
  object: TextObject;
  onUpdate: (patch: Partial<BoardObject>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-zinc-600" htmlFor="selected-note">
        Text
      </label>
      <textarea
        id="selected-note"
        value={object.text}
        onChange={(event) => onUpdate({ text: event.target.value })}
        className="min-h-20 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
      />
      <ColorField value={object.color ?? "#fafafa"} onChange={(color) => onUpdate({ color })} />
      <NumberField label="Size" value={object.fontSize ?? 28} min={12} max={64} step={2} onChange={(fontSize) => onUpdate({ fontSize })} />
    </div>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-zinc-600">Color</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            title={color}
            onClick={() => onChange(color)}
            className={`h-8 w-8 rounded-md border ${value === color ? "border-zinc-950" : "border-zinc-200"}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-zinc-600">{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-zinc-950"
      />
      <span className="font-mono text-xs text-zinc-500">{value}</span>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-zinc-600">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
        {children}
      </select>
    </label>
  );
}
