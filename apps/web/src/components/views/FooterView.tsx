"use client";

import { motion } from "motion/react";
import type { Profile } from "@/lib/portfolio/types";
import { spring } from "@/components/motion/Reveal";

type Props = {
  profile: Profile;
};

export function FooterView({ profile }: Props) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={spring}
      className="mt-auto border-t px-5 py-14 sm:px-8"
      style={{
        borderColor: "var(--border)",
        color: "var(--footer-text)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="film-eyebrow mb-3">end frame</p>
          <p
            className="display text-2xl font-medium md:text-3xl"
            style={{ color: "var(--foreground)" }}
          >
            {profile.name}
          </p>
          <p className="mt-2 max-w-sm text-sm">{profile.title}</p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          {profile.phone ? (
            <a
              href={`tel:${profile.phone.replace(/\s+/g, "")}`}
              style={{ color: "var(--footer-link)" }}
              className="transition-opacity hover:opacity-80"
            >
              {profile.phone}
            </a>
          ) : null}
          {profile.email ? (
            <a
              href={`mailto:${profile.email}`}
              style={{ color: "var(--footer-link)" }}
              className="transition-opacity hover:opacity-80"
            >
              {profile.email}
            </a>
          ) : null}
          {profile.linkedin ? (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--footer-link)" }}
              className="transition-opacity hover:opacity-80"
            >
              LinkedIn
            </a>
          ) : null}
          {profile.github ? (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--footer-link)" }}
              className="transition-opacity hover:opacity-80"
            >
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </motion.footer>
  );
}
