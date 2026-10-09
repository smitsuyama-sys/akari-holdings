# 集客の自動化：運用ガイド

## 全体の流れ
1. **コラム自動作成**（毎週 火・金 朝）… 定期実行の Claude が `ops/column-routine.md` に沿って記事と SNS 投稿案を作り、`auto-content` ブランチに push します。
2. **公開** … `auto-content` を `main` に取り込むと Netlify が自動で公開します（最初の数週間は内容を確認してから取り込む運用。安定したら自動公開に切り替え可能）。
3. **診断ツール**（`shindan.html`）… 24時間自動で稼働。結果をその場で表示し、連絡先を入れた方には AI の個別レポートを表示・メール送信します。
4. **見込み度の判定と通知** … 回答から見込み度 A/B/C を自動で判定し、担当者にメールで通知します。A の方には面談予約のリンクを自動で案内します。
5. **週次レポート**（毎週 月曜 朝）… 1週間の記事数と診断リード数をまとめ、Gmail の下書きとして届けます。

## 初回だけ必要な設定（Netlify）
Site configuration → Environment variables に次を登録してください。

| 変数 | 内容 | 必須 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API のキー（AI 個別レポート用） | AIを使う場合 |
| `RESEND_API_KEY` | Resend（メール送信サービス）のキー | 自動メールを使う場合 |
| `MAIL_FROM` | 送信元。例 `光ホールディングス <info@example.co.jp>`（Resend でドメイン認証が必要） | 同上 |
| `STAFF_EMAIL` | 担当者の通知先メールアドレス | 同上 |
| `BOOKING_URL` | 面談予約ページ（Googleカレンダーの予約スケジュール等）のURL | 任意 |
| `REPLY_TO` | 利用者がメールに返信したときの宛先（未設定なら `STAFF_EMAIL`） | 任意 |
| `AI_TIMEOUT_MS` | AI の待ち時間（ミリ秒、既定 25000） | 任意 |

- 未設定でも診断ツールは動き、定型レポートが画面に表示されます（メールは送られません）。
- 自動メールを有効にしたら、`assets/shindan.js` の案内文（「この画面に表示します」「レポートを見る」）を「メールでもお送りします」に戻してください。
- Netlify の Forms → Form notifications で、フォーム `shindan` の通知先メールを設定すると、Resend なしでも担当者に回答が届きます。
- Netlify の関数は既定で10秒で打ち切られます。AI レポートが間に合わない場合は定型レポートが表示されます（リードは保存済み）。必要に応じて Netlify サポートに関数のタイムアウト延長（最大26秒）を依頼してください。

## SNS
`ops/sns/` に投稿案が溜まります。自動投稿するには、各SNSのビジネスアカウントと API 契約（X は有料プラン）が必要です。準備ができたら投稿の自動化を追加できます。

## 公開されないファイル
`ops/`・`netlify/`・`wallpaper/` は `netlify.toml` の設定でサイト上には公開されません。

## 検索エンジン（Google Search Console）
- `sitemap.xml` と `robots.txt` は公開（デプロイ）のたびに `scripts/build-sitemap.mjs` が自動生成します。
- Search Console で「URL プレフィックス」としてサイトを登録し、「サイトマップ」に `sitemap.xml` を送信します。
- 所有権の確認に「HTML タグ」を選んだ場合は、表示された `<meta name="google-site-verification" ...>` を全ページの `<head>` に追加します。

## 独自ドメイン
- Netlify の「ドメイン管理」で独自ドメインを追加すると、サイトマップ・共有用タグ（og:url / og:image / canonical）のURLは次回の公開から自動で新しいドメインに置き換わります。
- 切り替え後は Search Console に新しいドメインも登録してください。

## SNS
- プロフィール文と最初の投稿は `ops/sns/start-kit.md` にあります。
