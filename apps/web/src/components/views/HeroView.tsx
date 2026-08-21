"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ExperienceSummary, Profile } from "@/lib/portfolio/types";
import type { HeroBackdrop as HeroBackdropMode } from "@/lib/theme/presets";
import { normalizeHeroBackdrop } from "@/lib/theme/hero-backdrops";
import { TextScramble } from "@/components/motion/TextScramble";
import { HeroBackdrop } from "./HeroBackdrop";
import { NeuralField } from "@/components/cinematic/NeuralField";
import { DataOrchestratorField } from "@/components/cinematic/DataOrchestratorField";
import { scrollToId } from "@/components/cinematic/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  profile: Profile;
  experienceSummary: ExperienceSummary;
  heroBackdrop: HeroBackdropMode;
};

export function HeroView({
  profile,
  experienceSummary,
  heroBackdrop,
}: Props) {
  const root = useRef<HTMLElement>(null);
  const layerMid = useRef<HTMLDivElement>(null);
  const layerNear = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  const first = profile.name.split(" ")[0] ?? profile.name;
  const rest = profile.name.split(" ").slice(1).join(" ");
  const mode = normalizeHeroBackdrop(heroBackdrop);
  const showNeural = mode !== "orchestrator";
  const showOrchestrator = mode === "orchestrator";

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const fades = content.current?.querySelectorAll<HTMLElement>("[data-hero-fade]") ?? [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      fades.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(fades, { opacity: 0, y: 36 });
      gsap.to(fades, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.15,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.4,
        },
      });

      if (layerMid.current) {
        tl.to(layerMid.current, { y: 90, ease: "none" }, 0);
      }
      if (layerNear.current) {
        tl.to(layerNear.current, { y: 40, ease: "none" }, 0);
      }
      // Parallax only — do not fade the name away
      if (content.current) {
        tl.to(content.current, { y: 80, ease: "none" }, 0);
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative h-[100svh] min-h-[100svh] w-full overflow-hidden"
    >
      {/* Hero backdrop */}
      <div className="absolute inset-0">
        <HeroBackdrop mode={mode} />
      </div>

      {showNeural ? <NeuralField /> : null}
      {showOrchestrator ? <DataOrchestratorField /> : null}

      {/* Readable overlay — lighter so name stays clear */}
      <div
        ref={layerMid}
        className="pointer-events-none absolute inset-0 z-[2] will-change-transform"
        style={{
          background:
            "linear-gradient(105deg, color-mix(in srgb, var(--background) 55%, transparent) 0%, color-mix(in srgb, var(--background) 20%, transparent) 45%, transparent 70%)",
        }}
      />
      <div
        ref={layerNear}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[45%] will-change-transform"
        style={{
          background:
            "linear-gradient(to top, var(--background), transparent)",
        }}
      />

      <div
        ref={content}
        className="relative z-20 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-28 pt-28 sm:px-8 md:pb-32"
      >
        <div className="max-w-3xl">
          <p data-hero-fade className="film-eyebrow mb-6">
            {profile.location}
          </p>
          <h1
            data-hero-fade
            className="display text-[clamp(2.8rem,9.5vw,6.25rem)] leading-[0.9] font-semibold tracking-tight"
            style={{
              color: "var(--hero-headline)",
              textShadow:
                "0 2px 24px color-mix(in srgb, var(--background) 70%, transparent), 0 0 40px color-mix(in srgb, var(--background) 40%, transparent)",
            }}
          >
            <span className="block">
              <TextScramble text={first} />
            </span>
            {rest ? (
              <span className="mt-1 block font-medium opacity-90">
                <TextScramble text={rest} delayMs={480} />
              </span>
            ) : null}
          </h1>
          <p
            data-hero-fade
            className="mt-6 max-w-md text-base md:text-lg"
            style={{ color: "var(--hero-subtext)" }}
          >
            {profile.title}
            <span className="mono ml-2 text-sm opacity-60">
              · {experienceSummary.totalLabel}
            </span>
          </p>

          <div data-hero-fade className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              data-cursor="grow"
              onClick={() => scrollToId("experience")}
              className="cursor-grow clip-cta px-7 py-3.5 text-sm font-semibold transition-opacity duration-500 hover:opacity-90"
              style={{
                background: "var(--hero-cta-bg)",
                color: "var(--hero-cta-text)",
              }}
            >
              View experience
            </button>
            <button
              type="button"
              data-cursor="grow"
              onClick={() => scrollToId("projects")}
              className="cursor-grow liquid-glass clip-cta px-7 py-3.5 text-sm font-medium transition-opacity duration-500 hover:opacity-90"
              style={{ color: "var(--hero-headline)" }}
            >
              View work
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <p className="film-eyebrow flex items-center gap-2">
          <span
            className="inline-block h-10 w-px"
            style={{ background: "var(--accent)" }}
          />
          Scroll
        </p>
      </div>
    </section>
  );
}
