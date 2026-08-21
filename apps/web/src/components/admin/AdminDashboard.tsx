"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Education,
  Experience,
  PortfolioPayload,
  Profile,
  Project,
  SiteSettings,
  SkillGroup,
} from "@/lib/portfolio/types";
import {
  THEME_PRESETS,
  normalizeHex,
  resolveVisual,
  visualToCssVars,
} from "@/lib/theme/presets";
import { HERO_BACKDROP_OPTIONS } from "@/lib/theme/hero-backdrops";
import type { HeroBackdrop } from "@/lib/theme/hero-backdrops";
import type { CSSProperties } from "react";
import { ProfileForm } from "@/components/admin/forms/ProfileForm";
import { ExperiencesForm } from "@/components/admin/forms/ExperiencesForm";
import { EducationForm } from "@/components/admin/forms/EducationForm";
import { SkillsForm } from "@/components/admin/forms/SkillsForm";
import { ProjectsForm } from "@/components/admin/forms/ProjectsForm";
import { TextInput, SaveBar } from "@/components/admin/forms/fields";

type Tab =
  | "profile"
  | "experiences"
  | "education"
  | "skills"
  | "projects"
  | "site"
  | "seed";

type Props = {
  initial: PortfolioPayload;
  email: string;
};

async function putJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Save failed");
  return data;
}

