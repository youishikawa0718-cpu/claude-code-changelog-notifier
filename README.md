# Claude Code Changelog Notifier

Claude Code の新しいリリースを自動検知し、日本語に翻訳して LINE に通知するツール。

## 仕組み

1. GitHub Releases API (`anthropics/claude-code`) から最新リリースを取得
2. 前回通知済みバージョンと比較し、新しいリリースを検出
3. DeepL API でリリースノートを日本語に翻訳
4. LINE Messaging API で通知を送信

## 技術スタック

- **TypeScript** / Node.js
- **GitHub Releases API** — リリース情報取得（認証不要）
- **DeepL API Free** — 日本語翻訳（月50万文字無料）
- **LINE Messaging API** — 通知送信（月200通無料）
- **macOS launchd** — 12時間間隔の定期実行

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集して以下を設定:

| 変数 | 説明 | 取得先 |
|------|------|--------|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE チャネルアクセストークン | [LINE Developers Console](https://developers.line.biz/console/) |
| `LINE_USER_ID` | 通知先の LINE ユーザーID | LINE Developers Console > Basic settings |
| `DEEPL_API_KEY` | DeepL API 認証キー | [DeepL API](https://www.deepl.com/ja/your-account/keys) |

### 3. LINE Messaging API の準備

1. [LINE Developers Console](https://developers.line.biz/console/) にログイン
2. Provider を作成 → Messaging API チャネルを作成
3. Messaging API タブで Channel access token を発行
4. Basic settings タブで Your user ID を確認
5. 作成された Bot を LINE で友だち追加（QRコードから）

### 4. 動作確認

```bash
# ドライランで確認（LINE送信なし）
npm run dry-run

# 本番実行
npm start
```

### 5. 定期実行の設定（macOS launchd）

```bash
cp com.yukiishikawa.claude-code-changelog.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.yukiishikawa.claude-code-changelog.plist
```

確認:
```bash
launchctl list | grep changelog
```

停止:
```bash
launchctl unload ~/Library/LaunchAgents/com.yukiishikawa.claude-code-changelog.plist
```

## オプション環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `DRY_RUN` | `false` | `true` でLINE送信をスキップしコンソール出力 |
| `STATE_FILE_PATH` | `./state/last-seen.json` | 状態ファイルのパス |
| `GITHUB_REPO` | `anthropics/claude-code` | 監視対象リポジトリ |

## ログ

launchd 経由の実行ログ:
```bash
tail -f logs/stdout.log
tail -f logs/stderr.log
```
