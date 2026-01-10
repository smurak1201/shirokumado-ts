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
- [型の使い分け](#型の使い分け)
  - [interface vs type](#interface-vs-type)
  - [型の分離](#型の分離)
- [型安全性のベストプラクティス](#型安全性のベストプラクティス)
  - [1. 型定義の一元管理](#1-型定義の一元管理)
  - [2. null 許容型の明示](#2-null-許容型の明示)
  - [3. 型推論の活用](#3-型推論の活用)
  - [4. 厳格な型チェック](#4-厳格な型チェック)
  - [5. Prisma との統合](#5-prisma-との統合)
  - [6. エラーハンドリングの型安全性](#6-エラーハンドリングの型安全性)
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
- `app/types.ts` と `app/dashboard/types.ts` で型定義を一元管理
- Prisma の型生成機能と統合し、データベーススキーマから自動的に型を生成
- API Routes のリクエスト・レスポンスの型を定義し、エンドポイント間の型安全性を確保
- カスタムフックやユーティリティ関数にも型を適用し、コードの品質を向上

## 設定ファイル

### tsconfig.json

TypeScript の設定を管理するファイルです。コンパイラオプション、型チェックの厳格さ、パスエイリアスなどを定義します。

**このアプリでの使用箇所**:

- `tsconfig.json`: TypeScript の設定ファイル

**設定内容**:

```1:40:tsconfig.json
{
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

**設定の説明**:

1. **基本設定**:

   - `target: "ES2017"`: コンパイル後の JavaScript のバージョン
   - `lib`: 使用する型定義ライブラリ（DOM、ESNext など）
   - `module: "esnext"`: モジュールシステム（ES Modules）
   - `jsx: "react-jsx"`: React JSX の変換方法

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

- `app/types.ts`: フロントエンド共通型定義

**型定義の内容**:

```1:44:app/types.ts
/**
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

**型定義の特徴**:

- **インターフェース**: `interface` キーワードを使用して型を定義
- **コメント**: JSDoc コメントで型の説明を記述
- **null 許容型**: `string | null` のように、null の可能性を明示
- **用途別の型**: `Product` と `ProductTile` のように、用途に応じて型を分離

### ダッシュボードの型定義

**このアプリでの使用箇所**:

- `app/dashboard/types.ts`: ダッシュボード共通型定義

**型定義の内容**:

```1:22:app/dashboard/types.ts
/**
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

**型定義の特徴**:

- **ネストされた型**: `category: Category` のように、他の型を参照
- **日付の文字列化**: `publishedAt: string | null` のように、Date 型を文字列として扱う（JSON シリアライズのため）

## 型安全性の実装

### コンポーネントの Props の型定義

**このアプリでの使用箇所**:

1. **`app/components/ProductGrid.tsx`** - Props の型定義

```11:14:app/components/ProductGrid.tsx
interface ProductGridProps {
  category: Category; // カテゴリー情報
  products: Product[]; // 商品一覧
}
```

**説明**: `ProductGrid` コンポーネントの Props に型を定義しています。

2. **`app/components/ProductModal.tsx`** - Props の型定義

```12:16:app/components/ProductModal.tsx
interface ProductModalProps {
  product: Product | null; // 表示する商品情報（nullの場合は非表示）
  isOpen: boolean; // モーダルの開閉状態
  onClose: () => void; // モーダルを閉じるコールバック関数
}
```

**説明**: `ProductModal` コンポーネントの Props に型を定義し、`product` が `null` の可能性を明示しています。

### 関数の型定義

**このアプリでの使用箇所**:

1. **`app/utils/format.ts`** - 価格フォーマット関数

```typescript
// app/utils/format.ts
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}
```

**説明**: 関数の引数と戻り値に型を指定しています。

2. **`app/hooks/useProductModal.ts`** - カスタムフックの戻り値の型

```12:47:app/hooks/useProductModal.ts
export function useProductModal() {
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

**説明**: カスタムフックの戻り値の型は、TypeScript が自動的に推論します。

### ユニオン型と null 許容型

**このアプリでの使用箇所**:

1. **null 許容型**: `string | null`、`number | null` など

```24:31:app/types.ts
export interface Product {
  id: number; // 商品ID
  name: string; // 商品名
  description: string; // 商品説明
  imageUrl: string | null; // 商品画像URL（Blob StorageのURL）
  priceS: number | null; // Sサイズの価格（円）
  priceL: number | null; // Lサイズの価格（円）
}
```

**説明**: `imageUrl`、`priceS`、`priceL` は `null` の可能性があるため、ユニオン型を使用しています。

2. **ユニオン型**: `Product | null`

```13:13:app/components/ProductModal.tsx
  product: Product | null; // 表示する商品情報（nullの場合は非表示）
```

**説明**: `product` は `Product` 型または `null` の可能性があるため、ユニオン型を使用しています。

## Prisma との統合

Prisma は、データベーススキーマから TypeScript の型定義を自動生成します。これにより、データベース操作が型安全になります。

### 型生成

**説明**: Prisma は、`prisma/schema.prisma` から TypeScript の型定義を自動生成します。

**型生成コマンド**:

```bash
npm run db:generate
```

**生成される型**:

```typescript
// @prisma/client から自動生成される型
import { Product, Category } from "@prisma/client";

// 型安全なデータアクセス
const product: Product = await prisma.product.findUnique({
  where: { id: 1 },
});
```

**このアプリでの使用例**:

```typescript
// lib/prisma.ts などで使用
import { PrismaClient } from "@prisma/client";

const product = await prisma.product.findUnique({
  where: { id: 1 },
});

// 型安全なプロパティアクセス
console.log(product.name); // OK
console.log(product.invalidField); // コンパイルエラー
```

**Prisma の型生成のメリット**:

- **型安全性**: データベーススキーマと TypeScript の型が自動的に同期
- **自動補完**: IDE で自動補完が利用可能
- **リファクタリング**: スキーマ変更時に型エラーで影響範囲を把握

**詳細は [Prisma ガイド - 型生成](./prisma-guide.md#型生成) を参照してください。**

## API Routes での型安全性

API Routes では、リクエストとレスポンスの型を定義することで、エンドポイント間の型安全性を確保します。

### リクエストの型定義

**このアプリでの使用箇所**:

**`app/api/products/route.ts`** - POST リクエストの型

```typescript
// app/api/products/route.ts
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // バリデーション時に型チェック
  if (!body.name || typeof body.name !== "string") {
    throw new ValidationError("商品名は必須です");
  }

  // 型安全なデータ操作
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

**説明**: リクエストボディの型をバリデーション時にチェックし、型安全なデータ操作を行います。

### レスポンスの型定義

**このアプリでの使用箇所**:

**`lib/api-helpers.ts`** - API レスポンスの型

```typescript
// lib/api-helpers.ts
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}
```

**説明**: ジェネリクスを使用して、レスポンスデータの型を指定します。

## エラーハンドリングでの型安全性

このアプリでは、統一されたエラークラスを使用して、エラーハンドリングを型安全に実装しています。

**このアプリでの使用箇所**:

- `lib/errors.ts`: エラークラスの定義

**エラークラスの例**:

```typescript
// lib/errors.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource}が見つかりません`);
    this.name = "NotFoundError";
  }
}
```

**使用例**:

```typescript
// app/api/products/[id]/route.ts
if (!product) {
  throw new NotFoundError("商品");
}
```

**型安全なエラーハンドリングのメリット**:

- **エラーの種類を明確化**: エラーの種類を型で区別
- **IDE サポート**: エラーの種類に応じた処理を自動補完
- **一貫性**: 統一されたエラーハンドリングにより、コードの一貫性を確保

## 型推論

TypeScript は、型を明示的に指定しなくても、コンパイラが型を推論します。

### 変数の型推論

**このアプリでの使用箇所**:

```typescript
// 型を明示的に指定しなくても、TypeScript が推論
const products = await prisma.product.findMany();
// products の型は Product[] と推論される
```

### 関数の戻り値の型推論

**このアプリでの使用箇所**:

```typescript
// 戻り値の型を明示的に指定しなくても、TypeScript が推論
export function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`;
  // 戻り値の型は string と推論される
}
```

### 配列の型推論

**このアプリでの使用箇所**:

```typescript
// 配列の要素の型を推論
const categories = [
  { id: 1, name: "かき氷" },
  { id: 2, name: "ドリンク" },
];
// categories の型は { id: number; name: string }[] と推論される
```

## 型の使い分け

このアプリでは、用途に応じて適切な型定義方法を選択しています。

### interface vs type

**interface を使用する場合**:

- オブジェクトの型を定義する場合
- 拡張可能な型を定義する場合

**このアプリでの使用例**:

```typescript
// app/types.ts
export interface Product {
  id: number;
  name: string;
  // ...
}
```

**type を使用する場合**:

- ユニオン型やインターセクション型を定義する場合
- 型エイリアスを定義する場合
- プリミティブ型やユニオン型を組み合わせる場合

**このアプリでの使用箇所**: 現在は使用されていません。

**使用例**:

```typescript
// ユニオン型の例
type Status = "pending" | "completed" | "failed";

// 型エイリアスの例
type ProductId = number;

// インターセクション型の例
type AdminUser = User & {
  permissions: string[];
};

// ユーティリティ型の例
type PartialProduct = Partial<Product>;
type ReadonlyProduct = Readonly<Product>;
```

**このアプリで使用しない理由**:

- オブジェクトの型定義はすべて`interface`を使用しており、一貫性を保っている
- ユニオン型や型エイリアスが必要な場面が少ない
- `interface`の方が拡張性が高く、将来の変更に対応しやすい

### 型の分離

**このアプリでの使用例**:

- **`Product`**: 詳細表示用の型（`app/types.ts`）
- **`ProductTile`**: タイル表示用の型（`app/types.ts`）

**型を分離するメリット**:

- **パフォーマンス**: 必要最小限のデータのみを含む型を使用
- **明確性**: 用途に応じた型により、コードの意図が明確
- **保守性**: 型の変更時の影響範囲が明確

## 型安全性のベストプラクティス

### 1. 型定義の一元管理

**原則**: 型定義を `types.ts` ファイルに集約し、重複を防ぐ

**例**: `app/types.ts`、`app/dashboard/types.ts` で型定義を一元管理

### 2. null 許容型の明示

**原則**: `null` の可能性がある場合は、ユニオン型を使用

**例**: `string | null`、`number | null`

### 3. 型推論の活用

**原則**: 型推論が可能な場合は、明示的な型指定を省略

**例**: `const products = await prisma.product.findMany();`

### 4. 厳格な型チェック

**原則**: `tsconfig.json` で厳格な型チェックを有効化

**例**: `strict: true`、`noUnusedLocals: true`、`noUncheckedIndexedAccess: true`

### 5. Prisma との統合

**原則**: Prisma の型生成機能を活用し、データベース操作を型安全に

**例**: `npm run db:generate` で型を生成し、`@prisma/client` から型をインポート

### 6. エラーハンドリングの型安全性

**原則**: 統一されたエラークラスを使用し、エラーハンドリングを型安全に

**例**: `ValidationError`、`NotFoundError` などのエラークラスを定義

## このアプリでの TypeScript の使用例まとめ

### 型定義の構成

1. **フロントエンドの型定義** (`app/types.ts`)

   - `Category`: カテゴリー情報
   - `Product`: 商品情報（詳細表示用）
   - `ProductTile`: 商品情報（タイル表示用）

2. **ダッシュボードの型定義** (`app/dashboard/types.ts`)
   - `Category`: カテゴリー情報（カテゴリーオブジェクトを含む）
   - `Product`: 商品情報（公開状態、日付情報を含む）

### 型安全性の実装

1. **コンポーネントの Props**: すべてのコンポーネントの Props に型を定義
2. **関数の引数と戻り値**: すべての関数に型を指定
3. **API Routes**: リクエストとレスポンスの型を定義
4. **エラーハンドリング**: 統一されたエラークラスを使用

### Prisma との統合

1. **型生成**: `npm run db:generate` で型を生成
2. **型の使用**: `@prisma/client` から型をインポート
3. **型安全な操作**: Prisma Client の操作がすべて型安全

### 設定ファイル

- **`tsconfig.json`**: 厳格な型チェックを有効化
- **パスエイリアス**: `@/` でプロジェクトルートを参照

## まとめ

このアプリケーションでは、**TypeScript 5** を使用して以下の機能を実装しています：

1. **型定義の一元管理**: `app/types.ts` と `app/dashboard/types.ts` で型定義を集約
2. **型安全性**: すべてのコンポーネント、関数、API Routes に型を適用
3. **Prisma との統合**: データベーススキーマから自動的に型を生成
4. **厳格な型チェック**: `tsconfig.json` で厳格な型チェックを有効化
5. **エラーハンドリング**: 統一されたエラークラスを使用し、型安全なエラーハンドリングを実現

すべてのコードは型安全に実装され、コンパイル時に型エラーを検出できます。これにより、実行時エラーを事前に防止し、コードの品質を向上させています。

## 参考リンク

- **[Prisma ガイド](./prisma-guide.md)**: Prisma との型統合の詳細
- **[React ガイド](./react-guide.md)**: React での TypeScript の使用方法
- **[Next.js ガイド](./nextjs-guide.md)**: Next.js での TypeScript の使用方法
- **[TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/)**: TypeScript の包括的なドキュメント
