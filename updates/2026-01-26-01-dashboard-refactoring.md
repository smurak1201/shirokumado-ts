# dashboardディレクトリリファクタリング仕様書

**日付**: 2026-01-26
**ブランチ**: claude/refactor-dashboard-directory-tZY7E
**対象**: `app/dashboard/` ディレクトリ全体
**ステータス**: 未着手
**完了日**: -

---

## 進捗状況

| #   | タスク                                           | 優先度 | ステータス | 備考 |
| --- | ------------------------------------------------ | :----: | :--------: | ---- |
| 1   | ProductCardContent コンポーネントの抽出          |   高   |    [ ]     |      |
| 2   | useProductSearch フックの抽出                    |   高   |    [ ]     |      |
| 3   | DashboardForm と ProductEditForm の統合          |   中   |    [ ]     |      |
| 4   | ファイル構造のサブディレクトリ分割               |   中   |    [ ]     |      |
| 5   | 型定義の整理と共通化                             |   低   |    [o]     |      |
| 6   | 動作確認・ビルドテスト                           |   -    |    [ ]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

`app/dashboard/` ディレクトリには20個のコンポーネント、6個のカスタムフック、3個のユーティリティが存在する。現状でも動作しているが、CLAUDE.mdのルールに基づいてコードの保守性と可読性を向上させる余地がある。

### 課題

- **課題1**: `ProductCard.tsx` と `SortableProductItem.tsx` が類似したUIを持ち、同じ表示ロジックが重複している
- **課題2**: `ProductList.tsx` に検索関連の状態（searchName, searchPublished, searchCategoryId）が直接定義されており、単一責任の原則に反している
- **課題3**: `DashboardForm.tsx` と `ProductEditForm.tsx` が非常に似た構造を持ち、共通化の余地がある
- **課題4**: コンポーネント数が多く、ファイルの見通しが悪い
- **課題5**: 型定義が分散しており、一部の型が適切にエクスポートされていない

### 良好な点（修正不要）

- エラーハンドリングは適切に実装されている（try-catch + ユーザーフレンドリーなメッセージ）
- 非同期処理の並列化（`Promise.all()`）は適切に使用されている
- 型定義は関数の引数・返り値に適切に付与されている
- コンポーネントは基本的に単一責任で分割されている
- カスタムフックが適切に使用されている
- 動的インポート（`ProductLayoutTab`）は既に実装されている

### 設計方針

- **DRY**: 3箇所以上で使用されるコードのみ共通化する（CLAUDE.mdルール準拠）
- **KISS**: 最もシンプルな解決策を選ぶ
- **YAGNI**: 現時点で必要な改善のみ実施する
- **単一責任**: 各コンポーネント・フックは1つの責務を持つように分割
- **モバイルファースト**: スマートフォン向けのスタイルを基本とし、`sm:`、`md:`、`lg:` で大きな画面へ拡張

---

## タスク詳細

### タスク1: ProductCardContent コンポーネントの抽出

**対象ファイル**:

- `app/dashboard/components/ProductCardContent.tsx`（**新規作成**）
- `app/dashboard/components/ProductCard.tsx`（既存・変更）
- `app/dashboard/components/SortableProductItem.tsx`（既存・変更）

**問題点**:

`ProductCard.tsx` と `SortableProductItem.tsx` が以下の同じUI構造を持つ：
- 商品画像の表示
- 商品名の表示
- 価格の表示

**修正内容**:

共通の商品カード内容を `ProductCardContent` として抽出し、両コンポーネントから使用する。

**実装例**:

