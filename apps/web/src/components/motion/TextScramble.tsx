"use client";

import { useEffect, useState, type CSSProperties } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—/+";

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** Ms between glyph ticks */
  tickMs?: number;
  /** Delay before scramble starts */
  delayMs?: number;
};

/** NameThatUI “Text Scramble / Decode Effect” — glyphs churn into the real string. */
export function TextScramble({
  text,
  className,
  style,
  tickMs = 28,
  delayMs = 180,
}: Props) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = window.setTimeout(() => {
      timer = setInterval(() => {
        frame += 1;
        const progress = Math.min(1, frame / Math.max(12, text.length * 2.2));
        const reveal = Math.floor(progress * text.length);
        setDisplay(
          text
            .split("")
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (i < reveal) return text[i];
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join(""),
        );
        if (progress >= 1) {
          clearInterval(timer);
          setDisplay(text);
        }
      }, tickMs);
    }, delayMs);

    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [text, tickMs, delayMs]);

  return (
    <span className={className} style={style} aria-label={text}>
      {display}
    </span>
  );
}
