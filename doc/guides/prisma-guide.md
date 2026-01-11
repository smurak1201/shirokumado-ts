# Prisma 7 ガイド

## 目次

- [概要](#概要)
- [Prisma 7 の設定](#prisma-7-の設定)
  - [prisma.config.ts](#prismaconfigts)
- [データベースへの接続](#データベースへの接続)
  - [Prisma 7 でのデータベース接続の概要](#prisma-7-でのデータベース接続の概要)
  - [このアプリでの PostgreSQL（Neon）への接続](#このアプリでの-postgresqlneonへの接続)
- [ORM としての機能](#orm-としての機能)
  - [データベーススキーマ定義](#データベーススキーマ定義)
  - [リレーション（関連）](#リレーション関連)
  - [マイグレーション](#マイグレーション)
  - [型生成](#型生成)
  - [Prisma Studio](#prisma-studio)
  - [シードデータ](#シードデータ)
- [Prisma 関数の説明と使用例](#prisma-関数の説明と使用例)
  - [findMany](#findmany)
  - [findUnique](#findunique)
  - [create](#create)
  - [update](#update)
  - [delete](#delete)
  - [$transaction](#transaction)
- [クエリオプション](#クエリオプション)
  - [where](#where)
  - [orderBy](#orderby)
  - [include](#include)
  - [N+1 問題の詳細解説](#n1-問題の詳細解説)
  - [select（このアプリでは未使用）](#selectこのアプリでは未使用)
  - [take と skip（このアプリでは未使用）](#take-と-skipこのアプリでは未使用)
- [エラーハンドリング](#エラーハンドリング)
- [型安全性](#型安全性)
- [マイグレーション](#マイグレーション-1)
- [Prisma 7 のベストプラクティス](#prisma-7-のベストプラクティス)
  - [アダプターの使用](#アダプターの使用)
  - [設定ファイルの管理](#設定ファイルの管理)
  - [パフォーマンスの最適化](#パフォーマンスの最適化)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

Prisma 7 は、モダンなアプリケーション開発のための次世代 ORM（Object-Relational Mapping）です。型安全なデータベースアクセスと、直感的な API を提供します。

このアプリケーションでは、**Prisma 7.2.0** を使用して PostgreSQL（Vercel Neon）に接続し、商品情報やカテゴリー情報などのデータを管理しています。

**このアプリでの使用箇所**:

- **バックエンド（Server Components、API Routes）**: Prisma を使用してデータベースに直接アクセス
  - `app/page.tsx`: ホームページで商品データを取得
  - `app/dashboard/page.tsx`: ダッシュボードページで商品データを取得
  - `app/api/products/route.ts`: 商品一覧の取得・作成
  - [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): 個別商品の取得・更新・削除
  - `app/api/products/reorder/route.ts`: 商品の並び替え（`$transaction` を使用）
  - `app/api/categories/route.ts`: カテゴリー一覧の取得
- **フロントエンド（Client Components）**: Prisma は使用していない。代わりに `fetch` API を使用して API Routes にアクセス

**Prisma 7 の主な特徴**:

- **アダプターシステム**: データベースプロバイダーごとに専用のアダプターを使用（`@prisma/adapter-neon` など）
- **設定ファイルの分離**: `prisma.config.ts` で設定を管理
- **パフォーマンスの向上**: クエリ実行速度の改善とバンドルサイズの縮小
- **型安全性の強化**: より厳密な型チェックとエラーハンドリング
- **PostgreSQL の拡張機能**: `orderBy` での `nulls` オプションなど

## Prisma 7 の設定

### prisma.config.ts

**説明**: Prisma 7 では、設定を `prisma.config.ts` ファイルで管理します。これにより、スキーマファイルと設定を分離し、より柔軟な設定が可能になります。

**このアプリでの使用箇所**:

- [`prisma.config.ts`](../../prisma.config.ts): Prisma の設定ファイル

**設定ファイルの構成**:

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // Prisma 7では、directUrlは環境変数から自動的に読み込まれます
    // DATABASE_URL_UNPOOLED または POSTGRES_URL_NON_POOLING を設定してください
  },
});
[`prisma.config.ts`](../prisma.config.ts)

```

- 設定ファイルが [`prisma.config.ts`](../../prisma.config.ts) に分離された
- `defineConfig` 関数を使用して設定を定義
- マイグレーションの設定（パス、シード）を設定ファイルで管理

## データベースへの接続

### Prisma 7 でのデータベース接続の概要

**説明**: Prisma 7 では、データベースプロバイダーごとに専用のアダプターを使用してデータベースに接続します。これにより、各データベースの特性に最適化された接続管理が可能になります。

**Prisma 7 での一般的な接続方法**:

1. **アダプターの選択**: 使用するデータベースに応じて適切なアダプターを選択

   - PostgreSQL: `@prisma/adapter-postgres` または `@prisma/adapter-neon`（Neon の場合）
   - MySQL: `@prisma/adapter-mysql`
   - SQLite: `@prisma/adapter-sqlite`

2. **Prisma Client の初期化**: アダプターを指定して Prisma Client を作成

```typescript
import { PrismaClient } from "@prisma/client";
import { Adapter } from "@prisma/adapter-xxx"; // データベースに応じたアダプター

const adapter = new Adapter(connectionString);

const prisma = new PrismaClient({
  adapter, // アダプターを指定
});
```

- **アダプターシステム**: Prisma 6 までは接続文字列を直接指定していましたが、Prisma 7 ではアダプターを使用
- **接続管理**: アダプターが接続プール、WebSocket、トランザクションなどを管理
- **パフォーマンス**: サーバーレス環境でのパフォーマンスが向上
- **型安全性**: アダプターにより、より厳密な型チェックが可能

### このアプリでの PostgreSQL（Neon）への接続

このアプリケーションでは、**PostgreSQL（Vercel Neon）** に接続するために `@prisma/adapter-neon` を使用しています。

**このアプリでの使用箇所**:

- [`lib/prisma.ts`](../../lib/prisma.ts): Prisma Client の初期化とエクスポート
- すべての Server Components と API Routes で `import { prisma } from '@/lib/prisma'` として使用

**実際の実装コード**:

[`lib/prisma.ts`](../../lib/prisma.ts) (行 28-70)

```28:70
  // Prisma 7では、Neonに接続するためにアダプターを使用します
  const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!rawConnectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
  }

  // 接続文字列を確実に文字列に変換
  // process.envの値は常にstring | undefinedなので、String()で変換
  const connectionString = String(rawConnectionString).trim();

  // 接続文字列が空でないことを確認
  if (!connectionString || connectionString.length === 0) {
    throw new Error('DATABASE_URL must be a non-empty string');
  }

  // 接続文字列が正しい形式であることを確認
  if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  try {
    // neon関数を使用してアダプターを作成
    // これにより、Vercelの本番環境でも正しく動作します
    const sql = neon(connectionString);
    const adapter = new PrismaNeon(sql as any);

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  } catch (error) {
    console.error('Failed to create Prisma Client:', error);
    console.error('Connection string type:', typeof connectionString);
    console.error('Connection string length:', connectionString.length);
    console.error('Connection string preview:', connectionString.substring(0, 20) + '...');
    throw error;
  }
};
```

1. **環境変数からの接続文字列取得**:

   - `DATABASE_URL` または `POSTGRES_URL` から接続文字列を取得
   - PostgreSQL の接続文字列形式（`postgresql://` または `postgres://` で始まる）を検証

2. **Neon アダプターの作成**:

   - `@neondatabase/serverless` の `neon` 関数を使用して SQL クライアントを作成
   - `PrismaNeon` アダプターに SQL クライアントを渡してアダプターを作成

3. **WebSocket の設定**（Node.js 環境用）:

[`lib/prisma.ts`](../../lib/prisma.ts) (行 19-22)

```19:22
if (typeof globalThis !== 'undefined' && !globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}
```

4. **Prisma Client の作成**:

   - 作成したアダプターを `PrismaClient` のコンストラクタに渡す
   - 開発環境ではクエリログを有効化（`['query', 'error', 'warn']`）
   - 本番環境ではエラーログのみ（`['error']`）

5. **シングルトンインスタンスの管理**:

[`lib/prisma.ts`](../../lib/prisma.ts) (行 72-77)

```72:77
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**PostgreSQL（Neon）接続の特徴**:

- **サーバーレス対応**: Neon はサーバーレスアーキテクチャの PostgreSQL サービス
- **WebSocket 接続**: サーバーレス環境での効率的な接続管理
- **接続プール**: アダプターが自動的に接続プールを管理
- **パフォーマンス**: エッジネットワーク経由で高速なデータベースアクセス

**環境変数の設定**:

```env
DATABASE_URL=postgresql://user:password@host/database
DATABASE_URL_UNPOOLED=postgresql://user:password@host/database
POSTGRES_URL=postgresql://user:password@host/database
POSTGRES_URL_NON_POOLING=postgresql://user:password@host/database
```

- `DATABASE_URL`: プールされた接続（通常のクエリ用）
- `DATABASE_URL_UNPOOLED` または `POSTGRES_URL_NON_POOLING`: プールされていない接続（マイグレーション用）
- Prisma 7 では、これらの環境変数から自動的に適切な接続を使用します

## ORM としての機能

### データベーススキーマ定義

**説明**: Prisma では、[`prisma/schema.prisma`](../../prisma/schema.prisma) ファイルでデータベーススキーマを定義します。このファイルは、データベースのテーブル構造、フィールド、リレーション、制約などを宣言的に記述します。

**Prisma 7 でのスキーマ定義**:

Prisma 7 では、スキーマファイルの基本的な構造は Prisma 6 と同じですが、設定の一部が `prisma.config.ts` に分離されました。

**このアプリでの使用箇所**:

- [`prisma/schema.prisma`](../../prisma/schema.prisma): データベーススキーマの定義

**スキーマファイルの構成**:

```prisma
// Generator: Prisma Client の生成設定
generator client {
  provider = "prisma-client-js"
}

// Datasource: データベース接続設定
// Prisma 7では、接続情報はprisma.config.tsで管理されますが、
// スキーマファイルではプロバイダーの種類を指定します
datasource db {
  provider = "postgresql"  // PostgreSQLデータベースを使用
}

// カテゴリーテーブル
model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("categories")
}

// 商品テーブル
model Product {
  id          Int       @id @default(autoincrement())
  name        String
  description String    @db.Text
  imageUrl    String?   @map("image_url")
  priceS      Decimal?  @map("price_s") @db.Decimal(10, 2)
  priceL      Decimal?  @map("price_l") @db.Decimal(10, 2)
  categoryId  Int       @map("category_id")
  category    Category  @relation(fields: [categoryId], references: [id])
  published   Boolean   @default(true)
  publishedAt DateTime? @map("published_at")
  endedAt     DateTime? @map("ended_at")
  displayOrder Int?     @map("display_order")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("products")
}
[`prisma/schema.prisma`](../prisma/schema.prisma)

```

1. **Generator**: Prisma Client の生成方法を指定

   - `provider = "prisma-client-js"`: JavaScript/TypeScript 用のクライアントを生成

2. **Datasource**: データベース接続情報を指定

   - `provider = "postgresql"`: PostgreSQL データベースを使用

3. **Model**: データベーステーブルを定義
   - `Category`: カテゴリーテーブル
   - `Product`: 商品テーブル

**フィールドの属性**:

- `@id`: 主キー
- `@default(autoincrement())`: 自動インクリメント
- `@default(now())`: 作成時に現在時刻を設定
- `@updatedAt`: 更新時に自動的に現在時刻を更新
- `@unique`: ユニーク制約
- `@map("column_name")`: データベースのカラム名をマッピング

**PostgreSQL 固有の型指定**:

このアプリでは、PostgreSQL の特性を活用するために以下の型指定を使用しています：

- `@db.Text`: PostgreSQL の `TEXT` 型（長いテキスト用）
- `@db.Decimal(10, 2)`: PostgreSQL の `DECIMAL(10, 2)` 型（10 桁、小数点以下 2 桁）

**このアプリでの使用例**:

```prisma
model Product {
  description String    @db.Text  // PostgreSQLのTEXT型を使用
  priceS      Decimal?  @map("price_s") @db.Decimal(10, 2)  // DECIMAL型を使用
  priceL      Decimal?  @map("price_l") @db.Decimal(10, 2)  // DECIMAL型を使用
  // ...
}
[`prisma/schema.prisma`](../prisma/schema.prisma)

```

- `@db.Text`: 商品説明などの長いテキストを保存するために使用
- `@db.Decimal(10, 2)`: 価格などの数値を正確に保存するために使用（浮動小数点数の誤差を避けるため）

**このアプリでの使用例**:

```typescript
import { Category, Product } from "@prisma/client";

// 型安全なデータアクセス
const category: Category = await prisma.category.findUnique({
  where: { id: 1 },
});

const product: Product = await prisma.product.findUnique({
  where: { id: 1 },
});
```

**説明**: Prisma では、モデル間の関連（リレーション）をスキーマで定義します。これにより、関連するデータを簡単に取得できます。

**このアプリでの使用箇所**:

- [`prisma/schema.prisma`](../../prisma/schema.prisma): リレーションの定義

**1 対多のリレーション**:

```prisma
model Category {
  id        Int       @id @default(autoincrement())
  products  Product[] // 複数の商品を持つ
  // ...
}

// Product モデル（多側）
model Product {
  id          Int       @id @default(autoincrement())
  categoryId  Int       @map("category_id")
  category    Category  @relation(fields: [categoryId], references: [id])
  // ...
}
```

- `Category.products`: `Product[]` 型で、このカテゴリーに属するすべての商品を表す
- `Product.category`: `Category` 型で、この商品が属するカテゴリーを表す
- `@relation(fields: [categoryId], references: [id])`: 外部キー関係を定義
  - `fields: [categoryId]`: このモデルの外部キーフィールド
  - `references: [id]`: 参照先のモデルの主キー

**このアプリでの使用例**:

```typescript
const products = await prisma.product.findMany({
  include: {
    category: true, // カテゴリー情報も一緒に取得
  },
});

// カテゴリーとその商品を一緒に取得
const categories = await prisma.category.findMany({
  include: {
    products: true, // このカテゴリーに属する商品も一緒に取得
  },
});
```

- [`app/page.tsx`](../../app/page.tsx): 商品とカテゴリーを一緒に取得
- [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx): 商品とカテゴリーを一緒に取得
- [`app/api/products/route.ts`](../../app/api/products/route.ts): 商品とカテゴリーを一緒に取得

### マイグレーション

**説明**: Prisma 7 のマイグレーション機能は、データベーススキーマの変更をバージョン管理し、安全にデータベースを更新します。スキーマファイルを変更した後、マイグレーションを作成・適用することで、データベースの構造を更新できます。

**このアプリでの使用箇所**:

- **`prisma/migrations/`**: マイグレーションファイルの保存場所
- [`prisma.config.ts`](../../prisma.config.ts): マイグレーションの設定（パス、シードファイル）

**Prisma 7 でのマイグレーション**:

Prisma 7 では、`prisma.config.ts` でマイグレーションの設定を管理します：

```typescript
export default defineConfig({
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
[`prisma.config.ts`](../prisma.config.ts)

```

npm run db:migrate

# 本番環境でマイグレーションを適用

npm run db:migrate:deploy

````

- マイグレーションの設定が [`prisma.config.ts`](../../prisma.config.ts) で管理される
- シードファイルのパスを設定ファイルで指定可能

**このアプリでのマイグレーション例**:

1. **初期スキーマの作成** (`20260101062802_init_products_schema`):

```sql
-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "price_s" DECIMAL(10,2),
    "price_l" DECIMAL(10,2),
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```sql
-- AlterTable
ALTER TABLE "products" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "published_at" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "ended_at" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "display_order" INTEGER;
````

- **バージョン管理**: スキーマの変更履歴を追跡
- **ロールバック**: 問題が発生した場合、以前の状態に戻せる
- **チーム開発**: 複数の開発者が同じスキーマ変更を適用できる
- **本番環境**: 本番環境でも安全にスキーマを更新できる

**マイグレーションコマンド**:

```bash
npm run db:migrate:deploy # 本番環境でマイグレーションを適用
npm run db:push           # スキーマを直接プッシュ（開発環境のみ）
```

**説明**: Prisma は、スキーマファイルから TypeScript の型定義を自動生成します。これにより、コンパイル時に型エラーを検出でき、IDE での自動補完も利用できます。

**このアプリでの使用箇所**:

- `npm run db:generate`: Prisma Client と型定義を生成

**型生成の実行**:

````typescript
export type Category = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: Decimal | null;
  priceL: Decimal | null;
  categoryId: number;
  published: boolean;
  publishedAt: Date | null;
  endedAt: Date | null;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
};
```typescript
import { Product, Category } from "@prisma/client";

const product: Product = await prisma.product.findUnique({
  where: { id: 1 },
});

// 型エラーを検出
console.log(product.name); // OK
console.log(product.invalidField); // コンパイルエラー
````

- スキーマファイル（`schema.prisma`）を変更した後
- 依存関係をインストールした後
- マイグレーションを適用した後

### Prisma Studio

**説明**: Prisma Studio は、データベースの内容を視覚的に確認・編集できる GUI ツールです。ブラウザでデータベースの内容を確認し、データの追加・編集・削除ができます。

**このアプリでの使用箇所**:

- `npm run db:studio`: Prisma Studio を起動

**Prisma Studio の起動**:

- データベースの内容をブラウザで確認
- データの追加・編集・削除
- リレーションの確認
- データの検索・フィルタリング

**このアプリでの使用例**:

```bash
npm run db:studio

# ブラウザで http://localhost:5555 を開く
# カテゴリーや商品のデータを確認・編集できる
```

### シードデータ

**説明**: シードデータは、開発環境やテスト環境で初期データを投入するために使用します。データベースを初期化した後、基本的なカテゴリーや商品データを自動的に投入できます。

**このアプリでの使用箇所**:

- [`prisma/seed.ts`](../../prisma/seed.ts): シードデータのスクリプト
- [`prisma.config.ts`](../../prisma.config.ts): シードファイルのパスを設定

**シードファイルの構成**:

[`prisma/seed.ts`](../../prisma/seed.ts) (行 1-40)

```typescript
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("シードデータの投入を開始します...");

  // カテゴリーの作成
  const category1 = await prisma.category.upsert({
    where: { name: "かき氷" },
    update: {},
    create: {
      name: "かき氷",
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: "その他" },
    update: {},
    create: {
      name: "その他",
    },
  });

  console.log("カテゴリーを作成しました:", category1.name, category2.name);
  console.log("シードデータの投入が完了しました！");
}

main()
  .catch((e) => {
    console.error("シードデータの投入中にエラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**シードデータの実行方法**:

```bash
# シードデータを投入
npm run db:seed
```

**シードファイルの設定**:

[`prisma.config.ts`](../../prisma.config.ts) でシードファイルのパスを指定します：

```typescript
export default defineConfig({
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts", // シードファイルのパス
  },
});
```

**シードデータのベストプラクティス**:

- **`upsert` を使用**: 既存のデータを更新し、存在しない場合は作成（冪等性を保証）
- **エラーハンドリング**: エラーが発生した場合、適切にエラーログを出力
- **接続の切断**: 処理完了後に `prisma.$disconnect()` を呼び出して接続を切断
- **開発環境のみ**: 本番環境ではシードデータを実行しない（手動でデータを投入）

**理由**:

- **開発効率**: 開発環境で毎回同じ初期データを投入でき、開発効率が向上
- **テスト**: テスト環境で一貫したデータを投入でき、テストの再現性が向上
- **冪等性**: `upsert` を使用することで、何度実行しても同じ結果になる

### findMany

**説明**: 複数のレコードを取得します。条件を指定してフィルタリングやソートが可能です。

**基本的な使い方**:

1. **[`app/page.tsx`](../../app/page.tsx) (行 30-34)** - カテゴリー一覧の取得

```30:34
      orderBy: {
        id: "asc",
      },
    }),
```

[`app/page.tsx`](../../app/page.tsx) (行 36-46)

```36:46
      include: {
        category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
      },
      orderBy: {
        displayOrder: {
          sort: "asc",
          nulls: "last", // displayOrderがnullの商品は最後に
        },
      },
    }),
```

[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (行 21-25)

```21:25
      orderBy: {
        id: "asc",
      },
    }),
```

[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (行 27-34)

```27:34
      include: {
        category: true, // 関連するカテゴリー情報も一緒に取得
      },
      orderBy: {
        createdAt: "desc", // 作成日時の降順でソート
      },
    }),
```

[`app/api/products/route.ts`](../../app/api/products/route.ts) (行 31-38)

```31:38
        include: {
          category: true, // 関連するカテゴリー情報も取得
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順でソート（新しい順）
        },
      }),
```

[`app/api/categories/route.ts`](../../app/api/categories/route.ts) (行 20-26)

```20:26
      prisma.category.findMany({
        orderBy: {
          id: 'asc',
        },
      }),
```

- `where`: フィルタリング条件
- `orderBy`: ソート順序
- `include`: 関連データの取得（N+1 問題を回避）
- `select`: 取得するフィールドの指定
- `take`: 取得件数の制限
- `skip`: スキップする件数（ページネーション）

### findUnique

**説明**: 一意のレコードを取得します。`@unique` が設定されているフィールド（主キーやユニーク制約）で検索します。

**基本的な使い方**:

```typescript
  where: { id: 1 },
});
```

1. **[`app/api/products/route.ts`](../../app/api/products/route.ts) (行 87-90)** - カテゴリーの存在確認（商品作成時）

```87:90
    'POST /api/products - category check'
  );
```

        where: { id: productId },
        include: {
          category: true,
        },
      }),

```57:60:app/api/products/[id]/route.ts
    `PUT /api/products/${id} - existence check`
  );
```

      `PUT /api/products/${id} - category check`
    );

```171:174:app/api/products/[id]/route.ts
    `DELETE /api/products/${id} - existence check`
  );
```

- `where`: 検索条件（主キーまたはユニーク制約のフィールド）
- `include`: 関連データの取得
- `select`: 取得するフィールドの指定

### create

**説明**: 新しいレコードを作成します。

**基本的な使い方**:

```typescript
  data: {
    name: "商品名",
    description: "商品説明",
    categoryId: 1,
  },
});
```

1. **[`app/api/products/route.ts`](../../app/api/products/route.ts) (行 115-133)** - 新規商品の作成

```115:133
      prisma.product.create({
        data: {
          name: body.name.trim(), // 前後の空白を削除
          description: body.description.trim(), // 前後の空白を削除
          imageUrl: body.imageUrl || null, // 画像URLが指定されていない場合は null
          priceS: body.priceS ? parseFloat(body.priceS) : null, // 文字列を数値に変換
          priceL: body.priceL ? parseFloat(body.priceL) : null, // 文字列を数値に変換
          categoryId: body.categoryId,
          published, // 自動判定または手動設定された公開状態
          publishedAt,
          endedAt,
        },
        include: {
          category: true, // 作成された商品にカテゴリー情報も含める
        },
      }),
```

- `data`: 作成するデータ
- `include`: 作成後に取得する関連データ
- `select`: 作成後に取得するフィールドの指定

### update

**説明**: 既存のレコードを更新します。

**基本的な使い方**:

```typescript
  where: { id: 1 },
  data: {
    name: "更新された商品名",
  },
});
```

1. **`app/api/products/[id]/route.ts`** - 商品情報の更新

```141:150:app/api/products/[id]/route.ts
      prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
        },
      }),
```

[`app/api/products/reorder/route.ts`](../../app/api/products/reorder/route.ts) (行 22-28)

```22:28
          prisma.product.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
        )
```

- `where`: 更新対象のレコードを指定（主キーまたはユニーク制約）
- `data`: 更新するデータ
- `include`: 更新後に取得する関連データ
- `select`: 更新後に取得するフィールドの指定

### delete

**説明**: レコードを削除します。

**基本的な使い方**:

```typescript
  where: { id: 1 },
});
```

1. **`app/api/products/[id]/route.ts`** - 商品の削除

```192:195:app/api/products/[id]/route.ts
    `DELETE /api/products/${id}`
  );
```

- `where`: 削除対象のレコードを指定（主キーまたはユニーク制約）

### $transaction

**説明**: 複数のデータベース操作をトランザクションとして実行します。すべての操作が成功するか、すべてがロールバックされます。

**基本的な使い方**:

```typescript
  prisma.product.update({ where: { id: 1 }, data: { name: "商品1" } }),
  prisma.product.update({ where: { id: 2 }, data: { name: "商品2" } }),
]);
```

1. **[`app/api/products/reorder/route.ts`](../../app/api/products/reorder/route.ts) (行 19-31)** - 複数商品の表示順序を一括更新

```19:31
    async () => {
      await prisma.$transaction(
        body.productOrders.map((item: { id: number; displayOrder: number }) =>
          prisma.product.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
        )
      );
    },
    'POST /api/products/reorder'
```

- 複数の操作を原子性（atomicity）を保証して実行
- 一括更新や一括削除
- データの整合性を保つ必要がある操作

## クエリオプション

Prisma のクエリ関数では、様々なオプションを使用してデータの取得方法を制御できます。このアプリで実際に使用されているオプションについて説明します。

### where

**説明**: データベースから取得するレコードをフィルタリングするための条件を指定します。主キーやユニーク制約のフィールド、または通常のフィールドで条件を指定できます。

**基本的な使い方**:

```typescript
const product = await prisma.product.findUnique({
  where: { id: 1 },
});

// 条件でフィルタリング
const products = await prisma.product.findMany({
  where: {
    published: true,
    categoryId: 1,
  },
});
```

1. **[`app/api/products/route.ts`](../../app/api/products/route.ts) (行 87-90)** - カテゴリーの存在確認（商品作成時）

```87:90
    'POST /api/products - category check'
  );
