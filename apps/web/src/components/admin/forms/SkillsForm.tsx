"use client";

import type { SkillGroup } from "@/lib/portfolio/types";
import { ChipListEditor, TextInput, SaveBar } from "./fields";

type Props = {
  value: SkillGroup[];
  onChange: (v: SkillGroup[]) => void;
  onSave: () => void;
};

function emptyGroup(order: number): SkillGroup {
  return {
    id: `skill-${Date.now()}`,
    category: "",
    items: [],
    order,
  };
}

export function SkillsForm({ value, onChange, onSave }: Props) {
  const update = (index: number, patch: Partial<SkillGroup>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">Skills</h2>
        <button
          type="button"
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-teal-300"
          onClick={() => onChange([...value, emptyGroup(value.length)])}
        >
          Add skill group
        </button>
      </div>

      {value.map((group, index) => (
        <div key={group.id} className="space-y-4 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between gap-3">
            <TextInput
              label="Category"
              value={group.category}
              onChange={(v) => update(index, { category: v })}
            />
            <button
              type="button"
              className="mt-6 text-xs text-red-300"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              Remove group
            </button>
          </div>
          <ChipListEditor
            label="Skills in this group"
            items={group.items}
            onChange={(items) => update(index, { items })}
          />
        </div>
      ))}

      <SaveBar onSave={onSave} label="Save skills" />
    </section>
  );
}
