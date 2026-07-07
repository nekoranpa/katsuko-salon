# 勝子 美和温サロン

副題・英字表記：YABIKU KATSUKO BIWAON SALON


温熱サロン向けの「おしゃれな公開ホームページ」＋「予約・売上・在庫・施術師報酬管理」のスターターです。

## 今回進めた内容

- 公開ホームページ
  - サロン紹介
  - 温熱ケアメニュー
  - 電話予約導線
  - サプリ商品一覧
  - Stripe Payment Linkへの導線
- 管理画面
  - タブ式コンソール
  - 電話予約の新規登録フォーム
  - ベッド3台と施術師の重複チェック
  - 予約ステータス変更
  - 「来店済み」変更時の施術売上自動登録
  - 施術師別の歩合報酬集計
  - サプリ商品追加
  - 物販売上の手動登録
  - 物販売上登録時の在庫減算
  - Supabase未設定時はデモデータで動作
  - Supabase設定後は実データ読込・登録へ切替
- Supabase用SQL
  - profiles
  - beds
  - service_menus
  - customers
  - reservations
  - treatment_sales
  - products
  - product_sales
  - payroll_adjustments
  - monthly_therapist_payroll view
- Stripe
  - 初期は商品ごとのPayment Link方式
  - products.stripe_payment_linkにURLを保存

## セットアップ

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` に以下を入れてください。

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SALON_PHONE=予約電話番号
VITE_SALON_LINE_URL=
```

## Supabase設定

1. SupabaseのSQL Editorで `supabase/schema.sql` を実行
2. Authenticationで管理者と施術師のユーザーを作成
3. `profiles` にユーザーを追加
4. 管理者は `role = admin`、施術師は `role = therapist`

## Stripe設定

最初は簡単に始めるため、Stripe Payment Links方式です。

1. Stripeで商品を作成
2. Payment Linkを作成
3. 管理画面の商品追加フォーム、またはSupabaseの `products.stripe_payment_link` にURLを保存
4. 公開ページの商品ボタンから決済へ誘導

## 公開方法

1. GitHubにこのフォルダをpush
2. VercelまたはNetlifyでGitHubリポジトリを接続
3. 環境変数に `.env` と同じ値を設定
4. build commandは `npm run build`
5. publish directoryは `dist`

## 注意

温熱・サプリの表現は、医療効果や痩身効果を断定しない方針です。
「美容と健康維持をサポート」「リラックス」「温活」「年齢に応じたケア」などの表現に寄せています。

## 次の実装候補

- Supabase Authログイン画面
- 管理者・施術師ごとの表示制御をUI側でも厳密化
- 予約編集・削除
- 顧客カルテ
- Stripe Webhookによる物販売上の自動登録
- 領収書PDF
- 報酬明細PDF