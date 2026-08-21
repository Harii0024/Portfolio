export type Profile = {
  name: string;
  title: string;
  location: string;
  summary: string;
  heroTagline: string;
  email: string;
  phone?: string;
  linkedin: string;
  github: string;
};

export type ExperienceProject = {
  name: string;
  summary: string;
  bullets: string[];
  stack: string[];
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string; // YYYY-MM
  endDate: string | null;
  bullets: string[];
  projects: ExperienceProject[];
  order: number;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  startYear: string;
  endYear: string;
  highlights: string[];
  order: number;
};

export type SkillGroup = {
  id: string;
  category: string;
  items: string[];
  order: number;
};

export type Project = {
  id: string;
  name: string;
  company: string;
  summary: string;
  bullets: string[];
  stack: string[];
  metrics: string[];
  order: number;
};

export type SiteSettings = {
  sectionLabels: Record<string, string>;
  themePreset?: import("@/lib/theme/presets").ThemePresetId;
  accentColor?: string;
  backgroundColor?: string;
  heroBackdrop?: import("@/lib/theme/presets").HeroBackdrop;
};

export type ExperienceSummary = {
  totalLabel: string;
  totalMonths: number;
};

export type PortfolioPayload = {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  skillGroups: SkillGroup[];
  projects: Project[];
  site: SiteSettings;
  experienceSummary: ExperienceSummary;
  source: "firestore" | "seed";
};

export const DEFAULT_SECTION_ORDER = [
  "hero",
  "experience",
  "skills",
  "projects",
  "education",
] as const;

export type SectionId = (typeof DEFAULT_SECTION_ORDER)[number];
