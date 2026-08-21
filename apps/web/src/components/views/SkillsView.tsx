"use client";

import { motion } from "motion/react";
import type { SkillGroup } from "@/lib/portfolio/types";
import { Marquee } from "@/components/motion/Marquee";
import { GsapReveal } from "@/components/cinematic/GsapReveal";
import { ScrollWordReveal } from "@/components/motion/ScrollWordReveal";
import { spring } from "@/components/motion/Reveal";

type Props = {
  skillGroups: SkillGroup[];
  label: string;
};

export function SkillsView({ skillGroups, label }: Props) {
  const allSkills = skillGroups.flatMap((g) => g.items);
  const half = Math.ceil(allSkills.length / 2);
  const rowA = allSkills.slice(0, half);
  const rowB = allSkills.slice(half);

  return (
    <section id="skills" className="section-pad relative">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <GsapReveal>
          <p className="film-eyebrow mb-4">02 · stack</p>
          <ScrollWordReveal
            text={label}
            className="display text-[clamp(2rem,5vw,3.25rem)] font-medium"
            style={{ color: "var(--skills-group-title)" }}
          />
        </GsapReveal>
      </div>

      {allSkills.length > 0 ? (
        <div className="mt-12 space-y-4">
          <Marquee durationSec={42}>
            {(rowA.length ? rowA : allSkills).map((item, i) => (
              <span
                key={`a-${i}-${item}`}
                data-cursor="grow"
                className="cursor-grow liquid-glass whitespace-nowrap rounded-full px-5 py-2.5 text-xs tracking-wide md:text-sm"
                style={{ color: "var(--skills-chip-text)" }}
              >
                {item}
              </span>
            ))}
          </Marquee>
          <Marquee durationSec={48} reverse>
            {(rowB.length ? rowB : allSkills).map((item, i) => (
              <span
                key={`b-${i}-${item}`}
                className="mono whitespace-nowrap rounded-full border px-5 py-2.5 text-xs tracking-[0.12em] uppercase"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                }}
              >
                {item}
              </span>
            ))}
          </Marquee>
        </div>
      ) : null}

      <div className="mx-auto mt-16 grid max-w-6xl gap-12 px-5 sm:px-8 md:grid-cols-2">
        {skillGroups.map((group, i) => (
          <GsapReveal key={group.id} delay={i * 0.08}>
            <h3 className="film-eyebrow mb-5">{group.category}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item, j) => (
                <motion.span
                  key={`${group.id}-${j}-${item}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: 0.02 * j }}
                  className="cursor-grow rounded-full border px-3.5 py-1.5 text-xs transition-transform duration-500 hover:-translate-y-0.5 md:text-sm"
                  data-cursor="grow"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--skills-chip-bg)",
                    color: "var(--skills-chip-text)",
                  }}
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </GsapReveal>
        ))}
      </div>
    </section>
  );
}
