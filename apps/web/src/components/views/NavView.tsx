"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import type { Profile } from "@/lib/portfolio/types";
import { spring } from "@/components/motion/Reveal";
import { useScrollSpy } from "@/components/motion/useScrollSpy";
import { scrollToId } from "@/components/cinematic/SmoothScroll";

type Props = {
  profile: Profile;
};

const LINKS = [
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Work" },
  { id: "education", label: "Education" },
] as const;

export function NavView({ profile }: Props) {
  const ids = useMemo(() => LINKS.map((l) => l.id), []);
  const active = useScrollSpy(ids);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6"
    >
      <div className="liquid-glass pointer-events-auto mx-auto flex max-w-5xl items-center justify-between rounded-full px-4 py-2.5 md:px-5">
        <a
          href="#"
          data-cursor="grow"
          className="cursor-grow display text-sm font-medium tracking-tight md:text-base"
          style={{ color: "var(--nav-text)" }}
          onClick={(e) => {
            e.preventDefault();
            const lenis = (
              window as unknown as { __lenis?: { scrollTo: (v: number) => void } }
            ).__lenis;
            lenis?.scrollTo(0);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {profile.name.split(" ")[0]}
          <span style={{ color: "var(--nav-accent)" }}> · AI</span>
        </a>
        <nav className="hidden items-center gap-0.5 text-sm md:flex">
          {LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                data-cursor="grow"
                className="cursor-grow relative rounded-full px-3 py-1.5 transition-opacity duration-500"
                style={{
                  color: "var(--nav-text)",
                  opacity: isActive ? 1 : 0.55,
                }}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(link.id);
                }}
              >
                {link.label}
                {isActive ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                    transition={spring}
                  />
                ) : null}
              </a>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
