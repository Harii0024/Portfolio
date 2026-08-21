"use client";

import { useEffect, useRef, useState } from "react";
import {
  HUB_ID,
  ORCHESTRATOR_NODES,
  OrchestratorNodeLayer,
  type OrchestratorNodeDef,
} from "@/components/cinematic/orchestrator-nodes";

const PALETTE = {
  blue: { r: 37, g: 99, b: 235 },
  cyan: { r: 34, g: 211, b: 238 },
  indigo: { r: 99, g: 102, b: 241 },
  white: { r: 255, g: 255, b: 255 },
};

type Rgb = { r: number; g: number; b: number };

type Pipeline = { from: string; to: string; activity: number };

type StreamParticle = {
  pipelineIndex: number;
  t: number;
  speed: number;
  size: number;
  hue: "blue" | "cyan" | "indigo";
  trail: number;
};

type NeuronPulse = {
  pipelineIndex: number;
  t: number;
  speed: number;
};

const PIPELINES: Pipeline[] = [
  { from: "db-in", to: HUB_ID, activity: 1 },
  { from: "api-in", to: HUB_ID, activity: 1 },
  { from: "ai-svc", to: HUB_ID, activity: 1 },
  { from: "app-in", to: HUB_ID, activity: 1 },
  { from: HUB_ID, to: "cloud-m", activity: 1 },
  { from: HUB_ID, to: "analytics", activity: 1 },
  { from: HUB_ID, to: "api-out", activity: 0.9 },
  { from: HUB_ID, to: "ext-out", activity: 0.85 },
];

