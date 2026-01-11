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
- [ドキュメント](#ドキュメント)
  - [入門ガイド](#入門ガイド)
  - [アーキテクチャと設計](#アーキテクチャと設計)
  - [技術スタック](#技術スタック-1)
  - [機能別ガイド](#機能別ガイド)
  - [開発ガイド](#開発ガイド)
  - [技術ガイド](#技術ガイド)
  - [セットアップとデプロイ](#セットアップとデプロイ)
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

### バックエンド

- **Next.js API Routes** - RESTful API エンドポイント
- **Prisma 7.2.0** - ORM（データベースアクセス）

### データベース・ストレージ

- **Vercel Neon** (PostgreSQL) - サーバーレスデータベース
- **Vercel Blob Storage** - 画像ストレージ

### デプロイ

- **Vercel** - ホスティングプラットフォーム

### アーキテクチャの特徴

- **Server Components**: デフォルトでサーバーサイドでレンダリング。Prisma を使用してデータベースに直接アクセスし、初期 HTML を生成
- **Client Components**: インタラクティブな機能（状態管理、イベントハンドラーなど）を実装。必要に応じて `fetch` API を使用して API Routes にアクセス
- **API Routes**: Client Components からのリクエストを処理。Prisma を使用してデータベース操作を実行し、RESTful API として機能

詳細は [技術スタックドキュメント](./doc/tech-stack.md) を参照してください。

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

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース接続（Neon）
# DATABASE_URL または POSTGRES_URL のどちらかが必要です
DATABASE_URL=postgresql://...
# 以下の環境変数はオプションです（Neon の接続プール設定など）
DATABASE_URL_UNPOOLED=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Blob Storage（必須）
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

詳細は [Prisma & Blob セットアップガイド](./doc/setup-prisma-blob.md) を参照してください。

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

## ドキュメント

### 入門ガイド

- **[はじめに - コードリーディングガイド](./doc/getting-started.md)** - **まずここから**: プロジェクトのコードを理解するためのガイド。どのファイルから読み始めるか、各ディレクトリの役割を説明します。

### アーキテクチャと設計

- **[アーキテクチャ](./doc/architecture.md)** - アーキテクチャの全体像と設計思想。コンポーネント設計、状態管理、データフローなどを説明します。
- **[プロジェクト構造](./doc/project-structure.md)** - ディレクトリ構造の詳細説明。各ファイルの役割と設計思想を説明します。

### 技術スタック

- **[技術スタック](./doc/tech-stack.md)** - 使用している技術の詳細。各技術の特徴と、このアプリでの使われ方を説明します。

### 機能別ガイド

- **[フロントエンドガイド](./doc/guides/frontend-guide.md)** - フロントエンド実装の詳細。ページ構成、コンポーネント、データフローなどを説明します。
- **[ダッシュボードガイド](./doc/guides/dashboard-guide.md)** - ダッシュボード機能の詳細。商品管理機能の実装を説明します。

### 開発ガイド

- **[開発ガイドライン](./doc/development-guide.md)** - コーディング規約とベストプラクティス。Next.js、Prisma、TypeScript などの技術スタック別のベストプラクティス、命名規則、Git ワークフローなどを説明します。

### 技術ガイド

- **[Next.js ガイド](./doc/guides/nextjs-guide.md)** - Next.js の詳細な使用方法。画像最適化、フォント最適化、メタデータ、ビルドとデプロイなどの説明と、このアプリでの実際の使用箇所を説明します。
- **[App Router ガイド](./doc/guides/app-router-guide.md)** - Next.js App Router の詳細な使用方法。Server Components、Client Components、API Routes などの説明と、このアプリでの実際の使用箇所を説明します。
- **[React ガイド](./doc/guides/react-guide.md)** - React の詳細な使用方法。Hooks、カスタムフック、コンポーネント設計などの説明と、このアプリでの実際の使用箇所を説明します。
- **[JSX ガイド](./doc/guides/jsx-guide.md)** - JSX の構文と使用方法。HTML との違い、基本的な構文、ベストプラクティスなどの説明と、このアプリでの実際の使用例を説明します。
- **[TypeScript ガイド](./doc/guides/typescript-guide.md)** - TypeScript の詳細な使用方法。型定義、型安全性、Prisma との統合などの説明と、このアプリでの実際の使用箇所を説明します。
- **[Prisma ガイド](./doc/guides/prisma-guide.md)** - Prisma の詳細な使用方法。各関数の説明と、このアプリでの実際の使用箇所を説明します。
- **[ユーティリティ関数ガイド](./doc/guides/utilities-guide.md)** - `lib/` ディレクトリのユーティリティ関数の詳細。商品関連ユーティリティ、画像圧縮、Blob Storage、設定管理、環境変数の型安全な管理などを説明します。

### セットアップとデプロイ

- **[Prisma & Blob セットアップガイド](./doc/setup-prisma-blob.md)** - データベースとストレージのセットアップ方法。開発環境の構築手順を説明します。
- **[デプロイメントガイド](./doc/deployment.md)** - デプロイ手順。Vercel へのデプロイ方法を説明します。

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
│   │   └── categories/   # カテゴリーAPI
│   ├── dashboard/         # ダッシュボード機能
│   │   ├── components/   # ダッシュボードコンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   └── utils/        # ユーティリティ関数
│   ├── components/       # フロントエンド共通コンポーネント
│   ├── hooks/            # カスタムフック
│   ├── utils/            # ユーティリティ関数
│   ├── faq/              # FAQページ
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # ホームページ
├── lib/                    # ユーティリティ・ライブラリ
│   ├── prisma.ts         # Prisma Clientインスタンス
│   ├── blob.ts           # Blobストレージユーティリティ
│   ├── env.ts            # 環境変数管理
│   ├── errors.ts          # 統一されたエラーハンドリング
│   ├── api-helpers.ts    # API Routes用ヘルパー
│   ├── config.ts         # アプリケーション設定
│   ├── image-compression.ts # 画像圧縮ユーティリティ
│   └── product-utils.ts  # 商品関連ユーティリティ
├── prisma/                 # Prisma設定
│   ├── schema.prisma     # データベーススキーマ定義
│   └── migrations/       # マイグレーションファイル
├── public/                 # 静的ファイル
├── doc/                    # ドキュメント
└── package.json            # 依存関係
```

詳細は [プロジェクト構造ドキュメント](./doc/project-structure.md) を参照してください。

## デプロイ

このプロジェクトは Vercel にデプロイされています。

- **本番環境**: [本番 URL]
- **プレビュー環境**: プルリクエストごとに自動生成

詳細は [デプロイメントガイド](./doc/deployment.md) を参照してください。

## ライセンス

このプロジェクトはプライベートプロジェクトです。
