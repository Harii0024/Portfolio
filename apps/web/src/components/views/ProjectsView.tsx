"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/portfolio/types";
import { GsapReveal } from "@/components/cinematic/GsapReveal";
import { ExpandOnScroll } from "@/components/cinematic/ExpandOnScroll";
import { ScrollWordReveal } from "@/components/motion/ScrollWordReveal";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  projects: Project[];
  label: string;
};

export function ProjectsView({ projects, label }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const floatA = useRef<HTMLDivElement>(null);
  const floatB = useRef<HTMLDivElement>(null);
  const floatC = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const scrub = (el: HTMLElement | null, y: number, x = 0) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: -y * 0.35, x: -x * 0.35 },
          {
            y,
            x,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.4,
            },
          },
        );
      };

      scrub(floatA.current, 160, -40);
      scrub(floatB.current, -120, 60);
      scrub(floatC.current, 90, -20);

      section.querySelectorAll<HTMLElement>("[data-proj-card]").forEach((card, i) => {
        const title = card.querySelector<HTMLElement>("[data-proj-title]");
        const glow = card.querySelector<HTMLElement>("[data-proj-glow]");
        const index = card.querySelector<HTMLElement>("[data-proj-index]");
        const shift = i % 2 === 0 ? -36 : 36;

        gsap.fromTo(
          card,
          { x: shift, y: 48 },
          {
            x: 0,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              end: "top 40%",
              scrub: 1.25,
            },
          },
        );

        if (title) {
          gsap.fromTo(
            title,
            { y: 14 },
            {
              y: -8,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.6,
              },
            },
          );
        }

        if (glow) {
          gsap.fromTo(
            glow,
            { y: -30, scale: 0.92 },
            {
              y: 40,
              scale: 1.08,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.8,
              },
            },
          );
        }

        if (index) {
          gsap.fromTo(
            index,
            { y: 20, opacity: 0.15 },
            {
              y: -30,
              opacity: 0.35,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 20%",
                scrub: 1.3,
              },
            },
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, [projects]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="section-pad relative overflow-hidden"
    >
      {/* Soft parallax orbs — depth field behind cards */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          ref={floatA}
          className="absolute -left-[10%] top-[12%] h-[42vmin] w-[42vmin] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent) 28%, transparent), transparent 70%)",
            filter: "blur(8px)",
          }}
        />
        <div
          ref={floatB}
          className="absolute -right-[8%] top-[40%] h-[36vmin] w-[36vmin] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent-warm) 22%, transparent), transparent 68%)",
            filter: "blur(10px)",
          }}
        />
        <div
          ref={floatC}
          className="absolute left-[35%] bottom-[5%] h-[28vmin] w-[28vmin] rounded-full opacity-35"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 72%)",
            filter: "blur(12px)",
          }}
        />
      </div>

      <div className="relative z-[1] mx-auto max-w-6xl px-5 sm:px-8">
        <GsapReveal>
          <p className="film-eyebrow mb-4">03 · systems</p>
          <ScrollWordReveal
            text={label}
            className="display text-[clamp(2rem,5vw,3.25rem)] font-medium"
            style={{ color: "var(--projects-title)" }}
          />
          <p className="mt-3 max-w-sm text-sm" style={{ color: "var(--muted)" }}>
            Open any piece for the full story.
          </p>
        </GsapReveal>
      </div>

      <div className="relative z-[1] mx-auto mt-14 flex max-w-6xl flex-col gap-10 px-5 sm:px-8 md:gap-12">
        {projects.map((project, i) => {
          const open = openId === project.id;
          return (
            <ExpandOnScroll key={project.id} fromScale={i === 0 ? 0.92 : 0.94}>
              <article
                data-proj-card
                data-cursor="grow"
                className="cursor-grow glass-panel group relative overflow-hidden border transition-[box-shadow] duration-700"
                style={{
                  background: "var(--projects-surface)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div
                  data-proj-glow
                  className="pointer-events-none absolute -inset-[20%] opacity-50 transition-opacity duration-700 group-hover:opacity-80"
                  style={{
                    background: `radial-gradient(ellipse at ${i % 2 === 0 ? "12%" : "88%"} 20%, color-mix(in srgb, var(--accent) 26%, transparent), transparent 58%)`,
                  }}
                />

                <span
                  data-proj-index
                  className="pointer-events-none absolute -right-1 top-4 display select-none text-[clamp(4rem,14vw,8rem)] font-semibold leading-none md:top-2 md:right-4"
                  style={{ color: "var(--accent)", opacity: 0.2 }}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <button
                  type="button"
                  className="relative w-full p-6 text-left md:p-10"
                  onClick={() => setOpenId(open ? null : project.id)}
                  aria-expanded={open}
                >
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="relative z-[1] min-w-0">
                      <p className="film-eyebrow">
                        {String(i + 1).padStart(2, "0")} · {project.company}
                      </p>
                      <h3
                        data-proj-title
                        className="display mt-3 text-[clamp(1.5rem,3.5vw,2.75rem)] font-medium will-change-transform"
                        style={{
                          color: "var(--projects-title)",
                          textShadow:
                            "0 2px 18px color-mix(in srgb, var(--background) 55%, transparent)",
                        }}
                      >
                        {project.name}
                      </h3>
                    </div>
                    <span
                      className="mono relative z-[1] text-xs tracking-widest uppercase"
                      style={{ color: "var(--muted)" }}
                    >
                      {open ? "Close" : "Details"}
                    </span>
                  </div>

                  {!open ? (
                    <p
                      className="relative z-[1] mt-4 max-w-xl text-sm leading-relaxed line-clamp-2"
                      style={{ color: "var(--muted)" }}
                    >
                      {project.summary}
                    </p>
                  ) : null}

                  {!open && project.metrics.length > 0 ? (
                    <div className="relative z-[1] mt-5 flex flex-wrap gap-x-4 gap-y-2">
                      {project.metrics.slice(0, 3).map((m, mi) => (
                        <span
                          key={`${project.id}-peek-${mi}`}
                          className="mono text-[11px] md:text-xs"
                          style={{ color: "var(--projects-metric)" }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div
                      className="relative z-[1] space-y-5 border-t px-6 pb-8 md:px-10"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <p
                        className="pt-5 max-w-3xl text-sm leading-relaxed md:text-base"
                        style={{ color: "var(--muted)" }}
                      >
                        {project.summary}
                      </p>
                      {project.metrics.length > 0 ? (
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                          {project.metrics.map((m, mi) => (
                            <span
                              key={`${project.id}-m-${mi}-${m}`}
                              className="mono text-xs md:text-sm"
                              style={{ color: "var(--projects-metric)" }}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <ul
                        className="grid gap-2 text-sm md:grid-cols-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        {project.bullets.map((b, bi) => (
                          <li key={`${project.id}-b-${bi}`} className="opacity-85">
                            <span style={{ color: "var(--accent)" }}>→ </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-2">
                        {project.stack.map((s, si) => (
                          <span
                            key={`${project.id}-s-${si}-${s}`}
                            className="rounded-full px-3 py-1 text-xs"
                            style={{
                              background: "var(--projects-stack-chip)",
                              color: "var(--foreground)",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </ExpandOnScroll>
          );
        })}
      </div>
    </section>
  );
}
