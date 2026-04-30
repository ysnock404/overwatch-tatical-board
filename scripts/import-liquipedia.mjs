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

async function categoryMembers(category) {
  const pages = [];
  let cmcontinue;

  do {
    const data = await liquipedia({
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmlimit: "50",
      ...(cmcontinue ? { cmcontinue } : {}),
    });
    pages.push(...(data.query?.categorymembers ?? []));
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue);

  return pages;
}

async function pageInfo(pageids) {
  if (pageids.length === 0) return {};
  const data = await liquipedia({
    action: "query",
    pageids: pageids.join("|"),
    prop: "info|pageimages",
    inprop: "url",
    piprop: "thumbnail|original|name",
    pithumbsize: "256",
  });

  return data.query?.pages ?? {};
}

function slug(title) {
  return title
    .toLowerCase()
    .replace(/[':]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferRole(title) {
  const support = ["ana", "baptiste", "brigitte", "illari", "kiriko", "lifeweaver", "lucio", "mercy", "moira", "zenyatta"];
  const tank = ["d.va", "doomfist", "junker queen", "mauga", "orisa", "ramattra", "reinhardt", "roadhog", "sigma", "winston", "wrecking ball", "zarya"];
  const normalized = title.toLowerCase();
  if (support.some((item) => normalized.includes(item))) return "support";
  if (tank.some((item) => normalized.includes(item))) return "tank";
  return "damage";
}

function inferMode(title) {
  const normalized = title.toLowerCase();
  if (normalized.includes("control")) return "control";
  if (normalized.includes("escort")) return "escort";
  if (normalized.includes("hybrid")) return "hybrid";
  if (normalized.includes("push")) return "push";
  if (normalized.includes("flashpoint")) return "flashpoint";
  if (normalized.includes("clash")) return "clash";
  return "control";
}

async function normalizeHeroes() {
  const members = await categoryMembers("Category:Heroes");
  const info = await pageInfo(members.map((page) => page.pageid));

  return members.map((page) => {
    const details = info[String(page.pageid)] ?? {};
    return {
      id: slug(page.title),
      name: page.title,
      role: inferRole(page.title),
      portraitUrl: details.thumbnail?.source ?? "",
      iconUrl: details.thumbnail?.source ?? "",
      sourceUrl: details.fullurl ?? `https://liquipedia.net/overwatch/${page.title.replaceAll(" ", "_")}`,
      license: "See Liquipedia page metadata and source file page.",
    };
  });
}

async function normalizeMaps() {
  const members = await categoryMembers("Category:Maps");
  const info = await pageInfo(members.map((page) => page.pageid));

  return members.map((page) => {
    const details = info[String(page.pageid)] ?? {};
    return {
      id: slug(page.title),
      name: page.title,
      mode: inferMode(page.title),
      imageUrl: details.thumbnail?.source ?? "",
      sourceUrl: details.fullurl ?? `https://liquipedia.net/overwatch/${page.title.replaceAll(" ", "_")}`,
      license: "See Liquipedia page metadata and source file page.",
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
