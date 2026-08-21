export type HeroBackdrop = "aurora" | "mesh" | "orchestrator";

/** Admin + runtime options for hero background modes. */
export const HERO_BACKDROP_OPTIONS: {
  value: HeroBackdrop;
  label: string;
  description: string;
}[] = [
  {
    value: "aurora",
    label: "Aurora",
    description: "Animated gradient aurora with soft glow orbs",
  },
  {
    value: "mesh",
    label: "Soft mesh",
    description: "Minimal radial mesh — calm and professional",
  },
  {
    value: "orchestrator",
    label: "Data orchestrator",
    description:
      "Living nervous system — pipelines, orbital hub, luminous data streams",
  },
];

export function normalizeHeroBackdrop(value: string | undefined): HeroBackdrop {
  if (value === "mesh") return "mesh";
  if (value === "orchestrator") return "orchestrator";
  return "aurora";
}
