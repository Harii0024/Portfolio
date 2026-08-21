"use client";

import type { ComponentType, CSSProperties } from "react";

export type OrchestratorNodeKind =
  | "orchestrator"
  | "database"
  | "api"
  | "cloud"
  | "ai"
  | "app"
  | "analytics"
  | "external";

export type OrchestratorNodeDef = {
  id: string;
  nx: number;
  ny: number;
  kind: OrchestratorNodeKind;
  label: string;
  depth: 0 | 1 | 2;
  phase: number;
};

export const HUB_ID = "hub";

/** Tiered layout — sources → hub → outputs (no spider-web cross-links). */
export const ORCHESTRATOR_NODES: OrchestratorNodeDef[] = [
  /* Ingest layer */
  { id: "db-in", nx: 0.53, ny: 0.16, kind: "database", label: "Database", depth: 1, phase: 0.3 },
  { id: "api-in", nx: 0.51, ny: 0.32, kind: "api", label: "API", depth: 1, phase: 1.0 },
  { id: "ai-svc", nx: 0.53, ny: 0.52, kind: "ai", label: "AI Models", depth: 1, phase: 2.1 },
  { id: "app-in", nx: 0.51, ny: 0.72, kind: "app", label: "Apps", depth: 1, phase: 0.6 },

  /* Central orchestrator */
  {
    id: HUB_ID,
    nx: 0.62,
    ny: 0.46,
    kind: "orchestrator",
    label: "Orchestrator",
    depth: 2,
    phase: 0,
  },

  /* Delivery layer */
  { id: "cloud-m", nx: 0.78, ny: 0.19, kind: "cloud", label: "Cloud", depth: 1, phase: 1.4 },
  {
    id: "analytics",
    nx: 0.82,
    ny: 0.42,
    kind: "analytics",
    label: "Insights",
    depth: 1,
    phase: 2.5,
  },
  { id: "api-out", nx: 0.86, ny: 0.58, kind: "api", label: "REST", depth: 1, phase: 0.2 },
  {
    id: "ext-out",
    nx: 0.84,
    ny: 0.76,
    kind: "external",
    label: "External",
    depth: 1,
    phase: 1.7,
  },
];

type IconProps = { className?: string; style?: CSSProperties };

function IconDatabase({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <ellipse cx="12" cy="6.5" rx="7" ry="2.8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 6.5v5.8c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V6.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 12.3v5.2c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8v-5.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconApi({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M8 8l-3 4 3 4M16 8l3 4-3 4M14 6l-4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCloud({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 18h9.5a4 4 0 0 0 .35-8 5.5 5.5 0 0 0-10.65 1.8A3.5 3.5 0 0 0 7 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAi({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9h2v2H9zM13 9h2v2h-2zM9 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
    </svg>
  );
}

function IconApp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9h16M9 9v11" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconInsights({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 18V6M8 18V10M12 18V13M16 18V8M20 18V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconExternal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 12h20M12 4c2.5 2.2 4 5.2 4 8s-1.5 5.8-4 8M12 4c-2.5 2.2-4 5.2-4 8s1.5 5.8 4 8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconOrchestrator({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS: Record<OrchestratorNodeKind, ComponentType<IconProps>> = {
  database: IconDatabase,
  api: IconApi,
  cloud: IconCloud,
  ai: IconAi,
  app: IconApp,
  analytics: IconInsights,
  external: IconExternal,
  orchestrator: IconOrchestrator,
};

type NodeCardProps = {
  node: OrchestratorNodeDef;
  glow?: number;
};

export function OrchestratorNodeCard({ node, glow = 0 }: NodeCardProps) {
  const Icon = ICONS[node.kind];
  const isHub = node.kind === "orchestrator";
  const illum = Math.min(1, glow);
  const iconSize = isHub ? "h-8 w-8" : "h-6 w-6";

  const glowFilter =
    illum > 0.08 || isHub
      ? `drop-shadow(0 0 ${8 + illum * 14}px rgba(34, 211, 238, ${0.45 + illum * 0.4})) drop-shadow(0 0 ${4 + illum * 8}px rgba(37, 99, 235, ${0.35 + illum * 0.25}))`
      : "drop-shadow(0 0 6px rgba(34, 211, 238, 0.35))";

  return (
    <div
      className={`absolute flex flex-col items-center gap-2 ${isHub ? "z-[3]" : "z-[2]"}`}
      style={{
        left: `${node.nx * 100}%`,
        top: `${node.ny * 100}%`,
        transform: `translate(-50%, -50%) scale(${isHub ? 1.06 : 1})`,
        opacity: 0.88 + illum * 0.12,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ filter: glowFilter }}
      >
        <Icon
          className={`text-cyan-300 ${iconSize}`}
          style={{
            color: isHub
              ? "rgb(165, 243, 252)"
              : illum > 0.2
                ? "rgb(186, 230, 253)"
                : "rgb(103, 232, 249)",
          }}
        />
      </div>
      <span
        className={`mono whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.14em] ${
          isHub ? "text-cyan-200" : "text-cyan-400/80"
        }`}
        style={{
          opacity: 0.75 + illum * 0.25,
          textShadow: "0 0 12px rgba(34, 211, 238, 0.35)",
        }}
      >
        {node.label}
      </span>
    </div>
  );
}

type LayerProps = {
  glowById: Record<string, number>;
};

export function OrchestratorNodeLayer({ glowById }: LayerProps) {
  return (
    <>
      {ORCHESTRATOR_NODES.map((node) => (
        <OrchestratorNodeCard
          key={node.id}
          node={node}
          glow={glowById[node.id] ?? 0}
        />
      ))}
    </>
  );
}