```

        where: { id: productId },
        include: {
          category: true,
        },
      }),

```57:60:app/api/products/[id]/route.ts
    `PUT /api/products/${id} - existence check`
  );
```

      `PUT /api/products/${id} - category check`
    );

```171:174:app/api/products/[id]/route.ts
    `DELETE /api/products/${id} - existence check`
  );
```

      prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
        },
      }),

```192:195:app/api/products/[id]/route.ts
    `DELETE /api/products/${id}`
  );
```

[`app/api/products/reorder/route.ts`](../../app/api/products/reorder/route.ts) (行 22-28)

```22:28
          prisma.product.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
        )
```

- `equals`: 等しい（デフォルト）
- `not`: 等しくない
- `in`: 配列内の値に一致
- `notIn`: 配列内の値に一致しない
- `lt`, `lte`, `gt`, `gte`: 数値比較
- `contains`, `startsWith`, `endsWith`: 文字列検索

### orderBy

**説明**: 取得したレコードのソート順序を指定します。単一フィールドまたは複数フィールドでソートできます。また、`null` 値の扱いも指定できます。

**基本的な使い方**:

```typescript
const products = await prisma.product.findMany({
  orderBy: {
    createdAt: "desc", // 降順
  },
});

// 複数フィールドでソート
const products = await prisma.product.findMany({
  orderBy: [{ categoryId: "asc" }, { createdAt: "desc" }],
});

