"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { heroes, roleLabels } from "@/lib/mock-data";
import type { HeroRole } from "@/lib/types";

const roles: Array<HeroRole | "all"> = ["all", "tank", "damage", "support"];

export default function HeroesPage() {
  const [role, setRole] = useState<HeroRole | "all">("all");
  const filtered = useMemo(() => heroes.filter((hero) => role === "all" || hero.role === role), [role]);

  return (
    <AppShell>
      <main className="mx-auto max-w-[1440px] px-5 py-8">
        <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Hero roster</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Heroes</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((item) => (
              <button
                key={item}
                onClick={() => setRole(item)}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  role === item
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-500"
                }`}
              >
                {item === "all" ? "All" : roleLabels[item]}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
          {filtered.map((hero) => (
            <article key={hero.id} className="border border-zinc-200 bg-white p-4">
              <div className="aspect-square overflow-hidden bg-zinc-100">
                <img src={hero.portraitUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <h2 className="mt-4 text-sm font-semibold">{hero.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">{roleLabels[hero.role]}</p>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
