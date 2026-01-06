# Prisma ガイド

## 概要

Prisma は、モダンなアプリケーション開発のための次世代 ORM（Object-Relational Mapping）です。型安全なデータベースアクセスと、直感的な API を提供します。

このアプリケーションでは、Prisma を使用して PostgreSQL（Vercel Neon）に接続し、商品情報やカテゴリー情報などのデータを管理しています。

## Prisma Client の初期化

Prisma Client は `lib/prisma.ts` でシングルトンインスタンスとして管理されています。

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
```

**このアプリでの使用箇所**:

- `lib/prisma.ts`: Prisma Client の初期化とエクスポート
- すべての Server Components と API Routes で `import { prisma } from '@/lib/prisma'` として使用

## ORM としての機能

### データベーススキーマ定義

**説明**: Prisma では、`prisma/schema.prisma` ファイルでデータベーススキーマを定義します。このファイルは、データベースのテーブル構造、フィールド、リレーション、制約などを宣言的に記述します。

**このアプリでの使用箇所**:

- `prisma/schema.prisma`: データベーススキーマの定義

**スキーマファイルの構成**:

```prisma
// prisma/schema.prisma

// Generator: Prisma Client の生成設定
generator client {
  provider = "prisma-client-js"
}

// Datasource: データベース接続設定
datasource db {
  provider = "postgresql"
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
```

**スキーマの主な要素**:

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
- `@db.Text`: データベースの型を指定（長いテキスト）
- `@db.Decimal(10, 2)`: データベースの型を指定（10 桁、小数点以下 2 桁）

**このアプリでの使用例**:

```typescript
// スキーマから生成された型を使用
import { Category, Product } from "@prisma/client";

// 型安全なデータアクセス
const category: Category = await prisma.category.findUnique({
  where: { id: 1 },
});

const product: Product = await prisma.product.findUnique({
  where: { id: 1 },
});
```

### リレーション（関連）

**説明**: Prisma では、モデル間の関連（リレーション）をスキーマで定義します。これにより、関連するデータを簡単に取得できます。

**このアプリでの使用箇所**:

- `prisma/schema.prisma`: リレーションの定義

**1 対多のリレーション**:

```prisma
// Category モデル（1側）
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

**リレーションの説明**:

- `Category.products`: `Product[]` 型で、このカテゴリーに属するすべての商品を表す
- `Product.category`: `Category` 型で、この商品が属するカテゴリーを表す
- `@relation(fields: [categoryId], references: [id])`: 外部キー関係を定義
  - `fields: [categoryId]`: このモデルの外部キーフィールド
  - `references: [id]`: 参照先のモデルの主キー

**このアプリでの使用例**:

```typescript
// 商品とカテゴリーを一緒に取得（N+1問題を回避）
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

**使用箇所**:

- `app/page.tsx`: 商品とカテゴリーを一緒に取得
- `app/dashboard/page.tsx`: 商品とカテゴリーを一緒に取得
- `app/api/products/route.ts`: 商品とカテゴリーを一緒に取得

### マイグレーション

**説明**: Prisma のマイグレーション機能は、データベーススキーマの変更をバージョン管理し、安全にデータベースを更新します。スキーマファイルを変更した後、マイグレーションを作成・適用することで、データベースの構造を更新できます。

**このアプリでの使用箇所**:

- `prisma/migrations/`: マイグレーションファイルの保存場所

**マイグレーションの作成と適用**:

```bash
# マイグレーションを作成（スキーマの変更を検出）
npm run db:migrate

# 本番環境でマイグレーションを適用
npm run db:migrate:deploy
```

**このアプリでのマイグレーション例**:

1. **初期スキーマの作成** (`20260101062802_init_products_schema`):

```sql
-- prisma/migrations/20260101062802_init_products_schema/migration.sql

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
```

2. **公開フィールドの追加** (`20260101082609_add_published_field`):

```sql
-- prisma/migrations/20260101082609_add_published_field/migration.sql

-- AlterTable
ALTER TABLE "products" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "published_at" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "ended_at" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "display_order" INTEGER;
```

**マイグレーションのメリット**:

- **バージョン管理**: スキーマの変更履歴を追跡
- **ロールバック**: 問題が発生した場合、以前の状態に戻せる
- **チーム開発**: 複数の開発者が同じスキーマ変更を適用できる
- **本番環境**: 本番環境でも安全にスキーマを更新できる

**マイグレーションコマンド**:

```bash
npm run db:migrate        # マイグレーションを作成・適用
npm run db:migrate:deploy # 本番環境でマイグレーションを適用
npm run db:push           # スキーマを直接プッシュ（開発環境のみ）
```

### 型生成

**説明**: Prisma は、スキーマファイルから TypeScript の型定義を自動生成します。これにより、コンパイル時に型エラーを検出でき、IDE での自動補完も利用できます。

**このアプリでの使用箇所**:

- `npm run db:generate`: Prisma Client と型定義を生成

**型生成の実行**:

```bash
npm run db:generate
```

**生成される型**:

```typescript
// @prisma/client から自動生成される型

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
```

**このアプリでの使用例**:

```typescript
// 型安全なデータアクセス
import { Product, Category } from "@prisma/client";

const product: Product = await prisma.product.findUnique({
  where: { id: 1 },
});

// 型エラーを検出
console.log(product.name); // ✅ OK
console.log(product.invalidField); // ❌ コンパイルエラー
```

**型生成のタイミング**:

- スキーマファイル（`schema.prisma`）を変更した後
- 依存関係をインストールした後
- マイグレーションを適用した後

### Prisma Studio

**説明**: Prisma Studio は、データベースの内容を視覚的に確認・編集できる GUI ツールです。ブラウザでデータベースの内容を確認し、データの追加・編集・削除ができます。

**このアプリでの使用箇所**:

- `npm run db:studio`: Prisma Studio を起動

**Prisma Studio の起動**:

```bash
npm run db:studio
```

**機能**:

- データベースの内容をブラウザで確認
- データの追加・編集・削除
- リレーションの確認
- データの検索・フィルタリング

**このアプリでの使用例**:

```bash
# Prisma Studio を起動
npm run db:studio

# ブラウザで http://localhost:5555 を開く
# カテゴリーや商品のデータを確認・編集できる
```

## Prisma 関数の説明と使用例

### findMany

**説明**: 複数のレコードを取得します。条件を指定してフィルタリングやソートが可能です。

**基本的な使い方**:

```typescript
const products = await prisma.product.findMany();
```

**このアプリでの使用箇所**:

1. **`app/page.tsx`** - カテゴリー一覧の取得

```30:34:app/page.tsx
    prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    }),
