# 集客の自動化：運用ガイド

## 全体の流れ
1. **コラム自動作成**（毎週 火・金 朝）… 定期実行の Claude が `ops/column-routine.md` に沿って記事と SNS 投稿案を作り、`auto-content` ブランチに push します。
2. **公開** … `auto-content` を `main` に取り込むと Netlify が自動で公開します（最初の数週間は内容を確認してから取り込む運用。安定したら自動公開に切り替え可能）。
3. **診断ツール**（`shindan.html`）… 24時間自動で稼働。結果をその場で表示し、追加の質問と連絡先を入れた方には、AI が**詳細診断レポート**（5章構成・A4で5〜8ページ相当）を作成します。
   - レポートは `report.html?id=…` で表示され、PDF保存・印刷ができます（検索エンジンには載りません）。見本：`report.html?id=sample`
   - 処理の流れ：`/api/report/start`（受付・保存）→ `/api/report/section` ×5章（同時に作成）→ `/api/report/finish`（メール送付）→ `/api/report`（表示用データ）
   - 回答とレポートは Netlify Blobs（ストア名 `reports`）に保存されます。同じメールアドレスからは10分以内に1件までです
   - 見込み度Aの方には「担当者が確認して補足を添えて連絡する」と案内し、担当者宛てメールの件名に【要対応】が付きます
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
| `MAIL_TIMEOUT_MS` | Resend の応答待ち時間（ミリ秒、既定 8000） | 任意 |

- 未設定でも診断ツールは動き、定型レポートが画面に表示されます（メールは送られません）。
- 自動メールは稼働中（2026年10月13日に Resend で akari-hd.co.jp のドメイン確認が「Verified」になり、診断ページの案内文にも「メールでもお送りします」を戻した）。送信に失敗する場合は Resend の Domains で状態を確認する。
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

## お問い合わせフォーム（contact.html）
- 種類（事業承継・MBO/LBO・セカンドオピニオン・診断・グループ/その他事業・協業・採用・取材・その他）を必須で選択。各事業ページのボタンから `contact.html?type=second` のように来ると、種類が選ばれた状態になる
- 送信内容は Netlify Forms（フォーム名 `contact`）に記録され、あわせて `/api/contact`（netlify/functions/contact.mjs）が Resend で次の2通を送る
  - 担当者（`STAFF_EMAIL`）宛て：件名【お問い合わせ：種類】会社名 お名前様。返信するとお客様に届く
  - お客様宛て：受付確認メール（同じメールアドレスへは5分に1回まで。入力された本文は載せない）
- プライバシーポリシーは privacy.html（全ページのフッターにリンク）
- 送信ボタンを押すと、Netlify Forms への記録と `/api/contact` のメール送信を同時に行う。片方が失敗してももう片方が成功していれば「受け付けました」と表示し、メールが送れなかったときはその旨を画面に出す（両方失敗したときだけ「送信に失敗しました」）

## メールが Gmail などに届かないときの確認手順
上から順に見ると、どこで止まっているかが分かります。
1. **設定が揃っているか** … ブラウザで `https://akari-hd.co.jp/api/contact` を開く。`"configured": true` でなければ Netlify の Environment variables（`RESEND_API_KEY`・`MAIL_FROM`・`STAFF_EMAIL`）を確認する。変数を変えたら **再デプロイ**（Deploys → Trigger deploy）しないと関数に反映されない
2. **フォームの記録が残っているか** … Netlify → Forms → `contact`。届いていれば「Verified submissions」に、迷惑判定されると「Spam submissions」に入る（迷惑判定されると Netlify からの通知メールも来ない）。フォーム `contact` の Form notifications（通知先メール）が設定されているかもここで確認する
3. **関数のログ** … Netlify → Logs → Functions → `contact`。`sendMail: sent { id: ... }` が出ていれば Resend は受け付けている。`resend 4xx: ...` が出ていればその内容が原因（例：401 はキーが無効、403 はドメイン未認証や送信元アドレス不一致、422 は宛先や送信元の形式、429 は送りすぎ）
4. **Resend 側** … Resend → Emails で送信ログ（Delivered / Bounced / Complained）を見る。Resend → Domains で `akari-hd.co.jp` が Verified のままか確認する。`MAIL_FROM` のアドレスのドメインは、Resend で認証したドメインと一致している必要がある
5. **受信側（Gmail）** … 「迷惑メール」「プロモーション」「すべてのメール」を検索する（`from:info@akari-hd.co.jp`）。Gmail のフィルタで振り分けられていないかも確認する。Google Workspace のアドレスの場合は、管理コンソールの「メールログ検索」で受信の有無が分かる
6. **ドメインの DNS** … Gmail は SPF・DKIM に加えて DMARC（`_dmarc.akari-hd.co.jp` の TXT に `v=DMARC1; p=none;`）があると受信トレイに入りやすい。Resend → Domains の DNS レコードがすべて Verified かを確認する

※ Resend の無料プランは 1日100通・月3,000通まで。超えると 429 で止まる
