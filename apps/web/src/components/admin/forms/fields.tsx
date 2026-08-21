"use client";

import type { ReactNode } from "react";

const fieldClass =
  "mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-500/60";

export function FieldLabel({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm text-zinc-300 ${className ?? ""}`}>
      <span className="block font-medium leading-5">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs font-normal leading-4 text-zinc-500">
          {hint}
        </span>
      ) : null}
      {children}
    </label>
  );
}

export function TextInput({
  label,
  hint,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <FieldLabel label={label} hint={hint} className={className}>
      <input
        type={type}
        className={fieldClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldLabel>
  );
}

export function SelectInput({
  label,
  hint,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <FieldLabel label={label} hint={hint} className={className}>
      <select
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldLabel>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <FieldLabel label={label} hint={hint}>
      <textarea
        className={`${fieldClass} resize-y font-sans`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldLabel>
  );
}

/** One item per row — add / remove / edit list entries. */
export function StringListEditor({
  label,
  hint,
  items,
  onChange,
  placeholder = "New item",
  addLabel = "Add item",
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-zinc-300">{label}</p>
        {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              rows={2}
              className={`${fieldClass} flex-1`}
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[index] = e.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className="shrink-0 rounded-md border border-zinc-700 px-2 text-xs text-zinc-400 hover:border-red-500/40 hover:text-red-300"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-teal-300 hover:border-teal-500/40"
        onClick={() => onChange([...items, ""])}
      >
        {addLabel}
      </button>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-600">No items yet — click “{addLabel}”.</p>
      ) : null}
      <p className="text-[10px] text-zinc-600">
        Tip: paste many lines at once into the last empty row, or add one row per bullet.
      </p>
    </div>
  );
}

export function ChipListEditor({
  label,
  hint,
  items,
  onChange,
  placeholder = "e.g. Python",
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-zinc-300">{label}</p>
        {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              className={`${fieldClass} flex-1`}
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...items];
                next[index] = e.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className="shrink-0 rounded-md border border-zinc-700 px-2 text-xs text-zinc-400 hover:text-red-300"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-teal-300 hover:border-teal-500/40"
        onClick={() => onChange([...items, ""])}
      >
        Add tag
      </button>
    </div>
  );
}

export function SaveBar({ onSave, label = "Save" }: { onSave: () => void; label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-zinc-800 bg-zinc-950/95 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onSave}
        className="rounded-md bg-teal-400 px-4 py-2 text-sm font-medium text-zinc-950"
      >
        {label}
      </button>
    </div>
  );
}

export { fieldClass };
