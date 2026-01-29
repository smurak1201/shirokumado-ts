# Async/Await ガイド

## このドキュメントの役割

このドキュメントは「**非同期処理の書き方**」を説明します。Promise、async/await、並列処理など、非同期処理の基礎を理解したいときに参照してください。

**関連ドキュメント**:
- [開発ガイドライン](../development-guide.md#prisma): Prisma での非同期データベース操作
- [App Router ガイド](./app-router-guide.md): Server Components でのデータフェッチ

## 目次

- [概要](#概要)
- [Promise とは](#promise-とは)
- [async/await の基本](#asyncawait-の基本)
  - [async 関数](#async-関数)
  - [await キーワード](#await-キーワード)
  - [戻り値の型](#戻り値の型)
- [エラーハンドリング](#エラーハンドリング)
  - [try-catch ブロック](#try-catch-ブロック)
  - [エラーの種類](#エラーの種類)
- [Promise の便利なメソッド](#promise-の便利なメソッド)
  - [Promise.all](#promiseall---このアプリで使用中)
  - [Promise.allSettled](#promiseallsettled---このアプリでは未使用)
  - [Promise.race](#promiserace---このアプリでは未使用)
  - [Promise.any](#promiseany---このアプリでは未使用)
- [このアプリでの使用例](#このアプリでの使用例)
  - [Server Components でのデータフェッチング](#server-components-でのデータフェッチング)
  - [API Routes での非同期処理](#api-routes-での非同期処理)
  - [Prisma でのデータベース操作](#prisma-でのデータベース操作)
  - [並列データフェッチング](#並列データフェッチング)
- [ベストプラクティス](#ベストプラクティス)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

`async/await` は、JavaScript/TypeScript で非同期処理を記述するための構文です。Promise をより読みやすく、同期的なコードのように書くことができます。

このアプリケーションでは、**async/await** を使用して以下の処理を実装しています：

- **Server Components**: データベースからのデータ取得
- **API Routes**: リクエストの処理とレスポンスの生成
- **Prisma**: データベース操作
- **並列処理**: 複数の非同期処理を同時に実行

**async/await の主な特徴**:

- **読みやすさ**: Promise チェーンよりも読みやすいコード
- **エラーハンドリング**: try-catch ブロックでエラーを処理可能
- **型安全性**: TypeScript で型推論が効く
- **デバッグ**: スタックトレースが分かりやすい

## Promise とは

`Promise` は、非同期処理の結果を表現するオブジェクトです。非同期処理が完了したとき（成功または失敗）に値を返します。

**Promise の状態**:

- **pending**: 処理がまだ完了していない状態
- **fulfilled**: 処理が成功して完了した状態
- **rejected**: 処理が失敗した状態

**基本的な Promise**:

```typescript
// Promise を作成
const promise = new Promise((resolve, reject) => {
  // 非同期処理
  setTimeout(() => {
    resolve("成功");
  }, 1000);
});

// Promise の結果を取得
promise.then((value) => {
  console.log(value); // "成功"
});
```

**このアプリでの使用例**:

Prisma の操作はすべて Promise を返します。

```typescript
// Prisma の操作は Promise を返す
const productPromise = prisma.product.findUnique({
  where: { id: 1 },
});

// Promise の結果を取得
productPromise.then((product) => {
  console.log(product);
});
```

## async/await の基本

### async 関数

`async` キーワードを関数の前に付けると、その関数は非同期関数になります。非同期関数は常に Promise を返します。

**基本的な構文**:

```typescript
async function fetchData() {
  // 非同期処理
  return "データ";
}

// 使用例
const data = await fetchData();
```

**このアプリでの使用箇所**:

1. **Server Components** ([`app/page.tsx`](../../app/page.tsx))

```typescript
async function getPublishedProductsByCategory(): Promise<
  CategoryWithProducts[]
> {
  // データベースからデータを取得
  const [categories, products] = await Promise.all([
    prisma.category.findMany({...}),
    prisma.product.findMany({...})
  ]);
  // ...
}
```

2. **API Routes** ([`app/api/products/route.ts`](../../app/api/products/route.ts))

```typescript
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  // データベースに保存
  const product = await prisma.product.create({...});
  return apiSuccess({ product });
});
```

### await キーワード

`await` キーワードは、Promise が完了するまで待機します。`await` は `async` 関数内でのみ使用できます。

**基本的な構文**:

```typescript
async function example() {
  // Promise が完了するまで待機
  const result = await someAsyncFunction();
  console.log(result); // Promise の結果が表示される
}
```

**このアプリでの使用例**:

1. **データベース操作** ([`lib/prisma.ts`](../../lib/prisma.ts))

```typescript
const product = await prisma.product.findUnique({
  where: { id: 1 },
});
```

2. **API リクエスト** ([`app/api/products/route.ts`](../../app/api/products/route.ts))

```typescript
const body = await request.json();
```

3. **ファイルアップロード** ([`lib/blob.ts`](../../lib/blob.ts))

```typescript
const blob = await uploadImage("products/image.jpg", buffer, "image/jpeg");
```

### 戻り値の型

`async` 関数は常に Promise を返すため、戻り値の型は `Promise<T>` になります。

**型の指定方法**:

```typescript
// 明示的に型を指定
async function fetchData(): Promise<string> {
  return "データ";
}

// 型推論を活用（推奨）
async function fetchData() {
  return "データ"; // Promise<string> と推論される
}
```

**このアプリでの使用例**:

[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (`getDashboardData`関数)

```typescript
async function getDashboardData(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  const [categories, products] = await Promise.all([...]);
  return { categories, products };
}
```

## エラーハンドリング

### try-catch ブロック

`async/await` では、`try-catch` ブロックでエラーを処理します。

**基本的な構文**:

```typescript
async function example() {
  try {
    const result = await someAsyncFunction();
    return result;
  } catch (error) {
    console.error("エラーが発生しました:", error);
    throw error; // エラーを再スロー
  }
}
```

**このアプリでの使用例**:

1. **Server Components** ([`app/page.tsx`](../../app/page.tsx))

```typescript
async function getPublishedProductsByCategory(): Promise<
  CategoryWithProducts[]
> {
  try {
    const [categories, products] = await Promise.all([...]);
    // ...
  } catch (error) {
    console.error("商品データの取得に失敗しました:", error);
    return []; // エラー時は空配列を返す
  }
}
```

2. **API Routes** ([`lib/api-helpers.ts`](../../lib/api-helpers.ts))

このアプリでは、`withErrorHandling` 関数を使用して統一されたエラーハンドリングを実装しています。

```typescript
export const POST = withErrorHandling(async (request: NextRequest) => {
  // try-catch は withErrorHandling 内で自動的に処理される
  const body = await request.json();
  const product = await prisma.product.create({...});
  return apiSuccess({ product });
});
```

### エラーの種類

このアプリでは、統一されたエラークラスを使用しています。

**エラークラス** ([`lib/errors.ts`](../../lib/errors.ts)):

- `ValidationError`: バリデーションエラー（400）
- `NotFoundError`: リソースが見つからない（404）
- `DatabaseError`: データベースエラー（500）
- `BlobStorageError`: Blob Storage エラー（500）

**使用例**:

```typescript
import { ValidationError, NotFoundError } from "@/lib/errors";

async function getProduct(id: number) {
  if (!id) {
    throw new ValidationError("商品IDは必須です");
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundError("商品");
  }

  return product;
}
```

## Promise の便利なメソッド

### Promise.all - **このアプリで使用中**

`Promise.all` は、複数の Promise を並列で実行し、すべてが完了するまで待機します。すべての Promise が成功した場合のみ成功とみなされます。

**基本的な構文**:

```typescript
const [result1, result2] = await Promise.all([
  asyncFunction1(),
  asyncFunction2(),
]);
```

**このアプリでの使用箇所**:

1. **Server Components** ([`app/page.tsx`](../../app/page.tsx))

```typescript
// カテゴリーと商品を並列で取得（パフォーマンス向上）
const [categories, products] = await Promise.all([
  // カテゴリーをID順で取得
  prisma.category.findMany({
    orderBy: { id: "asc" },
  }),
  // 商品をカテゴリー情報を含めて取得
  prisma.product.findMany({
    include: { category: true },
    orderBy: { displayOrder: { sort: "asc", nulls: "last" } },
  }),
]);
```

2. **ダッシュボード** ([`app/dashboard/page.tsx`](../../app/dashboard/page.tsx))

```typescript
const [categoriesList, productsList] = await Promise.all([
  safePrismaOperation(
    () => prisma.category.findMany({ orderBy: { id: "asc" } }),
    "getDashboardData - categories"
  ),
  safePrismaOperation(
    () =>
      prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
    "getDashboardData - products"
  ),
]);
```

**メリット**:

- **パフォーマンス**: 複数の処理を並列で実行できるため、処理時間が短縮される
- **N+1 問題の回避**: 関連データを一度に取得できる

**注意点**:

- 1 つでも Promise が失敗すると、全体が失敗する
- すべての Promise が完了するまで待機する

### Promise.allSettled - **このアプリでは未使用**

`Promise.allSettled` は、すべての Promise が完了するまで待機しますが、成功・失敗に関わらずすべての結果を返します。

**このアプリでの使用状況**: 現在、このアプリでは `Promise.allSettled` は使用されていませんが、一部の処理が失敗しても続行したい場合に有用です。

**基本的な構文**:

```typescript
const results = await Promise.allSettled([asyncFunction1(), asyncFunction2()]);

results.forEach((result) => {
  if (result.status === "fulfilled") {
    console.log("成功:", result.value);
  } else {
    console.error("失敗:", result.reason);
  }
});
```

**使用例**:

```typescript
// 複数のファイルをアップロード（一部が失敗しても続行）
const results = await Promise.allSettled([
  uploadFile("file1.jpg", buffer1),
  uploadFile("file2.jpg", buffer2),
  uploadFile("file3.jpg", buffer3),
]);

const successful = results
  .filter((r) => r.status === "fulfilled")
  .map((r) => r.value);
```

**メリット**:

- **部分的な成功を許容**: 一部の処理が失敗しても、成功した結果を取得できる
- **エラーハンドリング**: 各処理の成功・失敗を個別に処理できる

**使用例**:

- 複数のファイルをアップロードする際、一部が失敗しても成功したファイルを保存したい場合
- 複数の API エンドポイントからデータを取得し、一部が失敗しても利用可能なデータを使用したい場合

### Promise.race - **このアプリでは未使用**

`Promise.race` は、複数の Promise のうち、最初に完了したものの結果を返します。

**このアプリでの使用状況**: 現在、このアプリでは `Promise.race` は使用されていませんが、タイムアウト処理やフォールバック処理に使用できます。

**基本的な構文**:

```typescript
const result = await Promise.race([asyncFunction1(), asyncFunction2()]);
```

**使用例**:

```typescript
// タイムアウト処理
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("タイムアウト")), 5000)
);

try {
  const result = await Promise.race([fetchData(), timeout]);
  console.log(result);
} catch (error) {
  console.error("タイムアウトまたはエラー:", error);
}
```

**メリット**:

- **タイムアウト処理**: 一定時間内に完了しない処理をキャンセルできる
- **フォールバック処理**: 複数の処理のうち、最初に成功したものを使用できる

**使用例**:

- API リクエストにタイムアウトを設定したい場合
- 複数のデータソースから最初に取得できたデータを使用したい場合

### Promise.any - **このアプリでは未使用**

`Promise.any` は、複数の Promise のうち、最初に**成功した**ものの結果を返します。すべての Promise が失敗した場合のみ失敗とみなされます。

**基本的な構文**:

```typescript
const result = await Promise.any([asyncFunction1(), asyncFunction2()]);
```

**使用例**:

```typescript
// 複数のAPIエンドポイントから最初に成功したデータを取得
try {
  const result = await Promise.any([
    fetchFromPrimaryAPI(),
    fetchFromBackupAPI(),
    fetchFromCacheAPI(),
  ]);
  console.log("データ取得成功:", result);
} catch (error) {
  // すべてのAPIが失敗した場合
  console.error("すべてのデータソースが失敗しました:", error);
}
```

**このアプリでの使用状況**: 現在、このアプリでは `Promise.any` は使用されていませんが、フォールバック処理や冗長性のあるデータ取得に使用できます。

**Promise.race との違い**:

- **Promise.race**: 最初に完了したもの（成功・失敗に関わらず）を返す
- **Promise.any**: 最初に**成功した**ものを返す（すべて失敗した場合のみ失敗）

**使用例**:

- 複数の CDN から画像を取得し、最初に成功したものを使用したい場合
- プライマリとバックアップの API からデータを取得し、最初に成功したものを使用したい場合

## このアプリでの使用例

### Server Components でのデータフェッチング

Server Components では、`async/await` を使用してデータベースから直接データを取得できます。

**このアプリでの使用箇所**:

[`lib/products.ts`](../../lib/products.ts) (`getPublishedProductsByCategory`関数)

```typescript
async function getPublishedProductsByCategory(): Promise<
  CategoryWithProducts[]
> {
  try {
    // カテゴリーと商品を並列で取得（パフォーマンス向上）
    const [categoriesList, productsList] = await Promise.all([
      safePrismaOperation(
        () =>
          prisma.category.findMany({
            orderBy: { id: "asc" },
          }),
        "getPublishedProductsByCategory - categories"
      ),
      safePrismaOperation(
        () =>
          prisma.product.findMany({
            include: { category: true },
            orderBy: [
              {
                displayOrder: {
                  sort: "asc",
                  nulls: "last",
                },
              },
            ],
          }),
        "getPublishedProductsByCategory - products"
      ),
    ]);

    // データの処理...
    return processedData;
  } catch (error) {
    log.error("公開商品の取得に失敗しました", {
      context: "getPublishedProductsByCategory",
      error,
    });
    throw error;
  }
}
```

**詳細は [App Router ガイド - Server Components でのデータフェッチング](./app-router-guide.md#server-components-でのデータフェッチング) を参照してください。**

### API Routes での非同期処理

API Routes では、`async/await` を使用してリクエストを処理し、レスポンスを生成します。

**このアプリでの使用箇所**:

[`app/api/products/route.ts`](../../app/api/products/route.ts) (`POST`エクスポート)

```typescript
export const POST = withErrorHandling(async (request: NextRequest) => {
  // リクエストボディを取得
  const body = await request.json();

  // バリデーション
  if (!body.name || typeof body.name !== "string") {
    throw new ValidationError("商品名は必須です");
  }

  // データベースに保存
  const product = await prisma.product.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || "",
      // ...
    },
  });

  return apiSuccess({ product });
});
```

**詳細は [App Router ガイド - API Routes](./app-router-guide.md#api-routes) を参照してください。**

### Prisma でのデータベース操作

Prisma の操作はすべて Promise を返すため、`async/await` を使用します。

**このアプリでの使用例**:

1. **データの取得** ([`lib/prisma.ts`](../../lib/prisma.ts))

```typescript
const product = await prisma.product.findUnique({
  where: { id: 1 },
});
```

2. **データの作成** ([`app/api/products/route.ts`](../../app/api/products/route.ts))

```typescript
const product = await prisma.product.create({
  data: {
    name: "商品名",
    description: "商品説明",
    // ...
  },
});
```

3. **トランザクション** ([`doc/development-guide.md`](../development-guide.md))

```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.order.create({ data: { userId: user.id, ...orderData } });
});
```

**詳細は [Prisma ガイド](./prisma-guide.md) を参照してください。**

### 並列データフェッチング

`Promise.all` を使用して、複数のデータを並列で取得します。

**このアプリでの使用例**:

[`app/page.tsx`](../../app/page.tsx) (`getPublishedProductsByCategory`関数)

```typescript
// カテゴリーと商品を並列で取得
const [categories, products] = await Promise.all([
  prisma.category.findMany({ orderBy: { id: "asc" } }),
  prisma.product.findMany({
    include: { category: true },
    orderBy: { displayOrder: { sort: "asc", nulls: "last" } },
  }),
]);
```

**メリット**:

- **パフォーマンス**: シーケンシャルな処理よりも高速
- **N+1 問題の回避**: 関連データを一度に取得できる

## ベストプラクティス

### 1. async/await を優先

**推奨**: Promise チェーンよりも `async/await` を使用します。

```typescript
// 良い例: async/await
async function fetchData() {
  const data = await fetch("/api/data");
  const json = await data.json();
  return json;
}

// 避ける: Promise チェーン
function fetchData() {
  return fetch("/api/data")
    .then((data) => data.json())
    .then((json) => json);
}
```

**理由**:

- **読みやすさ**: 同期的なコードのように読みやすい
- **エラーハンドリング**: try-catch でエラーを処理できる
- **デバッグ**: スタックトレースが分かりやすい

### 2. 並列処理を活用

**推奨**: 独立した非同期処理は `Promise.all` で並列実行します。

```typescript
// 良い例: 並列処理
const [categories, products] = await Promise.all([
  prisma.category.findMany(),
  prisma.product.findMany(),
]);

// 避ける: シーケンシャル処理
const categories = await prisma.category.findMany();
const products = await prisma.product.findMany();
```

**理由**:

- **パフォーマンス**: 処理時間が短縮される
- **効率性**: リソースを効率的に使用できる

### 3. エラーハンドリングを適切に実装

**推奨**: try-catch ブロックでエラーを処理します。

```typescript
// 良い例: エラーハンドリング
async function fetchData() {
  try {
    const data = await fetch("/api/data");
    return await data.json();
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
    throw error;
  }
}
```

**理由**:

- **エラーの可視性**: エラーが適切に処理される
- **デバッグ**: エラーの原因を特定しやすい
- **ユーザー体験**: 適切なエラーメッセージを表示できる

### 4. 型を明示的に指定

**推奨**: 戻り値の型を明示的に指定します（特に複雑な型の場合）。

```typescript
// 良い例: 型を明示
async function getDashboardData(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  // ...
}

// 型推論が十分な場合は省略可能
async function getProduct(id: number) {
  return await prisma.product.findUnique({ where: { id } });
}
```

**理由**:

- **型安全性**: コンパイル時に型エラーを検出できる
- **可読性**: 関数の戻り値が明確になる
- **IDE サポート**: 自動補完が効く

### 5. 統一されたエラーハンドリング

**推奨**: このアプリでは `withErrorHandling` を使用します。

```typescript
// 良い例: withErrorHandling
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const product = await prisma.product.create({ data: body });
  return apiSuccess({ product });
});
```

**理由**:

- **一貫性**: すべての API Routes で統一されたエラーハンドリング
- **コードの簡潔性**: try-catch を書く必要がない
- **保守性**: エラーハンドリングのロジックを一箇所で管理

## まとめ

このアプリケーションでは、**async/await** を使用して以下の機能を実装しています：

1. **Server Components**: データベースからのデータ取得
2. **API Routes**: リクエストの処理とレスポンスの生成
3. **Prisma**: データベース操作
4. **並列処理**: `Promise.all` を使用した複数の非同期処理の並列実行

**このアプリでの Promise メソッドの使用状況**:

- **Promise.all**: **使用中** - Server Components やダッシュボードで並列データフェッチングに使用
- **Promise.allSettled**: **未使用** - 一部の処理が失敗しても続行したい場合に有用
- **Promise.race**: **未使用** - タイムアウト処理やフォールバック処理に使用可能
- **Promise.any**: **未使用** - 複数のデータソースから最初に成功したものを取得する場合に有用

**async/await の主なメリット**:

- **読みやすさ**: Promise チェーンよりも読みやすいコード
- **エラーハンドリング**: try-catch ブロックでエラーを処理可能
- **型安全性**: TypeScript で型推論が効く
- **パフォーマンス**: `Promise.all` を使用した並列処理で高速化

すべての非同期処理は `async/await` を使用して実装され、統一されたエラーハンドリングにより、コードの品質と保守性が向上しています。

## 参考リンク

- **[TypeScript ガイド](./typescript-guide.md)**: TypeScript での async/await の型定義
- **[App Router ガイド](./app-router-guide.md)**: Server Components でのデータフェッチング
- **[Prisma ガイド](./prisma-guide.md)**: Prisma での非同期処理
- **[開発ガイド](../development-guide.md)**: コーディング規約とベストプラクティス
- **[MDN - async function](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function)**: async 関数の詳細な説明
- **[MDN - await](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/await)**: await 演算子の詳細な説明
- **[MDN - Promise](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise)**: Promise の詳細な説明
