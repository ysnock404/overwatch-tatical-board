import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowedHosts = new Set(["liquipedia.net"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await params;
  const decoded = decodeUrl(encoded);

  if (!decoded) {
    return new Response("Invalid image id", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(decoded);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (target.protocol !== "https:" || !allowedHosts.has(target.hostname)) {
    return new Response("Image host not allowed", { status: 400 });
  }

  const upstream = await fetch(target, {
    cache: "no-store",
    headers: {
      "User-Agent": "OverwatchTacticalBoard/0.1 image proxy",
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/*",
    },
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

function decodeUrl(encoded: string) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(encoded)) return null;
  let output = "";
  for (let index = 0; index < encoded.length; index += 2) {
    output += String.fromCharCode(Number.parseInt(encoded.slice(index, index + 2), 16));
  }
  return output;
}