```

2. **`app/page.tsx`** - 商品一覧の取得（カテゴリー情報を含む）

```36:46:app/page.tsx
    prisma.product.findMany({
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

3. **`app/dashboard/page.tsx`** - カテゴリー一覧の取得

```21:25:app/dashboard/page.tsx
    prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    }),
```

4. **`app/dashboard/page.tsx`** - 商品一覧の取得（カテゴリー情報を含む）

```27:34:app/dashboard/page.tsx
    prisma.product.findMany({
      include: {
        category: true, // 関連するカテゴリー情報も一緒に取得
      },
      orderBy: {
        createdAt: "desc", // 作成日時の降順でソート
      },
    }),
```

5. **`app/api/products/route.ts`** - 商品一覧の取得（API エンドポイント）

```31:38:app/api/products/route.ts
      prisma.product.findMany({
        include: {
          category: true, // 関連するカテゴリー情報も取得
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順でソート（新しい順）
        },
      }),
```

6. **`app/api/categories/route.ts`** - カテゴリー一覧の取得（API エンドポイント）

```16:20:app/api/categories/route.ts
      prisma.category.findMany({
        orderBy: {
          id: 'asc',
        },
      }),
```

**主なオプション**:

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
const product = await prisma.product.findUnique({
  where: { id: 1 },
});
```

**このアプリでの使用箇所**:

1. **`app/api/products/route.ts`** - カテゴリーの存在確認（商品作成時）

```87:90:app/api/products/route.ts
    () => prisma.category.findUnique({ where: { id: body.categoryId } }),
    'POST /api/products - category check'
  );
```

2. **`app/api/products/[id]/route.ts`** - 商品の取得（GET エンドポイント）

```25:30:app/api/products/[id]/route.ts
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
        },
      }),
```

3. **`app/api/products/[id]/route.ts`** - 商品の存在確認（更新時）

```57:60:app/api/products/[id]/route.ts
    () => prisma.product.findUnique({ where: { id: productId } }),
    `PUT /api/products/${id} - existence check`
  );
```

4. **`app/api/products/[id]/route.ts`** - カテゴリーの存在確認（更新時）

```85:88:app/api/products/[id]/route.ts
      () => prisma.category.findUnique({ where: { id: body.categoryId } }),
      `PUT /api/products/${id} - category check`
    );
```

5. **`app/api/products/[id]/route.ts`** - 商品の存在確認（削除時）

```171:174:app/api/products/[id]/route.ts
    () => prisma.product.findUnique({ where: { id: productId } }),
    `DELETE /api/products/${id} - existence check`
  );
