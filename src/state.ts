import fs from "node:fs";
import path from "node:path";
import type { AppState } from "./types.js";

export function loadState(filePath: string): AppState | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveState(filePath: string, state: AppState): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2) + "\n");
  fs.renameSync(tmpPath, filePath);
}