function rgba(c: Rgb, a: number): string {
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a})`;
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function nodePos(node: OrchestratorNodeDef, w: number, h: number) {
  return { x: node.nx * w, y: node.ny * h };
}

/** Edge of `node` on the side facing `toward`. */
function anchorPoint(
  node: OrchestratorNodeDef,
  toward: OrchestratorNodeDef,
  w: number,
  h: number,
) {
  const np = nodePos(node, w, h);
  const tp = nodePos(toward, w, h);
  const dx = tp.x - np.x;
  const dy = tp.y - np.y;
  const len = Math.hypot(dx, dy) || 1;
  const pad =
    node.kind === "orchestrator" || toward.kind === "orchestrator" ? 22 : 16;
  return {
    x: np.x + (dx / len) * pad,
    y: np.y + (dy / len) * pad,
  };
}

function pipelineControls(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  bend = 0.14,
) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const sign = ax < bx ? 1 : -1;
  return {
    c1x: ax + dx * 0.33 + nx * len * bend * sign,
    c1y: ay + dy * 0.33 + ny * len * bend * sign,
    c2x: ax + dx * 0.67 + nx * len * bend * sign * 0.55,
    c2y: ay + dy * 0.67 + ny * len * bend * sign * 0.55,
  };
}

function cubicAt(
  ax: number,
  ay: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  bx: number,
  by: number,
  t: number,
) {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x: uu * u * ax + 3 * uu * t * c1x + 3 * u * tt * c2x + tt * t * bx,
    y: uu * u * ay + 3 * uu * t * c1y + 3 * u * tt * c2y + tt * t * by,
  };
}

function drawOrbitals(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  t: number,
  reduce: boolean,
) {
  const rings = [
    { rx: 58, ry: 32, speed: 0.0022, a: 0.2 },
    { rx: 86, ry: 46, speed: -0.0016, a: 0.14 },
  ];
  for (const ring of rings) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(reduce ? 0 : t * ring.speed);
    ctx.beginPath();
    ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(PALETTE.indigo, ring.a);
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 11]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

export function DataOrchestratorField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [glowById, setGlowById] = useState<Record<string, number>>({});
  const setGlowRef = useRef(setGlowById);
  setGlowRef.current = setGlowById;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let t = 0;

    const nodeMap = new Map(ORCHESTRATOR_NODES.map((n) => [n.id, n]));
    const nodeGlow = new Map<string, number>();
    ORCHESTRATOR_NODES.forEach((n) => nodeGlow.set(n.id, 0));

    const particles: StreamParticle[] = PIPELINES.flatMap((pipe, pipelineIndex) =>
      Array.from({ length: 3 }, (_, i) => ({
        pipelineIndex,
        t: i / 3 + Math.random() * 0.15,
        speed: 0.0014 + pipe.activity * 0.0016 + Math.random() * 0.0006,
        size: 1.4 + Math.random() * 1.3,
        hue: (["blue", "cyan", "indigo"] as const)[i % 3],
        trail: 0.07 + Math.random() * 0.04,
      })),
    );

    const neurons: NeuronPulse[] = PIPELINES.flatMap((_, pipelineIndex) =>
      Array.from({ length: 2 }, () => ({
        pipelineIndex,
        t: Math.random(),
        speed: 0.0009 + Math.random() * 0.001,
      })),
    );

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const getPipelineGeom = (index: number) => {
      const pipe = PIPELINES[index];
      const a = nodeMap.get(pipe.from);
      const b = nodeMap.get(pipe.to);
      if (!a || !b) return null;
      const ap = anchorPoint(a, b, w, h);
      const bp = anchorPoint(b, a, w, h);
      const { c1x, c1y, c2x, c2y } = pipelineControls(ap.x, ap.y, bp.x, bp.y);
      return { pipe, a, b, ap, bp, c1x, c1y, c2x, c2y };
    };

    const tracePath = (
      geom: NonNullable<ReturnType<typeof getPipelineGeom>>,
    ) => {
      ctx.beginPath();
      ctx.moveTo(geom.ap.x, geom.ap.y);
      ctx.bezierCurveTo(
        geom.c1x,
        geom.c1y,
        geom.c2x,
        geom.c2y,
        geom.bp.x,
        geom.bp.y,
      );
    };

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      for (const [id, g] of nodeGlow) {
        nodeGlow.set(id, Math.max(0, g - 0.018));
      }

      const edgePulse = new Array(PIPELINES.length).fill(0);

      /* Only draw orchestration zone — left headline area stays clean via CSS */
      ctx.save();
      ctx.beginPath();
      ctx.rect(w * 0.36, 0, w * 0.64, h);
      ctx.clip();

      /* Base synaptic paths — always visible */
      for (let pi = 0; pi < PIPELINES.length; pi++) {
        const geom = getPipelineGeom(pi);
        if (!geom) continue;

        const grad = ctx.createLinearGradient(
          geom.ap.x,
          geom.ap.y,
          geom.bp.x,
          geom.bp.y,
        );
        grad.addColorStop(0, rgba(PALETTE.indigo, 0.08));
        grad.addColorStop(0.5, rgba(PALETTE.blue, 0.28));
        grad.addColorStop(1, rgba(PALETTE.cyan, 0.12));

        tracePath(geom);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.25;
        ctx.stroke();

        if (!reduce) {
          tracePath(geom);
          ctx.setLineDash([3, 16]);
          ctx.lineDashOffset = -t * 0.6 - pi * 4;
          ctx.strokeStyle = rgba(PALETTE.cyan, 0.12);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      /* Neuron pulses — small signals continuously traveling */
      for (const n of neurons) {
        const geom = getPipelineGeom(n.pipelineIndex);
        if (!geom) continue;
        if (!reduce) n.t = (n.t + n.speed) % 1;

        const pt = cubicAt(
          geom.ap.x,
          geom.ap.y,
          geom.c1x,
          geom.c1y,
          geom.c2x,
          geom.c2y,
          geom.bp.x,
          geom.bp.y,
          n.t,
        );
        edgePulse[n.pipelineIndex] = Math.max(
          edgePulse[n.pipelineIndex],
          Math.sin(n.t * Math.PI) * 0.6,
        );

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(PALETTE.cyan, 0.45);
        ctx.fill();
      }

      /* Primary data particles with comet trails */
      for (const p of particles) {
        const geom = getPipelineGeom(p.pipelineIndex);
        if (!geom) continue;

        if (!reduce) {
          p.t += p.speed;
          if (p.t >= 1) {
            p.t = 0;
            nodeGlow.set(
              geom.pipe.to,
              Math.min(1, (nodeGlow.get(geom.pipe.to) ?? 0) + 0.95),
            );
            nodeGlow.set(
              geom.pipe.from,
              Math.min(1, (nodeGlow.get(geom.pipe.from) ?? 0) + 0.35),
            );
          }
        }

        edgePulse[p.pipelineIndex] = Math.max(
          edgePulse[p.pipelineIndex],
          Math.sin(p.t * Math.PI) * geom.pipe.activity,
        );

        const pt = cubicAt(
          geom.ap.x,
          geom.ap.y,
          geom.c1x,
          geom.c1y,
          geom.c2x,
          geom.c2y,
          geom.bp.x,
          geom.bp.y,
          p.t,
        );
        const t0 = Math.max(0, p.t - p.trail);
        const p0 = cubicAt(
          geom.ap.x,
          geom.ap.y,
          geom.c1x,
          geom.c1y,
          geom.c2x,
          geom.c2y,
          geom.bp.x,
          geom.bp.y,
          t0,
        );

        const color =
          p.hue === "cyan"
            ? PALETTE.cyan
            : p.hue === "indigo"
              ? PALETTE.indigo
              : PALETTE.blue;

        const trailGrad = ctx.createLinearGradient(p0.x, p0.y, pt.x, pt.y);
        trailGrad.addColorStop(0, rgba(color, 0));
        trailGrad.addColorStop(0.6, rgba(color, 0.55));
        trailGrad.addColorStop(1, rgba(PALETTE.white, 0.95));

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.stroke();

        const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, p.size * 4);
        glow.addColorStop(0, rgba(PALETTE.white, 0.95));
        glow.addColorStop(0.35, rgba(color, 0.7));
        glow.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Active path glow */
      for (let pi = 0; pi < PIPELINES.length; pi++) {
        if (edgePulse[pi] < 0.05) continue;
        const geom = getPipelineGeom(pi);
        if (!geom) continue;
        tracePath(geom);
        ctx.strokeStyle = rgba(PALETTE.cyan, edgePulse[pi] * 0.42);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const hub = nodeMap.get(HUB_ID)!;
      const hp = nodePos(hub, w, h);
      drawOrbitals(ctx, hp.x, hp.y, t, reduce);

      if (!reduce) {
        const wave = (t % 280) / 280;
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 28 + wave * 110, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(PALETTE.cyan, (1 - wave) * 0.14);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.restore();

      if (t % 3 === 0) {
        const next: Record<string, number> = {};
        for (const node of ORCHESTRATOR_NODES) {
          next[node.id] = nodeGlow.get(node.id) ?? 0;
        }
        setGlowRef.current(next);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />
      <div className="relative z-10 h-full w-full">
        <OrchestratorNodeLayer glowById={glowById} />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(105deg,
              color-mix(in srgb, var(--background) 96%, transparent) 0%,
              color-mix(in srgb, var(--background) 72%, transparent) 36%,
              transparent 52%
            )
          `,
        }}
      />
    </div>
  );
}