```

**主なオプション**:

- `where`: 検索条件（主キーまたはユニーク制約のフィールド）
- `include`: 関連データの取得
- `select`: 取得するフィールドの指定

### create

**説明**: 新しいレコードを作成します。

**基本的な使い方**:

```typescript
const product = await prisma.product.create({
  data: {
    name: "商品名",
    description: "商品説明",
    categoryId: 1,
  },
});
```

**このアプリでの使用箇所**:

1. **`app/api/products/route.ts`** - 新規商品の作成

```115:133:app/api/products/route.ts
    () =>
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

**主なオプション**:

- `data`: 作成するデータ
- `include`: 作成後に取得する関連データ
- `select`: 作成後に取得するフィールドの指定

### update

**説明**: 既存のレコードを更新します。

**基本的な使い方**:

```typescript
const product = await prisma.product.update({
  where: { id: 1 },
  data: {
    name: "更新された商品名",
  },
});
```

**このアプリでの使用箇所**:

1. **`app/api/products/[id]/route.ts`** - 商品情報の更新

```141:150:app/api/products/[id]/route.ts
    () =>
      prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
        },
      }),
```

2. **`app/api/products/reorder/route.ts`** - 商品の表示順序の更新（トランザクション内）

```23:26:app/api/products/reorder/route.ts
          prisma.product.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
```

**主なオプション**:

- `where`: 更新対象のレコードを指定（主キーまたはユニーク制約）
- `data`: 更新するデータ
- `include`: 更新後に取得する関連データ
- `select`: 更新後に取得するフィールドの指定

### delete

**説明**: レコードを削除します。

**基本的な使い方**:

```typescript
await prisma.product.delete({
  where: { id: 1 },
});
```

**このアプリでの使用箇所**:

1. **`app/api/products/[id]/route.ts`** - 商品の削除

```192:195:app/api/products/[id]/route.ts
    () => prisma.product.delete({ where: { id: productId } }),
    `DELETE /api/products/${id}`
  );
```

**主なオプション**:

- `where`: 削除対象のレコードを指定（主キーまたはユニーク制約）

### $transaction

**説明**: 複数のデータベース操作をトランザクションとして実行します。すべての操作が成功するか、すべてがロールバックされます。

**基本的な使い方**:

```typescript
await prisma.$transaction([
  prisma.product.update({ where: { id: 1 }, data: { name: "商品1" } }),
  prisma.product.update({ where: { id: 2 }, data: { name: "商品2" } }),
]);
```

**このアプリでの使用箇所**:

1. **`app/api/products/reorder/route.ts`** - 複数商品の表示順序を一括更新

```19:29:app/api/products/reorder/route.ts
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
```

**主な用途**:

- 複数の操作を原子性（atomicity）を保証して実行
- 一括更新や一括削除
- データの整合性を保つ必要がある操作

## クエリオプション

Prisma のクエリ関数では、様々なオプションを使用してデータの取得方法を制御できます。このアプリで実際に使用されているオプションについて説明します。

### where

**説明**: データベースから取得するレコードをフィルタリングするための条件を指定します。主キーやユニーク制約のフィールド、または通常のフィールドで条件を指定できます。

**基本的な使い方**:

```typescript
// 主キーで検索
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

**このアプリでの使用箇所**:

1. **`app/api/products/route.ts`** - カテゴリーの存在確認（商品作成時）

```87:90:app/api/products/route.ts
    () => prisma.category.findUnique({ where: { id: body.categoryId } }),
    'POST /api/products - category check'
  );
```

2. **`app/api/products/[id]/route.ts`** - 商品の取得（GET エンドポイント）

```25:30:app/api/products/[id]/route.ts
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
        },
      }),
```

3. **`app/api/products/[id]/route.ts`** - 商品の存在確認（更新時）

```57:60:app/api/products/[id]/route.ts
    () => prisma.product.findUnique({ where: { id: productId } }),
    `PUT /api/products/${id} - existence check`
  );
```

4. **`app/api/products/[id]/route.ts`** - カテゴリーの存在確認（更新時）

```85:88:app/api/products/[id]/route.ts
      () => prisma.category.findUnique({ where: { id: body.categoryId } }),
      `PUT /api/products/${id} - category check`
    );
```

5. **`app/api/products/[id]/route.ts`** - 商品の存在確認（削除時）

```171:174:app/api/products/[id]/route.ts
    () => prisma.product.findUnique({ where: { id: productId } }),
    `DELETE /api/products/${id} - existence check`
  );
```

6. **`app/api/products/[id]/route.ts`** - 商品の更新

```141:150:app/api/products/[id]/route.ts
    () =>
      prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
        },
      }),