// null値の扱いを指定
const products = await prisma.product.findMany({
  orderBy: {
    displayOrder: {
      sort: "asc",
      nulls: "last", // null値は最後に配置
    },
  },
});
```

1. **[`app/page.tsx`](../../app/page.tsx) (行 30-34)** - カテゴリーを ID 順で取得

```30:34
      orderBy: {
        id: "asc",
      },
    }),
```

[`app/page.tsx`](../../app/page.tsx) (行 36-46)

```36:46
      include: {
        category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
      },
      orderBy: {
        displayOrder: {
          sort: "asc",
          nulls: "last", // displayOrderがnullの商品は最後に
        },
      },
    }),
```

[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (行 21-25)

```21:25
      orderBy: {
        id: "asc",
      },
    }),
```

[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (行 27-34)

```27:34
      include: {
        category: true, // 関連するカテゴリー情報も一緒に取得
      },
      orderBy: {
        createdAt: "desc", // 作成日時の降順でソート
      },
    }),
```

[`app/api/products/route.ts`](../../app/api/products/route.ts) (行 31-38)

```31:38
        include: {
          category: true, // 関連するカテゴリー情報も取得
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順でソート（新しい順）
        },
      }),
```

[`app/api/categories/route.ts`](../../app/api/categories/route.ts) (行 20-26)

```20:26
      prisma.category.findMany({
        orderBy: {
          id: 'asc',
        },
      }),
