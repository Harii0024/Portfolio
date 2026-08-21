"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { HeroBackdrop } from "@/lib/theme/hero-backdrops";

type Props = {
  mode: HeroBackdrop;
  children?: ReactNode;
};

function AuroraMeshLayers({ mode }: { mode: "aurora" | "mesh" }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            mode === "mesh"
              ? `radial-gradient(ellipse at 70% 30%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 55%),
                 radial-gradient(ellipse at 20% 80%, color-mix(in srgb, var(--accent-warm) 14%, transparent), transparent 50%),
                 var(--background)`
              : `radial-gradient(ellipse 80% 60% at 70% 40%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 60%),
                 radial-gradient(ellipse 50% 40% at 15% 70%, color-mix(in srgb, var(--accent-warm) 18%, transparent), transparent 55%),
                 radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--accent-muted) 90%, transparent), transparent 45%),
                 linear-gradient(165deg, var(--background), color-mix(in srgb, var(--accent) 8%, var(--background)))`,
        }}
      />
      <motion.div
        className="absolute -right-[10%] top-[5%] h-[70vmax] w-[70vmax] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 35%, transparent), transparent 68%)",
          filter: "blur(40px)",
        }}
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -10, 0], scale: [1, 1.06, 0.98, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-[15%] bottom-[-10%] h-[55vmax] w-[55vmax] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent-warm) 30%, transparent), transparent 70%)",
          filter: "blur(48px)",
        }}
        animate={{ x: [0, 35, -15, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

/** Deep midnight base — cinematic 16:9 hero; energy concentrated center-right. */
function OrchestratorBase() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 62% 48%, rgba(37, 99, 235, 0.12) 0%, transparent 52%),
            radial-gradient(ellipse 60% 50% at 78% 55%, rgba(34, 211, 238, 0.06) 0%, transparent 48%),
            radial-gradient(ellipse 40% 35% at 55% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 45%),
            linear-gradient(118deg,
              #030712 0%,
              color-mix(in srgb, var(--background) 95%, #0b131e) 42%,
              color-mix(in srgb, var(--background) 88%, #0f172a) 100%
            )
          `,
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 68% 45%, rgba(34, 211, 238, 0.15), transparent 70%)",
          filter: "blur(32px)",
        }}
        animate={{ opacity: [0.18, 0.28, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[5%] top-[12%] h-[50vmax] w-[50vmax] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.25), transparent 68%)",
          filter: "blur(64px)",
        }}
        animate={{ scale: [1, 1.04, 0.98, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[18%] bottom-[8%] h-[35vmax] w-[35vmax] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(37, 99, 235, 0.3), transparent 70%)",
          filter: "blur(48px)",
        }}
        animate={{ x: [0, 12, -8, 0], y: [0, -10, 6, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-y-0 left-0 w-[42%]"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--background) 98%, #030712), transparent)",
        }}
      />
    </>
  );
}

/** Hero visual stack — aurora, soft mesh, or data orchestrator base. */
export function HeroBackdrop({ mode }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {mode === "orchestrator" ? (
        <OrchestratorBase />
      ) : (
        <AuroraMeshLayers mode={mode} />
      )}
    </div>
  );
}
