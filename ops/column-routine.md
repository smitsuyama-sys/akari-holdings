# コラム自動作成ルーティンの手順書

このファイルは、定期実行される Claude のセッションが読んで、そのとおりに作業するための手順書です。
人が内容を変えれば、次回の実行から反映されます。

## 目的
光（あかり）ホールディングスのサイトに、事業承継・M&A・MBO・経営支援に関する解説コラムを1本追加し、
読者を無料の準備度診断（shindan.html）へ案内する。あわせて SNS 投稿文の下書きを作る。

## 手順
1. リポジトリ https://github.com/smitsuyama-sys/akari-holdings を用意する（未取得なら clone）。
2. ブランチ `auto-content` で作業する。
   - `git fetch origin main auto-content`（auto-content がなければ main だけ）
   - `git checkout -B auto-content origin/auto-content`（なければ `origin/main` から作成）
   - `git merge origin/main --no-edit` で最新の main を取り込む
3. `column.html` の一覧と既存の `column-*.html` を読み、取り上げたテーマを把握する。重複は避ける。
4. テーマを1つ決める。候補の例：
   - 後継者がいない会社の選択肢 / 自社株の評価の考え方の基本 / 個人保証の引き継ぎ
   - M&A の一般的な流れと期間 / 基本合意と最終契約の違い / デューデリジェンスで見られる点
   - MBO の資金調達の仕組み / 承継前に整えておきたい財務・組織 / 仲介とFAの違い
   - 中小企業庁や国の支援制度の紹介（事業承継・引継ぎ支援センター等）
   - 直近のニュースや制度改正（Web検索で確認できたもののみ）
5. Web検索で、公的機関（中小企業庁、国税庁、経済産業省、日本政策金融公庫など）の一次情報を中心に確認する。
6. 記事を書く。
   - ファイル名：`column-NN.html`（既存の最大番号 + 1、2桁ゼロ埋め）
   - `column-01.html` をひな形にし、`<title>`、`meta description`、共有用タグ（`og:title`・`og:description`・`og:url`・`canonical` のファイル名部分）、パンくず、日付、カテゴリ、本文、を差し替える
   - `og:image` はそのまま（`assets/og-image.png`）。サイトマップ（sitemap.xml）は公開時に自動生成されるので編集不要
   - 本文 1,800〜2,500字。`<h2>` で3〜5見出し。経営者が読んで分かる平易な日本語
   - 末尾の診断への誘導（`.column-cta`）と注意書き（`.column-note`）は残す
   - **図解を1〜2点入れる**（読者が流れや違いをひと目でつかめるように）。画像は使わず、既存のクラスで HTML として書く：
     - 手順・流れ → `<figure class="col-fig">` ＋ `<ol class="col-flow">`（各 `<li>` に `.cf-phase`・`.cf-no`・`<b>`見出し・説明 `<span>`）。例は `column-02.html`
     - 比較・違い → `<figure class="col-fig">` ＋ `<div class="col-table-wrap"><table class="col-table">`。例は `column-01.html`・`column-02.html`
     - 図の中の数値・事実も、本文と同じく出典で確認できたものだけにする
   - 数値・制度・法令に触れた場合は、本文末尾に `<p class="column-sources">参考：<a href="URL">出典名</a>…</p>` を入れる
7. `column.html` の `<!-- COLUMN-LIST:START ... -->` の直下に、新しい記事の `<li class="news-item">` を追加する（新しい順）。
8. SNS 投稿文を `ops/sns/YYYY-MM-DD.md` に書く：
   - X 用（140字以内）×2案、LinkedIn / Facebook 用（300字程度）×1案
   - 記事URL は `https://<サイトのドメイン>/column-NN.html` とし、ドメインが不明なら `{SITE}/column-NN.html` と書く
   - ハッシュタグは2個まで
9. 公開前の自己チェック（すべて満たすまで直す）：
   - 出典で確認できない数値・統計・事例を書いていない
   - 「必ず」「絶対」「最高値で売れる」など断定・誇大な表現がない
   - 特定の企業・仲介会社を批判していない。実在の顧客事例を作っていない
   - 税務・法務は一般論にとどめ、個別の助言になっていない
   - ステルスマーケティングに当たる書き方（第三者を装う等）をしていない
   - HTML が崩れていない（タグの閉じ忘れなし、リンク切れなし）
10. `git add` → `git commit -m "Add column-NN: <タイトル>"` → `git push -u origin auto-content`。
    push がネットワークエラーで失敗したら、2秒・4秒・8秒・16秒の間隔で最大4回再試行する。
11. 最後に、追加した記事のタイトル・要旨・出典・SNS 投稿案を短く報告する。

## してはいけないこと
- `main` ブランチへ直接 push しない（公開は人が auto-content を main に取り込んで行う）
- 既存ページのデザイン・構成を変えない（column.html への1行追加を除く）
- プルリクエストを作らない
