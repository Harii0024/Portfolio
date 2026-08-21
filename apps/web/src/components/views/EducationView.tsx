"use client";

import type { Education } from "@/lib/portfolio/types";
import { GsapReveal } from "@/components/cinematic/GsapReveal";
import { ExpandOnScroll } from "@/components/cinematic/ExpandOnScroll";
import { ScrollWordReveal } from "@/components/motion/ScrollWordReveal";

type Props = {
  education: Education[];
  label: string;
};

export function EducationView({ education, label }: Props) {
  return (
    <section id="education" className="section-pad mx-auto max-w-6xl px-5 sm:px-8">
      <GsapReveal>
        <p className="film-eyebrow mb-4">04 · foundation</p>
        <ScrollWordReveal
          text={label}
          className="display text-[clamp(2rem,5vw,3.25rem)] font-medium"
          style={{ color: "var(--edu-title)" }}
        />
      </GsapReveal>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {education.map((edu) => (
          <ExpandOnScroll key={edu.id} fromScale={0.94}>
            <article
              data-cursor="grow"
              className="cursor-grow glass-panel border p-7 transition-opacity duration-500 hover:opacity-95"
              style={{
                background: "var(--edu-surface)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <h3
                className="display text-xl font-medium md:text-2xl"
                style={{ color: "var(--edu-title)" }}
              >
                {edu.degree}
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--edu-meta)" }}>
                {edu.school} · {edu.startYear}–{edu.endYear}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {edu.highlights.map((h, hi) => (
                  <span
                    key={`${edu.id}-h-${hi}`}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </article>
          </ExpandOnScroll>
        ))}
      </div>
    </section>
  );
}
