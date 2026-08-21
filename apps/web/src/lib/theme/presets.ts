import {
  normalizeHeroBackdrop,
  type HeroBackdrop,
} from "@/lib/theme/hero-backdrops";

export type { HeroBackdrop };

export type ThemePresetId =
  | "ember"
  | "ocean"
  | "midnight"
  | "graphite"
  | "forest"
  | "champagne"
  | "ink"
  | "custom";

export type ThemePreset = {
  id: ThemePresetId;
  name: string;
  blurb: string;
  accent: string;
  accentWarm: string;
  background: string;
};

/** Professional unified palettes — pick one or enter any hex. */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ember",
    name: "Ember",
    blurb: "Warm film red on ink black",
    accent: "#ee3f2c",
    accentWarm: "#f5a524",
    background: "#050505",
  },
  {
    id: "ocean",
    name: "Ocean",
    blurb: "Clean corporate blue",
    accent: "#3b82f6",
    accentWarm: "#60a5fa",
    background: "#060a12",
  },
  {
    id: "midnight",
    name: "Midnight",
    blurb: "Navy #0b131e + ice accent",
    accent: "#5b8def",
    accentWarm: "#93c5fd",
    background: "#0b131e",
  },
  {
    id: "graphite",
    name: "Graphite",
    blurb: "Neutral professional gray",
    accent: "#a1a1aa",
    accentWarm: "#e4e4e7",
    background: "#0a0a0b",
  },
  {
    id: "forest",
    name: "Forest",
    blurb: "Calm teal-green",
    accent: "#34d399",
    accentWarm: "#6ee7b7",
    background: "#06110c",
  },
  {
    id: "champagne",
    name: "Champagne",
    blurb: "Muted gold / executive",
    accent: "#c9a227",
    accentWarm: "#e8d48b",
    background: "#0c0a07",
  },
  {
    id: "ink",
    name: "Ink",
    blurb: "Slate sky on deep blue-black",
    accent: "#38bdf8",
    accentWarm: "#7dd3fc",
    background: "#020617",
  },
];

export function normalizeHex(input: string): string | null {
  let h = input.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(h)) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  // Accept near-misses like 0b131 → pad last nibble only if 5 chars? Prefer reject.
  if (/^[0-9a-f]{6}$/.test(h)) return `#${h}`;
  if (/^[0-9a-f]{8}$/.test(h)) return `#${h.slice(0, 6)}`;
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  const v = n.slice(1);
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  if (!A || !B) return a;
  return rgbToHex(
    A.r + (B.r - A.r) * t,
    A.g + (B.g - A.g) * t,
    A.b + (B.b - A.b) * t,
  );
}

export function lightenHex(hex: string, amount = 0.28): string {
  return mixHex(hex, "#ffffff", amount);
}

export function darkenHex(hex: string, amount = 0.72): string {
  return mixHex(hex, "#000000", amount);
}

export type VisualSettings = {
  themePreset: ThemePresetId;
  accentColor: string;
  backgroundColor: string;
  heroBackdrop: HeroBackdrop;
};

export const DEFAULT_VISUAL: VisualSettings = {
  themePreset: "midnight",
  accentColor: "#5b8def",
  backgroundColor: "#0b131e",
  heroBackdrop: "aurora",
};

export function resolveVisual(partial?: Partial<VisualSettings> | null): VisualSettings {
  const presetId = (partial?.themePreset ?? DEFAULT_VISUAL.themePreset) as ThemePresetId;
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  const rawBackdrop = partial?.heroBackdrop ?? DEFAULT_VISUAL.heroBackdrop;
  const heroBackdrop = normalizeHeroBackdrop(rawBackdrop);

  if (presetId !== "custom" && preset) {
    return {
      themePreset: presetId,
      accentColor: preset.accent,
      backgroundColor: preset.background,
      heroBackdrop,
    };
  }

  return {
    themePreset: "custom",
    accentColor:
      normalizeHex(partial?.accentColor ?? "") ?? DEFAULT_VISUAL.accentColor,
    backgroundColor:
      normalizeHex(partial?.backgroundColor ?? "") ??
      DEFAULT_VISUAL.backgroundColor,
    heroBackdrop,
  };
}

/** Map one accent + background into all CSS custom properties used by the UI. */
export function visualToCssVars(visual: VisualSettings): Record<string, string> {
  const accent = normalizeHex(visual.accentColor) ?? DEFAULT_VISUAL.accentColor;
  const background =
    normalizeHex(visual.backgroundColor) ?? DEFAULT_VISUAL.backgroundColor;
  const preset = THEME_PRESETS.find((p) => p.id === visual.themePreset);
  const accentWarm =
    preset && visual.themePreset !== "custom"
      ? preset.accentWarm
      : lightenHex(accent, 0.32);
  const accentMuted = mixHex(accent, background, 0.82);
  const foreground = mixHex(background, "#ffffff", 0.92);
  const muted = mixHex(background, "#ffffff", 0.45);
  const border = `color-mix(in srgb, ${foreground} 10%, transparent)`;
  const surface = mixHex(background, "#ffffff", 0.04);

  const overlay = `linear-gradient(115deg, ${mixHex(background, "#000000", 0.15)}ee 0%, ${mixHex(background, "#000000", 0.05)}99 38%, ${background}14 62%, ${mixHex(background, "#000000", 0.1)}99 100%)`;

  return {
    "--background": background,
    "--foreground": foreground,
    "--accent": accent,
    "--accent-warm": accentWarm,
    "--accent-muted": accentMuted,
    "--border": border,
    "--muted": muted,
    "--nav-bg": `color-mix(in srgb, ${background} 55%, transparent)`,
    "--nav-text": foreground,
    "--nav-accent": accent,
    "--hero-overlay": overlay,
    "--hero-headline": foreground,
    "--hero-subtext": muted,
    "--hero-cta-bg": foreground,
    "--hero-cta-text": background,
    "--twin-panel-bg": `color-mix(in srgb, ${surface} 70%, transparent)`,
    "--twin-panel-border": border,
    "--twin-input-bg": `color-mix(in srgb, ${background} 92%, transparent)`,
    "--twin-accent": accent,
    "--exp-timeline": accent,
    "--exp-title": foreground,
    "--exp-meta": muted,
    "--exp-bullet": mixHex(background, "#ffffff", 0.72),
    "--skills-chip-bg": `color-mix(in srgb, ${foreground} 5%, transparent)`,
    "--skills-chip-text": mixHex(background, "#ffffff", 0.85),
    "--skills-group-title": foreground,
    "--projects-surface": `color-mix(in srgb, ${surface} 80%, transparent)`,
    "--projects-title": foreground,
    "--projects-metric": accentWarm,
    "--projects-stack-chip": `color-mix(in srgb, ${foreground} 6%, transparent)`,
    "--edu-surface": `color-mix(in srgb, ${surface} 75%, transparent)`,
    "--edu-title": foreground,
    "--edu-meta": muted,
    "--footer-bg": "transparent",
    "--footer-text": muted,
    "--footer-link": accent,
  };
}
