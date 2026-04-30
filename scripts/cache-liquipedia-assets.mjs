import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const publicDir = path.join(process.cwd(), "public");
const dataDir = path.join(process.cwd(), "data");
const userAgent =
  process.env.LIQUIPEDIA_USER_AGENT ||
  "OverwatchTacticalBoard/0.1 asset cache; set LIQUIPEDIA_USER_AGENT with contact";

function extensionFromUrl(url) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.includes(".png")) return "png";
  if (pathname.includes(".jpeg")) return "jpeg";
  if (pathname.includes(".jpg")) return "jpg";
  if (pathname.includes(".webp")) return "webp";
  return "bin";
}

async function download(url, relativePath) {
  const outputPath = path.join(publicDir, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });

  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/*",
      "Accept-Encoding": "gzip",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
}

async function cacheHeroes() {
  const heroes = JSON.parse(await readFile(path.join(dataDir, "heroes.json"), "utf8"));

  for (const hero of heroes) {
    const remoteUrl = hero.remotePortraitUrl ?? hero.portraitUrl;
    const ext = extensionFromUrl(remoteUrl);
    const relativePath = `assets/liquipedia/heroes/${hero.id}.${ext}`;
    await download(remoteUrl, relativePath);
    hero.remotePortraitUrl = remoteUrl;
    hero.remoteIconUrl = hero.remoteIconUrl ?? hero.iconUrl;
    hero.portraitUrl = `/${relativePath}`;
    hero.iconUrl = `/${relativePath}`;
  }

  await writeFile(path.join(dataDir, "heroes.json"), `${JSON.stringify(heroes, null, 2)}\n`);
  return heroes.length;
}

async function cacheMaps() {
  const maps = JSON.parse(await readFile(path.join(dataDir, "maps.json"), "utf8"));

  for (const map of maps) {
    const remoteUrl = map.remoteImageUrl ?? map.imageUrl;
    const ext = extensionFromUrl(remoteUrl);
    const relativePath = `assets/liquipedia/maps/${map.id}.${ext}`;
    await download(remoteUrl, relativePath);
    map.remoteImageUrl = remoteUrl;
    map.remoteBlueprintUrl = map.remoteBlueprintUrl ?? map.blueprintUrl;
    map.imageUrl = `/${relativePath}`;
    map.blueprintUrl = `/${relativePath}`;
  }

  await writeFile(path.join(dataDir, "maps.json"), `${JSON.stringify(maps, null, 2)}\n`);
  return maps.length;
}

async function main() {
  const heroes = await cacheHeroes();
  const maps = await cacheMaps();
  console.log(`Cached ${heroes} hero assets and ${maps} map assets`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