```

- `"asc"`: 昇順（小さい順）
- `"desc"`: 降順（大きい順）

**null 値の扱い**（Prisma 7 + PostgreSQL）:

- `"first"`: null 値を最初に配置
- `"last"`: null 値を最後に配置（このアプリで使用）

**Prisma 7 での新機能**:

Prisma 7 では、PostgreSQL の `NULLS FIRST` / `NULLS LAST` 構文をサポートしています。これにより、`null` 値の扱いを明示的に制御できます。

**このアプリでの使用例**:

`displayOrder` フィールドが `null` の商品を最後に配置する例：

```typescript
orderBy: {
  displayOrder: {
    sort: "asc",
    nulls: "last", // displayOrderがnullの商品は最後に
  },
}
[`app/page.ts`](../app/page.ts)

```

### include

**説明**: 関連するデータ（リレーション）を一緒に取得します。`include` を使用することで、N+1 問題を回避し、パフォーマンスを向上させます。

**基本的な使い方**:

```typescript
const products = await prisma.product.findMany({
  include: {
    category: true, // カテゴリー情報も一緒に取得
  },
});

// 複数のリレーションを取得
const categories = await prisma.category.findMany({
  include: {
    products: true, // このカテゴリーに属する商品も一緒に取得
  },
});
```

1. **[`app/page.tsx`](../../app/page.tsx) (行 36-46)** - 商品とカテゴリーを一緒に取得

```36:46
      include: {
        category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
      },
      orderBy: {
        displayOrder: {
          sort: "asc",
          nulls: "last", // displayOrderがnullの商品は最後に
        },
      },
    }),
