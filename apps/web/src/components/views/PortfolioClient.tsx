"use client";

import type { PortfolioPayload } from "@/lib/portfolio/types";
import { DEFAULT_SECTION_ORDER } from "@/lib/portfolio/types";
import { AmbientMesh } from "@/components/motion/AmbientMesh";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { VisualTheme } from "@/components/theme/VisualTheme";
import { SmoothScroll } from "@/components/cinematic/SmoothScroll";
import { CursorFollower } from "@/components/cinematic/CursorFollower";
import { resolveVisual } from "@/lib/theme/presets";
import { NavView } from "./NavView";
import { HeroView } from "./HeroView";
import { ExperienceView } from "./ExperienceView";
import { SkillsView } from "./SkillsView";
import { ProjectsView } from "./ProjectsView";
import { EducationView } from "./EducationView";
import { FooterView } from "./FooterView";

type Props = {
  payload: PortfolioPayload;
};

export function PortfolioClient({ payload }: Props) {
  const sections = [...DEFAULT_SECTION_ORDER];
  const labels = payload.site.sectionLabels;
  const visual = resolveVisual(payload.site);

  return (
    <VisualTheme site={payload.site}>
      <SmoothScroll>
        <div className="relative isolate overflow-x-hidden">
          <AmbientMesh />
          <div className="film-vignette" aria-hidden />
          <div className="film-grain" aria-hidden />
          <ScrollProgress />
          <CursorFollower />
          <NavView profile={payload.profile} />
          {sections.map((section) => {
            switch (section) {
              case "hero":
                return (
                  <HeroView
                    key="hero"
                    profile={payload.profile}
                    experienceSummary={payload.experienceSummary}
                    heroBackdrop={visual.heroBackdrop}
                  />
                );
              case "experience":
                return (
                  <ExperienceView
                    key="experience"
                    experiences={payload.experiences}
                    label={labels.experience ?? "Experience"}
                  />
                );
              case "skills":
                return (
                  <SkillsView
                    key="skills"
                    skillGroups={payload.skillGroups}
                    label={labels.skills ?? "Capabilities"}
                  />
                );
              case "projects":
                return (
                  <ProjectsView
                    key="projects"
                    projects={payload.projects}
                    label={labels.projects ?? "Systems shipped"}
                  />
                );
              case "education":
                return (
                  <EducationView
                    key="education"
                    education={payload.education}
                    label={labels.education ?? "Education"}
                  />
                );
              default:
                return null;
            }
          })}
          <FooterView profile={payload.profile} />
          {payload.source === "seed" ? (
            <p className="mono px-6 py-3 text-center text-[10px] opacity-40">
              Showing seed data — configure Firebase and run Admin → Seed for live DB content.
            </p>
          ) : null}
        </div>
      </SmoothScroll>
    </VisualTheme>
  );
}
