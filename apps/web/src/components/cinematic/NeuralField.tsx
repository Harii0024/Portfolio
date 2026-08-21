"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  layer: number;
};

type Edge = {
  a: number;
  b: number;
  pulse: number;
  speed: number;
};

function readAccent(): string {
  if (typeof window === "undefined") return "#5b8def";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();
  return v || "#5b8def";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0").slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 91, g: 141, b: 239 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Synaptic lattice — generative neural-field canvas for the hero.
 * Soft, accent-tinted nodes + traveling activation pulses.
 */
export function NeuralField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let t = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    const accent = hexToRgb(readAccent());

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
      seed();
    };

    const seed = () => {
      const count = Math.min(68, Math.max(36, Math.floor((w * h) / 22000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        // Bias density to the right / upper field so left headline stays clear
        const biasX = 0.42 + Math.random() * 0.58;
        const biasY = 0.08 + Math.random() * 0.78;
        nodes.push({
          x: biasX * w,
          y: biasY * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 1.2 + Math.random() * 2.4,
          phase: Math.random() * Math.PI * 2,
          layer: Math.floor(Math.random() * 3),
        });
      }

      edges = [];
      const maxDist = Math.min(w, h) * 0.22;
      for (let i = 0; i < nodes.length; i++) {
        const dists: { j: number; d: number }[] = [];
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist) dists.push({ j, d });
        }
        dists.sort((a, b) => a.d - b.d);
        for (const link of dists.slice(0, 3)) {
          edges.push({
            a: i,
            b: link.j,
            pulse: Math.random(),
            speed: 0.0025 + Math.random() * 0.0045,
          });
        }
      }
    };

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      // Soft left-to-right fade so name stays readable
      const fade = ctx.createLinearGradient(0, 0, w * 0.55, 0);
      fade.addColorStop(0, "rgba(0,0,0,0)");
      fade.addColorStop(0.35, "rgba(0,0,0,0.35)");
      fade.addColorStop(1, "rgba(0,0,0,1)");

      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < w * 0.28 || n.x > w - 8) n.vx *= -1;
          if (n.y < 8 || n.y > h - 8) n.vy *= -1;
        }

        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 140) {
            n.x -= (dx / d) * 0.35;
            n.y -= (dy / d) * 0.35;
          }
        }
      }

      // Edges
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const alpha = Math.max(0, 1 - dist / (Math.min(w, h) * 0.24)) * 0.45;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${alpha * 0.55})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (!reduce) {
          e.pulse = (e.pulse + e.speed) % 1;
          const px = a.x + dx * e.pulse;
          const py = a.y + dy * e.pulse;
          const glow = 0.35 + 0.65 * Math.sin(e.pulse * Math.PI);
          ctx.beginPath();
          ctx.arc(px, py, 1.6 + glow, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${0.55 + glow * 0.35})`;
          ctx.fill();
        }
      }

      // Nodes
      for (const n of nodes) {
        const breath = 0.55 + 0.45 * Math.sin(t * 0.02 + n.phase);
        const ring = n.r + breath * 1.8;

        ctx.beginPath();
        ctx.arc(n.x, n.y, ring * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${0.04 + breath * 0.05})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + breath * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},${0.55 + breath * 0.35})`;
        ctx.fill();

        if (n.layer === 2) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, ring + 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${0.2 + breath * 0.2})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Occasional “inference” burst — radial scan from a hub node
      if (!reduce) {
        const hub = nodes[Math.floor((t / 180) % nodes.length)] ?? nodes[0];
        if (hub) {
          const scan = (t % 180) / 180;
          ctx.beginPath();
          ctx.arc(hub.x, hub.y, 8 + scan * 90, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${(1 - scan) * 0.22})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // Apply readability mask via destination-in style overlay
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= rect.width &&
        pointer.y <= rect.height;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full opacity-55" />
      {/* Soft veil — keep light so the name stays visible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, color-mix(in srgb, var(--background) 35%, transparent) 0%, transparent 48%)",
        }}
      />
    </div>
  );
}
