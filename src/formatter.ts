import type { Release } from "./types.js";
import { translateToJapanese } from "./translator.js";

const MAX_LENGTH = 4800;

export async function formatReleaseMessage(release: Release, deeplApiKey: string): Promise<string> {
  const date = new Date(release.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const header = `📦 Claude Code v${release.version} (${date})`;
  const url = `https://github.com/anthropics/claude-code/releases/tag/${release.tagName}`;
  let body = release.body
    .replace(/\r\n/g, "\n")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

  if (deeplApiKey) {
    body = await translateToJapanese(body, deeplApiKey);
  }

  const full = `${header}\n\n${body}\n\n${url}`;

  if (full.length <= MAX_LENGTH) {
    return full;
  }

  const truncated = body.slice(0, MAX_LENGTH - header.length - url.length - 30);
  return `${header}\n\n${truncated}...\n\n(続きはこちら)\n${url}`;
}