```

7. **`app/api/products/[id]/route.ts`** - 商品の削除

```192:195:app/api/products/[id]/route.ts
    () => prisma.product.delete({ where: { id: productId } }),
    `DELETE /api/products/${id}`
  );
```

8. **`app/api/products/reorder/route.ts`** - 商品の表示順序の更新（トランザクション内）

```23:26:app/api/products/reorder/route.ts
          prisma.product.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
```

**主な演算子**:

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
// 単一フィールドでソート
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

**このアプリでの使用箇所**:

1. **`app/page.tsx`** - カテゴリーを ID 順で取得

```30:34:app/page.tsx
    prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    }),
```

2. **`app/page.tsx`** - 商品を表示順序でソート（null 値は最後に）

```36:46:app/page.tsx
    prisma.product.findMany({
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

3. **`app/dashboard/page.tsx`** - カテゴリーを ID 順で取得

```21:25:app/dashboard/page.tsx
    prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    }),
```

4. **`app/dashboard/page.tsx`** - 商品を作成日時の降順でソート

```27:34:app/dashboard/page.tsx
    prisma.product.findMany({
      include: {
        category: true, // 関連するカテゴリー情報も一緒に取得
      },
      orderBy: {
        createdAt: "desc", // 作成日時の降順でソート
      },
    }),
```

5. **`app/api/products/route.ts`** - 商品を作成日時の降順でソート

```31:38:app/api/products/route.ts
      prisma.product.findMany({
        include: {
          category: true, // 関連するカテゴリー情報も取得
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順でソート（新しい順）
        },
      }),
```

6. **`app/api/categories/route.ts`** - カテゴリーを ID 順で取得

```16:20:app/api/categories/route.ts
      prisma.category.findMany({
        orderBy: {
          id: 'asc',
        },
      }),
```

**ソート順序**:

- `"asc"`: 昇順（小さい順）
- `"desc"`: 降順（大きい順）

**null 値の扱い**（PostgreSQL のみ）:

- `"first"`: null 値を最初に配置
- `"last"`: null 値を最後に配置（このアプリで使用）

**このアプリでの使用例**:

`displayOrder` フィールドが `null` の商品を最後に配置する例：

```typescript
// app/page.tsx
orderBy: {
  displayOrder: {
    sort: "asc",
    nulls: "last", // displayOrderがnullの商品は最後に
  },
}
```

これにより、表示順序が設定されている商品が先に表示され、設定されていない商品は最後に表示されます。

### include

**説明**: 関連するデータ（リレーション）を一緒に取得します。`include` を使用することで、N+1 問題を回避し、パフォーマンスを向上させます。

**基本的な使い方**:

```typescript
// 単一のリレーションを取得
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

**このアプリでの使用箇所**:

1. **`app/page.tsx`** - 商品とカテゴリーを一緒に取得

```36:46:app/page.tsx
    prisma.product.findMany({
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

2. **`app/dashboard/page.tsx`** - 商品とカテゴリーを一緒に取得

```27:34:app/dashboard/page.tsx
    prisma.product.findMany({
      include: {
        category: true, // 関連するカテゴリー情報も一緒に取得
      },
      orderBy: {
        createdAt: "desc", // 作成日時の降順でソート
      },
    }),
```

3. **`app/api/products/route.ts`** - 商品とカテゴリーを一緒に取得

```31:38:app/api/products/route.ts
      prisma.product.findMany({
        include: {
          category: true, // 関連するカテゴリー情報も取得
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順でソート（新しい順）
        },
      }),
```

4. **`app/api/products/route.ts`** - 商品作成時にカテゴリー情報も含める

```115:133:app/api/products/route.ts
    () =>
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

5. **`app/api/products/[id]/route.ts`** - 商品取得時にカテゴリー情報も含める

```25:30:app/api/products/[id]/route.ts
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
        },
      }),
```

6. **`app/api/products/[id]/route.ts`** - 商品更新時にカテゴリー情報も含める

```141:150:app/api/products/[id]/route.ts
    () =>
      prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
        },
      }),
```

**メリット**:

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

**❌ 悪い例: N+1 問題が発生するコード**

```typescript
// 1回目のクエリ: 商品一覧を取得
const products = await prisma.product.findMany();

