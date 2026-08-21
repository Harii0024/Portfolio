"use client";

import type { Profile } from "@/lib/portfolio/types";
import { TextArea, TextInput, SaveBar } from "./fields";

type Props = {
  value: Profile;
  onChange: (p: Profile) => void;
  onSave: () => void;
};

export function ProfileForm({ value, onChange, onSave }: Props) {
  const set = <K extends keyof Profile>(key: K, v: Profile[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <section className="space-y-4 rounded-xl border border-zinc-800 p-5">
      <h2 className="text-sm font-semibold text-zinc-200">Profile</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Full name" value={value.name} onChange={(v) => set("name", v)} />
        <TextInput
          label="Title / headline"
          hint="Shown under your name"
          value={value.title}
          onChange={(v) => set("title", v)}
        />
        <TextInput
          label="Location"
          value={value.location}
          onChange={(v) => set("location", v)}
        />
        <TextInput
          label="Phone"
          value={value.phone ?? ""}
          onChange={(v) => set("phone", v)}
          placeholder="+91 …"
        />
        <TextInput
          label="Email"
          type="email"
          value={value.email}
          onChange={(v) => set("email", v)}
        />
        <TextInput
          label="LinkedIn URL"
          value={value.linkedin}
          onChange={(v) => set("linkedin", v)}
        />
        <TextInput
          label="GitHub URL"
          value={value.github}
          onChange={(v) => set("github", v)}
        />
      </div>
      <TextArea
        label="Hero tagline"
        hint="Short line under the hero title"
        rows={3}
        value={value.heroTagline}
        onChange={(v) => set("heroTagline", v)}
      />
      <TextArea
        label="Professional summary"
        hint="Full summary — keep every paragraph"
        rows={10}
        value={value.summary}
        onChange={(v) => set("summary", v)}
      />
      <SaveBar onSave={onSave} label="Save profile" />
    </section>
  );
}