```

[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (行 27-34)

```27:34
      include: {
        category: true, // 関連するカテゴリー情報も一緒に取得
      },
      orderBy: {
        createdAt: "desc", // 作成日時の降順でソート
      },
    }),
```

[`app/api/products/route.ts`](../../app/api/products/route.ts) (行 31-38)

```31:38
        include: {
          category: true, // 関連するカテゴリー情報も取得
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順でソート（新しい順）
        },
      }),
```

[`app/api/products/route.ts`](../../app/api/products/route.ts) (行 115-133)

```115:133
      prisma.product.create({
        data: {
          name: body.name.trim(), // 前後の空白を削除
          description: body.description.trim(), // 前後の空白を削除
          imageUrl: body.imageUrl || null, // 画像URLが指定されていない場合は null
          priceS: body.priceS ? parseFloat(body.priceS) : null, // 文字列を数値に変換
          priceL: body.priceL ? parseFloat(body.priceL) : null, // 文字列を数値に変換
          categoryId: body.categoryId,
          published, // 自動判定または手動設定された公開状態
          publishedAt,
          endedAt,
        },
        include: {
          category: true, // 作成された商品にカテゴリー情報も含める
        },
      }),
```

        where: { id: productId },
        include: {
          category: true,
        },
      }),

```141:150:app/api/products/[id]/route.ts
      prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
        },
      }),
