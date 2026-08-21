"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin cinematic scroll progress — Draftly “scroll to animate” cue. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent-warm) 80%, white))",
      }}
    />
  );
}
