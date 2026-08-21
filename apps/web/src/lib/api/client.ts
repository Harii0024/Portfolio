/**
 * Browser / RSC → Python FastAPI.
 * Prefer same-origin `/api/*` (Next rewrites to BACKEND_URL) so cookies work.
 */
import { getBrowserApiBase, getServerApiBase } from "@hari/web-config";

export { getBrowserApiBase, getServerApiBase };

/** Parse JSON API bodies; surface plain-text 500s instead of JSON.parse crashes. */
export async function readApiJson<T = Record<string, unknown>>(
  res: Response,
): Promise<T> {
  const text = await res.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const snippet = text.slice(0, 120).replace(/\s+/g, " ");
    throw new Error(
      res.ok
        ? `Invalid JSON from API: ${snippet}`
        : snippet || `Request failed (${res.status})`,
    );
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { server?: boolean },
): Promise<T> {
  const base = init?.server ? getServerApiBase() : getBrowserApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  const data = await readApiJson<Record<string, unknown> & { detail?: unknown; error?: unknown }>(
    res,
  );
  if (!res.ok) {
    const message =
      (data && (data.detail || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }
  return data as T;
}
