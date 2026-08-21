from __future__ import annotations

from app.domain.experience import compute_experience_summary
from app.seed.content import (
    SEED_EDUCATION,
    SEED_EXPERIENCES,
    SEED_PROFILE,
    SEED_PROJECTS,
    SEED_SITE_SETTINGS,
    SEED_SKILL_GROUPS,
)


def build_seed_payload() -> dict:
    experiences = [{**exp, "id": f"seed-exp-{i}"} for i, exp in enumerate(SEED_EXPERIENCES)]
    education = [{**edu, "id": f"seed-edu-{i}"} for i, edu in enumerate(SEED_EDUCATION)]
    skill_groups = [
        {**group, "id": f"seed-skill-{i}"} for i, group in enumerate(SEED_SKILL_GROUPS)
    ]
    projects = [{**proj, "id": f"seed-proj-{i}"} for i, proj in enumerate(SEED_PROJECTS)]

    return {
        "profile": SEED_PROFILE,
        "experiences": experiences,
        "education": education,
        "skillGroups": skill_groups,
        "projects": projects,
        "site": SEED_SITE_SETTINGS,
        "experienceSummary": compute_experience_summary(experiences),
        "source": "seed",
    }
