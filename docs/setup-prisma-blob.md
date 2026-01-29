# Prisma & Blob セットアップガイド

## このドキュメントの役割

このドキュメントは Prisma と Blob Storage の**セットアップ方法**を説明します。環境構築や初期設定を行う際に参照してください。

| 目的 | 参照するドキュメント |
|---|---|
| **セットアップ・初期設定** | **このドキュメント** |
| Prisma の詳細な使用方法 | [Prisma ガイド](./guides/prisma-guide.md) |
| Blob Storage の詳細な使用方法 | [ユーティリティ関数ガイド](./guides/utilities-guide.md#blob-storage-ユーティリティ-libblobts) |
| 環境変数の型安全な管理 | [ユーティリティ関数ガイド](./guides/utilities-guide.md#環境変数の型安全な管理-libenvts) |

## 目次

- [概要](#概要)
- [インストール済みパッケージ](#インストール済みパッケージ)
- [環境変数](#環境変数)
- [Prisma のセットアップ](#prisma-のセットアップ)
- [Blob Storage のセットアップ](#blob-storage-のセットアップ)
- [Prisma Studio](#prisma-studio)
- [トラブルシューティング](#トラブルシューティング)
- [参考リンク](#参考リンク)

## 概要

白熊堂プロジェクトでの Prisma（Neon PostgreSQL）と Vercel Blob Storage のセットアップと使用方法を説明します。

## インストール済みパッケージ

- **Prisma** `^7.2.0` - ORM とマイグレーションツール
- **@prisma/client** `^7.2.0` - Prisma Client（型安全なデータベースクライアント）
- **@vercel/blob** `^2.0.0` - Blob ストレージ操作用

## 環境変数

[`.env`](../.env)ファイルに以下の環境変数が設定されています：

```env
# データベース接続（必須）
DATABASE_URL=postgresql://user:password@host:port/database

# 以下の環境変数はオプションです（Neon の接続プール設定など）
DATABASE_URL_UNPOOLED=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Blob Storage（必須）
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### データベース接続の設定

**説明**: このアプリでは、通常の PostgreSQL 接続を使用しています。`DATABASE_URL` 環境変数に PostgreSQL 接続文字列を設定してください。

**環境変数の設定**:

- **`DATABASE_URL`** (必須): PostgreSQL 接続文字列
  - 形式: `postgresql://user:password@host:port/database`
  - Vercel Neon などのサーバーレスデータベースサービスから取得できます

**Vercel Neon での取得方法**:

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトの Settings > Environment Variables に移動
3. Neon データベースを作成または既存のデータベースを選択
4. 接続文字列をコピーして `DATABASE_URL` として設定

**詳細な情報**:

- [Prisma ガイド](./guides/prisma-guide.md): Prisma の詳細な使用方法
- [Vercel Neon Documentation](https://vercel.com/docs/storage/vercel-postgres): Vercel Neon の公式ドキュメント

### 環境変数の型安全な管理

このアプリでは、[`lib/env.ts`](../lib/env.ts) を使用して環境変数を型安全に取得します。

```typescript
import { getServerEnv } from "@/lib/env";

const env = getServerEnv();
const dbUrl = env.DATABASE_URL; // 型安全
```

**詳細**については、[ユーティリティ関数ガイド - 環境変数](./guides/utilities-guide.md#環境変数の型安全な管理-libenvts)を参照してください。

## Prisma のセットアップ

### Prisma Client のインポート

[`lib/prisma.ts`](../lib/prisma.ts) から Prisma Client をインポートして使用します。

```typescript
import { prisma } from "@/lib/prisma";

const users = await prisma.user.findMany();
```

### スキーマの定義

[`prisma/schema.prisma`](../prisma/schema.prisma) でデータベーススキーマを定義します。

### マイグレーションコマンド

```bash
# マイグレーションファイルを作成
npm run db:migrate

# スキーマを直接データベースにプッシュ（開発時のみ）
npm run db:push

# 本番環境でマイグレーションを適用
npm run db:migrate:deploy

# Prisma Client を再生成
npm run db:generate
```

**詳細な使用方法**（CRUD 操作、トランザクション、リレーションなど）については、[Prisma ガイド](./guides/prisma-guide.md)を参照してください。

## Blob Storage のセットアップ

### 基本的な使用方法

[`lib/blob.ts`](../lib/blob.ts) から必要な関数をインポートして使用します。

```typescript
import { uploadImage, deleteFile } from "@/lib/blob";

// 画像のアップロード
const imageBlob = await uploadImage("images/product.jpg", imageBuffer, "image/jpeg");
console.log(imageBlob.url);

// ファイルの削除
await deleteFile("https://...blob.vercel-storage.com/...");
```

**詳細な使用方法**（ファイル一覧取得、ファイル情報取得など）については、[ユーティリティ関数ガイド - Blob Storage](./guides/utilities-guide.md#blob-storage-ユーティリティ-libblobts)を参照してください。

## Prisma Studio

データベースの内容を視覚的に確認・編集するには、Prisma Studio を使用します。

```bash
npm run db:studio
```

ブラウザで `http://localhost:5555` が開き、データベースの内容を確認できます。

## トラブルシューティング

### Prisma 関連

- **マイグレーションエラー**: スキーマとデータベースの状態が一致しない場合、`npm run db:push`で強制的に同期できます（開発環境のみ）。

- **Prisma Client が見つからない**: `npm run db:generate`を実行して Prisma Client を生成してください。

- **接続エラー**: 環境変数`DATABASE_URL`が正しく設定されているか確認してください。PostgreSQL 接続文字列の形式が正しいか確認してください。

### Blob Storage 関連

- **アップロードエラー**: 環境変数`BLOB_READ_WRITE_TOKEN`が正しく設定されているか確認してください。

- **ファイルサイズエラー**: Vercel Blob の制限を確認してください。

## 参考リンク

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma ガイド](./guides/prisma-guide.md): Prisma の詳細な使用方法
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
