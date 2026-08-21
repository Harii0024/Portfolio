"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: ReactNode;
  className?: string;
  /** Scale from → to while scrolling through the element */
  fromScale?: number;
  toScale?: number;
};

/** Panel / “image” expansion scrubbed by scroll. */
export function ExpandOnScroll({
  children,
  className = "",
  fromScale = 0.88,
  toScale = 1,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const i = inner.current;
    if (!w || !i) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        i,
        { scale: fromScale, borderRadius: "2rem" },
        {
          scale: toScale,
          borderRadius: "1.25rem",
          ease: "none",
          scrollTrigger: {
            trigger: w,
            start: "top 85%",
            end: "top 35%",
            scrub: 1.2,
          },
        },
      );
      gsap.fromTo(
        i,
        { opacity: 0.82 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: w,
            start: "top 90%",
            end: "top 50%",
            scrub: 1,
          },
        },
      );
    }, w);

    return () => ctx.revert();
  }, [fromScale, toScale]);

  return (
    <div ref={wrap} className={`expand-scroll ${className}`}>
      <div ref={inner} className="origin-center will-change-transform">
        {children}
      </div>
    </div>
  );
}
