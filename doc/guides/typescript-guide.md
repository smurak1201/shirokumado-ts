# TypeScript ガイド

## 目次

- [概要](#概要)
- [TypeScript とは](#typescript-とは)
- [設定ファイル](#設定ファイル)
  - [tsconfig.json](#tsconfigjson)
- [型定義](#型定義)
  - [フロントエンドの型定義](#フロントエンドの型定義)
  - [ダッシュボードの型定義](#ダッシュボードの型定義)
- [型安全性の実装](#型安全性の実装)
  - [コンポーネントの Props の型定義](#コンポーネントの-props-の型定義)
  - [関数の型定義](#関数の型定義)
  - [ユニオン型と null 許容型](#ユニオン型と-null-許容型)
- [Prisma との統合](#prisma-との統合)
  - [型生成](#型生成)
- [API Routes での型安全性](#api-routes-での型安全性)
  - [リクエストの型定義](#リクエストの型定義)
  - [レスポンスの型定義](#レスポンスの型定義)
- [エラーハンドリングでの型安全性](#エラーハンドリングでの型安全性)
- [型推論](#型推論)
  - [変数の型推論](#変数の型推論)
  - [関数の戻り値の型推論](#関数の戻り値の型推論)
  - [配列の型推論](#配列の型推論)
- [ジェネリクス](#ジェネリクス)
  - [ジェネリクスとは](#ジェネリクスとは)
  - [関数のジェネリクス](#関数のジェネリクス)
  - [インターフェースのジェネリクス](#インターフェースのジェネリクス)
  - [制約付きジェネリクス](#制約付きジェネリクス)
  - [ジェネリクスの使い分け](#ジェネリクスの使い分け)
- [型の使い分け](#型の使い分け)
  - [interface vs type](#interface-vs-type)
  - [型の分離](#型の分離)
- [型安全性のベストプラクティス](#型安全性のベストプラクティス)
  - [1. 型定義の一元管理](#1-型定義の一元管理)
  - [2. null 許容型の明示](#2-null-許容型の明示)
  - [3. 型推論の活用](#3-型推論の活用)
  - [4. 厳格な型チェック](#4-厳格な型チェック)
  - [5. ジェネリクスの活用](#5-ジェネリクスの活用)
  - [6. Prisma との統合](#6-prisma-との統合)
  - [7. エラーハンドリングの型安全性](#7-エラーハンドリングの型安全性)
- [このアプリでの TypeScript の使用例まとめ](#このアプリでの-typescript-の使用例まとめ)
  - [型定義の構成](#型定義の構成)
  - [型安全性の実装](#型安全性の実装-1)
  - [Prisma との統合](#prisma-との統合-1)
  - [設定ファイル](#設定ファイル-1)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

TypeScript は、Microsoft が開発した JavaScript の型付きスーパーセットです。JavaScript に静的型付けを追加することで、大規模なアプリケーション開発を支援します。

このアプリケーションでは、**TypeScript 5** を使用して、フロントエンドとバックエンドの両方で型安全性を確保し、開発効率とコード品質を向上させています。

**TypeScript の主な特徴**:

- **型安全性**: コンパイル時に型エラーを検出し、実行時エラーを事前に防止
- **IDE サポート**: 優れた自動補完とリファクタリング機能により、開発効率を向上
- **段階的導入**: JavaScript コードをそのまま TypeScript として実行可能
- **最新の JavaScript 機能**: ES6+ の機能をサポートし、モダンな開発が可能
- **エコシステム**: 多くのライブラリが TypeScript の型定義を提供

## TypeScript とは

TypeScript は、JavaScript に静的型付けを追加したプログラミング言語です。コンパイル時に型チェックを行うことで、実行時エラーを事前に検出し、コードの品質を向上させます。

**主な特徴**:

- **静的型付け**: 変数や関数に型を指定し、コンパイル時に型エラーを検出
- **型推論**: 型を明示的に指定しなくても、コンパイラが型を推論
- **型エイリアスとインターフェース**: 複雑な型を定義し、再利用可能にする
- **ジェネリクス**: 型をパラメータ化し、汎用的なコードを記述
- **ユニオン型とインターセクション型**: 複数の型を組み合わせて新しい型を定義

**このアプリでの使われ方**:

- フロントエンドとバックエンドの両方で TypeScript を使用し、型安全性を確保
- [`app/types.ts`](../../app/types.ts) と [`app/dashboard/types.ts`](../../app/dashboard/types.ts) で型定義を一元管理
- Prisma の型生成機能と統合し、データベーススキーマから自動的に型を生成
- API Routes のリクエスト・レスポンスの型を定義し、エンドポイント間の型安全性を確保
- カスタムフックやユーティリティ関数にも型を適用し、コードの品質を向上

## 設定ファイル

### tsconfig.json

TypeScript の設定を管理するファイルです。コンパイラオプション、型チェックの厳格さ、パスエイリアスなどを定義します。

**このアプリでの使用箇所**:

- [`tsconfig.json`](../../tsconfig.json): TypeScript の設定ファイル

**設定内容**:

[`tsconfig.json`](../../tsconfig.json) (設定ファイル全体)

```typescript
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    },
    // より厳格な型チェック
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

**設定項目の詳細**:

1. **基本設定**:

   - `target: "ES2017"`: コンパイル後の JavaScript のバージョン（ES2017 をターゲット）
   - `lib: ["dom", "dom.iterable", "esnext"]`: 使用する型定義ライブラリ（DOM API、ES6+ の機能）
   - `allowJs: true`: JavaScript ファイルも TypeScript プロジェクトに含める（段階的移行を可能にする）
   - `skipLibCheck: true`: 型定義ファイル（`.d.ts`）の型チェックをスキップ（ビルド時間の短縮）

2. **厳格な型チェック**:

   - `strict: true`: すべての厳格な型チェックオプションを有効化
     - `noImplicitAny`: 暗黙的な `any` 型を禁止
     - `strictNullChecks`: `null` と `undefined` の厳格なチェック
     - `strictFunctionTypes`: 関数の型の厳格なチェック
     - その他の厳格なチェックオプション
   - `noUnusedLocals: true`: 未使用のローカル変数をエラーにする
   - `noUnusedParameters: true`: 未使用のパラメータをエラーにする
   - `noFallthroughCasesInSwitch: true`: switch 文で break がない場合をエラーにする
   - `noUncheckedIndexedAccess: true`: インデックスアクセス（`array[0]`）の結果が `undefined` の可能性があることを型で表現

3. **モジュール解決**:

   - `module: "esnext"`: ES モジュール形式を使用
   - `moduleResolution: "bundler"`: バンドラー（Next.js）向けのモジュール解決
   - `resolveJsonModule: true`: JSON ファイルをモジュールとしてインポート可能
   - `isolatedModules: true`: 各ファイルを独立してコンパイル可能にする（トランスパイラとの互換性）

4. **JSX 設定**:

   - `jsx: "react-jsx"`: React 19 の新しい JSX 変換を使用（`React` のインポートが不要）

5. **パスエイリアス**:

   - `paths: { "@/*": ["./*"] }`: `@/` でプロジェクトルートを参照可能
     - 例: `import { prisma } from "@/lib/prisma"`
     - 相対パス（`../../lib/prisma`）よりも読みやすく、メンテナンスしやすい

6. **その他**:
   - `noEmit: true`: JavaScript ファイルを生成しない（Next.js がビルドを担当）
   - `incremental: true`: 増分コンパイルを有効化（ビルド時間の短縮）
   - `forceConsistentCasingInFileNames: true`: ファイル名の大文字小文字の一貫性を強制

**設定の変更方法**:

設定を変更する場合は、[`tsconfig.json`](../../tsconfig.json) を編集してください。変更後は、TypeScript サーバーが自動的に再読み込みされます（VS Code の場合）。

**理由**:

- **型安全性**: 厳格な型チェックにより、実行時エラーを事前に検出
- **開発効率**: パスエイリアスにより、インポートパスが簡潔になる
- **パフォーマンス**: 増分コンパイルにより、ビルド時間が短縮される

1. **基本設定**:

   - `target: "ES2017"`: コンパイル後の JavaScript のバージョン
   - `lib`: 使用する型定義ライブラリ（DOM、ESNext など）
   - `module: "esnext"`: モジュールシステム（ES Modules）
   - `jsx: "react-jsx"`: React JSX の変換方法（詳細は [JSX ガイド](./jsx-guide.md) を参照）

2. **型チェックの厳格さ**:

   - `strict: true`: すべての厳格な型チェックオプションを有効化
   - `noUnusedLocals: true`: 未使用のローカル変数をエラーにする
   - `noUnusedParameters: true`: 未使用のパラメータをエラーにする
   - `noUncheckedIndexedAccess: true`: インデックスアクセス時に `undefined` の可能性を考慮

3. **パスエイリアス**:

   - `paths: { "@/*": ["./*"] }`: `@/` でプロジェクトルートを参照可能

4. **Next.js 統合**:
   - `plugins: [{ "name": "next" }]`: Next.js の型チェックプラグインを使用
   - `incremental: true`: インクリメンタルコンパイルを有効化

## 型定義

このアプリでは、型定義を一元管理することで、型の重複を防ぎ、一貫性を保っています。

### フロントエンドの型定義

**このアプリでの使用箇所**:

- [`app/types.ts`](../../app/types.ts): フロントエンド共通型定義

**型定義の内容**:

[`app/types.ts`](../../app/types.ts) (型定義)

```typescript
 * フロントエンドで使用する共通型定義
 *
 * フロントエンドのコンポーネント間で共有される型定義を集約しています。
 * 型の重複を防ぎ、一貫性を保つために使用します。
 */

/**
 * カテゴリーの型定義
 *
 * 商品カテゴリーの情報を表します。
 */
export interface Category {
  id: number; // カテゴリーID
  name: string; // カテゴリー名
}

/**
 * 商品の型定義（フロントエンド表示用）
 *
 * 商品の詳細情報を表します。
 * モーダル表示や詳細表示で使用されます。
 */
export interface Product {
  id: number; // 商品ID
  name: string; // 商品名
  description: string; // 商品説明
  imageUrl: string | null; // 商品画像URL（Blob StorageのURL）
  priceS: number | null; // Sサイズの価格（円）
  priceL: number | null; // Lサイズの価格（円）
}

/**
 * 商品の型定義（タイル表示用）
 *
 * 商品タイル表示に必要な最小限の情報を表します。
 * グリッド表示で使用され、パフォーマンス最適化のため必要最小限の情報のみを含みます。
 */
export interface ProductTile {
  id: number; // 商品ID
  name: string; // 商品名
  imageUrl: string | null; // 商品画像URL（Blob StorageのURL）
}
```

- **インターフェース**: `interface` キーワードを使用して型を定義
- **コメント**: JSDoc コメントで型の説明を記述
- **null 許容型**: `string | null` のように、null の可能性を明示
- **用途別の型**: `Product` と `ProductTile` のように、用途に応じて型を分離

### ダッシュボードの型定義

**このアプリでの使用箇所**:

- [`app/dashboard/types.ts`](../../app/dashboard/types.ts): ダッシュボード共通型定義

**型定義の内容**:

[`app/dashboard/types.ts`](../../app/dashboard/types.ts) (型定義)

```typescript
 * ダッシュボードで使用する共通型定義
 */

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
  category: Category;
  published: boolean;
  publishedAt: string | null;
  endedAt: string | null;
  displayOrder: number | null;
}
```

- **ネストされた型**: `category: Category` のように、他の型を参照
- **日付の文字列化**: `publishedAt: string | null` のように、Date 型を文字列として扱う（JSON シリアライズのため）

## 型安全性の実装

### コンポーネントの Props の型定義

**このアプリでの使用箇所**:

1. **[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (`ProductGridProps`インターフェース)** - Props の型定義

```typescript
  category: Category; // カテゴリー情報
  products: Product[]; // 商品一覧
}
```

2. **[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (`ProductModalProps`インターフェース)** - Props の型定義

```typescript
  product: Product | null; // 表示する商品情報（nullの場合は非表示）
  isOpen: boolean; // モーダルの開閉状態
  onClose: () => void; // モーダルを閉じるコールバック関数
}
```

### 関数の型定義

**このアプリでの使用箇所**:

1. **価格フォーマット関数**

[`app/utils/format.ts`](../../app/utils/format.ts) (`formatPrice`関数)

```typescript
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}
```

2. **[`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (`useProductModal`フック)** - カスタムフックの戻り値の型

```typescript
  // 選択された商品を管理（モーダル表示用）
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // モーダルの開閉状態を管理
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * 商品タイルクリック時のハンドラー
   * 選択された商品を設定してモーダルを開きます
   *
   * @param product - クリックされた商品
   */
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  /**
   * モーダル閉じる時のハンドラー
   * モーダルを閉じ、アニメーション完了後に選択をクリアします
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // モーダルが閉じた後に選択をクリア（アニメーション完了を待つ）
    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  return {
    selectedProduct,
    isModalOpen,
    handleProductClick,
    handleCloseModal,
  };
}
```

### ユニオン型と null 許容型

**このアプリでの使用箇所**:

1. **null 許容型**: `string | null`、`number | null` など

[`app/types.ts`](../../app/types.ts) (`Product`インターフェース)

```typescript
  id: number; // 商品ID
  name: string; // 商品名
  description: string; // 商品説明
  imageUrl: string | null; // 商品画像URL（Blob StorageのURL）
  priceS: number | null; // Sサイズの価格（円）
  priceL: number | null; // Lサイズの価格（円）
}
```

2. **ユニオン型**: `Product | null`

```tsx
product: Product | null; // 表示する商品情報（nullの場合は非表示）
```

詳細は [コンポーネントの Props の型定義](#コンポーネントの-props-の型定義) セクションを参照

3. **文字列リテラル型のユニオン型**: `"list" | "layout"`

```typescript
type TabType = "list" | "layout";
```

**詳細は [interface vs type](#interface-vs-type) セクションを参照してください。**

## Prisma との統合

Prisma は、データベーススキーマから TypeScript の型定義を自動生成します。これにより、データベース操作が型安全になります。

### 型生成

**説明**: Prisma は、[`prisma/schema.prisma`](../../prisma/schema.prisma) から TypeScript の型定義を自動生成します。

**型生成コマンド**:

```bash
npm run db:generate
```

**生成される型**:

```typescript
import { Product, Category } from "@prisma/client";

// 型安全なデータアクセス（async/await を使用）
const product: Product = await prisma.product.findUnique({
  where: { id: 1 },
});
```

**このアプリでの使用例**:

[`lib/prisma.ts`](../../lib/prisma.ts) (行 72-73, 83-96)

```typescript
import { PrismaClient } from "@prisma/client";

const product = await prisma.product.findUnique({
  where: { id: 1 },
});

// 型安全なプロパティアクセス
console.log(product.name); // OK
console.log(product.invalidField); // コンパイルエラー
```

- **型安全性**: データベーススキーマと TypeScript の型が自動的に同期
- **自動補完**: IDE で自動補完が利用可能
- **リファクタリング**: スキーマ変更時に型エラーで影響範囲を把握

**詳細は [Prisma ガイド - 型生成](./prisma-guide.md#型生成) を参照してください。async/await の使用方法については [Async/Await ガイド](./async-await-guide.md) を参照してください。**

## API Routes での型安全性

API Routes では、リクエストとレスポンスの型を定義することで、エンドポイント間の型安全性を確保します。

### リクエストの型定義

**このアプリでの使用箇所**:

[`app/api/products/route.ts`](../../app/api/products/route.ts) (`POST`エクスポート)

```typescript
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // バリデーション時に型チェック
  if (!body.name || typeof body.name !== "string") {
    throw new ValidationError("商品名は必須です");
  }

  // 型安全なデータ操作（async/await を使用）
  const product = await prisma.product.create({
    data: {
      name: body.name.trim(),
      description: body.description.trim(),
      // ...
    },
  });

  return apiSuccess({ product });
});
```

**async/await の詳細な使用方法については [Async/Await ガイド](./async-await-guide.md) を参照してください。**

### レスポンスの型定義

**このアプリでの使用箇所**:

[`lib/api-helpers.ts`](../../lib/api-helpers.ts) (`apiSuccess`関数)

```typescript
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  response.headers.set("Content-Type", "application/json; charset=utf-8");
  return response;
}
```

**特徴**:

- **文字エンコーディング**: 自動的に`Content-Type: application/json; charset=utf-8`ヘッダーを設定し、日本語を含む JSON の文字化けを防止
- **型安全性**: ジェネリック型`<T>`により、レスポンスデータの型が推論される

**詳細**: ジェネリクスの詳細な説明については、[ジェネリクス](#ジェネリクス)セクションを参照してください。

## エラーハンドリングでの型安全性

このアプリでは、統一されたエラークラスを使用して、エラーハンドリングを型安全に実装しています。

**このアプリでの使用箇所**:

- [`lib/errors.ts`](../../lib/errors.ts): エラークラスの定義

**エラークラスの例**:

[`lib/errors.ts`](../../lib/errors.ts) (`ValidationError`クラス)

```typescript
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}
```

**使用例**:

```typescript
if (!product) {
  throw new NotFoundError("商品");
}
```

- **エラーの種類を明確化**: エラーの種類を型で区別
- **IDE サポート**: エラーの種類に応じた処理を自動補完
- **一貫性**: 統一されたエラーハンドリングにより、コードの一貫性を確保

## 型推論

TypeScript は、型を明示的に指定しなくても、コンパイラが型を推論します。

### 変数の型推論

**このアプリでの使用箇所**:

[`lib/prisma.ts`](../../lib/prisma.ts) (`createPrismaClient`関数)

```typescript
const products = await prisma.product.findMany();
// products の型は Product[] と推論される
```

**このアプリでの使用箇所**:

[`app/utils/format.ts`](../../app/utils/format.ts) (`formatPrice`関数)

```typescript
export function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`;
  // 戻り値の型は string と推論される
}
```

**このアプリでの使用箇所**:

```typescript
const categories = [
  { id: 1, name: "かき氷" },
  { id: 2, name: "ドリンク" },
];
// categories の型は { id: number; name: string }[] と推論される
```

## ジェネリクス

ジェネリクス（Generics）は、型をパラメータ化することで、複数の型で再利用可能なコードを記述する機能です。同じコードを異なる型で使用できるため、コードの重複を減らし、型安全性を保ちながら柔軟性を提供します。

### ジェネリクスとは

ジェネリクスを使用すると、型を変数のように扱うことができます。これにより、同じ関数やクラスを異なる型で使用できます。

**基本的な構文**:

```typescript
function identity<T>(arg: T): T {
  return arg;
}

// 使用例
const number = identity<number>(42); // number型
const text = identity<string>("hello"); // string型
```

**型推論による省略**:

```typescript
// 型引数を省略すると、TypeScriptが推論する
const number = identity(42); // number型と推論される
const text = identity("hello"); // string型と推論される
```

### 関数のジェネリクス

関数にジェネリクスを使用することで、異なる型で同じ関数を使用できます。

#### apiSuccess 関数

**このアプリでの使用箇所**:

[`lib/api-helpers.ts`](../../lib/api-helpers.ts) (`apiSuccess`関数)

```typescript
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  response.headers.set("Content-Type", "application/json; charset=utf-8");
  return response;
}
```

**使用例**:

```typescript
// 商品データを返す場合
const product = await prisma.product.findUnique({ where: { id: 1 } });
return apiSuccess({ product }); // T は { product: Product } と推論される

// 商品一覧を返す場合
const products = await prisma.product.findMany();
return apiSuccess({ products }); // T は { products: Product[] } と推論される
```

**メリット**:

- **型安全性**: レスポンスデータの型が推論され、型安全な操作が可能
- **再利用性**: 異なる型のデータに対して同じ関数を使用できる
- **コードの簡潔性**: 型ごとに別々の関数を定義する必要がない

#### safePrismaOperation 関数

**このアプリでの使用箇所**:

[`lib/prisma.ts`](../../lib/prisma.ts) (`safePrismaOperation`関数)

```typescript
export async function safePrismaOperation<T>(
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

**使用例**:

```typescript
// Product型を返す操作
const product = await safePrismaOperation(
  () => prisma.product.findUnique({ where: { id: 1 } }),
  "getProduct"
); // T は Product | null と推論される

// Product[]型を返す操作
const products = await safePrismaOperation(
  () => prisma.product.findMany(),
  "getProducts"
); // T は Product[] と推論される
```

**メリット**:

- **型安全性**: Prisma 操作の戻り値の型が保持される
- **エラーハンドリング**: 統一されたエラーハンドリングを提供
- **再利用性**: あらゆる Prisma 操作に対して使用可能

### インターフェースのジェネリクス

インターフェースにもジェネリクスを使用できます。これにより、異なる型で同じインターフェース構造を使用できます。

#### ApiSuccessResponse インターフェース

**このアプリでの使用箇所**:

[`lib/api-types.ts`](../../lib/api-types.ts) (`ApiSuccessResponse`インターフェース)

```typescript
export interface ApiSuccessResponse<T> {
  [key: string]: T;
}
```

**使用例**:

```typescript
// 商品データのレスポンス
type ProductResponse = ApiSuccessResponse<Product>;
// これは { [key: string]: Product } と同じ

// 商品一覧のレスポンス
type ProductsResponse = ApiSuccessResponse<Product[]>;
// これは { [key: string]: Product[] } と同じ
```

**実際の使用**:

このアプリでは、`ApiSuccessResponse<T>`は汎用的な型として定義されていますが、実際の API レスポンス型（`GetProductsResponse`、`PostProductResponse`など）は、より具体的な型として定義されています。これにより、各 API エンドポイントのレスポンス型が明確になります。

**メリット**:

- **型の再利用**: 同じ構造を異なる型で使用できる
- **型安全性**: レスポンスの型が明確になる
- **拡張性**: 新しい API エンドポイントを追加する際に、同じパターンを使用できる

### 制約付きジェネリクス

ジェネリクスに制約を付けることで、型パラメータが特定の条件を満たすことを保証できます。

#### withErrorHandling 関数

**このアプリでの使用箇所**:

[`lib/api-helpers.ts`](../../lib/api-helpers.ts) (`withErrorHandling`関数)

```typescript
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
```

**説明**:

- `T extends unknown[]`: `T`は配列型でなければならないという制約
- これにより、`handler`関数の引数の型が保持される

**使用例**:

```typescript
// NextRequestを引数に取るハンドラー
export const POST = withErrorHandling(async (request: NextRequest) => {
  // ...
});

// 引数なしのハンドラー
export const GET = withErrorHandling(async () => {
  // ...
});
```

**メリット**:

- **型安全性**: ハンドラー関数の引数の型が保持される
- **柔軟性**: 異なる引数を持つハンドラーに対応できる

### ジェネリクスの使い分け

**このアプリでの使い分け**:

1. **関数のジェネリクス**: 異なる型で同じ関数を使用する場合
   - 例: `apiSuccess<T>`, `safePrismaOperation<T>`
2. **インターフェースのジェネリクス**: 異なる型で同じ構造を使用する場合
   - 例: `ApiSuccessResponse<T>`
3. **制約付きジェネリクス**: 型パラメータに制約を付ける場合
   - 例: `withErrorHandling<T extends unknown[]>`

**一般的な指針**:

- **関数のジェネリクス**: 複数の型で同じロジックを使用する場合
- **インターフェースのジェネリクス**: 複数の型で同じ構造を使用する場合
- **制約付きジェネリクス**: 型パラメータが特定の条件を満たす必要がある場合

**注意点**:

- ジェネリクスは型安全性を保ちながらコードの再利用性を高めるが、過度に使用するとコードが複雑になる
- このアプリでは、実際に複数の型で使用する場合のみジェネリクスを使用している

### Java との比較

Java 経験者向けの補足:

**類似点**:

- TypeScript の`<T>`は Java の`<T>`と同様の構文
- 型パラメータの概念は同じ

**違い**:

- TypeScript では型推論が強力で、型引数を省略できる場合が多い
- TypeScript では`extends`キーワードで制約を付ける（Java の`extends`や`super`に似ている）

**例**:

```typescript
// TypeScript
function identity<T>(arg: T): T {
  return arg;
}

// Java
public <T> T identity(T arg) {
  return arg;
}
```

このアプリでは、用途に応じて適切な型定義方法を選択しています。

### interface vs type

TypeScript では、`interface`と`type`の両方を使用して型を定義できますが、それぞれに適した使い方があります。

#### interface を使用する場合

**推奨される用途**:

- オブジェクトの型を定義する場合
- 拡張可能な型を定義する場合（`extends`や`implements`を使用）
- 宣言のマージ（Declaration Merging）が必要な場合

**このアプリでの使用例**:

[`app/types.ts`](../../app/types.ts) (型定義)

```typescript
export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  priceS: number | null;
  priceL: number | null;
}

export interface Category {
  id: number;
  name: string;
}
```

**interface の特徴**:

- **拡張可能**: `extends`キーワードで継承できる
- **宣言のマージ**: 同じ名前の`interface`を複数定義すると、自動的にマージされる
- **オブジェクト型に特化**: オブジェクトの構造を定義するのに適している

**拡張の例**:

```typescript
interface BaseProduct {
  id: number;
  name: string;
}

interface Product extends BaseProduct {
  description: string;
  price: number;
}
```

#### type を使用する場合

**推奨される用途**:

- ユニオン型やインターセクション型を定義する場合
- 型エイリアスを定義する場合
- プリミティブ型やユニオン型を組み合わせる場合
- ユーティリティ型を使用する場合

**このアプリでの使用箇所**:

1. **文字列リテラル型のユニオン型**: `"list" | "layout"`

[`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts) (`TabType`型)

```typescript
type TabType = "list" | "layout";
```

**使用例**:

[`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts) (`useTabState`フック)

```typescript
const [activeTab, setActiveTab] = useState<TabType>(() => {
  // ...
});
```

[`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx) (フィルタリング処理)

```typescript
onClick={() => setActiveTab("list")}
```

**type の特徴**:

- **柔軟性**: ユニオン型、インターセクション型、ユーティリティ型など、様々な型を定義できる
- **型エイリアス**: 複雑な型に名前を付けて再利用できる
- **計算型**: 条件型（Conditional Types）やマップ型（Mapped Types）など、高度な型操作が可能

**その他の使用例**:

```typescript
// ユニオン型
type Status = "pending" | "completed" | "failed";

// 型エイリアス
type ProductId = number;

// インターセクション型
type AdminUser = User & {
  permissions: string[];
};

// ユーティリティ型
type PartialProduct = Partial<Product>;
type ReadonlyProduct = Readonly<Product>;

// 関数型
type EventHandler = (event: Event) => void;
```

#### type と interface の使い分けの指針

**このアプリでの使い分け**:

- **`interface`**: オブジェクトの型定義に使用（`Product`、`Category` など）
  - 理由: オブジェクトの構造を定義するのに適しており、拡張性が高い
- **`type`**: ユニオン型、文字列リテラル型、型エイリアスなど、オブジェクト以外の型定義に使用（`TabType` など）
  - 理由: 柔軟性が高く、様々な型を表現できる

**一般的な指針**:

1. **オブジェクトの型を定義する場合**: `interface`を優先
   - 理由: 拡張性が高く、宣言のマージが可能
2. **ユニオン型やインターセクション型を定義する場合**: `type`を使用
   - 理由: `interface`では表現できない
3. **型エイリアスを定義する場合**: `type`を使用
   - 理由: 複雑な型に名前を付けて再利用するのに適している
4. **既存の型を拡張する場合**: `interface extends`を使用
   - 理由: より明確で、宣言のマージが可能

**注意点**:

- `interface`と`type`は多くの場合、互換的に使用できますが、宣言のマージや拡張の挙動が異なります
- このアプリでは、一貫性を保つため、オブジェクト型には`interface`、それ以外には`type`を使用しています

**このアプリでの使用例**:

- **`Product`**: 詳細表示用の型（[`app/types.ts`](../../app/types.ts)）
- **`ProductTile`**: タイル表示用の型（[`app/types.ts`](../../app/types.ts)）

**型を分離するメリット**:

- **パフォーマンス**: 必要最小限のデータのみを含む型を使用
- **明確性**: 用途に応じた型により、コードの意図が明確
- **保守性**: 型の変更時の影響範囲が明確

## 型安全性のベストプラクティス

### 1. 型定義の一元管理

**原則**: 型定義を `types.ts` ファイルに集約し、重複を防ぐ

**例**: [`app/types.ts`](../../app/types.ts)、[`app/dashboard/types.ts`](../../app/dashboard/types.ts) で型定義を一元管理

### 2. null 許容型の明示

**原則**: `null` の可能性がある場合は、ユニオン型を使用

**例**: `string | null`、`number | null`

### 3. 型推論の活用

**原則**: 型推論が可能な場合は、明示的な型指定を省略

**例**: `const products = await prisma.product.findMany();`

### 4. 厳格な型チェック

**原則**: [`tsconfig.json`](../../tsconfig.json) で厳格な型チェックを有効化

**例**: `strict: true`、`noUnusedLocals: true`、`noUncheckedIndexedAccess: true`

### 5. ジェネリクスの活用

**原則**: 複数の型で同じコードを使用する場合、ジェネリクスを使用してコードの再利用性を向上

**例**: `apiSuccess<T>`, `safePrismaOperation<T>`, `withErrorHandling<T>`など

**メリット**:

- **コードの再利用性**: 同じ関数を異なる型で使用できる
- **型安全性**: 型推論により、型安全な操作が可能
- **保守性**: 型ごとに別々の関数を定義する必要がない

### 6. Prisma との統合

**原則**: Prisma の型生成機能を活用し、データベース操作を型安全に

**例**: `npm run db:generate` で型を生成し、`@prisma/client` から型をインポート

### 7. エラーハンドリングの型安全性

**原則**: 統一されたエラークラスを使用し、エラーハンドリングを型安全に

**例**: `ValidationError`、`NotFoundError` などのエラークラスを定義

## このアプリでの TypeScript の使用例まとめ

### 型定義の構成

1. **フロントエンドの型定義** ([`app/types.ts`](../../app/types.ts))

   - `Category`: カテゴリー情報
   - `Product`: 商品情報（詳細表示用）
   - `ProductTile`: 商品情報（タイル表示用）

2. **ダッシュボードの型定義** ([`app/dashboard/types.ts`](../../app/dashboard/types.ts))

   - `Category`: カテゴリー情報（カテゴリーオブジェクトを含む）
   - `Product`: 商品情報（公開状態、日付情報を含む）

3. **型エイリアス** ([`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts))
   - `TabType`: 文字列リテラル型のユニオン型（`"list" | "layout"`）

### 型安全性の実装

1. **コンポーネントの Props**: すべてのコンポーネントの Props に型を定義
2. **関数の引数と戻り値**: すべての関数に型を指定
3. **API Routes**: リクエストとレスポンスの型を定義
4. **ジェネリクス**: `apiSuccess<T>`, `safePrismaOperation<T>`, `withErrorHandling<T>`などで型をパラメータ化
5. **エラーハンドリング**: 統一されたエラークラスを使用

### Prisma との統合

1. **型生成**: `npm run db:generate` で型を生成
2. **型の使用**: `@prisma/client` から型をインポート
3. **型安全な操作**: Prisma Client の操作がすべて型安全

### 設定ファイル

- **[`tsconfig.json`](../../tsconfig.json)**: 厳格な型チェックを有効化
- **パスエイリアス**: `@/` でプロジェクトルートを参照

## まとめ

このアプリケーションでは、**TypeScript 5** を使用して以下の機能を実装しています：

1. **型定義の一元管理**: [`app/types.ts`](../../app/types.ts) と [`app/dashboard/types.ts`](../../app/dashboard/types.ts) で型定義を集約
2. **型安全性**: すべてのコンポーネント、関数、API Routes に型を適用
3. **型エイリアス**: 文字列リテラル型のユニオン型など、`type` キーワードを使用した型定義
4. **ジェネリクス**: `apiSuccess<T>`, `safePrismaOperation<T>`, `withErrorHandling<T>`など、型をパラメータ化してコードの再利用性を向上
5. **Prisma との統合**: データベーススキーマから自動的に型を生成
6. **厳格な型チェック**: [`tsconfig.json`](../../tsconfig.json) で厳格な型チェックを有効化
7. **エラーハンドリング**: 統一されたエラークラスを使用し、型安全なエラーハンドリングを実現

すべてのコードは型安全に実装され、コンパイル時に型エラーを検出できます。これにより、実行時エラーを事前に防止し、コードの品質を向上させています。

## 参考リンク

- **[Prisma ガイド](./prisma-guide.md)**: Prisma との型統合の詳細
- **[React ガイド](./react-guide.md)**: React での TypeScript の使用方法
- **[JSX ガイド](./jsx-guide.md)**: TypeScript での JSX の使用方法
- **[Next.js ガイド](./nextjs-guide.md)**: Next.js での TypeScript の使用方法
- **[Async/Await ガイド](./async-await-guide.md)**: async/await と Promise の使用方法
- **[ユーティリティ関数ガイド](./utilities-guide.md)**: 環境変数の型安全な管理（`lib/env.ts`）の詳細
- **[TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/)**: TypeScript の包括的なドキュメント
