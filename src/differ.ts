import type { Release } from "./types.js";

function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  const len = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < len; i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function findNewReleases(releases: Release[], lastSeenVersion: string): Release[] {
  return releases
    .filter((r) => compareVersions(r.version, lastSeenVersion) > 0)
    .sort((a, b) => compareVersions(a.version, b.version));
}
