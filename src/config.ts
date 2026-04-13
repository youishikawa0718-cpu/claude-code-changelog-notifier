import "dotenv/config";
import path from "node:path";
import type { Config } from "./types.js";

export function loadConfig(): Config {
  const lineChannelAccessToken = process.env["LINE_CHANNEL_ACCESS_TOKEN"];
  const deeplApiKey = process.env["DEEPL_API_KEY"];
  const dryRun = process.env["DRY_RUN"] === "true";

  if (!dryRun) {
    if (!lineChannelAccessToken) {
      throw new Error("環境変数 LINE_CHANNEL_ACCESS_TOKEN が未設定です。.envファイルを確認してください。");
    }
    if (!deeplApiKey) {
      throw new Error("環境変数 DEEPL_API_KEY が未設定です。.envファイルを確認してください。");
    }
  }

  return {
    lineChannelAccessToken: lineChannelAccessToken ?? "",
    deeplApiKey: deeplApiKey ?? "",
    stateFilePath: process.env["STATE_FILE_PATH"] ?? path.resolve(process.cwd(), "state/last-seen.json"),
    githubRepo: process.env["GITHUB_REPO"] ?? "anthropics/claude-code",
    dryRun,
  };
}
