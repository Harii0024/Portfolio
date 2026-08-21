"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function MagicLinkVerifyClient() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") || "";
  const [message, setMessage] = useState("Verifying magic link…");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing token in URL.");
      setMessage("");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/magic-link/verify", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || data.detail || "Verification failed");
          setMessage("");
          return;
        }
        setMessage("Signed in. Redirecting…");
        router.replace("/admin/dashboard");
        router.refresh();
      } catch {
        if (!cancelled) {
          setError("Network error");
          setMessage("");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-100">
      <h1 className="text-xl font-semibold">Magic link</h1>
      {message ? <p className="mt-3 text-sm text-zinc-300">{message}</p> : null}
      {error ? (
        <p className="mt-3 rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <a href="/admin" className="mt-6 inline-block text-sm text-teal-400 hover:underline">
        Back to login
      </a>
    </div>
  );
}
