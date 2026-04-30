import type { GameMap, Hero } from "./types";
import heroData from "../../data/heroes.json";
import mapData from "../../data/maps.json";

export const heroes = heroData as Hero[];

const disabledMapIds = new Set(["antarctic-peninsula", "thames-district", "powder-keg-mine"]);

export const maps = (mapData as GameMap[]).filter((map) => !disabledMapIds.has(map.id));

export const roleLabels = {
  tank: "Tank",
  damage: "DPS",
  support: "Support",
} as const;

export const modeLabels = {
  control: "Control",
  escort: "Escort",
  hybrid: "Hybrid",
  push: "Push",
  flashpoint: "Flashpoint",
  clash: "Clash",
  payload_race: "Payload Race",
  arena: "Arena",
  assault: "Assault",
  lucioball: "Lucioball",
} as const;
