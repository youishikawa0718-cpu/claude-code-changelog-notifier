# Claude Code Changelog Notifier

Claude Code の新しいリリースを自動検知し、日本語に翻訳して LINE に通知する自動化ツール。

## 作った背景

社内の経営層で Claude Code を活用した業務改善に取り組んでいる中、AI ツールのアップデートサイクルの速さが課題になっていた。Claude Code は頻繁にアップデートされ、新機能の追加や破壊的変更が日常的に起こる。リリースノートを毎日手動でチェックするのは現実的ではないし、チェックを怠ると重要な変更を見逃して業務に支障が出るリスクもある。

**「更新情報は追いかけるものではなく、届くものであるべきだ」** — そう考えて、受動的に情報を受け取れる仕組みを作ることにした。

## なぜこの技術スタックなのか

### LINE Messaging API — 通知先の選定

Slack や Discord ではなく LINE を選んだのは、社内の連絡手段が LINE だからという単純な理由。通知は普段使っているツールに届かなければ意味がない。新しいアプリを開く習慣をつけるコストより、既存の導線に乗せる方がはるかに確実だった。

LINE Messaging API の無料枠（月200通）は、Claude Code のリリース頻度を考えれば十分すぎる。Bot の友だち追加だけで通知先を増やせるため、社内展開のハードルも低い。

### DeepL API — 翻訳エンジンの選定

リリースノートは英語で書かれているが、経営層を含む社内メンバー全員が英語のリリースノートをストレスなく読めるわけではない。翻訳の選択肢として Google Translate API、Claude API、DeepL API を検討した。

- **Google Translate API**: 従量課金で無料枠の管理が煩雑
- **Claude API**: 高品質だがリリースノート翻訳にはオーバースペック。コストも高い
- **DeepL API Free**: 月50万文字の無料枠があり、技術文書の翻訳品質が高い

個人開発で運用コストを極力抑えたかったため、無料枠が明確で翻訳品質も十分な DeepL を採用した。

### GitHub Actions + macOS launchd — スケジューラの選定

定期実行の仕組みとして cron、GitHub Actions、macOS launchd を比較した。

- **cron**: macOS では非推奨になりつつあり、権限周りの制約も多い
- **GitHub Actions**: クラウド実行で Mac の電源状態に依存しない。Secrets 管理も標準機能で完結
- **macOS launchd**: OS ネイティブで信頼性が高く、ローカルで完結する

当初は launchd のみで運用していたが、Mac がスリープ/シャットダウン中に実行されない問題があったため、GitHub Actions を主系として追加した。launchd は副系として残しており、両方が動いても状態管理により重複通知は発生しない。

### TypeScript — 言語の選定

型安全性を重視して TypeScript を選択した。API レスポンスの型定義を明示することで、GitHub API や LINE API のレスポンス構造が変わった際にコンパイル時点で気づける。`tsx` を使うことでビルドステップなしに直接実行でき、開発体験も損なわない。

## 開発で苦労した点

### LINE Messaging API の文字数制限

LINE のテキストメッセージには5,000文字の上限がある。Claude Code のリリースノートは大型アップデート時にかなり長くなるため、単純に全文を送ると制限に引っかかる。4,800文字で切り詰めて「続きはこちら」のリンクを付与する方式にしたが、どこで切るかの調整に試行錯誤した。ヘッダーと URL の長さを差し引いた上で本文を切り詰めるロジックに落ち着いた。

### 初回実行時の通知洪水

初めてツールを動かしたとき、過去のリリースすべてが「新着」として検出され、大量の通知が一気に飛ぶ問題に直面した。初回実行時は最新バージョンを「既読」として記録するだけにして、2回目以降から差分通知を開始するガード処理を入れて解決した。

### 状態管理のクラッシュ耐性

通知処理の途中でプロセスが中断された場合、どこまで通知済みかの状態が壊れるリスクがあった。対策として2つの工夫を入れている。

1. **アトミック書き込み**: 一時ファイルに書き出してから `rename` で差し替えることで、書き込み途中のファイル破損を防止
2. **1件ずつ状態更新**: 複数の新リリースがある場合、全件処理後にまとめて保存するのではなく、1件通知するごとに状態を保存。途中で落ちても、次回実行時に未通知分から再開できる

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
- **GitHub Actions** — 12時間間隔の定期実行（主系）
- **macOS launchd** — 12時間間隔の定期実行（副系）

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

### 5. 定期実行の設定

#### GitHub Actions（推奨）

リポジトリを GitHub に push するだけで、12時間ごと（JST 9時/21時）に自動実行される。

GitHub リポジトリの Settings > Secrets and variables > Actions に以下を登録:

| Secret 名 | 値 |
|------|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE チャネルアクセストークン |
| `LINE_USER_ID` | 通知先の LINE ユーザーID |
| `DEEPL_API_KEY` | DeepL API 認証キー |

手動実行で動作確認:
```bash
gh workflow run check-releases.yml
```

#### macOS launchd（オプション）

Mac が起動中のみ動作するローカル実行。GitHub Actions と併用可能。

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

GitHub Actions:
```bash
gh run list --workflow=check-releases.yml
gh run view <run-id> --log
```

launchd:
```bash
tail -f logs/stdout.log
tail -f logs/stderr.log
```
