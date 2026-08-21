#!/usr/bin/env node
/**
 * Single-server production start: FastAPI (internal) + Next.js (public port).
 * Browser hits one origin; Next rewrites /api/* → http://127.0.0.1:8000
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";
const apiPort = process.env.API_PORT || "8000";
const webPort = process.env.PORT || process.env.WEB_PORT || "3000";

const env = {
  ...process.env,
  BACKEND_URL: `http://127.0.0.1:${apiPort}`,
  INTERNAL_API_URL: `http://127.0.0.1:${apiPort}`,
  PORT: webPort,
};

function run(cmd, args, cwd, name) {
  const child = spawn(cmd, args, {
    cwd,
    env,
    stdio: "inherit",
    shell: isWin,
  });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exit(code ?? 1);
    }
  });
  return child;
}

console.log(`Starting API on 127.0.0.1:${apiPort} (internal)`);
console.log(`Starting web on 0.0.0.0:${webPort} (public)`);

run(
  "uv",
  ["run", "--directory", "apps/api", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", apiPort],
  root,
  "api",
);

setTimeout(() => {
  run("pnpm", ["--filter", "@hari/web", "start"], root, "web");
}, 1500);

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