```

- **N+1 問題の回避**: 関連データを一度のクエリで取得できるため、データベースへのクエリ回数を削減
- **パフォーマンス向上**: 複数のクエリを実行するよりも高速
- **コードの簡潔性**: 関連データを簡単に取得できる

**include と select の違い**:

- `include`: すべてのフィールドと指定したリレーションを取得
- `select`: 指定したフィールドとリレーションのみを取得（より細かい制御が可能）

このアプリでは、`include` を使用して関連データを取得しています。

### N+1 問題の詳細解説

`include` オプションを使用することで、N+1 問題を回避できます。N+1 問題について詳しく説明します。

#### N+1 問題とは

**説明**: N+1 問題は、データベースアクセスのパフォーマンス問題の一つです。親レコード（N 件）を取得した後、各レコードの関連データを個別に取得するために、追加で N 回のクエリを実行してしまう問題です。

**問題の発生パターン**:

1. 最初に親レコードを 1 回取得（例: 商品一覧）
2. 各親レコードの関連データを個別に取得（例: 各商品のカテゴリー情報）
3. 結果として、1 + N 回のクエリが実行される

**具体例**:

このアプリケーションで、商品とカテゴリーの関係を例に説明します。

**悪い例: N+1 問題が発生するコード**

```typescript
const products = await prisma.product.findMany();

