import { NextRequest } from "next/server";

const allowedHosts = new Set(["liquipedia.net"]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (target.protocol !== "https:" || !allowedHosts.has(target.hostname)) {
    return new Response("Image host not allowed", { status: 400 });
  }

  const upstream = await fetch(target, {
    headers: {
      "User-Agent": "OverwatchTacticalBoard/0.1 image proxy",
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/*",
    },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Image fetch failed", { status: upstream.status || 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
    },
  });
}