```tsx
// app/dashboard/components/ProductCardContent.tsx（新規作成）
import Image from "next/image";
import type { Product } from "../types";

interface ProductCardContentProps {
  product: Product;
  showPublishedBadge?: boolean;
  showCategoryBadge?: boolean;
  isGrayscale?: boolean;
}

/**
 * 商品カードの共通コンテンツコンポーネント
 *
 * ProductCard と SortableProductItem で共有される商品表示部分。
 */
export default function ProductCardContent({
  product,
  showPublishedBadge = false,
  showCategoryBadge = false,
  isGrayscale = false,
}: ProductCardContentProps) {
  return (
    <>
      {product.imageUrl ? (
        <div className={`relative h-20 w-full sm:h-32 md:h-48 ${isGrayscale ? "opacity-50" : ""}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="rounded object-cover"
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          />
        </div>
      ) : (
        <div
          className={`h-20 w-full rounded bg-gray-200 sm:h-32 md:h-48 ${
            isGrayscale ? "opacity-50" : ""
          }`}
        />
      )}

      <div className="mt-1 flex flex-1 flex-col sm:mt-2 md:mt-4">
        <div className="mb-1 flex h-[3em] items-center justify-center sm:mb-2 sm:h-[3em] md:h-[3.5em]">
          <h3
            className={`line-clamp-2 whitespace-pre-wrap text-center text-[10px] font-semibold leading-tight sm:text-xs md:text-lg ${
              isGrayscale ? "text-gray-500" : ""
            }`}
          >
            {product.name}
          </h3>
        </div>

        {(showPublishedBadge || showCategoryBadge) && (
          <div className="mb-1 flex flex-wrap gap-0.5 sm:mb-2 sm:gap-1 md:gap-2">
            {showPublishedBadge && (
              <span
                className={`rounded-full px-1 py-0.5 text-[8px] font-medium sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                  product.published
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {product.published ? "公開" : "非公開"}
              </span>
            )}
            {showCategoryBadge && (
              <span
                className={`rounded-full px-1 py-0.5 text-[8px] sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
                  isGrayscale
                    ? "bg-gray-200 text-gray-500"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {product.category.name}
              </span>
            )}
          </div>
        )}

        <div
          className={`mb-1 text-[8px] sm:mb-2 sm:text-[10px] md:mb-4 md:text-sm ${
            isGrayscale ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {product.priceS && (
            <span>S: ¥{product.priceS.toLocaleString()}</span>
          )}
          {product.priceS && product.priceL && (
            <span className="mx-0.5 sm:mx-1 md:mx-2">/</span>
          )}
          {product.priceL && (
            <span>L: ¥{product.priceL.toLocaleString()}</span>
          )}
        </div>
      </div>
    </>
  );
}
```

**ProductCard.tsx の変更**:

```tsx
// app/dashboard/components/ProductCard.tsx
import ProductCardContent from "./ProductCardContent";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

/**
 * 商品カードコンポーネント
 *
 * 商品情報を表示するカードUIを提供します。
 */
export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <div
      className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 ${
        !product.published ? "bg-gray-50" : "bg-white"
      }`}
    >
      <ProductCardContent
        product={product}
        showPublishedBadge
        showCategoryBadge
        isGrayscale={!product.published}
      />

      <div className="mt-auto flex gap-0.5 sm:gap-1 md:gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 rounded-md bg-blue-600 px-0.5 py-0.5 text-[8px] font-medium text-white hover:bg-blue-700 sm:px-1 sm:py-1 sm:text-[10px] md:px-3 md:py-2 md:text-sm"
        >
          編集
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 rounded-md bg-red-600 px-0.5 py-0.5 text-[8px] font-medium text-white hover:bg-red-700 sm:px-1 sm:py-1 sm:text-[10px] md:px-3 md:py-2 md:text-sm"
        >
          削除
        </button>
      </div>
    </div>
  );
}
```

**SortableProductItem.tsx の変更**:

```tsx
// app/dashboard/components/SortableProductItem.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProductCardContent from "./ProductCardContent";
import type { Product } from "../types";

interface SortableProductItemProps {
  product: Product;
}

/**
 * ドラッグ&ドロップ可能な商品アイテムコンポーネント
 */
