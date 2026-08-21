"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Soft magnetic cursor — expands on interactive targets. */
export function CursorFollower() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine || !dot.current || !ring.current) return;

    document.documentElement.classList.add("has-cinematic-cursor");

    const d = dot.current;
    const r = ring.current;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      gsap.to(d, { x: pos.x, y: pos.y, duration: 0.12, ease: "power2.out", overwrite: "auto" });
    };

    const ticker = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.12;
      ringPos.y += (pos.y - ringPos.y) * 0.12;
      gsap.set(r, { x: ringPos.x, y: ringPos.y });
    };
    gsap.ticker.add(ticker);

    const grow = () => {
      gsap.to(r, { scale: 2.4, opacity: 0.35, duration: 0.45, ease: "power2.out" });
      gsap.to(d, { scale: 0.5, duration: 0.35, ease: "power2.out" });
    };
    const shrink = () => {
      gsap.to(r, { scale: 1, opacity: 0.55, duration: 0.5, ease: "power2.out" });
      gsap.to(d, { scale: 1, duration: 0.35, ease: "power2.out" });
    };

    const selectors = "a, button, [data-cursor='grow'], .cursor-grow";
    const bind = () => {
      document.querySelectorAll(selectors).forEach((el) => {
        el.addEventListener("mouseenter", grow);
        el.addEventListener("mouseleave", shrink);
      });
    };
    bind();
    const mo = new MutationObserver(bind);
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-cinematic-cursor");
      window.removeEventListener("mousemove", onMove);
      gsap.ticker.remove(ticker);
      mo.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        className="cinematic-cursor-ring pointer-events-none fixed top-0 left-0 z-[100] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border md:block"
        style={{ borderColor: "color-mix(in srgb, var(--accent) 55%, transparent)", opacity: 0.55 }}
        aria-hidden
      />
      <div
        ref={dot}
        className="cinematic-cursor-dot pointer-events-none fixed top-0 left-0 z-[101] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
        style={{ background: "var(--accent)" }}
        aria-hidden
      />
    </>
  );
}
