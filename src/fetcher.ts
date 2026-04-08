import type { Release } from "./types.js";

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  body: string | null;
}

export async function fetchRecentReleases(repo: string, count = 10): Promise<Release[]> {
  const url = `https://api.github.com/repos/${repo}/releases?per_page=${count}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "claude-code-changelog-notifier",
    },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(`GitHub APIレート制限に達しました (${res.status})`);
    }
    throw new Error(`GitHub APIエラー: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as GitHubRelease[];

  return data.map((r) => ({
    tagName: r.tag_name,
    version: r.tag_name.replace(/^v/, ""),
    publishedAt: r.published_at,
    body: r.body ?? "",
  }));
}