// N回のクエリ: 各商品のカテゴリー情報を個別に取得
for (const product of products) {
  const category = await prisma.category.findUnique({
    where: { id: product.categoryId },
  });
  // 商品とカテゴリーを使用
}
```

**問題点**:

- 商品が 10 件ある場合、合計 11 回（1 + 10）のクエリが実行される
- 商品が 100 件ある場合、合計 101 回（1 + 100）のクエリが実行される
- データベースへの負荷が大幅に増加
- レスポンスタイムが遅くなる

**✅ 良い例: N+1 問題を回避するコード**

```typescript
// 1回のクエリ: 商品とカテゴリーを一緒に取得
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

**改善点**:

- 商品が何件あっても、常に 1 回のクエリで完了
- データベースへの負荷が大幅に削減
- レスポンスタイムが向上

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

- `app/page.tsx`: 商品一覧の取得時にカテゴリー情報も一緒に取得
- `app/dashboard/page.tsx`: 商品一覧の取得時にカテゴリー情報も一緒に取得
- `app/api/products/route.ts`: API エンドポイントで商品一覧を返す際にカテゴリー情報も一緒に取得
- `app/api/products/[id]/route.ts`: 単一商品取得時にもカテゴリー情報を一緒に取得

**ベストプラクティス**:

1. **`include` を使用**: 関連データが必要な場合は、必ず `include` オプションを使用する
2. **必要なデータを事前に取得**: 後から個別に取得するのではなく、最初から一緒に取得する
3. **クエリの最適化**: 不要なデータは取得しない（`select` を使用）

### select（このアプリでは未使用）

**説明**: 取得するフィールドを指定します。必要なフィールドのみを取得することで、パフォーマンスを向上させることができます。

**基本的な使い方**:

```typescript
// 特定のフィールドのみを取得
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    priceS: true,
  },
});
```

**このアプリでの使用箇所**: 現在は使用されていません。

**使用する場合のメリット**:

- 必要なデータのみを取得できるため、ネットワーク転送量を削減
- パフォーマンスの向上（特に大量のデータを扱う場合）

### take と skip（このアプリでは未使用）

**説明**: ページネーションを実装するために使用します。`take` は取得件数を、`skip` はスキップする件数を指定します。

**基本的な使い方**:

```typescript
// 最初の10件を取得
const products = await prisma.product.findMany({
  take: 10,
});

// 11件目から20件目を取得（ページネーション）
const products = await prisma.product.findMany({
  skip: 10,
  take: 10,
});
```

**このアプリでの使用箇所**: 現在は使用されていません。

**使用する場合のメリット**:

- 大量のデータを分割して取得できる
- ページネーション機能の実装が容易

## エラーハンドリング

このアプリでは、Prisma 操作を `safePrismaOperation` 関数でラップして、エラーを統一された形式で処理しています。

**このアプリでの使用箇所**:

- `lib/prisma.ts`: `safePrismaOperation` 関数の定義
- すべての API Routes で使用（`app/api/**/*.ts`）

**使用例**:

```typescript
import { safePrismaOperation } from "@/lib/prisma";

const products = await safePrismaOperation(
  () => prisma.product.findMany(),
  "GET /api/products"
);
```

**メリット**:

- エラーを `DatabaseError` に統一
- エラーログの自動記録
- コンテキスト情報の付与

## 型安全性

Prisma は、スキーマから TypeScript の型定義を自動生成します。これにより、コンパイル時に型エラーを検出できます。

**このアプリでの使用例**:

```typescript
// Prisma が生成した型を使用
const product: Product = await prisma.product.findUnique({
  where: { id: 1 },
});

// 型安全なプロパティアクセス
console.log(product.name); // ✅ OK
console.log(product.invalidField); // ❌ コンパイルエラー
```

**型生成コマンド**:

```bash
npm run db:generate
```

## マイグレーション

データベーススキーマの変更は、Prisma のマイグレーション機能で管理します。

**このアプリでの使用箇所**:

- `prisma/migrations/`: マイグレーションファイルの保存場所

**マイグレーションコマンド**:

```bash
npm run db:migrate        # マイグレーションを作成・適用
npm run db:migrate:deploy # 本番環境でマイグレーションを適用
npm run db:push           # スキーマを直接プッシュ（開発環境のみ）
```

## まとめ

このアプリケーションでは、Prisma を使用して以下の操作を行っています：

1. **データの取得**: `findMany`, `findUnique` を使用して商品やカテゴリーを取得
2. **データの作成**: `create` を使用して新規商品を作成
3. **データの更新**: `update` を使用して商品情報を更新
4. **データの削除**: `delete` を使用して商品を削除
5. **トランザクション**: `$transaction` を使用して複数の操作を原子性を保証して実行

すべての操作は `safePrismaOperation` でラップされ、統一されたエラーハンドリングが行われています。また、`include` オプションを使用して N+1 問題を回避し、パフォーマンスを最適化しています。
