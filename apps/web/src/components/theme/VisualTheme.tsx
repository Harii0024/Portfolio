"use client";

import { useLayoutEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/portfolio/types";
import { resolveVisual, visualToCssVars } from "@/lib/theme/presets";

type Props = {
  site: SiteSettings;
  children: ReactNode;
};

/** Applies unified theme (preset or custom hex) to the whole portfolio tree. */
export function VisualTheme({ site, children }: Props) {
  const visual = resolveVisual({
    themePreset: site.themePreset,
    accentColor: site.accentColor,
    backgroundColor: site.backgroundColor,
    heroBackdrop: site.heroBackdrop,
  });
  const vars = useMemo(
    () => visualToCssVars(visual),
    [
      visual.themePreset,
      visual.accentColor,
      visual.backgroundColor,
      visual.heroBackdrop,
    ],
  );

  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.style.backgroundColor = vars["--background"];
    document.body.style.backgroundColor = vars["--background"];
    document.body.style.color = vars["--foreground"];
    return () => {
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
      }
    };
  }, [vars]);

  return (
    <div className="min-h-full" style={vars as CSSProperties}>
      {children}
    </div>
  );
}
