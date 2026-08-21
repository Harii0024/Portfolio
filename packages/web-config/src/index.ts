/** Server-side API base URL (RSC, SSR, Next rewrites). */
export function getServerApiBase(): string {
  return (
    process.env.BACKEND_URL?.replace(/\/$/, "") ||
    process.env.INTERNAL_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000"
  );
}

/** Browser API base — empty means same-origin `/api/*` via Next rewrites. */
export function getBrowserApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "";
}

/** Public web port when running the unified server. */
export const DEFAULT_WEB_PORT = Number(process.env.PORT || process.env.WEB_PORT || 3000);

/** Internal API port (not exposed publicly in single-server mode). */
export const DEFAULT_API_PORT = Number(process.env.API_PORT || 8000);
