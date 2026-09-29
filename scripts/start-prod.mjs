#!/usr/bin/env node
/**
 * Single-server production start: FastAPI (internal) + Next.js (public port).
 * Browser hits one origin; Next rewrites /api/* → http://127.0.0.1:8000
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
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

function waitForPort(port, timeoutMs = 120_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ port: Number(port), host: "127.0.0.1" });
      const fail = () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`API did not listen on 127.0.0.1:${port} within ${timeoutMs}ms`));
          return;
        }
        setTimeout(attempt, 500);
      };
      socket.once("connect", () => {
        socket.removeListener("error", fail);
        socket.end();
        resolve();
      });
      socket.once("error", fail);
    };
    attempt();
  });
}

const venvUvicorn = path.join(
  root,
  "apps/api/.venv",
  isWin ? "Scripts/uvicorn.exe" : "bin/uvicorn",
);

console.log(`Starting API on 127.0.0.1:${apiPort} (internal)`);

if (fs.existsSync(venvUvicorn)) {
  run(venvUvicorn, ["app.main:app", "--host", "127.0.0.1", "--port", apiPort], path.join(root, "apps/api"), "api");
} else {
  run(
    "uv",
    ["run", "--directory", "apps/api", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", apiPort],
    root,
    "api",
  );
}

await waitForPort(apiPort);
console.log(`API is ready. Starting web on 0.0.0.0:${webPort} (public)`);
run("pnpm", ["--filter", "@hari/web", "start"], root, "web");

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
