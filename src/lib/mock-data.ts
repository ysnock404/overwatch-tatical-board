import type { GameMap, Hero } from "./types";
import heroData from "../../data/heroes.json";
import mapData from "../../data/maps.json";

export const heroes = heroData as Hero[];

export const maps = mapData as GameMap[];

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
