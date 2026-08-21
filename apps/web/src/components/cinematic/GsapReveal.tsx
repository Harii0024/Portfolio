"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** "fade" | "up" | "scale" */
  variant?: "fade" | "up" | "scale";
  delay?: number;
  as?: "div" | "section" | "article" | "header";
};

/** Slow GSAP ScrollTrigger fade / rise reveal. */
export function GsapReveal({
  children,
  className = "",
  style,
  variant = "up",
  delay = 0,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(el, { clearProps: "all", opacity: 1 });
      return;
    }

    const from: gsap.TweenVars = { opacity: 0 };
    if (variant === "up") from.y = 48;
    if (variant === "scale") {
      from.scale = 0.92;
      from.y = 24;
    }

    const tween = gsap.fromTo(el, from, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.35,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [variant, delay]);

  return (
    <Tag ref={ref as never} className={className} style={{ ...style, opacity: 0 }}>
      {children}
    </Tag>
  );
}
