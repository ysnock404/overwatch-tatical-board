import type { GameMap, Hero } from "./types";

export const heroes: Hero[] = [
  {
    id: "reinhardt",
    name: "Reinhardt",
    role: "tank",
    portraitUrl: "/assets/heroes/reinhardt.svg",
    iconUrl: "/assets/heroes/reinhardt.svg",
  },
  {
    id: "winston",
    name: "Winston",
    role: "tank",
    portraitUrl: "/assets/heroes/winston.svg",
    iconUrl: "/assets/heroes/winston.svg",
  },
  {
    id: "tracer",
    name: "Tracer",
    role: "damage",
    portraitUrl: "/assets/heroes/tracer.svg",
    iconUrl: "/assets/heroes/tracer.svg",
  },
  {
    id: "genji",
    name: "Genji",
    role: "damage",
    portraitUrl: "/assets/heroes/genji.svg",
    iconUrl: "/assets/heroes/genji.svg",
  },
  {
    id: "ana",
    name: "Ana",
    role: "support",
    portraitUrl: "/assets/heroes/ana.svg",
    iconUrl: "/assets/heroes/ana.svg",
  },
  {
    id: "lucio",
    name: "Lucio",
    role: "support",
    portraitUrl: "/assets/heroes/lucio.svg",
    iconUrl: "/assets/heroes/lucio.svg",
  },
];

export const maps: GameMap[] = [
  {
    id: "ilios-well",
    name: "Ilios: Well",
    mode: "control",
    imageUrl: "/assets/maps/ilios-well.svg",
    blueprintUrl: "/assets/maps/ilios-well.svg",
    sourceUrl: "mock://liquipedia/overwatch/Ilios",
  },
  {
    id: "kings-row",
    name: "King's Row",
    mode: "hybrid",
    imageUrl: "/assets/maps/kings-row.svg",
    blueprintUrl: "/assets/maps/kings-row.svg",
    sourceUrl: "mock://liquipedia/overwatch/Kings_Row",
  },
];

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
} as const;
