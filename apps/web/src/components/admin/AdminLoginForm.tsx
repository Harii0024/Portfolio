"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readApiJson } from "@/lib/api/client";
import { FaceCapture } from "./FaceCapture";

type Tab = "face" | "magic";

type FaceStatus = {
  faceEnrolled: boolean;
  setupRequired: boolean;
  setupKeyConfigured: boolean;
  threshold: number;
};

export function AdminLoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("face");
  const [status, setStatus] = useState<FaceStatus | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupKey, setSetupKey] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [setupReady, setSetupReady] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/face/status", { credentials: "include" })
      .then(async (r) => {
        const data = await readApiJson<FaceStatus & { error?: string; detail?: string }>(r);
        if (!r.ok) {
          throw new Error(data.error || data.detail || `Status failed (${r.status})`);
        }
        return data;
      })
      .then((data) => {
        setStatus(data);
        if (data.setupRequired) setShowSetupModal(true);
      })
      .catch((e) => {
        setStatus(null);
        setError(e instanceof Error ? e.message : "Could not reach auth API");
      });
  }, []);

  async function onFaceDescriptor(descriptor: number[]) {
    setError("");
    setInfo("");

    if (status?.setupRequired) {
      if (!setupReady || !setupKey.trim() || !setupEmail.trim()) {
        throw new Error("Complete the setup popup (key + email) first.");
      }
      const res = await fetch("/api/auth/face/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupKey: setupKey.trim(),
          email: setupEmail.trim(),
          descriptor,
        }),
      });
      const data = await readApiJson<{ error?: string; detail?: string }>(res);
      if (!res.ok) throw new Error(data.error || data.detail || "Enrollment failed");
      setInfo("Admin saved in DB with face. Opening dashboard…");
      setShowSetupModal(false);
      setStatus((s) =>
        s ? { ...s, faceEnrolled: true, setupRequired: false } : s,
      );
      router.push("/admin/dashboard");
      router.refresh();
      return;
    }

    const res = await fetch("/api/auth/face/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descriptor }),
    });
    const data = await readApiJson<{ error?: string; detail?: string }>(res);
    if (!res.ok) throw new Error(data.error || data.detail || "Face not recognized");
    router.push("/admin/dashboard");
    router.refresh();
  }

  function confirmSetup(e: FormEvent) {
    e.preventDefault();
    if (!setupKey.trim()) {
      setError("Enter ADMIN_SETUP_KEY from backend .env");
      return;
    }
    if (!setupEmail.trim() || !setupEmail.includes("@")) {
      setError("Enter the admin email to store in the database (for magic link later).");
      return;
    }
    setError("");
    setSetupReady(true);
    setInfo("Setup details ready — capture your face to create the admin in DB.");
  }

  async function onMagicSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/magic-link/request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicEmail.trim() }),
      });
      const data = await readApiJson<{
        error?: string;
        detail?: string;
        devLink?: string;
        email?: string;
      }>(res);
      if (!res.ok) {
        setError(data.error || data.detail || "Could not send magic link");
        return;
      }
      if (data.devLink) {
        setInfo(`SMTP not configured — open in this browser: ${data.devLink}`);
      } else {
        setInfo(`Magic link sent to ${data.email}`);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const needsSetup = Boolean(status?.setupRequired);

  return (
    <div className="relative mx-auto mt-16 w-full max-w-lg space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-100">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-sm text-zinc-400">
        Face or magic link. No password. No <code>ADMIN_EMAIL</code> in env — email lives in the DB.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("face")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            tab === "face" ? "bg-teal-400 text-zinc-950" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          Face
        </button>
        <button
          type="button"
          onClick={() => setTab("magic")}
          disabled={needsSetup}
          className={`rounded-md px-3 py-1.5 text-sm disabled:opacity-40 ${
            tab === "magic" ? "bg-teal-400 text-zinc-950" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          Magic link
        </button>
      </div>

      {error ? (
        <p className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300">{error}</p>
      ) : null}
      {info ? (
        <p className="break-all rounded-md bg-teal-950/40 px-3 py-2 text-sm text-teal-200">
          {info}
        </p>
      ) : null}

      {tab === "face" ? (
        <FaceCapture
          mode={needsSetup ? "enroll" : "login"}
          onDescriptor={onFaceDescriptor}
        />
      ) : (
        <form onSubmit={onMagicSubmit} className="space-y-3">
          <label className="block text-sm">
            Email (must exist on admin in DB)
            <input
              type="email"
              required
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading || needsSetup}
            className="w-full rounded-md bg-teal-400 px-4 py-2 font-medium text-zinc-950 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Email magic link"}
          </button>
        </form>
      )}

      {showSetupModal && needsSetup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-950 p-6 shadow-xl">
            <h2 className="text-lg font-semibold">First-time admin setup</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Enter <code className="text-zinc-200">ADMIN_SETUP_KEY</code> from{" "}
              <code className="text-zinc-200">.env</code>, plus the email to store on the
              admin record (used later for magic-link DB checks). Then capture your face.
            </p>
            <form onSubmit={confirmSetup} className="mt-4 space-y-3">
              <label className="block text-sm">
                Setup key
                <input
                  type="password"
                  autoFocus
                  value={setupKey}
                  onChange={(e) => {
                    setSetupKey(e.target.value);
                    setSetupReady(false);
                  }}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                Admin email (saved in DB)
                <input
                  type="email"
                  value={setupEmail}
                  onChange={(e) => {
                    setSetupEmail(e.target.value);
                    setSetupReady(false);
                  }}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
                  placeholder="you@domain.com"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-md bg-teal-400 px-4 py-2 text-sm font-medium text-zinc-950"
              >
                {setupReady ? "Ready — capture face below" : "Continue"}
              </button>
            </form>
            {setupReady ? (
              <button
                type="button"
                className="mt-3 text-xs text-zinc-500 underline"
                onClick={() => setShowSetupModal(false)}
              >
                Hide popup and use camera
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