export function AdminDashboard({ initial, email }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState<Profile>(initial.profile);
  const [experiences, setExperiences] = useState<Experience[]>(initial.experiences);
  const [education, setEducation] = useState<Education[]>(initial.education);
  const [skills, setSkills] = useState<SkillGroup[]>(initial.skillGroups);
  const [projects, setProjects] = useState<Project[]>(initial.projects);
  const [site, setSite] = useState<SiteSettings>(() => {
    const visual = resolveVisual(initial.site);
    return {
      sectionLabels: initial.site.sectionLabels ?? {},
      themePreset: visual.themePreset,
      accentColor: visual.accentColor,
      backgroundColor: visual.backgroundColor,
      heroBackdrop: visual.heroBackdrop,
    };
  });

  async function withStatus(fn: () => Promise<void>) {
    setStatus("Saving…");
    try {
      await fn();
      setStatus("Saved.");
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Error");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "experiences", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "site", label: "Site" },
    { id: "seed", label: "Seed" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Portfolio CMS</h1>
          <p className="text-xs text-zinc-500">{email}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a href="/" className="text-teal-400 hover:underline">
            View site
          </a>
          <button type="button" onClick={logout} className="text-zinc-400 hover:text-zinc-200">
            Log out
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row">
        <aside className="flex shrink-0 flex-row flex-wrap gap-2 lg:w-44 lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-2 text-left text-sm ${
                tab === t.id ? "bg-zinc-800 text-teal-300" : "text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          {status ? <p className="text-sm text-zinc-400">{status}</p> : null}

          {tab === "profile" && (
            <ProfileForm
              value={profile}
              onChange={setProfile}
              onSave={() => withStatus(() => putJson("/api/admin/profile", profile))}
            />
          )}

          {tab === "experiences" && (
            <ExperiencesForm
              value={experiences}
              onChange={setExperiences}
              onSave={() =>
                withStatus(() =>
                  putJson(
                    "/api/admin/experiences",
                    experiences.map((row, order) => ({ ...row, order })),
                  ),
                )
              }
            />
          )}

          {tab === "education" && (
            <EducationForm
              value={education}
              onChange={setEducation}
              onSave={() =>
                withStatus(() =>
                  putJson(
                    "/api/admin/education",
                    education.map((row, order) => ({ ...row, order })),
                  ),
                )
              }
            />
          )}

          {tab === "skills" && (
            <SkillsForm
              value={skills}
              onChange={setSkills}
              onSave={() =>
                withStatus(() =>
                  putJson(
                    "/api/admin/skills",
                    skills.map((row, order) => ({ ...row, order })),
                  ),
                )
              }
            />
          )}

          {tab === "projects" && (
            <ProjectsForm
              value={projects}
              onChange={setProjects}
              onSave={() =>
                withStatus(() =>
                  putJson(
                    "/api/admin/projects",
                    projects.map((row, order) => ({ ...row, order })),
                  ),
                )
              }
            />
          )}

          {tab === "site" && (
            <section className="space-y-6 rounded-xl border border-zinc-800 p-5">
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">Unified theme</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Pick a professional preset, or enter any hex (e.g.{" "}
                  <code className="text-zinc-400">#0b131e</code>) for background / accent.
                  One accent drives buttons, links, timeline, and metrics site-wide.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {THEME_PRESETS.map((preset) => {
                  const active = site.themePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setSite((s) => ({
                          ...s,
                          themePreset: preset.id,
                          accentColor: preset.accent,
                          backgroundColor: preset.background,
                        }))
                      }
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-teal-400/60 bg-zinc-900"
                          : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                      }`}
                    >
                      <div className="mb-3 flex h-10 overflow-hidden rounded-lg">
                        <span
                          className="w-2/3"
                          style={{ background: preset.background, flex: 2 }}
                        />
                        <span style={{ background: preset.accent, flex: 1 }} />
                        <span style={{ background: preset.accentWarm, flex: 1 }} />
                      </div>
                      <p className="text-sm font-medium text-zinc-100">{preset.name}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">{preset.blurb}</p>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    setSite((s) => ({
                      ...s,
                      themePreset: "custom",
                    }))
                  }
                  className={`rounded-xl border p-3 text-left transition ${
                    site.themePreset === "custom"
                      ? "border-teal-400/60 bg-zinc-900"
                      : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                  }`}
                >
                  <div className="mb-3 flex h-10 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-500">
                    Custom hex
                  </div>
                  <p className="text-sm font-medium text-zinc-100">Custom</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    Your exact #hex values
                  </p>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  Accent color
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      className="h-10 w-12 cursor-pointer rounded border border-zinc-700 bg-zinc-900"
                      value={normalizeHex(site.accentColor ?? "") ?? "#5b8def"}
                      onChange={(e) =>
                        setSite((s) => ({
                          ...s,
                          themePreset: "custom",
                          accentColor: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
                      value={site.accentColor}
                      placeholder="#5b8def"
                      onChange={(e) =>
                        setSite((s) => ({
                          ...s,
                          themePreset: "custom",
                          accentColor: e.target.value,
                        }))
                      }
                    />
                  </div>
                </label>
                <label className="block text-sm">
                  Background color
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      className="h-10 w-12 cursor-pointer rounded border border-zinc-700 bg-zinc-900"
                      value={normalizeHex(site.backgroundColor ?? "") ?? "#0b131e"}
                      onChange={(e) =>
                        setSite((s) => ({
                          ...s,
                          themePreset: "custom",
                          backgroundColor: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
                      value={site.backgroundColor}
                      placeholder="#0b131e"
                      onChange={(e) =>
                        setSite((s) => ({
                          ...s,
                          themePreset: "custom",
                          backgroundColor: e.target.value,
                        }))
                      }
                    />
                  </div>
                </label>
              </div>

              <div
                className="rounded-xl border p-4"
                style={
                  {
                    ...visualToCssVars(
                      resolveVisual({
                        themePreset: site.themePreset,
                        accentColor: site.accentColor,
                        backgroundColor: site.backgroundColor,
                        heroBackdrop: site.heroBackdrop,
                      }),
                    ),
                    background: "var(--background)",
                    color: "var(--foreground)",
                    borderColor: "var(--border)",
                  } as CSSProperties
                }
              >
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  Live preview
                </p>
                <p className="mt-2 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                  Hariharan · AI
                </p>
                <div className="mt-3 flex gap-2">
                  <span
                    className="rounded px-3 py-1.5 text-xs font-medium"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Accent CTA
                  </span>
                  <span
                    className="rounded border px-3 py-1.5 text-xs"
                    style={{ borderColor: "var(--border)", color: "var(--accent-warm)" }}
                  >
                    Metric
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300">Hero background</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Choose the animated backdrop behind your name on the homepage.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {HERO_BACKDROP_OPTIONS.map((option) => {
                    const active = (site.heroBackdrop ?? "aurora") === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setSite((s) => ({
                            ...s,
                            heroBackdrop: option.value as HeroBackdrop,
                          }))
                        }
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-teal-400/60 bg-zinc-900"
                            : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                        }`}
                      >
                        <HeroBackdropPreview mode={option.value} />
                        <p className="mt-3 text-sm font-medium text-zinc-100">
                          {option.label}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <h3 className="text-sm font-medium text-zinc-300">Section labels</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {(
                    [
                      ["experience", "Experience"],
                      ["skills", "Skills"],
                      ["projects", "Projects"],
                      ["education", "Education"],
                    ] as const
                  ).map(([key, fallback]) => (
                    <TextInput
                      key={key}
                      label={fallback}
                      value={site.sectionLabels[key] ?? ""}
                      placeholder={fallback}
                      onChange={(v) =>
                        setSite((s) => ({
                          ...s,
                          sectionLabels: { ...s.sectionLabels, [key]: v },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <SaveBar
                label="Save site settings"
                onSave={() =>
                  withStatus(async () => {
                    const accent = normalizeHex(site.accentColor ?? "");
                    const background = normalizeHex(site.backgroundColor ?? "");
                    if (!accent || !background) {
                      throw new Error(
                        "Accent and background must be valid hex (#RGB or #RRGGBB).",
                      );
                    }
                    await putJson("/api/admin/site", {
                      ...site,
                      accentColor: accent,
                      backgroundColor: background,
                    });
                    setSite((s) => ({
                      ...s,
                      accentColor: accent,
                      backgroundColor: background,
                    }));
                  })
                }
              />
            </section>
          )}

          {tab === "seed" && (
            <section className="space-y-3 rounded-xl border border-zinc-800 p-5">
              <p className="text-sm text-zinc-400">
                Writes the full resume (profile, experience, education, skills, projects)
                and site settings into Firestore. Use <strong>Force re-seed</strong> to
                replace existing documents with the complete seed content.
              </p>
              <button
                type="button"
                className="rounded-md bg-teal-400 px-4 py-2 text-sm font-medium text-zinc-950"
                onClick={() =>
                  withStatus(async () => {
                    const res = await fetch("/api/admin/seed", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ force: false }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Seed failed");
                    setStatus(data.message);
                    window.location.reload();
                  })
                }
              >
                Seed defaults
              </button>
              <button
                type="button"
                className="ml-2 rounded-md border border-red-500/40 px-4 py-2 text-sm text-red-300"
                onClick={() =>
                  withStatus(async () => {
                    const res = await fetch("/api/admin/seed", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ force: true }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Seed failed");
                    setStatus(data.message);
                    window.location.reload();
                  })
                }
              >
                Force re-seed
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function HeroBackdropPreview({ mode }: { mode: HeroBackdrop }) {
  if (mode === "mesh") {
    return (
      <div
        className="relative h-16 overflow-hidden rounded-lg"
        style={{
          background: `radial-gradient(ellipse at 70% 30%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%), var(--background)`,
        }}
      />
    );
  }

  if (mode === "orchestrator") {
    return (
      <div
        className="relative h-16 overflow-hidden rounded-lg"
        style={{ background: "var(--background)" }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(color-mix(in srgb, var(--accent) 20%, transparent) 1px, transparent 1px),
              linear-gradient(90deg, color-mix(in srgb, var(--accent) 20%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: "12px 12px",
          }}
        />
        <div className="absolute inset-y-2 right-3 flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          <span className="h-px w-4" style={{ background: "var(--accent-warm)" }} />
          <span
            className="h-3 w-3 rotate-45"
            style={{ background: "color-mix(in srgb, var(--accent) 70%, transparent)" }}
          />
          <span className="h-px w-3" style={{ background: "var(--accent)" }} />
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full border"
            style={{ borderColor: "var(--accent-warm)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-16 overflow-hidden rounded-lg" style={{ background: "var(--background)" }}>
      <div
        className="absolute -right-2 top-0 h-14 w-14 rounded-full opacity-70 blur-md"
        style={{ background: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-2 h-10 w-10 rounded-full opacity-50 blur-md"
        style={{ background: "color-mix(in srgb, var(--accent-warm) 45%, transparent)" }}
      />
    </div>
  );
}
