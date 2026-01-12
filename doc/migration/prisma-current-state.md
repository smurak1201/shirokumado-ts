# Prisma 現状使用状況

このドキュメントは、Drizzle 移行のために現在の Prisma 使用状況を記録したものです。

## スキーマ定義

### データベース

- **プロバイダー**: PostgreSQL (Vercel Neon)
- **接続方法**: `@prisma/adapter-neon` を使用

### テーブル構造

#### Category (カテゴリー)

```prisma
model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("categories")
}
```

**フィールド**:

- `id`: Int (主キー、自動インクリメント)
- `name`: String (ユニーク)
- `products`: Product[] (リレーション)
- `createdAt`: DateTime (作成日時、自動設定)
- `updatedAt`: DateTime (更新日時、自動更新)

**マッピング**: `categories` テーブル

#### Product (商品)

```prisma
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

**フィールド**:

- `id`: Int (主キー、自動インクリメント)
- `name`: String (必須)
- `description`: String (必須、Text 型)
- `imageUrl`: String? (オプショナル、`image_url`カラム)
- `priceS`: Decimal? (オプショナル、`price_s`カラム、Decimal(10,2))
- `priceL`: Decimal? (オプショナル、`price_l`カラム、Decimal(10,2))
- `categoryId`: Int (必須、`category_id`カラム)
- `category`: Category (リレーション)
- `published`: Boolean (デフォルト: true)
- `publishedAt`: DateTime? (オプショナル、`published_at`カラム)
- `endedAt`: DateTime? (オプショナル、`ended_at`カラム)
- `displayOrder`: Int? (オプショナル、`display_order`カラム)
- `createdAt`: DateTime (作成日時、自動設定、`created_at`カラム)
- `updatedAt`: DateTime (更新日時、自動更新、`updated_at`カラム)

**マッピング**: `products` テーブル

**リレーション**:

- `category`: Category (多対一、`categoryId`で参照)

## Prisma Client の設定

### ファイル: `lib/prisma.ts`

**主な機能**:

1. Prisma Client のシングルトンインスタンス管理
2. Neon アダプターを使用した接続
3. WebSocket 設定（Node.js 環境用）
4. エラーハンドリング (`safePrismaOperation`)

**エクスポート**:

- `prisma`: PrismaClient インスタンス
- `safePrismaOperation<T>`: エラーハンドリング付き Prisma 操作
- `disconnectPrisma()`: 接続切断

## API ルートでの使用状況

### 1. `/api/categories` (GET)

**ファイル**: `app/api/categories/route.ts`

**使用パターン**:

```typescript
prisma.category.findMany({
  orderBy: {
    id: "asc",
  },
});
```

**特徴**:

- シンプルな findMany
- orderBy で id の昇順ソート
- リレーションなし

### 2. `/api/products` (GET)

**ファイル**: `app/api/products/route.ts`

**使用パターン**:

```typescript
prisma.product.findMany({
  include: {
    category: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});
```

**特徴**:

- findMany with include
- カテゴリー情報も一緒に取得（N+1 問題回避）
- createdAt の降順ソート

### 3. `/api/products` (POST)

**ファイル**: `app/api/products/route.ts`

**使用パターン**:

```typescript
// カテゴリーの存在確認
prisma.category.findUnique({ where: { id: body.categoryId } });

// 商品の作成
prisma.product.create({
  data: {
    name: body.name.trim(),
    description: body.description.trim(),
    imageUrl: body.imageUrl || null,
    priceS: body.priceS ? parseFloat(body.priceS) : null,
    priceL: body.priceL ? parseFloat(body.priceL) : null,
    categoryId: body.categoryId,
    published,
    publishedAt,
    endedAt,
  },
  include: {
    category: true,
  },
});
```

**特徴**:

- findUnique でカテゴリーの存在確認
- create with include
- データの前処理（trim、parseFloat など）

### 4. `/api/products/[id]` (GET)

**ファイル**: `app/api/products/[id]/route.ts`

**使用パターン**:

```typescript
prisma.product.findUnique({
  where: { id: productId },
  include: {
    category: true,
  },
});
```

**特徴**:

- findUnique with include
- カテゴリー情報も一緒に取得

### 5. `/api/products/[id]` (PUT)

**ファイル**: `app/api/products/[id]/route.ts`

**使用パターン**:

```typescript
// 商品の存在確認
prisma.product.findUnique({ where: { id: productId } });

// カテゴリーの存在確認（指定されている場合）
prisma.category.findUnique({ where: { id: body.categoryId } });

// 商品の更新
prisma.product.update({
  where: { id: productId },
  data: updateData,
  include: {
    category: true,
  },
});
```

**特徴**:

- 部分更新（undefined のフィールドは更新しない）
- findUnique で存在確認
- update with include

### 6. `/api/products/[id]` (DELETE)

**ファイル**: `app/api/products/[id]/route.ts`

**使用パターン**:

```typescript
// 商品の存在確認
prisma.product.findUnique({ where: { id: productId } });

// 商品の削除
prisma.product.delete({ where: { id: productId } });
```

**特徴**:

- findUnique で存在確認
- delete 操作

### 7. `/api/products/reorder` (POST)

**ファイル**: `app/api/products/reorder/route.ts`

**使用パターン**:

```typescript
prisma.$transaction(
  body.productOrders.map((item: { id: number; displayOrder: number }) =>
    prisma.product.update({
      where: { id: item.id },
      data: { displayOrder: item.displayOrder },
    })
  )
);
```

**特徴**:

- トランザクション使用
- 複数の update を一括実行
- 配列の map を使用

## サーバーコンポーネントでの使用状況

### `app/page.tsx` (ホームページ)

**使用パターン**:

```typescript
// 並列取得（Promise.all使用）
const [categories, products] = await Promise.all([
  // カテゴリーをID順で取得
  prisma.category.findMany({
    orderBy: {
      id: "asc",
    },
  }),
  // 商品をカテゴリー情報を含めて取得
  prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      displayOrder: {
        sort: "asc",
        nulls: "last", // displayOrderがnullの商品は最後に
      },
    },
  }),
]);
```

**特徴**:

- `Promise.all`で並列取得（パフォーマンス向上）
- findMany with include（N+1 問題回避）
- `displayOrder`で昇順ソート（`nulls: "last"`オプション使用）
- 公開商品のフィルタリング（`calculatePublishedStatus`を使用）
- カテゴリーごとのグループ化
- データ変換（Decimal → Number）
- サーバーコンポーネントから直接データベースアクセス

**データ変換**:

- `priceS`, `priceL`: Decimal 型を Number 型に変換

**特殊な処理**:

- 公開商品のみをフィルタリング（`publishedAt`/`endedAt`に基づく自動判定）
- カテゴリーごとにグループ化
- 商品がないカテゴリーは除外

### `app/dashboard/page.tsx` (ダッシュボード)

**使用パターン**:

```typescript
// 並列取得（Promise.all使用）
const [categories, products] = await Promise.all([
  // カテゴリーをID順で取得
  prisma.category.findMany({
    orderBy: {
      id: "asc",
    },
  }),
  // 商品をカテゴリー情報を含めて取得
  prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  }),
]);
```

**特徴**:

- `Promise.all`で並列取得（パフォーマンス向上）
- findMany with include（N+1 問題回避）
- createdAt で降順ソート
- データ変換（Decimal → Number、Date → ISO 文字列）
- サーバーコンポーネントから直接データベースアクセス

**データ変換**:

- `priceS`, `priceL`: Decimal 型を Number 型に変換
- `publishedAt`, `endedAt`: Date 型を ISO 文字列に変換

## 使用している Prisma 機能

### クエリ関数

- ✅ `findMany` - 複数件取得
- ✅ `findUnique` - ユニークキーで 1 件取得
- ✅ `create` - 作成
- ✅ `update` - 更新
- ✅ `delete` - 削除
- ✅ `$transaction` - トランザクション

### クエリオプション

- ✅ `where` - 条件指定
- ✅ `include` - リレーション取得
- ✅ `orderBy` - ソート
  - ✅ 基本的なソート（`asc`, `desc`）
  - ✅ `nulls` オプション（`nulls: "last"` - `app/page.tsx`で使用）
- ✅ `data` - 作成・更新データ

### 未使用の機能（API ルート・サーバーコンポーネント）

- ❌ `findFirst` - 未使用
- ❌ `findFirstOrThrow` - 未使用
- ❌ `count` - 未使用
- ❌ `aggregate` - 未使用
- ❌ `groupBy` - 未使用
- ❌ `select` - 未使用（include のみ）
- ❌ `take` / `skip` - 未使用（ページネーションなし）
- ❌ `$queryRaw` - 未使用（Raw SQL なし）

### 使用している機能（seed.ts のみ）

- ✅ `upsert` - シードデータの作成時に使用

## 型定義の使用

### Prisma が生成する型

- `Category` - カテゴリーモデル
- `Product` - 商品モデル
- `PrismaClient` - Prisma Client 型

### リレーションを含む型

- `Product & { category: Category }` - include 使用時

## マイグレーション履歴

### 既存のマイグレーション

1. `20260101062802_init_products_schema` - 初期スキーマ作成
2. `20260101082609_add_published_field` - published フィールド追加
3. `20250101000000_remove_tags` / `20260101214559_remove_tags` - tags 削除

## エラーハンドリング

### `safePrismaOperation` の使用

すべての Prisma 操作で `safePrismaOperation` を使用:

```typescript
await safePrismaOperation(
  () => prisma.product.findMany({ ... }),
  'GET /api/products'
)
```

**機能**:

- エラーを `DatabaseError` に変換
- エラーログの記録
- コンテキスト情報の付与

## 環境変数

- `DATABASE_URL` - PostgreSQL 接続文字列
- `POSTGRES_URL` - 代替接続文字列（DATABASE_URL がない場合）

## 依存関係

### Prisma 関連

- `@prisma/client`: ^7.2.0
- `prisma`: ^7.2.0
- `@prisma/adapter-neon`: ^7.2.0
- `@neondatabase/serverless`: ^1.0.2
- `ws`: ^8.18.3 (WebSocket 用)

## シードデータ

### ファイル: `prisma/seed.ts`

**使用パターン**:

```typescript
// カテゴリーの作成（upsert使用）
prisma.category.upsert({
  where: { name: "かき氷" },
  update: {},
  create: {
    name: "かき氷",
  },
});
```

**特徴**:

- `upsert`を使用（存在しない場合は作成、存在する場合は更新）
- ユニークキー（name）で検索
- シンプルなカテゴリー作成のみ

**作成されるデータ**:

- カテゴリー: 'かき氷'
- カテゴリー: 'その他'

## サーバーコンポーネントでの使用状況（詳細）

### `app/dashboard/page.tsx`

**使用パターン**:

```typescript
// 並列取得（Promise.all使用）
const [categories, products] = await Promise.all([
  // カテゴリーをID順で取得
  prisma.category.findMany({
    orderBy: {
      id: "asc",
    },
  }),
  // 商品をカテゴリー情報を含めて取得
  prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  }),
]);
```

**特徴**:

- `Promise.all`で並列取得（パフォーマンス向上）
- findMany with include（N+1 問題回避）
- データ変換（Decimal → Number、Date → ISO 文字列）

**データ変換**:

- `priceS`, `priceL`: Decimal 型を Number 型に変換
- `publishedAt`, `endedAt`: Date 型を ISO 文字列に変換

## シードデータ

### ファイル: `prisma/seed.ts`

**使用パターン**:

```typescript
// カテゴリーの作成（upsert使用）
prisma.category.upsert({
  where: { name: "かき氷" },
  update: {},
  create: {
    name: "かき氷",
  },
});
```

**特徴**:

- `upsert`を使用（存在しない場合は作成、存在する場合は更新）
- ユニークキー（name）で検索
- シンプルなカテゴリー作成のみ

**作成されるデータ**:

- カテゴリー: 'かき氷'
- カテゴリー: 'その他'

## 更新履歴

- 2025-01-XX: 現状使用状況の記録開始
- 2025-01-XX: seed.ts とサーバーコンポーネントの詳細を追加
