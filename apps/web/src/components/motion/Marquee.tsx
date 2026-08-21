"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  durationSec?: number;
  className?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
};

/** Endless horizontal marquee (Draftly logo / platform strip). */
export function Marquee({
  children,
  durationSec = 36,
  className = "",
  pauseOnHover = true,
  reverse = false,
}: Props) {
  return (
    <div
      className={`marquee ${pauseOnHover ? "marquee-pause" : ""} ${reverse ? "marquee-reverse" : ""} ${className}`}
      style={{ ["--marquee-duration" as string]: `${durationSec}s` }}
    >
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
