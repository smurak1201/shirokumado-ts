# アーキテクチャドキュメント

白熊堂プロジェクトのアーキテクチャと設計思想を説明します。

## このドキュメントの役割

このドキュメントは「**なぜこの構造になっているのか**」を説明します。設計の意図や思想を理解したいときに参照してください。

| ドキュメント | 役割 |
|---|---|
| **architecture.md（このドキュメント）** | 設計思想と全体像（「なぜ」） |
| [development-guide.md](./development-guide.md) | コーディング規約の詳細（「どう書くか」） |
| [project-structure.md](./project-structure.md) | ファイル配置のリファレンス（「何がどこに」） |

## 目次

- [アーキテクチャ概要](#アーキテクチャ概要)
- [ディレクトリ構造の設計思想](#ディレクトリ構造の設計思想)
- [コンポーネント設計](#コンポーネント設計)
- [状態管理](#状態管理)
- [データフロー](#データフロー)
- [設定管理](#設定管理)
- [型定義の管理](#型定義の管理)
- [エラーハンドリング](#エラーハンドリング)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [セキュリティ](#セキュリティ)
- [参考リンク](#参考リンク)

## アーキテクチャ概要

このプロジェクトは、**Next.js App Router**をベースとした**モノレポ構造**を採用しています。

### 主要な設計原則

1. **型安全性**: TypeScript を徹底的に活用し、型定義を一元管理
2. **関心の分離**: 機能ごとにディレクトリを分割
3. **再利用性**: カスタムフックとユーティリティ関数を積極的に活用
4. **保守性**: 小さなコンポーネントと明確な責務分担

## ディレクトリ構造の設計思想

**注意**: 詳細なディレクトリ構造と各ファイルの役割については、[プロジェクト構造ドキュメント](./project-structure.md)を参照してください。App Router のディレクトリ構造については、[App Router ガイド](./guides/frontend/app-router-guide.md#app-router-のディレクトリ構造)を参照してください。

### フロントエンド (`app/`)

フロントエンドは、以下のように構造化されています：

```
app/
├── types.ts           # 共通型定義
├── hooks/            # カスタムフック
├── components/       # UIコンポーネント
│   └── ui/          # shadcn/ui コンポーネント
└── (public)/         # 公開ページ（Route Group）
```

**設計思想**:

- **[`types.ts`](../app/types.ts)**: フロントエンドで使用する型を一元管理（重複を防止）
- **`hooks/`**: 状態管理や副作用をカスタムフックに分離（再利用可能）
- **`components/`**: UI コンポーネントのみを配置（見た目とレイアウト）
- **`components/ui/`**: shadcn/ui コンポーネントとラッパーコンポーネント

### 機能別ディレクトリ (`app/dashboard/`)

ダッシュボード機能は、以下のように構造化されています：

```
app/dashboard/
├── page.tsx           # ダッシュボードルートページ
├── layout.tsx         # 共通レイアウト（認証チェック）
├── components/        # 共通コンポーネント
│   └── DashboardHeader.tsx
└── homepage/          # 商品管理ページ
    ├── page.tsx       # エントリーポイント
    ├── types.ts       # 共通型定義
    ├── components/    # UIコンポーネント
    │   ├── form/     # フォーム関連
    │   ├── layout/   # レイアウト関連
    │   └── list/     # リスト表示関連
    ├── hooks/         # 状態管理ロジック
    └── utils/         # ビジネスロジック
```

**設計思想**:

- **[`types.ts`](../app/dashboard/homepage/types.ts)**: その機能で使用する型を一元管理
- **`components/`**: UI コンポーネントのみを配置（form/, layout/, list/ でさらに分類）
- **`hooks/`**: 状態管理や副作用をカスタムフックに分離
- **`utils/`**: 純粋関数として実装可能なビジネスロジック

### グローバルユーティリティ (`lib/`)

プロジェクト全体で使用するユーティリティを配置：

```
lib/
├── config.ts         # 設定の一元管理
├── prisma.ts         # データベース接続
├── blob.ts           # ストレージ操作
├── errors.ts         # エラーハンドリング
├── api-helpers.ts    # API共通処理
├── client-fetch.ts   # クライアントサイドAPI呼び出しユーティリティ
└── auth-config.ts    # 認証設定（許可リストチェック）
```

## コンポーネント設計

### コンポーネントの階層構造

#### フロントエンド（公開ページ）

```
HomePage (Server Component)
  ├── FixedHeader (Server Component)
  ├── HeroSection (Server Component)
  └── ProductCategoryTabs (Client Component)
      └── ProductGrid (Client Component)
          ├── useProductModal (カスタムフック)
          ├── ProductTile
          └── ProductModal
              └── formatPrice (ユーティリティ関数)

FAQPage (Server Component)
  ├── FixedHeader (Server Component)
  └── FAQSection (Server Component)
```

#### ダッシュボード

```
DashboardPage (Server Component)
  └── DashboardContent (Client Component)
      ├── DashboardForm
      │   ├── useProductForm (カスタムフック)
      │   ├── ProductFormModal
      │   ├── ProductFormFields
      │   │   ├── ProductBasicFields
      │   │   ├── ProductImageField
      │   │   ├── ProductPriceFields
      │   │   └── ProductDateFields
      │   │       ├── ProductPublishedField
      │   │       └── ProductDateInput
      │   └── ProductFormFooter
      └── ProductList
          ├── ProductListTabs
          ├── ProductListContent
          │   ├── ProductSearchFilters
          │   └── ProductCard
          ├── ProductLayoutTab
          │   ├── LayoutCategoryTabs
          │   └── SortableProductItem
          └── ProductEditForm
              ├── useProductForm (カスタムフック)
              ├── ProductFormModal
              ├── ProductFormFields
              └── ProductFormFooter
```

### コンポーネント分割の原則

1. **単一責任の原則**: 各コンポーネントは 1 つの責務を持つ
2. **再利用性**: 汎用的なコンポーネントは分離（例: `LayoutCategoryTabs`, `SortableProductItem`）
3. **関心の分離**: UI とロジックを分離（カスタムフックを使用）

### 例: ProductList の分割

**Before** (840 行の巨大コンポーネント):

- タブ状態管理
- 商品順序変更ロジック
- カテゴリータブ UI
- ドラッグ&ドロップ UI
- すべてが 1 つのファイルに

**After** (分割後):

- [`ProductList.tsx`](../app/dashboard/homepage/components/list/ProductList.tsx): メインロジック（約 490 行）
- [`LayoutCategoryTabs.tsx`](../app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx): 配置変更用カテゴリータブ UI
- [`SortableProductItem.tsx`](../app/dashboard/homepage/components/layout/SortableProductItem.tsx): ドラッグ&ドロップ可能な商品アイテム
- [`useTabState.ts`](../app/dashboard/homepage/hooks/useTabState.ts): タブ状態管理フック
- [`useProductReorder.ts`](../app/dashboard/homepage/hooks/useProductReorder.ts): 商品順序変更フック
- [`productUtils.ts`](../app/dashboard/homepage/utils/productUtils.ts): 商品のグループ化・フィルタリング関数

## 状態管理

### 状態管理の戦略

1. **Server State**: Server Components で直接データフェッチ
2. **Client State**: React の`useState`とカスタムフック
3. **Persistent State**: `localStorage`をカスタムフックで管理

### カスタムフックの活用

#### ダッシュボード用フック

##### `useLocalStorageState`

[`app/dashboard/homepage/hooks/useLocalStorageState.ts`](../app/dashboard/homepage/hooks/useLocalStorageState.ts) (`useLocalStorageState`フック)

```typescript
// localStorage永続化の汎用フック（hydration対応）
const [value, setValue] = useLocalStorageState("key", defaultValue, {
  validate: (v) => isValid(v),
});
```

##### `useTabState`

[`app/dashboard/homepage/hooks/useTabState.ts`](../app/dashboard/homepage/hooks/useTabState.ts) (`useTabState`フック)

```typescript
// タブ状態をlocalStorageと同期（内部でuseLocalStorageStateを使用）
const { activeTab, setActiveTab } = useTabState();
```

##### `useCategoryTabState`

[`app/dashboard/homepage/hooks/useTabState.ts`](../app/dashboard/homepage/hooks/useTabState.ts) (`useCategoryTabState`フック)

```typescript
// カテゴリータブの状態管理（内部でuseLocalStorageStateを使用）
const { activeCategoryTab, setActiveCategoryTab } = useCategoryTabState(
  products,
  categories
);
```

##### `useProductReorder`

[`app/dashboard/homepage/hooks/useProductReorder.ts`](../app/dashboard/homepage/hooks/useProductReorder.ts) (`useProductReorder`フック)

```typescript
// 商品順序変更の楽観的UI更新
const { reorderProducts } = useProductReorder(setProducts, refreshProducts);
```

##### `useImageCompression`

[`app/dashboard/homepage/hooks/useImageCompression.ts`](../app/dashboard/homepage/hooks/useImageCompression.ts) (`useImageCompression`フック)

```typescript
// 画像圧縮処理
const { compressing, compressImageFile } = useImageCompression();
```

##### `useImageUpload`

[`app/dashboard/homepage/hooks/useImageUpload.ts`](../app/dashboard/homepage/hooks/useImageUpload.ts) (`useImageUpload`フック)

```typescript
// 画像アップロード処理
const { uploading, compressing, handleImageChange, uploadImage } = useImageUpload();
```

##### `useProductDelete`

[`app/dashboard/homepage/hooks/useProductDelete.ts`](../app/dashboard/homepage/hooks/useProductDelete.ts) (`useProductDelete`フック)

```typescript
// 商品削除処理（確認ダイアログ → API呼び出し → Toast通知 → リフレッシュ）
const { handleDelete } = useProductDelete(refreshProducts);
```

##### `useScrollPosition`

[`app/dashboard/homepage/hooks/useScrollPosition.ts`](../app/dashboard/homepage/hooks/useScrollPosition.ts) (`useScrollPosition`フック)

```typescript
// スクロール位置の監視
const {
  scrollContainerRef,
  showLeftGradient,
  showRightGradient,
  checkScrollPosition,
} = useScrollPosition();
```

#### フロントエンド用フック

##### `useProductModal`

[`app/hooks/useProductModal.ts`](../app/hooks/useProductModal.ts) (`useProductModal`フック)

```typescript
// 商品モーダルの状態管理
const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
  useProductModal();
```

## データフロー

**注意**: 技術的な詳細（使用している API、具体的な実装方法）については、[フロントエンドガイド](./guides/frontend/frontend-guide.md#データフロー)を参照してください。

### フロントエンド（公開ページ）

```
HomePage (Server Component)
  ↓ Prismaクエリ（データベースから直接取得）
  ↓ 公開商品のフィルタリング
  ↓ propsで渡す
ProductCategoryTabs (Client Component)
  ↓ カテゴリーごとのタブ切り替え
  ↓ propsで渡す
ProductGrid (Client Component)
  ↓ 状態管理（モーダル表示）
  ↓ イベントハンドリング
ProductModal (Client Component)
```

### ダッシュボード

```
DashboardPage (Server Component)
  ↓ Prismaクエリ（データベースから直接取得）
  ↓ propsで渡す
DashboardContent (Client Component)
  ↓ 状態のリフトアップ（products, refreshProducts）
  ↓ propsで渡す
ProductList (Client Component)
  ↓ 状態管理（検索条件、編集中の商品など）
  ↓ イベントハンドリング
子コンポーネント
```

**状態管理の設計**:

- React のベストプラクティスに従い、共有状態（商品一覧）は親コンポーネント（`DashboardContent`）で管理
- データフローが明確になり、コンポーネント間の結合が緩くなる
- `forwardRef`や`useImperativeHandle`を使わず、props でデータとコールバックを渡す

### API 呼び出しの流れ

```
Client Component
  ↓ fetchJson('/api/products')  ← lib/client-fetch.ts
API Route
  ↓ Prismaクエリ
Database
  ↓ レスポンス（自動パース・エラーハンドリング）
Client Component (状態更新)
```

### 楽観的 UI 更新

商品順序変更時のフロー：

```
1. ユーザーがドラッグ&ドロップ
2. ローカル状態を即座に更新（楽観的更新）
3. API呼び出し（バックグラウンド）
4. 成功: サーバーから最新データを取得
5. 失敗: エラー表示 + 元の状態に戻す
```

## 設定管理

**詳細**: 設定管理の詳細については、[ユーティリティ関数ガイド](./guides/backend/utilities-guide.md#設定の一元管理-libconfigts)を参照してください。

### 一元管理

すべての設定値を[`lib/config.ts`](../lib/config.ts) (`config`オブジェクト) に集約：

```typescript
export const config = {
  imageConfig: {
    MAX_FILE_SIZE_MB: 4,
    COMPRESSION_TARGET_SIZE_MB: 3.5,
    MAX_FILE_SIZE_BYTES: 4 * 1024 * 1024,
    MAX_IMAGE_WIDTH: 1920,
    MAX_IMAGE_HEIGHT: 1920,
    COMPRESSION_QUALITY: 0.85,
  },
  blobConfig: {
    PRODUCT_IMAGE_FOLDER: "products",
    CACHE_CONTROL_MAX_AGE: 31536000, // 1年
  },
  apiConfig: {
    PRODUCT_LIST_CACHE_SECONDS: 60,
    PRODUCT_LIST_STALE_WHILE_REVALIDATE_SECONDS: 120, // 2分
  },
  displayConfig: {
    GRID_COLUMNS: 3,
  },
};
```

**利点**:

- 設定値の変更が容易
- 環境ごとの設定が可能
- 型安全性の確保

## 型定義の管理

### 共通型定義

機能内で使用する型を一元管理：

[`app/dashboard/homepage/types.ts`](../app/dashboard/homepage/types.ts) (型定義)

```typescript
export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  // ...
}
```

**利点**:

- 型定義の重複を防止
- 一貫性の確保
- 変更時の影響範囲が明確

## エラーハンドリング

統一されたエラーハンドリングシステムを実装しています。

### 統一されたエラークラス

[`lib/errors.ts`](../lib/errors.ts) でエラークラスとエラーコードの定数を定義しています。

```typescript
// 使用例
throw new ValidationError("Invalid input");
throw new NotFoundError("Product");
throw new DatabaseError("Failed to connect");
```

**エラーコードの定数定義**:

```typescript
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  BLOB_STORAGE_ERROR: "BLOB_STORAGE_ERROR",
  NOT_FOUND: "NOT_FOUND",
  // ...
} as const;
```

### API Routes でのエラーハンドリング

[`lib/api-helpers.ts`](../lib/api-helpers.ts) (`withErrorHandling`関数)

```typescript
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data });
});
```

### クライアントサイドのエラーハンドリング

[`lib/client-fetch.ts`](../lib/client-fetch.ts) (`fetchJson`関数) でレスポンスのエラーチェックとJSONパースを統一し、[`sonner`](https://sonner.emilkowal.dev/) の `toast` でユーザーに通知します。

```typescript
import { fetchJson } from "@/lib/client-fetch";
import { toast } from "sonner";

try {
  await fetchJson("/api/products", { method: "POST", ... });
  toast.success("商品を登録しました");
} catch (error) {
  toast.error(getUserFriendlyMessageJa(error));
}
```

**詳細**: エラーハンドリングの詳細については、[開発ガイドライン - エラーハンドリング](./development-guide.md#エラーハンドリング) と [ユーティリティ関数ガイド - エラーハンドリング](./guides/backend/utilities-guide.md#エラーハンドリング-liberrorsts) を参照してください。

## パフォーマンス最適化

パフォーマンス最適化の詳細なガイドライン（画像最適化、コード分割、データベースクエリの最適化、React コンポーネントの最適化など）については、[開発ガイドライン - パフォーマンス最適化](./development-guide.md#パフォーマンス最適化)を参照してください。

### このプロジェクトでの主な最適化

- **画像最適化**: クライアントサイド圧縮（[`lib/image-compression/`](../lib/image-compression/)）、WebP 形式への変換
- **Server Components**: デフォルトで Server Components を使用し、クライアント JavaScript を最小化
- **N+1 問題の回避**: Prisma の`include`で関連データを一度に取得

## セキュリティ

セキュリティの詳細なガイドライン（環境変数の管理、入力検証、SQL インジェクション対策、セキュリティヘッダーなど）については、[開発ガイドライン - セキュリティ](./development-guide.md#セキュリティ)を参照してください。

### このプロジェクトでの主なセキュリティ対策

- **入力検証**: API Routes ですべての入力を検証、ファイルタイプとサイズを検証
- **環境変数**: 機密情報は環境変数で管理し、[`lib/env.ts`](../lib/env.ts)で型安全に使用
- **SQL インジェクション対策**: Prisma により自動的に適用
- **セキュリティヘッダー**: [`next.config.ts`](../next.config.ts)で設定

## 参考リンク

### プロジェクト内のドキュメント

- **[開発ガイドライン](./development-guide.md)**: コーディング規約とベストプラクティス
- **[プロジェクト構造](./project-structure.md)**: ディレクトリ構造の詳細
- **[技術スタック](./tech-stack.md)**: 使用している技術の詳細
- **[Async/Await ガイド](./guides/basics/async-await-guide.md)**: async/await と Promise の使用方法
- **[ユーティリティ関数ガイド](./guides/backend/utilities-guide.md)**: ユーティリティ関数の詳細
- **[shadcn/ui ガイド](./guides/frontend/shadcn-ui-guide.md)**: shadcn/ui の使用方法とラッパーコンポーネントの作成

### 外部ドキュメント

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
