"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Experience } from "@/lib/portfolio/types";
import { formatRolePeriod } from "@/lib/portfolio/experience";
import { GsapReveal } from "@/components/cinematic/GsapReveal";
import { ExpandOnScroll } from "@/components/cinematic/ExpandOnScroll";
import { ScrollWordReveal } from "@/components/motion/ScrollWordReveal";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  experiences: Experience[];
  label: string;
};

export function ExperienceView({ experiences, label }: Props) {
  const rail = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = rail.current;
    const root = list.current;
    if (!track || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        track,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: root,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1.1,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-exp-card]", root).forEach((card, i) => {
        gsap.fromTo(
          card,
          { x: i % 2 === 0 ? -28 : 28, opacity: 0.35 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 45%",
              scrub: 1.2,
            },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, [experiences]);

  return (
    <section id="experience" className="section-pad mx-auto max-w-6xl px-5 sm:px-8">
      <GsapReveal>
        <p className="film-eyebrow mb-4">01 · timeline</p>
        <ScrollWordReveal
          text={label}
          className="display text-[clamp(2rem,5vw,3.25rem)] font-medium"
          style={{ color: "var(--exp-title)" }}
        />
      </GsapReveal>

      <div ref={list} className="relative mt-14 pl-6 md:pl-10">
        <div
          className="absolute bottom-4 left-[0.55rem] top-4 w-px origin-top md:left-[0.85rem]"
          style={{ background: "color-mix(in srgb, var(--border) 80%, transparent)" }}
          aria-hidden
        />
        <div
          ref={rail}
          className="absolute bottom-4 left-[0.55rem] top-4 w-px origin-top md:left-[0.85rem]"
          style={{ background: "var(--exp-timeline)", transform: "scaleY(0)" }}
          aria-hidden
        />

        <div className="space-y-8 md:space-y-10">
          {experiences.map((exp, index) => (
            <ExpandOnScroll key={exp.id} fromScale={0.94}>
              <article
                data-exp-card
                data-cursor="grow"
                className="cursor-grow glass-panel relative border p-6 md:p-8"
                style={{
                  background: "var(--projects-surface)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <span
                  className="absolute -left-[1.55rem] top-8 h-3 w-3 rounded-full border-2 md:-left-[2.05rem] md:top-10"
                  style={{
                    borderColor: "var(--exp-timeline)",
                    background: "var(--background)",
                    boxShadow: "0 0 0 4px color-mix(in srgb, var(--background) 90%, transparent)",
                  }}
                  aria-hidden
                />

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="film-eyebrow mb-2">
                      {String(index + 1).padStart(2, "0")} · {exp.location}
                    </p>
                    <h3
                      className="display text-xl font-medium md:text-2xl"
                      style={{ color: "var(--exp-title)" }}
                    >
                      {exp.role}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--exp-meta)" }}>
                      {exp.company}
                    </p>
                  </div>
                  <p className="mono text-xs" style={{ color: "var(--exp-meta)" }}>
                    {formatRolePeriod(exp.startDate, exp.endDate)}
                  </p>
                </div>

                <ul
                  className="mt-6 space-y-3 text-sm leading-relaxed md:max-w-3xl"
                  style={{ color: "var(--exp-bullet)" }}
                >
                  {exp.bullets.map((b, bi) => (
                    <li key={`${exp.id}-b-${bi}`}>
                      <span style={{ color: "var(--accent)" }}>→ </span>
                      {b}
                    </li>
                  ))}
                </ul>

                {exp.projects?.length > 0 ? (
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {exp.projects.map((p, pi) => (
                      <div
                        key={`${exp.id}-p-${pi}-${p.name}`}
                        className="liquid-glass rounded-[var(--radius)] p-5"
                      >
                        <h4 className="font-medium" style={{ color: "var(--exp-title)" }}>
                          {p.name}
                        </h4>
                        <p className="mt-1 text-sm" style={{ color: "var(--exp-meta)" }}>
                          {p.summary}
                        </p>
                        {p.bullets?.length ? (
                          <ul className="mt-3 space-y-2 text-xs leading-relaxed" style={{ color: "var(--exp-bullet)" }}>
                            {p.bullets.map((b, bi) => (
                              <li key={`${exp.id}-p-${pi}-b-${bi}`}>
                                <span style={{ color: "var(--accent)" }}>→ </span>
                                {b}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {p.stack?.length ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {p.stack.map((s, si) => (
                              <span
                                key={`${exp.id}-p-${pi}-s-${si}`}
                                className="rounded-full px-2.5 py-0.5 text-[10px]"
                                style={{
                                  background: "var(--projects-stack-chip)",
                                  color: "var(--foreground)",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            </ExpandOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
