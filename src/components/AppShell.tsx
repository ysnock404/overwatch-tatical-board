import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#f6f7f8] text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4">
          <Link href="/" className="font-mono text-sm font-semibold uppercase tracking-[0.18em]">
            Overwatch Tactical Board
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950" href="/maps">
              Maps
            </Link>
            <Link className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950" href="/heroes">
              Heroes
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
