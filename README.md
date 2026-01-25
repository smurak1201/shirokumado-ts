# 白熊堂（しろくまどう）

白熊堂のかき氷屋のホームページプロジェクトです。

## 目次

- [技術スタック](#技術スタック)
- [前提条件](#前提条件)
- [セットアップ](#セットアップ)
  - [リポジトリのクローン](#1-リポジトリのクローン)
  - [依存関係のインストール](#2-依存関係のインストール)
  - [環境変数の設定](#3-環境変数の設定)
  - [データベースのセットアップ](#4-データベースのセットアップ)
  - [開発サーバーの起動](#5-開発サーバーの起動)
- [開発コマンド](#開発コマンド)
- [プロジェクト構造](#プロジェクト構造)
- [デプロイ](#デプロイ)
- [ライセンス](#ライセンス)

## 技術スタック

### フロントエンド

- **Next.js 16.1.1** (App Router) - ファイルベースのルーティングと Server Components
- **React 19.2.3** - UI ライブラリ
- **TypeScript 5** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **shadcn/ui** - UI コンポーネントライブラリ
- **Framer Motion** - アニメーションライブラリ

### バックエンド

- **Next.js API Routes** - RESTful API エンドポイント
- **Prisma 7.2.0** - ORM（データベースアクセス）

### データベース・ストレージ

- **Vercel Neon** (PostgreSQL) - サーバーレスデータベース
- **Vercel Blob Storage** - 画像ストレージ

### デプロイ

- **Vercel** - ホスティングプラットフォーム

## 前提条件

- Node.js 24 以上（LTS 推奨）
- npm 11 以上 または yarn
- Git

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd shirokumado-ts
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env`ファイルを作成し、必要な環境変数を設定してください。

**必須の環境変数**:

- `DATABASE_URL`: PostgreSQL 接続文字列（アプリケーション用・マイグレーション用）
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage のトークン

### 4. データベースのセットアップ

```bash
# Prisma Clientを生成
npm run db:generate

# マイグレーションを実行（初回）
npm run db:migrate

# または、スキーマを直接プッシュ（開発環境のみ）
npm run db:push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# リンター実行
npm run lint

# Prisma関連
npm run db:generate    # Prisma Clientを生成
npm run db:push        # スキーマをデータベースにプッシュ
npm run db:migrate     # マイグレーションを作成・適用
npm run db:migrate:deploy  # 本番環境でマイグレーションを適用
npm run db:studio      # Prisma Studioを起動
npm run db:seed        # シードデータを投入
```

## プロジェクト構造

```
shirokumado-ts/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── products/     # 商品API
│   │   │   ├── [id]/    # 商品個別操作
│   │   │   ├── reorder/ # 並び替え
│   │   │   └── upload/  # 画像アップロード
│   │   └── categories/   # カテゴリーAPI
│   ├── dashboard/         # ダッシュボード機能
│   │   ├── components/   # ダッシュボードコンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   ├── utils/        # ユーティリティ関数
│   │   ├── page.tsx      # ダッシュボードページ
│   │   └── types.ts       # 型定義
│   ├── components/       # フロントエンド共通コンポーネント
│   │   ├── ui/          # shadcn/ui コンポーネント
│   │   ├── Header.tsx   # ヘッダー
│   │   ├── Footer.tsx   # フッター
│   │   └── ...          # その他のコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── utils/            # ユーティリティ関数
│   ├── faq/              # FAQページ
│   ├── error.tsx         # エラーページ
│   ├── layout.tsx        # ルートレイアウト
│   ├── page.tsx          # ホームページ
│   └── types.ts           # 型定義
├── doc/                    # ドキュメント
├── lib/                    # ユーティリティ・ライブラリ
│   ├── prisma.ts         # Prisma Clientインスタンス
│   ├── blob.ts           # Blobストレージユーティリティ
│   ├── env.ts            # 環境変数管理
│   ├── errors.ts          # 統一されたエラーハンドリング
│   ├── api-helpers.ts    # API Routes用ヘルパー
│   ├── api-types.ts      # API型定義
│   ├── config.ts         # アプリケーション設定
│   ├── logger.ts         # ログユーティリティ
│   ├── products.ts       # 商品関連ユーティリティ
│   ├── product-utils.ts  # 商品関連ユーティリティ
│   ├── image-compression.ts # 画像圧縮ユーティリティ
│   └── utils.ts           # 汎用ユーティリティ
├── prisma/                 # Prisma設定
│   ├── schema.prisma     # データベーススキーマ定義
│   ├── migrations/       # マイグレーションファイル
│   └── seed.ts           # シードデータ
├── public/                 # 静的ファイル
├── updates/                # 更新履歴・改修ドキュメント
│   ├── README.md          # 更新履歴の説明
│   └── *.md               # 各改修の詳細ドキュメント
└── package.json            # 依存関係
```

## デプロイ

このプロジェクトは Vercel にデプロイされています。

- **本番環境**: [本番 URL]
- **プレビュー環境**: プルリクエストごとに自動生成

## ライセンス

このプロジェクトはプライベートプロジェクトです。
