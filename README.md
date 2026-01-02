# 白熊堂（しろくまどう）

白熊堂のかき氷屋のホームページプロジェクトです。

## 🚀 技術スタック

- **フロントエンド**: Next.js 16.1.1 (App Router), React 19.2.3, TypeScript 5, Tailwind CSS 4
- **バックエンド**: Next.js API Routes, Prisma 7.2.0
- **データベース**: Vercel Neon (PostgreSQL)
- **ストレージ**: Vercel Blob Storage
- **デプロイ**: Vercel

詳細は [技術スタックドキュメント](./doc/tech-stack.md) を参照してください。

## 📋 前提条件

- Node.js 24以上（LTS推奨）
- npm 11以上 または yarn
- Git

> **WSL上のUbuntuを使用している場合**: [WSLでのNode.jsセットアップガイド](./doc/nodejs-setup-wsl.md)を参照してください。

## 🛠️ セットアップ

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
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

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

## 📚 ドキュメント

- [技術スタック](./doc/tech-stack.md) - 使用している技術の詳細
- [アーキテクチャ](./doc/architecture.md) - アーキテクチャと設計思想
- [プロジェクト構造](./doc/project-structure.md) - ディレクトリ構造の説明
- [開発ガイドライン](./doc/development-guide.md) - コーディング規約とベストプラクティス
- [コーディング標準](./doc/coding-standards.md) - コード生成時のベストプラクティス
- [Prisma & Blob セットアップガイド](./doc/setup-prisma-blob.md) - データベースとストレージの使用方法
- [デプロイメントガイド](./doc/deployment.md) - デプロイ手順

## 🧑‍💻 開発コマンド

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
```

## 📁 プロジェクト構造

```
shirokumado-ts/
├── app/              # Next.js App Router
│   ├── api/         # API Routes
│   ├── layout.tsx   # ルートレイアウト
│   └── page.tsx     # ホームページ
├── lib/              # ユーティリティ・ライブラリ
│   ├── prisma.ts    # Prisma Clientインスタンス
│   ├── blob.ts      # Blobストレージユーティリティ
│   ├── env.ts       # 環境変数管理
│   ├── errors.ts    # 統一されたエラーハンドリング
│   └── api-helpers.ts # API Routes用ヘルパー
├── prisma/           # Prisma設定
│   ├── schema.prisma # データベーススキーマ定義
│   └── migrations/  # マイグレーションファイル
├── public/          # 静的ファイル
├── doc/             # ドキュメント
└── package.json     # 依存関係
```

詳細は [プロジェクト構造ドキュメント](./doc/project-structure.md) を参照してください。

## 🚢 デプロイ

このプロジェクトはVercelにデプロイされています。

- **本番環境**: [本番URL]
- **プレビュー環境**: プルリクエストごとに自動生成

詳細は [デプロイメントガイド](./doc/deployment.md) を参照してください。

## 📝 ライセンス

[ライセンス情報]

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します。詳細は [開発ガイドライン](./doc/development-guide.md) を参照してください。
