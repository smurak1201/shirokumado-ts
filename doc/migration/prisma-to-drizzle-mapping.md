# Prisma → Drizzle 移行マッピング

このドキュメントは、Prisma のクエリを Drizzle のクエリに変換する際のマッピング表です。

## 基本概念の対応

| Prisma                      | Drizzle                      | 説明                    |
| --------------------------- | ---------------------------- | ----------------------- |
| `prisma.model.findMany()`   | `db.query.model.findMany()`  | 複数件取得              |
| `prisma.model.findUnique()` | `db.query.model.findFirst()` | ユニークキーで 1 件取得 |
| `prisma.model.create()`     | `db.insert(model).values()`  | 作成                    |
| `prisma.model.update()`     | `db.update(model).set()`     | 更新                    |
| `prisma.model.delete()`     | `db.delete(model)`           | 削除                    |
| `prisma.$transaction()`     | `db.transaction()`           | トランザクション        |

## クエリオプションの対応

### where 条件

**Prisma**:

```typescript
prisma.product.findUnique({
  where: { id: productId },
});
```

**Drizzle**:

```typescript
db.query.product.findFirst({
  where: eq(product.id, productId),
});
```

### include (リレーション取得)

**Prisma**:

```typescript
prisma.product.findMany({
  include: {
    category: true,
  },
});
```

**Drizzle**:

```typescript
db.query.product.findMany({
  with: {
    category: true,
  },
});
```

### orderBy (ソート)

**Prisma**:

```typescript
prisma.product.findMany({
  orderBy: {
    createdAt: "desc",
  },
});
```

**Drizzle**:

```typescript
db.query.product.findMany({
  orderBy: [desc(product.createdAt)],
});
```

または

```typescript
db.select().from(product).orderBy(desc(product.createdAt));
```

### orderBy with nulls オプション

**Prisma** (`app/page.tsx`):

```typescript
prisma.product.findMany({
  orderBy: {
    displayOrder: {
      sort: "asc",
      nulls: "last", // null値は最後に配置
    },
  },
});
```

**Drizzle**:

```typescript
db.query.product.findMany({
  orderBy: [ascNullsLast(product.displayOrder)],
});
```

または

```typescript
import { ascNullsLast } from "drizzle-orm";

db.select().from(product).orderBy(ascNullsLast(product.displayOrder));
```

**注意**: Drizzle では`ascNullsLast`/`descNullsLast`/`ascNullsFirst`/`descNullsFirst`を使用します。

## 具体的な移行例

### 1. カテゴリー一覧取得

**Prisma** (`app/api/categories/route.ts`):

```typescript
prisma.category.findMany({
  orderBy: {
    id: "asc",
  },
});
```

**Drizzle**:

```typescript
db.query.category.findMany({
  orderBy: [asc(category.id)],
});
```

または

```typescript
db.select().from(category).orderBy(asc(category.id));
```

### 2. 商品一覧取得（カテゴリー情報含む）

**Prisma** (`app/api/products/route.ts`):

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

**Drizzle**:

```typescript
db.query.product.findMany({
  with: {
    category: true,
  },
  orderBy: [desc(product.createdAt)],
});
```

### 3. 商品作成（カテゴリー情報含む）

**Prisma** (`app/api/products/route.ts`):

```typescript
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

**Drizzle**:

```typescript
const [createdProduct] = await db
  .insert(product)
  .values({
    name: body.name.trim(),
    description: body.description.trim(),
    imageUrl: body.imageUrl || null,
    priceS: body.priceS ? parseFloat(body.priceS) : null,
    priceL: body.priceL ? parseFloat(body.priceL) : null,
    categoryId: body.categoryId,
    published,
    publishedAt,
    endedAt,
  })
  .returning();

// カテゴリー情報も取得
const productWithCategory = await db.query.product.findFirst({
  where: eq(product.id, createdProduct.id),
  with: {
    category: true,
  },
});
```

### 4. 商品更新（部分更新）

**Prisma** (`app/api/products/[id]/route.ts`):

```typescript
prisma.product.update({
  where: { id: productId },
  data: updateData,
  include: {
    category: true,
  },
});
```

**Drizzle**:

```typescript
const [updatedProduct] = await db
  .update(product)
  .set(updateData)
  .where(eq(product.id, productId))
  .returning();

// カテゴリー情報も取得
const productWithCategory = await db.query.product.findFirst({
  where: eq(product.id, updatedProduct.id),
  with: {
    category: true,
  },
});
```

### 5. 商品削除

**Prisma** (`app/api/products/[id]/route.ts`):

```typescript
prisma.product.delete({ where: { id: productId } });
```

**Drizzle**:

```typescript
await db.delete(product).where(eq(product.id, productId));
```

### 6. トランザクション（商品順序更新）

**Prisma** (`app/api/products/reorder/route.ts`):

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

**Drizzle**:

```typescript
await db.transaction(async (tx) => {
  for (const item of body.productOrders) {
    await tx
      .update(product)
      .set({ displayOrder: item.displayOrder })
      .where(eq(product.id, item.id));
  }
});
```

または、並列実行:

```typescript
await db.transaction(async (tx) => {
  await Promise.all(
    body.productOrders.map((item) =>
      tx
        .update(product)
        .set({ displayOrder: item.displayOrder })
        .where(eq(product.id, item.id))
    )
  );
});
```

## 型定義の対応

### Prisma 型

**Prisma**:

```typescript
import { Product, Category } from "@prisma/client";

type ProductWithCategory = Product & {
  category: Category;
};
```

**Drizzle**:

```typescript
import { product, category } from "@/lib/db/schema";

type ProductWithCategory = typeof product.$inferSelect & {
  category: typeof category.$inferSelect;
};
```

または、Drizzle のリレーションクエリから推論:

```typescript
const productWithCategory = await db.query.product.findFirst({
  with: { category: true },
});

type ProductWithCategory = typeof productWithCategory;
```

## エラーハンドリングの対応

### Prisma

```typescript
await safePrismaOperation(
  () => prisma.product.findMany({ ... }),
  'GET /api/products'
)
```

### Drizzle

```typescript
// safePrismaOperationの代わりに、try-catchまたは新しいヘルパー関数を使用
try {
  const products = await db.query.product.findMany({ ... });
  return products;
} catch (error) {
  logError(error, 'GET /api/products');
  throw new DatabaseError('Failed to execute database operation', error);
}
```

または、新しいヘルパー関数を作成:

```typescript
// lib/db/index.ts
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    throw new DatabaseError(
      `Failed to execute database operation${context ? ` in ${context}` : ""}`,
      error
    );
  }
}
```

## 注意事項

1. **リレーション取得**: Drizzle では `include` の代わりに `with` を使用
2. **ソート**: Drizzle では配列形式で指定（`[desc(...)]`）
3. **部分更新**: Drizzle では `set()` にオブジェクトを渡す（undefined のフィールドは自動的に除外されないため、明示的に処理が必要な場合あり）
4. **トランザクション**: Drizzle ではコールバック形式
5. **型推論**: Drizzle では `$inferSelect` や `$inferInsert` を使用

## 更新履歴

- 2025-01-XX: 移行マッピングの作成
