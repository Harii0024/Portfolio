"use client";

import { motion, useInView } from "motion/react";
import { useRef, type CSSProperties, type ElementType } from "react";

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  stagger?: number;
};

/** Draftly-style scroll word reveal — words rise into place on enter. */
export function ScrollWordReveal({
  text,
  className = "",
  style,
  as: Tag = "h2",
  stagger = 0.045,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      <span className="inline">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", opacity: 0 }}
              animate={inView ? { y: "0%", opacity: 1 } : undefined}
              transition={{
                duration: 0.7,
                delay: i * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
