"use client";

import type { Experience, ExperienceProject } from "@/lib/portfolio/types";
import {
  ChipListEditor,
  StringListEditor,
  TextArea,
  TextInput,
  SaveBar,
} from "./fields";

type Props = {
  value: Experience[];
  onChange: (v: Experience[]) => void;
  onSave: () => void;
};

function emptyProject(): ExperienceProject {
  return { name: "", summary: "", bullets: [], stack: [] };
}

function emptyExperience(order: number): Experience {
  return {
    id: `exp-${Date.now()}`,
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: null,
    bullets: [],
    projects: [],
    order,
  };
}

export function ExperiencesForm({ value, onChange, onSave }: Props) {
  const update = (index: number, patch: Partial<Experience>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateNestedProject = (
    expIndex: number,
    projIndex: number,
    patch: Partial<ExperienceProject>,
  ) => {
    const exp = value[expIndex];
    const projects = exp.projects.map((p, i) =>
      i === projIndex ? { ...p, ...patch } : p,
    );
    update(expIndex, { projects });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Experience</h2>
          <p className="text-xs text-zinc-500">
            Roles, bullets, and nested projects — full text, editable fields.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-teal-300"
          onClick={() => onChange([...value, emptyExperience(value.length)])}
        >
          Add role
        </button>
      </div>

      {value.map((exp, index) => (
        <div key={exp.id} className="space-y-4 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Role {index + 1}
            </p>
            <button
              type="button"
              className="text-xs text-red-300"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              Remove role
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Role / title"
              value={exp.role}
              onChange={(v) => update(index, { role: v })}
            />
            <TextInput
              label="Company"
              value={exp.company}
              onChange={(v) => update(index, { company: v })}
            />
            <TextInput
              label="Location"
              value={exp.location}
              onChange={(v) => update(index, { location: v })}
            />
            <TextInput
              label="Start date"
              hint="YYYY-MM"
              value={exp.startDate}
              onChange={(v) => update(index, { startDate: v })}
              placeholder="2026-03"
            />
            <TextInput
              label="End date"
              hint="YYYY-MM — leave empty if Present"
              value={exp.endDate ?? ""}
              onChange={(v) => update(index, { endDate: v.trim() ? v : null })}
              placeholder="Present → leave blank"
            />
          </div>

          <StringListEditor
            label="Role bullets"
            hint="One achievement per row — keep full wording from your resume"
            items={exp.bullets}
            onChange={(bullets) => update(index, { bullets })}
            addLabel="Add bullet"
          />

          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-300">Nested projects</p>
              <button
                type="button"
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-teal-300"
                onClick={() =>
                  update(index, { projects: [...exp.projects, emptyProject()] })
                }
              >
                Add project under role
              </button>
            </div>

            {exp.projects.map((proj, pi) => (
              <div
                key={`${exp.id}-p-${pi}`}
                className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="flex justify-between">
                  <p className="text-xs text-zinc-500">Project {pi + 1}</p>
                  <button
                    type="button"
                    className="text-xs text-red-300"
                    onClick={() =>
                      update(index, {
                        projects: exp.projects.filter((_, i) => i !== pi),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
                <TextInput
                  label="Project name"
                  value={proj.name}
                  onChange={(v) => updateNestedProject(index, pi, { name: v })}
                />
                <TextArea
                  label="Project summary"
                  rows={3}
                  value={proj.summary}
                  onChange={(v) => updateNestedProject(index, pi, { summary: v })}
                />
                <StringListEditor
                  label="Project bullets"
                  items={proj.bullets}
                  onChange={(bullets) =>
                    updateNestedProject(index, pi, { bullets })
                  }
                  addLabel="Add bullet"
                />
                <ChipListEditor
                  label="Stack"
                  items={proj.stack}
                  onChange={(stack) => updateNestedProject(index, pi, { stack })}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <SaveBar onSave={onSave} label="Save experience" />
    </section>
  );
}
