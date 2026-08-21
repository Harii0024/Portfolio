"use client";

import { motion } from "motion/react";

/** Soft film atmosphere — warm red/amber fields, not purple neon. */
export function AmbientMesh() {
  return (
    <div
      className="ambient-mesh pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
      style={{ opacity: "var(--mesh-opacity)" }}
    >
      <motion.div
        className="absolute -left-[25%] top-[-15%] h-[60vmax] w-[60vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
        }}
        animate={{ x: [0, 50, -15, 0], y: [0, 35, 8, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[20%] top-[15%] h-[50vmax] w-[50vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent-warm) 16%, transparent), transparent 72%)",
        }}
        animate={{ x: [0, -40, 20, 0], y: [0, -30, 18, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-25%] left-[20%] h-[55vmax] w-[55vmax] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent-muted) 95%, transparent), transparent 68%)",
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 12, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
