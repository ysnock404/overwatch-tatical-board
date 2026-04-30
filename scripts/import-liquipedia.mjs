import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const apiUrl = "https://liquipedia.net/overwatch/api.php";
const outputDir = path.join(process.cwd(), "data");
const userAgent =
  process.env.LIQUIPEDIA_USER_AGENT ||
  "OverwatchTacticalBoard/0.1 (local MVP importer; set LIQUIPEDIA_USER_AGENT with contact)";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function liquipedia(params) {
  const url = new URL(apiUrl);
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
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
    throw new Error(`Liquipedia API request failed: ${response.status} ${response.statusText}`);
  }

  await wait(1200);
  return response.json();
}

async function portalWikitext(page) {
  const data = await liquipedia({
    action: "parse",
    page,
    prop: "wikitext",
  });

  return data.parse?.wikitext?.["*"] ?? "";
}

async function imageInfo(fileNames) {
  const uniqueTitles = [...new Set(fileNames.map((fileName) => `File:${fileName.replace(/^File:/, "")}`))];
  const result = new Map();

  for (let index = 0; index < uniqueTitles.length; index += 50) {
    const batch = uniqueTitles.slice(index, index + 50);
    const data = await liquipedia({
      action: "query",
      titles: batch.join("|"),
      prop: "imageinfo",
      iiprop: "url|mime",
      iiurlwidth: "640",
    });
    const pages = Object.values(data.query?.pages ?? {});
    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (page.title && info) {
        result.set(page.title.replace(/^File:/, ""), {
          url: info.thumburl ?? info.url,
          originalUrl: info.url,
          mime: info.mime,
        });
      }
    }
  }

  return result;
}

function slug(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[':]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function normalizeHeroes() {
  const text = await portalWikitext("Portal:Heroes");
  const rows = [];
  let role = "damage";

  for (const line of text.split("\n")) {
    if (line.includes('<section begin="Damage"')) role = "damage";
    if (line.includes('<section begin="Tank"')) role = "tank";
    if (line.includes('<section begin="Support"')) role = "support";

    const match = line.match(/^File:(.+?)\|link=([^|]+)\|/);
    if (match) {
      rows.push({
        fileName: match[1],
        name: match[2],
        role,
      });
    }
  }

  const images = await imageInfo(rows.map((row) => row.fileName));

  return rows.map((row) => {
    const details = images.get(row.fileName);
    return {
      id: slug(row.name),
      name: row.name,
      role: row.role,
      portraitUrl: details?.url ?? "",
      iconUrl: details?.url ?? "",
      sourceUrl: `https://liquipedia.net/overwatch/${encodeURIComponent(row.name.replaceAll(" ", "_"))}`,
      license: "Source: Liquipedia Overwatch Portal:Heroes. See source page and file metadata for licensing.",
    };
  });
}

async function normalizeMaps() {
  const text = await portalWikitext("Portal:Maps");
  const rows = [];
  let mode = "control";

  for (const line of text.split("\n")) {
    const titleMatch = line.match(/<div class="font-title">\[\[(.+?)\]\]<\/div>/);
    if (titleMatch) {
      mode = titleMatch[1]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");
    }

    const match = line.match(/^(?:File:)?(.+?)\|link=([^|]+)\|/);
    if (match) {
      rows.push({
        fileName: match[1],
        name: match[2],
        mode,
      });
    }
  }

  const images = await imageInfo(rows.map((row) => row.fileName));

  return rows.map((row) => {
    const details = images.get(row.fileName);
    return {
      id: slug(row.name),
      name: row.name,
      mode: row.mode,
      imageUrl: details?.url ?? "",
      blueprintUrl: details?.url ?? "",
      sourceUrl: `https://liquipedia.net/overwatch/${encodeURIComponent(row.name.replaceAll(" ", "_"))}`,
      license: "Source: Liquipedia Overwatch Portal:Maps. See source page and file metadata for licensing.",
    };
  });
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const heroes = await normalizeHeroes();
  const maps = await normalizeMaps();
  await writeFile(path.join(outputDir, "heroes.json"), `${JSON.stringify(heroes, null, 2)}\n`);
  await writeFile(path.join(outputDir, "maps.json"), `${JSON.stringify(maps, null, 2)}\n`);
  console.log(`Imported ${heroes.length} heroes and ${maps.length} maps into ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
