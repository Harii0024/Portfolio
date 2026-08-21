from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class Profile(BaseModel):
    name: str
    title: str
    location: str
    summary: str
    hero_tagline: str = Field(alias="heroTagline")
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""

    model_config = {"populate_by_name": True}


class ExperienceProject(BaseModel):
    name: str
    summary: str
    bullets: list[str] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)


class Experience(BaseModel):
    id: str = ""
    company: str
    role: str
    location: str
    start_date: str = Field(alias="startDate")
    end_date: str | None = Field(default=None, alias="endDate")
    bullets: list[str] = Field(default_factory=list)
    projects: list[ExperienceProject] = Field(default_factory=list)
    order: int = 0

    model_config = {"populate_by_name": True}


class Education(BaseModel):
    id: str = ""
    school: str
    degree: str
    start_year: str = Field(alias="startYear")
    end_year: str = Field(alias="endYear")
    highlights: list[str] = Field(default_factory=list)
    order: int = 0

    model_config = {"populate_by_name": True}


class SkillGroup(BaseModel):
    id: str = ""
    category: str
    items: list[str] = Field(default_factory=list)
    order: int = 0

    model_config = {"populate_by_name": True}


class Project(BaseModel):
    id: str = ""
    name: str
    company: str
    summary: str
    bullets: list[str] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)
    metrics: list[str] = Field(default_factory=list)
    order: int = 0

    model_config = {"populate_by_name": True}


class SiteSettings(BaseModel):
    section_labels: dict[str, str] = Field(default_factory=dict, alias="sectionLabels")
    theme_preset: str = Field(default="midnight", alias="themePreset")
    accent_color: str = Field(default="#5b8def", alias="accentColor")
    background_color: str = Field(default="#0b131e", alias="backgroundColor")
    hero_backdrop: str = Field(default="aurora", alias="heroBackdrop")

    model_config = {"populate_by_name": True}


class ExperienceSummary(BaseModel):
    total_label: str = Field(alias="totalLabel")
    total_months: int = Field(alias="totalMonths")

    model_config = {"populate_by_name": True}


class PortfolioPayload(BaseModel):
    profile: Profile
    experiences: list[Experience]
    education: list[Education]
    skill_groups: list[SkillGroup] = Field(alias="skillGroups")
    projects: list[Project]
    site: SiteSettings
    experience_summary: ExperienceSummary = Field(alias="experienceSummary")
    source: Literal["firestore", "seed"]

    model_config = {"populate_by_name": True}


class FaceDescriptorRequest(BaseModel):
    descriptor: list[float]


class FaceEnrollRequest(BaseModel):
    setup_key: str = Field(alias="setupKey")
    email: str
    descriptor: list[float]

    model_config = {"populate_by_name": True}


class MagicLinkRequest(BaseModel):
    email: str


class MagicLinkVerifyRequest(BaseModel):
    token: str


class SeedRequest(BaseModel):
    force: bool = False

