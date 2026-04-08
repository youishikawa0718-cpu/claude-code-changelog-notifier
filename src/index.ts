import { loadConfig } from "./config.js";
import { fetchRecentReleases } from "./fetcher.js";
import { loadState, saveState } from "./state.js";
import { findNewReleases } from "./differ.js";
import { formatReleaseMessage } from "./formatter.js";
import { sendLineMessage } from "./notifier.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const state = loadState(config.stateFilePath);
  const releases = await fetchRecentReleases(config.githubRepo);

  if (releases.length === 0) {
    console.log("リリース情報が取得できませんでした");
    return;
  }

  // 初回実行: 最新バージョンを記録して終了（通知洪水防止）
  if (!state) {
    const latest = releases[0]!;
    saveState(config.stateFilePath, {
      lastSeenVersion: latest.version,
      lastSeenPublishedAt: latest.publishedAt,
      lastCheckedAt: new Date().toISOString(),
    });
    console.log(`初回実行: v${latest.version} を既読として記録しました`);
    return;
  }

  const newReleases = findNewReleases(releases, state.lastSeenVersion);

  if (newReleases.length === 0) {
    saveState(config.stateFilePath, {
      ...state,
      lastCheckedAt: new Date().toISOString(),
    });
    console.log(`更新なし (最新: v${state.lastSeenVersion})`);
    return;
  }

  console.log(`${newReleases.length}件の新リリースを検出`);

  for (const release of newReleases) {
    const message = await formatReleaseMessage(release, config.deeplApiKey);
    await sendLineMessage(config, message);

    // 1件ずつState更新（中断耐性）
    saveState(config.stateFilePath, {
      lastSeenVersion: release.version,
      lastSeenPublishedAt: release.publishedAt,
      lastCheckedAt: new Date().toISOString(),
    });

    console.log(`通知完了: v${release.version}`);
  }
}

main().catch((err) => {
  console.error("エラー:", err instanceof Error ? err.message : err);
  process.exit(1);
});