export default function SortableProductItem({
  product,
}: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: "none",
      }}
      className={`flex flex-col rounded-lg border border-gray-200 p-1 sm:p-2 md:p-4 bg-white cursor-move ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <ProductCardContent product={product} />
    </div>
  );
}
```

**チェックリスト**:

- [ ] `ProductCardContent.tsx` を新規作成
- [ ] `ProductCard.tsx` で `ProductCardContent` を使用するよう変更
- [ ] `SortableProductItem.tsx` で `ProductCardContent` を使用するよう変更
- [ ] ビルドエラーがないこと
- [ ] 商品一覧の表示が変わらないこと
- [ ] ドラッグ&ドロップが正常に動作すること

---

### タスク2: useProductSearch フックの抽出

**対象ファイル**:

- `app/dashboard/hooks/useProductSearch.ts`（**新規作成**）
- `app/dashboard/components/ProductList.tsx`（既存・変更）

**問題点**:

`ProductList.tsx` に検索関連の状態（`searchName`, `searchPublished`, `searchCategoryId`）とフィルタリングロジックが直接定義されており、単一責任の原則に反している。

**修正内容**:

検索関連の状態とロジックを `useProductSearch` フックに抽出する。

**実装例**:

```tsx
// app/dashboard/hooks/useProductSearch.ts（新規作成）
import { useState, useMemo } from "react";
import { filterProducts } from "../utils/productUtils";
import type { Product } from "../types";

/**
 * 商品検索の状態管理を行うカスタムフック
 *
 * 商品一覧の検索・フィルタリング機能を提供します。
 */
export function useProductSearch(products: Product[]) {
  const [searchName, setSearchName] = useState("");
  const [searchPublished, setSearchPublished] = useState<boolean | null>(null);
  const [searchCategoryId, setSearchCategoryId] = useState<number | null>(null);

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, searchName, searchPublished, searchCategoryId),
    [products, searchName, searchPublished, searchCategoryId]
  );

  const resetFilters = () => {
    setSearchName("");
    setSearchPublished(null);
    setSearchCategoryId(null);
  };

  return {
    searchName,
    setSearchName,
    searchPublished,
    setSearchPublished,
    searchCategoryId,
    setSearchCategoryId,
    filteredProducts,
    resetFilters,
  };
}
```

**ProductList.tsx の変更（59-67行目付近）**:

```tsx
// 変更前
const [searchName, setSearchName] = useState("");
const [searchPublished, setSearchPublished] = useState<boolean | null>(null);
const [searchCategoryId, setSearchCategoryId] = useState<number | null>(null);

const filteredProducts = useMemo(
  () =>
    filterProducts(products, searchName, searchPublished, searchCategoryId),
  [products, searchName, searchPublished, searchCategoryId]
);

// 変更後
import { useProductSearch } from "../hooks/useProductSearch";

// コンポーネント内
const {
  searchName,
  setSearchName,
  searchPublished,
  setSearchPublished,
  searchCategoryId,
  setSearchCategoryId,
  filteredProducts,
} = useProductSearch(products);
```

**チェックリスト**:

- [ ] `useProductSearch.ts` を新規作成
- [ ] `ProductList.tsx` でフックを使用するよう変更
- [ ] `useState`, `useMemo` の未使用インポートを削除
- [ ] `filterProducts` のインポートを `ProductList.tsx` から削除
- [ ] ビルドエラーがないこと
- [ ] 検索・フィルタリング機能が正常に動作すること

---

### タスク3: DashboardForm と ProductEditForm の統合

**対象ファイル**:

- `app/dashboard/components/ProductForm.tsx`（**新規作成**）
- `app/dashboard/components/DashboardForm.tsx`（削除候補）
- `app/dashboard/components/ProductEditForm.tsx`（削除候補）
- `app/dashboard/components/DashboardContent.tsx`（既存・変更）
- `app/dashboard/components/ProductList.tsx`（既存・変更）

**問題点**:

`DashboardForm.tsx` と `ProductEditForm.tsx` は以下の点で非常に似ている：
- 同じ `useProductForm` フックを使用
- 同じ `ProductFormModal`, `ProductFormFields`, `ProductFormFooter` を使用
- 送信処理のみが異なる（create vs update）

**修正内容**:

両コンポーネントを `ProductForm` に統合し、mode プロパティで作成/編集を切り替える。

**実装例**:

```tsx
// app/dashboard/components/ProductForm.tsx（新規作成）
"use client";

import { useProductForm } from "../hooks/useProductForm";
import ProductFormFields from "./ProductFormFields";
import ProductFormModal from "./ProductFormModal";
import ProductFormFooter from "./ProductFormFooter";
import { handleProductCreateSubmit, handleProductUpdateSubmit } from "../utils/productFormSubmit";
import { createInitialFormDataFromProduct } from "../utils/productFormData";
import type { Category, Product } from "../types";

interface ProductFormProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  mode: "create" | "edit";
  product?: Product;
}

/**
 * 商品フォームコンポーネント
 *
 * 商品の新規作成と編集の両方に対応するフォームを提供します。
 */
export default function ProductForm({
  categories,
  isOpen,
  onClose,
  onSuccess,
  mode,
  product,
}: ProductFormProps) {
  const isEditMode = mode === "edit" && product;

  const {
    formData,
    setFormData,
    submitting,
    setSubmitting,
    uploading,
    compressing,
    imagePreview,
    handleImageChange,
    uploadImage,
    hasDateRangeValue,
  } = useProductForm(
    isEditMode
      ? {
          initialImageUrl: product.imageUrl,
          initialFormData: createInitialFormDataFromProduct(product),
        }
      : {}
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (isEditMode) {
      await handleProductUpdateSubmit({
        productId: product.id,
        formData,
        uploadImage,
        imagePreview,
        originalImageUrl: product.imageUrl,
        setSubmitting,
        onUpdated: onSuccess,
        onClose,
      });
    } else {
      await handleProductCreateSubmit({
        formData,
        uploadImage,
        imagePreview,
        setSubmitting,
        setFormData,
        onProductCreated: onSuccess,
        onClose,
      });
    }
  };

  const title = isEditMode ? "商品を編集" : "新規商品登録";
  const formId = isEditMode ? "product-edit-form" : "product-form";
  const submitLabel = isEditMode ? "更新" : "商品を登録";
  const submittingLabel = isEditMode ? "更新中..." : "登録中...";
  const fieldPrefix = isEditMode ? "edit-" : "";

  return (
    <ProductFormModal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <ProductFormFooter
          submitting={submitting}
          uploading={uploading}
          compressing={compressing}
          onClose={onClose}
          submitLabel={submitLabel}
          uploadingLabel="画像をアップロード中..."
          submittingLabel={submittingLabel}
          formId={formId}
        />
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4 min-w-0">
        <ProductFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          submitting={submitting}
          uploading={uploading}
          compressing={compressing}
          imagePreview={imagePreview}
          onImageChange={(e) =>
            handleImageChange(e, isEditMode ? product.imageUrl : undefined)
          }
          hasDateRangeValue={hasDateRangeValue}
          fieldPrefix={fieldPrefix}
        />
      </form>
    </ProductFormModal>
  );
}
```

**チェックリスト**:

- [ ] `ProductForm.tsx` を新規作成
- [ ] `DashboardContent.tsx` で `ProductForm` を使用するよう変更
- [ ] `ProductList.tsx` で `ProductForm` を使用するよう変更
- [ ] `DashboardForm.tsx` を削除
- [ ] `ProductEditForm.tsx` を削除
- [ ] ビルドエラーがないこと
- [ ] 商品の新規作成が正常に動作すること
- [ ] 商品の編集が正常に動作すること

---

### タスク4: ファイル構造のサブディレクトリ分割

**対象ファイル**:

- `app/dashboard/components/` 配下のファイルを再編成

**問題点**:

20個のコンポーネントが1つのディレクトリに存在し、見通しが悪い。

**修正内容**:

関連するコンポーネントをサブディレクトリに整理する。

**新しいディレクトリ構造**:

```
app/dashboard/
├── components/
│   ├── form/                    # フォーム関連
│   │   ├── ProductForm.tsx
│   │   ├── ProductFormModal.tsx
│   │   ├── ProductFormFields.tsx
│   │   ├── ProductFormFooter.tsx
│   │   ├── ProductBasicFields.tsx
│   │   ├── ProductImageField.tsx
│   │   ├── ProductPriceFields.tsx
│   │   ├── ProductDateFields.tsx
│   │   ├── ProductDateInput.tsx
│   │   └── ProductPublishedField.tsx
│   │
│   ├── list/                    # 一覧表示関連
│   │   ├── ProductList.tsx
│   │   ├── ProductListTabs.tsx
│   │   ├── ProductListContent.tsx
│   │   ├── ProductSearchFilters.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProductCardContent.tsx
│   │
│   ├── layout/                  # 配置変更関連
│   │   ├── ProductLayoutTab.tsx
│   │   ├── LayoutCategoryTabs.tsx
│   │   └── SortableProductItem.tsx
│   │
│   └── DashboardContent.tsx     # メインコンテナ（ルートに残す）
│
├── hooks/                       # 変更なし
├── utils/                       # 変更なし
├── types.ts                     # 変更なし
└── page.tsx                     # 変更なし
```

**注意事項**:

- インポートパスの更新が必要
- 各ファイルのインポート文を相対パスで更新する

**チェックリスト**:

- [ ] `components/form/` ディレクトリを作成し、フォーム関連ファイルを移動
- [ ] `components/list/` ディレクトリを作成し、一覧表示関連ファイルを移動
- [ ] `components/layout/` ディレクトリを作成し、配置変更関連ファイルを移動
- [ ] 全ファイルのインポートパスを更新
- [ ] ビルドエラーがないこと
- [ ] 全機能が正常に動作すること

---

### タスク5: 型定義の整理と共通化

**対象ファイル**:

- `app/dashboard/types.ts`（既存・変更）
- `app/dashboard/hooks/useTabState.ts`（既存・変更）

**問題点**:

- `TabType` が `useTabState.ts` 内でローカルに定義されているが、`ProductListTabs.tsx` でも同じ型が使用されている
- 型の重複定義が発生している

**修正内容**:

共通の型定義を `types.ts` に集約する。

**実装例**:

```tsx
// app/dashboard/types.ts に追加

/**
 * ダッシュボードのタブ種別
 */
export type TabType = "list" | "layout";
```

**useTabState.ts の変更（9行目）**:

```tsx
// 変更前
type TabType = "list" | "layout";

// 変更後
import type { TabType } from "../types";
// ローカル定義を削除
```

**ProductListTabs.tsx の変更（3-6行目）**:

```tsx
// 変更前
interface ProductListTabsProps {
  activeTab: "list" | "layout";
  onTabChange: (tab: "list" | "layout") => void;
}

// 変更後
import type { TabType } from "../types";

interface ProductListTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}
```

**チェックリスト**:

- [ ] `types.ts` に `TabType` を追加
- [ ] `useTabState.ts` で型をインポートするよう変更
- [ ] `ProductListTabs.tsx` で型をインポートするよう変更
- [ ] ビルドエラーがないこと

---

### タスク6: 動作確認・ビルドテスト

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [ ] ダッシュボードページが正常に表示されること
   - [ ] 商品一覧が正常に表示されること
   - [ ] 検索・フィルタリングが正常に動作すること
   - [ ] 新規商品登録が正常に動作すること
   - [ ] 商品編集が正常に動作すること
   - [ ] 商品削除が正常に動作すること
   - [ ] 配置変更（ドラッグ&ドロップ）が正常に動作すること
   - [ ] 画像アップロードが正常に動作すること

2. **ビルド確認** (`npm run build`)
   - [ ] ビルドエラーがないこと
   - [ ] TypeScriptエラーがないこと
   - [ ] リントエラーがないこと

---

## 変更対象ファイル一覧

| ファイル                                                | 変更内容               | ステータス |
| ------------------------------------------------------- | ---------------------- | :--------: |
| `app/dashboard/components/ProductCardContent.tsx`       | **新規作成**           |    [ ]     |
| `app/dashboard/components/ProductCard.tsx`              | ProductCardContent使用 |    [ ]     |
| `app/dashboard/components/SortableProductItem.tsx`      | ProductCardContent使用 |    [ ]     |
| `app/dashboard/hooks/useProductSearch.ts`               | **新規作成**           |    [ ]     |
| `app/dashboard/components/ProductList.tsx`              | useProductSearch使用   |    [ ]     |
| `app/dashboard/components/ProductForm.tsx`              | **新規作成**           |    [ ]     |
| `app/dashboard/components/DashboardForm.tsx`            | 削除                   |    [ ]     |
| `app/dashboard/components/ProductEditForm.tsx`          | 削除                   |    [ ]     |
| `app/dashboard/components/DashboardContent.tsx`         | ProductForm使用        |    [ ]     |
| `app/dashboard/types.ts`                                | TabType追加            |    [ ]     |
| `app/dashboard/hooks/useTabState.ts`                    | 型インポート           |    [ ]     |
| `app/dashboard/components/ProductListTabs.tsx`          | 型インポート           |    [ ]     |

---

## 備考

### 注意事項

- 既存の正常に動作している機能には影響を与えないこと
- リファクタリングは段階的に行い、各タスク完了後に動作確認を実施すること
- タスク4（ファイル構造の分割）は他のタスク完了後に実施することを推奨

### 参考

- 類似のコード共通化: `app/components/ProductGrid.tsx` と `app/components/ProductModal.tsx`
- カスタムフックの実装例: `app/dashboard/hooks/useProductForm.ts`

### 実装順序の推奨

1. タスク5（型定義の整理）- 他のタスクに影響なし、単独で実装可能
2. タスク1（ProductCardContent抽出）- 単独で実装可能
3. タスク2（useProductSearch抽出）- 単独で実装可能
4. タスク3（フォーム統合）- タスク1, 2完了後が望ましい
5. タスク4（ファイル構造分割）- 全タスク完了後に実施
6. タスク6（動作確認）- 上記タスク完了後に実施

---

## 実装後の更新

各タスクの進捗に応じて以下を更新する:

**状態遷移ルール**（共通）:

- `[ ]` → `[~]` : 作業開始時
- `[~]` → `[o]` : 作業完了時

1. **進捗状況テーブル**
   - 上記の状態遷移ルールに従って更新
   - 備考欄に補足情報があれば記載

2. **タスクの見出し**
   - 完了時に「[完了]」を追記する（例: `### タスク1: ... [完了]`）

3. **タスク内のチェックリスト**
   - 上記の状態遷移ルールに従って各項目を更新

### 完了時の更新

全タスク完了後:

1. ステータスを「未着手」→「完了」に変更
2. 完了日を追記
3. 実際に変更したファイル一覧を確認・更新
4. 検証結果をチェックリストに記入

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