// N回のクエリ: 各商品のカテゴリー情報を個別に取得
for (const product of products) {
  const category = await prisma.category.findUnique({
    where: { id: product.categoryId },
  });
  // 商品とカテゴリーを使用
}
```

**理由**:

- **クエリ回数の増加**: 商品が 10 件ある場合、合計 11 回（1 + 10）のクエリが実行される。商品が 100 件ある場合、合計 101 回（1 + 100）のクエリが実行される
- **データベースへの負荷**: データベースへの負荷が大幅に増加し、パフォーマンスが悪化する
- **レスポンスタイム**: 各クエリの実行時間が累積され、レスポンスタイムが大幅に遅くなる
- **スケーラビリティ**: データ件数が増えるほどクエリ回数が増加し、パフォーマンスが悪化する

**良い例: N+1 問題を回避するコード**

```typescript
const products = await prisma.product.findMany({
  include: {
    category: true, // カテゴリー情報も一緒に取得
  },
});

// 追加のクエリは不要
for (const product of products) {
  // product.category に既にカテゴリー情報が含まれている
  console.log(product.category.name);
}
```

**理由**:

- **クエリ回数の削減**: 商品が何件あっても、常に 1 回のクエリで完了する
- **データベースへの負荷**: データベースへの負荷が大幅に削減され、パフォーマンスが向上する
- **レスポンスタイム**: クエリ回数が削減され、レスポンスタイムが大幅に向上する
- **スケーラビリティ**: データ件数が増えてもクエリ回数が一定のため、パフォーマンスが安定する

#### N+1 問題の影響

**パフォーマンスへの影響**:

- **クエリ回数の増加**: データ件数に比例してクエリ回数が増加
- **レスポンスタイムの悪化**: 各クエリの実行時間が累積される
- **データベース負荷の増加**: データベースサーバーへの負荷が増加
- **スケーラビリティの問題**: データが増えるほど問題が深刻化

**具体例**:

| 商品数  | N+1 問題あり    | N+1 問題回避 |
| ------- | --------------- | ------------ |
| 10 件   | 11 回のクエリ   | 1 回のクエリ |
| 100 件  | 101 回のクエリ  | 1 回のクエリ |
| 1000 件 | 1001 回のクエリ | 1 回のクエリ |

#### このアプリでの実装

このアプリケーションでは、すべての商品取得処理で `include: { category: true }` を使用して、N+1 問題を完全に回避しています。

**使用箇所**:

- [`app/page.tsx`](../../app/page.tsx): 商品一覧の取得時にカテゴリー情報も一緒に取得
- [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx): 商品一覧の取得時にカテゴリー情報も一緒に取得
- [`app/api/products/route.ts`](../../app/api/products/route.ts): API エンドポイントで商品一覧を返す際にカテゴリー情報も一緒に取得
- [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): 単一商品取得時にもカテゴリー情報を一緒に取得

**ベストプラクティス**:

1. **`include` を使用**: 関連データが必要な場合は、必ず `include` オプションを使用する
2. **必要なデータを事前に取得**: 後から個別に取得するのではなく、最初から一緒に取得する
3. **N+1 問題の回避**: ループ内でクエリを実行せず、`include` で一度に取得する

### select（このアプリでは未使用）

**説明**: 取得するフィールドを指定します。必要なフィールドのみを取得することで、パフォーマンスを向上させることができます。

**このアプリでの使用箇所**: 現在は使用されていません。

**基本的な使い方**:

```typescript
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    priceS: true,
    imageUrl: true,
    // リレーションも取得可能
    category: {
      select: {
        name: true,
      },
    },
  },
});
```

- 必要なデータのみを取得できるため、ネットワーク転送量を削減
- パフォーマンスの向上（特に大量のデータを扱う場合）
- 機密情報を含むフィールドを意図的に除外できる

**使用例**:

```typescript
const productTiles = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    imageUrl: true,
    category: {
      select: {
        name: true,
      },
    },
  },
});

// 商品詳細表示用（すべての情報）
const productDetails = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    category: true,
  },
});
```

- 商品情報は比較的少ないデータ量のため、すべてのフィールドを取得してもパフォーマンスへの影響が小さい
- `include`を使用してカテゴリー情報も一緒に取得する方が、コードがシンプルで保守しやすい
- 商品データの構造が比較的シンプルで、不要なフィールドが少ない

### take と skip（このアプリでは未使用）

**説明**: ページネーションを実装するために使用します。`take` は取得件数を、`skip` はスキップする件数を指定します。

**このアプリでの使用箇所**: 現在は使用されていません。

**基本的な使い方**:

```typescript
const products = await prisma.product.findMany({
  take: 10,
  orderBy: { createdAt: "desc" },
});

