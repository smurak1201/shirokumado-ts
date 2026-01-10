# アーキテクチャドキュメント

白熊堂プロジェクトのアーキテクチャと設計思想を説明します。

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

### フロントエンド (`app/`)

フロントエンドは、以下のように構造化されています：

```
app/
├── types.ts           # 共通型定義
├── hooks/            # カスタムフック
├── utils/            # ユーティリティ関数
└── components/       # UIコンポーネント
    └── icons/       # アイコンコンポーネント
```

**設計思想**:

- **`types.ts`**: フロントエンドで使用する型を一元管理（重複を防止）
- **`hooks/`**: 状態管理や副作用をカスタムフックに分離（再利用可能）
- **`utils/`**: 純粋関数として実装可能なビジネスロジック（テストしやすい）
- **`components/`**: UI コンポーネントのみを配置（見た目とレイアウト）
- **`components/icons/`**: アイコンコンポーネントを分離（再利用性）

### 機能別ディレクトリ (`app/dashboard/`)

ダッシュボード機能は、以下のように構造化されています：

```
app/dashboard/
├── types.ts           # 共通型定義
├── components/        # UIコンポーネント
├── hooks/            # 状態管理ロジック
└── utils/            # ビジネスロジック
```

**設計思想**:

- **`types.ts`**: その機能で使用する型を一元管理
- **`components/`**: UI コンポーネントのみを配置
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
└── api-helpers.ts    # API共通処理
```

## コンポーネント設計

### コンポーネントの階層構造

#### フロントエンド（公開ページ）

```
HomePage (Server Component)
  ├── Header (Server Component)
  ├── HeroBanner (Server Component)
  └── ProductGrid (Client Component)
      ├── useProductModal (カスタムフック)
      ├── ProductTile
      └── ProductModal
          ├── useModal (カスタムフック)
          ├── CloseIcon
          └── formatPrice (ユーティリティ関数)

FAQPage (Server Component)
  ├── Header (Server Component)
  └── FAQContent (Server Component)
```

#### ダッシュボード

```
DashboardPage (Server Component)
  └── DashboardContent (Client Component)
      ├── DashboardFormWrapper
      │   └── DashboardForm
      └── ProductList
          ├── CategoryTabs
          └── SortableProductItem
```

### コンポーネント分割の原則

1. **単一責任の原則**: 各コンポーネントは 1 つの責務を持つ
2. **再利用性**: 汎用的なコンポーネントは分離（例: `CategoryTabs`, `SortableProductItem`）
3. **関心の分離**: UI とロジックを分離（カスタムフックを使用）

### 例: ProductList の分割

**Before** (840 行の巨大コンポーネント):

- タブ状態管理
- 商品順序変更ロジック
- カテゴリータブ UI
- ドラッグ&ドロップ UI
- すべてが 1 つのファイルに

**After** (分割後):

- `ProductList.tsx`: メインロジック（約 490 行）
- `CategoryTabs.tsx`: カテゴリータブ UI
- `SortableProductItem.tsx`: ドラッグ&ドロップ可能な商品アイテム
- `useTabState.ts`: タブ状態管理フック
- `useProductReorder.ts`: 商品順序変更フック
- `productUtils.ts`: 商品のグループ化・フィルタリング関数

## 状態管理

### 状態管理の戦略

1. **Server State**: Server Components で直接データフェッチ
2. **Client State**: React の`useState`とカスタムフック
3. **Persistent State**: `localStorage`をカスタムフックで管理

### カスタムフックの活用

#### ダッシュボード用フック

##### `useTabState`

```typescript
// タブ状態をlocalStorageと同期
const { activeTab, setActiveTab } = useTabState();
```

##### `useCategoryTabState`

```typescript
// カテゴリータブの状態管理
const { activeCategoryTab, setActiveCategoryTab } = useCategoryTabState(
  products,
  categories
);
```

##### `useProductReorder`

```typescript
// 商品順序変更の楽観的UI更新
const { reorderProducts } = useProductReorder(setProducts, refreshProducts);
```

#### フロントエンド用フック

##### `useModal`

```typescript
// モーダルの開閉状態とESCキー処理を管理
useModal(isOpen, onClose);
```

##### `useProductModal`

```typescript
// 商品モーダルの状態管理
const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
  useProductModal();
```

## データフロー

### フロントエンド（公開ページ）

```
HomePage (Server Component)
  ↓ Prismaクエリ（データベースから直接取得）
  ↓ 公開商品のフィルタリング
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
  ↓ fetch('/api/products')
API Route
  ↓ Prismaクエリ
Database
  ↓ レスポンス
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

### 一元管理 (`lib/config.ts`)

すべての設定値を`lib/config.ts`に集約：

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
    CATEGORY_LIST_CACHE_SECONDS: 300, // 5分
    CATEGORY_LIST_STALE_WHILE_REVALIDATE_SECONDS: 600, // 10分
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

### 共通型定義 (`app/dashboard/types.ts`)

機能内で使用する型を一元管理：

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

### 統一されたエラークラス (`lib/errors.ts`)

```typescript
// 使用例
throw new ValidationError("Invalid input");
throw new NotFoundError("Product");
throw new DatabaseError("Failed to connect");
```

### API Routes でのエラーハンドリング

```typescript
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data });
});
```

## パフォーマンス最適化

### 画像最適化

- **クライアントサイド圧縮**: `lib/image-compression.ts`
- **WebP 形式**: デフォルトで WebP 形式に変換
- **サイズ制限**: 4MB 以下に制限

### データフェッチング

- **Server Components**: デフォルトで Server Components を使用
- **キャッシュ**: API Routes で適切なキャッシュヘッダーを設定
- **N+1 問題の回避**: Prisma の`include`で関連データを一度に取得（`select`はこのアプリでは未使用）

## セキュリティ

### 入力検証

- **API Routes**: すべての入力を検証
- **ファイルアップロード**: ファイルタイプとサイズを検証
- **Prisma**: SQL インジェクション対策が自動的に適用

### 環境変数

- **機密情報**: 環境変数で管理
- **型安全性**: `lib/env.ts`で型定義

## 参考リンク

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
