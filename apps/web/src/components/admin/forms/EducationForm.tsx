"use client";

import type { Education } from "@/lib/portfolio/types";
import { ChipListEditor, TextInput, SaveBar } from "./fields";

type Props = {
  value: Education[];
  onChange: (v: Education[]) => void;
  onSave: () => void;
};

function emptyEdu(order: number): Education {
  return {
    id: `edu-${Date.now()}`,
    school: "",
    degree: "",
    startYear: "",
    endYear: "",
    highlights: [],
    order,
  };
}

export function EducationForm({ value, onChange, onSave }: Props) {
  const update = (index: number, patch: Partial<Education>) => {
    const next = value.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">Education</h2>
        <button
          type="button"
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-teal-300"
          onClick={() => onChange([...value, emptyEdu(value.length)])}
        >
          Add education
        </button>
      </div>

      {value.map((edu, index) => (
        <div key={edu.id} className="space-y-4 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Entry {index + 1}
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
              label="Degree"
              value={edu.degree}
              onChange={(v) => update(index, { degree: v })}
            />
            <TextInput
              label="School"
              value={edu.school}
              onChange={(v) => update(index, { school: v })}
            />
            <TextInput
              label="Start year"
              value={edu.startYear}
              onChange={(v) => update(index, { startYear: v })}
            />
            <TextInput
              label="End year"
              value={edu.endYear}
              onChange={(v) => update(index, { endYear: v })}
            />
          </div>
          <ChipListEditor
            label="Highlights / coursework"
            items={edu.highlights}
            onChange={(highlights) => update(index, { highlights })}
          />
        </div>
      ))}

      <SaveBar onSave={onSave} label="Save education" />
    </section>
  );
}
