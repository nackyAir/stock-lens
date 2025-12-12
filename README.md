# Stock Lens

毎日の市場をわかりやすく。株式データを取得し、AIが分析してレポートをお届けするWebアプリケーション。

## 概要

Stock Lensは、気になる銘柄を選択するだけで最新の株価データを取得し、Claude AIによる分析レポートを生成します。分析結果はメールでも受け取ることができます。

### 主な機能

- **銘柄検索**: 会社名やティッカーシンボルで銘柄を検索
- **プリセットカテゴリー**: 主要指数、GAFAM、日本株など、よく見られる銘柄をカテゴリー別に表示
- **リアルタイム株価**: Yahoo Finance APIから最新の株価データを取得
- **AI分析**: Claude AIによる市場動向の分析
  - 今日のまとめ
  - 日次・週次・月次の傾向分析
  - 注目ポイント
  - 参考情報
- **メールレポート**: 分析結果をメールで送信

## 技術スタック

- **フレームワーク**: [Next.js 16](https://nextjs.org/) (App Router)
- **言語**: TypeScript
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **UIコンポーネント**: [shadcn/ui](https://ui.shadcn.com/)
- **株価データ**: [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2)
- **AI分析**: [Anthropic Claude](https://www.anthropic.com/) (AI SDK)
- **メール送信**: [Resend](https://resend.com/)
- **バリデーション**: [Zod](https://zod.dev/)

## 必要要件

- Node.js 18以上
- pnpm (推奨) / npm / yarn

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/nackyAir/stock-lens.git
cd stock-lens
```

### 2. 依存関係をインストール

```bash
pnpm install
```

### 3. 環境変数を設定

`.env.example`をコピーして`.env.local`を作成します。

```bash
cp .env.example .env.local
```

以下の環境変数を設定してください：

| 変数名 | 説明 | 取得先 |
|--------|------|--------|
| `ANTHROPIC_API_KEY` | Claude APIキー（AI分析に必要） | [Anthropic Console](https://console.anthropic.com/) |
| `RESEND_API_KEY` | Resend APIキー（メール送信に必要） | [Resend Dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | 送信元メールアドレス | [Resend Domains](https://resend.com/domains) |

### 4. 開発サーバーを起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開きます。

## 使い方

1. **銘柄を選ぶ**: 検索バーで銘柄を探すか、プリセットカテゴリーから選択します（最大20銘柄）
2. **分析を実行**: 「この銘柄を分析する」ボタンをクリック
3. **結果を確認**: 株価データとAI分析結果が表示されます
4. **メールで受け取る**（オプション）: メールアドレスを入力して送信

## プロジェクト構造

```
stock-lens/
├── app/
│   ├── api/
│   │   ├── analyze/       # AI分析エンドポイント
│   │   ├── send-email/    # メール送信エンドポイント
│   │   └── stocks/        # 株価データ取得エンドポイント
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインダッシュボード
├── components/
│   └── ui/                # shadcn/ui コンポーネント
├── emails/
│   └── stock-report.tsx   # メールテンプレート
├── lib/
│   ├── popular-stocks.ts  # プリセット銘柄データ
│   ├── stock-service.ts   # Yahoo Finance API連携
│   ├── types.ts           # TypeScript型定義
│   └── utils.ts           # ユーティリティ関数
└── public/                # 静的ファイル
```

## API エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/stocks` | POST | 指定した銘柄の株価データを取得 |
| `/api/stocks/search` | GET | 銘柄を検索 |
| `/api/analyze` | POST | 株価データをAIで分析 |
| `/api/send-email` | POST | 分析結果をメールで送信 |

## スクリプト

```bash
# 開発サーバー起動
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start

# Lint実行
pnpm lint
```

## デプロイ

[Vercel](https://vercel.com) でのデプロイを推奨します。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nackyAir/stock-lens)

環境変数をVercelのプロジェクト設定で追加してください。

## 注意事項

- 株価データはYahoo Financeから取得しています
- 投資に関する最終的なご判断はご自身の責任でお願いいたします
- APIキーは必ず環境変数として安全に管理してください

## ライセンス

MIT
