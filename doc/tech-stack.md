# 白熊堂 技術スタック

## 概要
白熊堂（かき氷屋）のホームページプロジェクトの技術スタックドキュメントです。

## フロントエンド

### フレームワーク
- **Next.js** `16.1.1`
  - App Routerを使用
  - サーバーサイドレンダリング（SSR）と静的サイト生成（SSG）をサポート
  - API Routesでバックエンド機能も実装可能

### UIライブラリ
- **React** `19.2.3`
  - UIコンポーネントの構築
- **React DOM** `19.2.3`

### スタイリング
- **Tailwind CSS** `^4`
  - ユーティリティファーストのCSSフレームワーク
  - ダークモード対応
- **PostCSS** (`@tailwindcss/postcss` `^4`)
  - Tailwind CSSの処理

### フォント
- **Geist Sans** / **Geist Mono** (Next.js Google Fonts)
  - デフォルトフォントとして使用

## バックエンド

### ランタイム
- **Node.js** `>=24.0.0` (LTS: Krypton)
  - Vercelのランタイムで使用
  - Next.js API Routesでバックエンド機能を実装
  - `.nvmrc`ファイルでバージョンを指定

### データベース
- **Vercel Neon** (PostgreSQL)
  - サーバーレスPostgreSQLデータベース
  - 開発環境から本番環境まで統一して使用
- **Prisma** `^7.2.0`
  - 型安全なORM（Object-Relational Mapping）
  - データベーススキーマ管理とマイグレーション
  - `lib/prisma.ts`にPrisma Clientインスタンスを実装
  - `prisma/schema.prisma`でスキーマを定義

### ストレージ
- **Vercel Blob Storage**
  - 画像やファイルの保存に使用
  - 開発環境から本番環境まで統一して使用
- **@vercel/blob** `^2.0.0`
  - Blobストレージへのファイルアップロード・管理
  - `lib/blob.ts`にユーティリティ関数を実装

## 言語・型システム

### 言語
- **TypeScript** `^5`
  - フロントエンドとバックエンドの両方で使用
  - 型安全性を確保

### 型定義
- `@types/node` `^20`
- `@types/react` `^19`
- `@types/react-dom` `^19`

## デプロイメント

### ホスティング
- **Vercel**
  - 自動デプロイ
  - プレビュー環境の自動生成
  - エッジネットワークでの高速配信

### 環境変数
- Vercelの環境変数設定を使用
- 開発環境と本番環境で適切に管理

## 開発ツール

### リンター
- **ESLint** `^9`
- **eslint-config-next** `16.1.1`
  - Next.js推奨のESLint設定

### ビルドツール
- Next.js内蔵のビルドシステム
- TypeScriptコンパイラ

## プロジェクト構造

```
shirokumado-ts/
├── app/              # Next.js App Router
│   ├── layout.tsx   # ルートレイアウト
│   ├── page.tsx     # ホームページ
│   └── globals.css  # グローバルスタイル
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
│   ├── tech-stack.md           # 技術スタック
│   └── setup-prisma-blob.md    # Prisma & Blob セットアップガイド
├── package.json     # 依存関係
├── tsconfig.json    # TypeScript設定
├── next.config.ts   # Next.js設定
└── eslint.config.mjs # ESLint設定
```

## 今後の追加予定

### その他
- フォームバリデーションライブラリ
- 認証システム（必要に応じて）
- 画像最適化ライブラリ
- テストフレームワーク（Jest、Vitest等）

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
npm run db:studio      # Prisma Studioを起動
```

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Neon Documentation](https://neon.tech/docs)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
