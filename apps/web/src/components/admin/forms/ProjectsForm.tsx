"use client";

import type { Project } from "@/lib/portfolio/types";
import { ChipListEditor, StringListEditor, TextArea, TextInput, SaveBar } from "./fields";

type Props = {
  value: Project[];
  onChange: (v: Project[]) => void;
  onSave: () => void;
};

function emptyProject(order: number): Project {
  return {
    id: `proj-${Date.now()}`,
    name: "",
    company: "",
    summary: "",
    bullets: [],
    stack: [],
    metrics: [],
    order,
  };
}

export function ProjectsForm({ value, onChange, onSave }: Props) {
  const update = (index: number, patch: Partial<Project>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Projects</h2>
          <p className="text-xs text-zinc-500">
            Featured systems — full bullets and metrics, not shortened.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-teal-300"
          onClick={() => onChange([...value, emptyProject(value.length)])}
        >
          Add project
        </button>
      </div>

      {value.map((project, index) => (
        <div key={project.id} className="space-y-4 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Project {index + 1}
            </p>
            <button
              type="button"
              className="text-xs text-red-300"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Project name"
              value={project.name}
              onChange={(v) => update(index, { name: v })}
            />
            <TextInput
              label="Company"
              value={project.company}
              onChange={(v) => update(index, { company: v })}
            />
          </div>
          <TextArea
            label="Summary"
            rows={4}
            value={project.summary}
            onChange={(v) => update(index, { summary: v })}
          />
          <StringListEditor
            label="Bullets"
            hint="One achievement per row — keep full wording"
            items={project.bullets}
            onChange={(bullets) => update(index, { bullets })}
            addLabel="Add bullet"
          />
          <ChipListEditor
            label="Stack"
            items={project.stack}
            onChange={(stack) => update(index, { stack })}
          />
          <ChipListEditor
            label="Metrics"
            items={project.metrics}
            onChange={(metrics) => update(index, { metrics })}
            placeholder="e.g. 25% accuracy lift"
          />
        </div>
      ))}

      <SaveBar onSave={onSave} label="Save projects" />
    </section>
  );
}
