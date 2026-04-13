import type { Config } from "./types.js";

export async function sendLineMessage(config: Config, text: string): Promise<void> {
  if (config.dryRun) {
    console.log("[DRY RUN] LINE送信内容:");
    console.log(text);
    console.log("---");
    return;
  }

  const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.lineChannelAccessToken}`,
    },
    body: JSON.stringify({
      messages: [{ type: "text", text }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) {
      console.warn("LINE API月間送信上限に達しました");
      return;
    }
    throw new Error(`LINE APIエラー: ${res.status} ${body}`);
  }
}
