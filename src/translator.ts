const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

export async function translateToJapanese(text: string, apiKey: string): Promise<string> {
  const res = await fetch(DEEPL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `DeepL-Auth-Key ${apiKey}`,
    },
    body: JSON.stringify({
      text: [text],
      target_lang: "JA",
      source_lang: "EN",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepL APIエラー: ${res.status} ${body}`);
  }

  const data = (await res.json()) as { translations: { text: string }[] };
  return data.translations[0]!.text;
}