// 11件目から20件目を取得（ページネーション）
const page = 2;
const pageSize = 10;
const products = await prisma.product.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: "desc" },
  include: {
    category: true,
  },
});
```

- 大量のデータを分割して取得できる
- ページネーション機能の実装が容易
- メモリ使用量を削減できる
- 初期表示を高速化できる

**使用例**:

```typescript
async function getProducts(page: number = 1, pageSize: number = 20) {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    }),
    prisma.product.count(), // 総件数を取得
  ]);

  return {
    products,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}
```

- 商品数が比較的少ないため、ページネーションが不要
- すべての商品を一度に取得してもパフォーマンスへの影響が小さい
- ユーザーがすべての商品を一度に確認できる方が使いやすい
- カテゴリーごとの表示で、各カテゴリーの商品数はさらに少ない

## エラーハンドリング

このアプリでは、Prisma 操作を `safePrismaOperation` 関数でラップして、エラーを統一された形式で処理しています。

**このアプリでの使用箇所**:

- [`lib/prisma.ts`](../../lib/prisma.ts): `safePrismaOperation` 関数の定義
- すべての API Routes で使用（`app/api/**/*.ts`）

**使用例**:

```typescript
const products = await safePrismaOperation(
  () => prisma.product.findMany(),
  "GET /api/products"
);
```

- エラーを `DatabaseError` に統一
- エラーログの自動記録
- コンテキスト情報の付与

## 型安全性

Prisma は、スキーマから TypeScript の型定義を自動生成します。これにより、コンパイル時に型エラーを検出できます。

**このアプリでの使用例**:

```typescript
const product: Product = await prisma.product.findUnique({
  where: { id: 1 },
});

// 型安全なプロパティアクセス
console.log(product.name); // OK
console.log(product.invalidField); // コンパイルエラー
```

データベーススキーマの変更は、Prisma のマイグレーション機能で管理します。

**このアプリでの使用箇所**:

- `prisma/migrations/`: マイグレーションファイルの保存場所

**マイグレーションコマンド**:

```bash
npm run db:migrate:deploy # 本番環境でマイグレーションを適用
npm run db:push           # スキーマを直接プッシュ（開発環境のみ）
```

### アダプターの使用

**説明**: Prisma 7 では、データベースプロバイダーごとに専用のアダプターを使用します。これにより、サーバーレス環境でのパフォーマンスが向上し、接続管理が最適化されます。

**このアプリでの実装**:

- `@prisma/adapter-neon`: Neon（PostgreSQL）用のアダプター
- WebSocket の設定により、Node.js 環境でも正しく動作

### 設定ファイルの管理

**説明**: Prisma 7 では、[`prisma.config.ts`](../../prisma.config.ts) で設定を管理します。これにより、スキーマファイルと設定を分離し、より柔軟な設定が可能になります。

**このアプリでの実装**:

- [`prisma.config.ts`](../../prisma.config.ts): スキーマパス、マイグレーションパス、シードファイルを設定
- 環境変数から自動的に接続情報を読み込み

### パフォーマンスの最適化

**説明**: Prisma 7 では、以下の最適化が行われています：

- **バンドルサイズの縮小**: 不要なコードの削除により、バンドルサイズが削減
- **クエリ実行速度の向上**: クエリエンジンの改善により、実行速度が向上
- **接続プールの最適化**: アダプターによる接続プールの管理が改善

## まとめ

このアプリケーションでは、**Prisma 7.2.0** を使用して以下の操作を行っています：

1. **データの取得**: `findMany`, `findUnique` を使用して商品やカテゴリーを取得
2. **データの作成**: `create` を使用して新規商品を作成
3. **データの更新**: `update` を使用して商品情報を更新
4. **データの削除**: `delete` を使用して商品を削除
5. **トランザクション**: `$transaction` を使用して複数の操作を原子性を保証して実行

**Prisma 7 の特徴を活用**:

- **アダプターシステム**: `@prisma/adapter-neon` を使用して Neon に接続
- **設定ファイル**: [`prisma.config.ts`](../../prisma.config.ts) で設定を管理
- **PostgreSQL 拡張機能**: `orderBy` での `nulls` オプションを使用
- **パフォーマンス**: アダプターによる接続管理の最適化

すべての操作は `safePrismaOperation` でラップされ、統一されたエラーハンドリングが行われています。また、`include` オプションを使用して N+1 問題を回避し、パフォーマンスを最適化しています。

## 参考リンク

- **[TypeScript ガイド](./typescript-guide.md)**: Prisma との型統合の詳細
- **[App Router ガイド](./app-router-guide.md)**: Server Components での Prisma の使用方法
- **[ユーティリティ関数ガイド](./utilities-guide.md)**: Blob Storage ユーティリティの詳細
- **[Prisma & Blob セットアップガイド](../setup-prisma-blob.md)**: Prisma と Blob Storage のセットアップ方法
- **[Prisma 公式ドキュメント](https://www.prisma.io/docs)**: Prisma の包括的なドキュメント
- **[Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)**: Prisma Client の API リファレンス
