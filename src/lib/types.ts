export type HeroRole = "tank" | "damage" | "support";

export type MapMode =
  | "control"
  | "escort"
  | "hybrid"
  | "push"
  | "flashpoint"
  | "clash"
  | "payload_race"
  | "arena"
  | "assault"
  | "lucioball";

export type Team = "blue" | "red";

export type Tool = "select" | "hero" | "arrow" | "zone" | "text";

export type Hero = {
  id: string;
  name: string;
  role: HeroRole;
  portraitUrl: string;
  iconUrl?: string;
};

export type GameMap = {
  id: string;
  name: string;
  mode: MapMode;
  imageUrl: string;
  blueprintUrl?: string;
  sourceUrl: string;
};

export type HeroObject = {
  id: string;
  type: "hero";
  heroId: string;
  team: Team;
  x: number;
  y: number;
  rotation?: number;
};

export type ArrowObject = {
  id: string;
  type: "arrow";
  points: number[];
  color: string;
};

export type ZoneObject = {
  id: string;
  type: "zone";
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
};

export type TextObject = {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
};

export type BoardObject = HeroObject | ArrowObject | ZoneObject | TextObject;

export type Strategy = {
  id: string;
  name: string;
  mapId: string;
  objects: BoardObject[];
  createdAt: string;
  updatedAt: string;
};
