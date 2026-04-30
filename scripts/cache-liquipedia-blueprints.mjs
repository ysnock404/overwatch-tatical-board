import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const dataPath = path.join(process.cwd(), "data", "maps.json");
const publicDir = path.join(process.cwd(), "public");
const outputDir = path.join(publicDir, "assets", "blueprints", "liquipedia");
const apiUrl = "https://liquipedia.net/commons/api.php";
const userAgent =
  process.env.LIQUIPEDIA_USER_AGENT ||
  "OverwatchTacticalBoard/0.1 top-down blueprint cache; set LIQUIPEDIA_USER_AGENT with contact";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function commons(params) {
  const url = new URL(apiUrl);
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
      "Accept-Encoding": "gzip",
    },
  });

  if (!response.ok) {
    throw new Error(`Commons API request failed: ${response.status} ${response.statusText}`);
  }

  await wait(350);
  return response.json();
}

function titleCandidates(name) {
  const base = name.trim();
  const noColon = base.replace(/:/g, "");
  const ascii = noColon.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const variants = new Set([base, noColon, ascii]);

  for (const value of [...variants]) {
    variants.add(value.replace(/ /g, "_"));
    variants.add(value.replace(/[ ':]/g, "_").replace(/_+/g, "_"));
    variants.add(value.replace(/[':]/g, "").replace(/ /g, "_"));
  }

  return [...variants].filter(Boolean);
}

async function findTopDownFile(mapName) {
  const candidates = titleCandidates(mapName);

  for (const candidate of candidates) {
    const data = await commons({
      action: "query",
      list: "allimages",
      aiprefix: candidate,
      ailimit: "50",
      aiprop: "url",
    });
    const hit = (data.query?.allimages ?? []).find((image) =>
      /(?:top[_ -]?down|overhead).*view|(?:top[_ -]?down)/i.test(image.name),
    );
    if (hit) return hit.name;
  }

  return null;
}

async function imageInfo(fileName) {
  const data = await commons({
    action: "query",
    titles: `File:${fileName}`,
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "2400",
  });

  const page = Object.values(data.query?.pages ?? {})[0];
  return page?.imageinfo?.[0] ?? null;
}

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

  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
}

async function main() {
  await rm(outputDir, { recursive: true, force: true });

  const maps = JSON.parse(await readFile(dataPath, "utf8"));
  let cached = 0;
  const missing = [];

  for (const map of maps) {
    const fileName = await findTopDownFile(map.name);

    if (!fileName) {
      map.blueprintUrl = map.imageUrl;
      delete map.remoteBlueprintUrl;
      delete map.blueprintSourceUrl;
      delete map.blueprintCredit;
      missing.push(map.name);
      continue;
    }

    const info = await imageInfo(fileName);
    const remoteUrl = info?.thumburl ?? info?.url;
    if (!remoteUrl) {
      missing.push(map.name);
      continue;
    }

    const ext = extensionFromUrl(remoteUrl);
    const relativePath = `assets/blueprints/liquipedia/${map.id}.${ext}`;
    await download(remoteUrl, relativePath);

    map.blueprintUrl = `/${relativePath}`;
    map.remoteBlueprintUrl = remoteUrl;
    map.blueprintSourceUrl = info.descriptionurl ?? `https://liquipedia.net/commons/File:${encodeURIComponent(fileName)}`;
    map.blueprintCredit = "Top-down view from Liquipedia Commons.";
    cached += 1;
  }

  await writeFile(dataPath, `${JSON.stringify(maps, null, 2)}\n`);
  console.log(`Cached ${cached} Liquipedia top-down blueprints`);
  if (missing.length > 0) {
    console.log(`Missing top-down blueprint fallback (${missing.length}): ${missing.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
