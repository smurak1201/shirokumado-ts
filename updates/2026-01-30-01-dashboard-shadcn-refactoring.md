# ダッシュボード shadcn UI リファクタリング仕様書

**日付**: 2026-01-30
**ブランチ**: feature/dashboard-shadcn-refactoring
**対象**: `app/dashboard/` ディレクトリ全体
**ステータス**: 完了
**完了日**: 2026-01-31

---

## 進捗状況

| #   | タスク                                       | 優先度 | ステータス | 備考 |
| --- | -------------------------------------------- | :----: | :--------: | ---- |
| 1   | shadcn UIコンポーネントの追加インストール    |   高   |    [o]     |      |
| 2   | Button コンポーネントの置き換え              |   高   |    [o]     |      |
| 3   | Dialog コンポーネントの置き換え              |   高   |    [o]     |      |
| 4   | Tabs コンポーネントの置き換え                |   中   |    [o]     | LayoutCategoryTabsは横スクロール機能維持のため現状維持 |
| 5   | Card コンポーネントの置き換え                |   中   |    [o]     |      |
| 6   | Badge コンポーネントの置き換え               |   中   |    [o]     |      |
| 7   | フォーム要素の置き換え（Input, Label, etc.） |   中   |    [o]     |      |
| 8   | RadioGroup コンポーネントの置き換え          |   低   |    [o]     |      |
| 9   | 動作確認・ビルドテスト                       |   -    |    [o]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

フロント側のページ（トップページ、FAQページ等）では shadcn/ui を使用しているが、ダッシュボード側ではすべてのUIを Tailwind CSS で直接実装している。これにより、以下の問題が発生している。

### 課題

- **課題1**: フロント側とダッシュボード側でUIの一貫性がない
- **課題2**: ボタン、モーダル、タブ等の基本UIが個別に実装されており、保守性が低い
- **課題3**: アクセシビリティ対応が不十分（shadcn/uiはRadix UIベースでアクセシビリティが担保されている）
- **課題4**: 新規コンポーネント追加時にスタイルの統一が難しい

### 設計方針

- **方針1**: 既存のshadcn/uiコンポーネントを最大限活用する
- **方針2**: 未インストールのコンポーネントは必要に応じて追加する
- **方針3**: 段階的に置き換えを行い、各タスク完了後に動作確認を実施する
- **方針4**: 既存の機能・見た目を維持しつつ、コードの一貫性を向上させる
- **方針5**: 既存のラッパーコンポーネントパターンに従う（後述）

### コンポーネント配置とラッパーパターン

プロジェクトでは以下のパターンでshadcnコンポーネントを使用している。

**ファイル配置**:
- ベースコンポーネント: `app/components/ui/badge.tsx`, `card.tsx` など
- ラッパーコンポーネント: `app/components/ui/badge-price.tsx`, `card-product.tsx` など
- すべて `app/components/ui/` に配置

**ラッパーコンポーネントの構造**:

```tsx
import { Badge } from "./badge";  // 相対パスでインポート
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

// 型定義: ベースコンポーネントのpropsを継承
export type PriceBadgeProps = ComponentPropsWithoutRef<typeof Badge>;

// ラッパーコンポーネント
export function PriceBadge({ className, ...props }: PriceBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("デフォルトスタイル", className)}  // cn()でマージ
      {...props}
    />
  );
}
```

**ダッシュボードでの方針**:
- 基本的にはshadcnコンポーネントを直接使用する
- ダッシュボード専用のスタイルが必要な場合は `className` で対応
- 複数箇所で同じスタイルを使う場合のみラッパーを作成（DRY: 3箇所目で共通化）

### CLAUDE.md準拠事項

本リファクタリングでは以下のルールに従うこと。

**設計原則**:
- **YAGNI**: 現時点で必要な置き換えのみ実施。将来的な拡張のための過剰な抽象化は行わない
- **KISS**: shadcnコンポーネントをシンプルに使用。複雑なラッパーは作らない
- **モバイルファースト**: スタイルは `text-[8px] sm:text-[10px] md:text-sm` のように小さい画面から拡張

**コード品質**:
- 未使用のインポートは削除すること
- 関数の引数と返り値には型を付けること
- リントエラーを解消すること（`npm run lint`）

**Server/Client Components**:
- shadcn/uiのインタラクティブなコンポーネント（Dialog, Tabs, Select, RadioGroup等）を使用するファイルには `"use client"` が必要
- 既存のClient Componentはそのまま維持
- 新規でClient指定が必要な場合のみ追加

**Tailwind CSS**:
- `cn()` を使用してクラスをマージ（動的クラス名 `bg-${color}-500` は使用禁止）
- モバイルファーストで `sm:`, `md:`, `lg:` を使用

---

## タスク詳細

### タスク1: shadcn UIコンポーネントの追加インストール [完了]

**対象ファイル**:

- `app/components/ui/input.tsx`（**新規作成**）
- `app/components/ui/label.tsx`（**新規作成**）
- `app/components/ui/textarea.tsx`（**新規作成**）
- `app/components/ui/select.tsx`（**新規作成**）
- `app/components/ui/radio-group.tsx`（**新規作成**）

**問題点**:

ダッシュボードのフォームで使用する Input, Label, Textarea, Select, RadioGroup が未インストール。

**修正内容**:

shadcn CLI を使用して必要なコンポーネントをインストールする。

**実行コマンド**:

```bash
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add radio-group
```

**チェックリスト**:

- [o] Input コンポーネントをインストール
- [o] Label コンポーネントをインストール
- [o] Textarea コンポーネントをインストール
- [o] Select コンポーネントをインストール
- [o] RadioGroup コンポーネントをインストール
- [o] ビルドエラーがないこと

---

### タスク2: Button コンポーネントの置き換え [完了]

**対象ファイル**:

- `app/dashboard/components/list/ProductCard.tsx`（既存・変更）
- `app/dashboard/components/form/ProductFormModal.tsx`（既存・変更）
- `app/dashboard/components/form/ProductFormFooter.tsx`（既存・変更）

**問題点**:

ダッシュボード内のボタンが Tailwind CSS で直接スタイリングされており、`app/components/ui/button.tsx` が使用されていない。

**修正内容**:

既存の `<button>` 要素を shadcn の `<Button>` コンポーネントに置き換える。

**ProductCard.tsx の変更**:

```tsx
// 変更前
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

// 変更後
import { Button } from "@/app/components/ui/button";

<Button
  onClick={() => onEdit(product)}
  size="sm"
  className="flex-1 text-[8px] sm:text-[10px] md:text-sm"
>
  編集
</Button>
<Button
  onClick={() => onDelete(product.id)}
  variant="destructive"
  size="sm"
  className="flex-1 text-[8px] sm:text-[10px] md:text-sm"
>
  削除
</Button>
```

**ProductFormModal.tsx の変更（閉じるボタン）**:

```tsx
// 変更前
<button
  onClick={onClose}
  className="text-gray-500 hover:text-gray-700"
  aria-label="閉じる"
>
  ✕
</button>

// 変更後
import { Button } from "@/app/components/ui/button";

<Button
  onClick={onClose}
  variant="ghost"
  size="icon"
  aria-label="閉じる"
>
  ✕
</Button>
```

**ProductFormFooter.tsx の変更**:

```tsx
// 変更前
<button
  type="button"
  onClick={onClose}
  disabled={submitting || uploading || compressing}
  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
>
  キャンセル
</button>
<button
  type="submit"
  form={formId}
  disabled={submitting || uploading || compressing}
  className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
>
  {/* ... */}
</button>

// 変更後
import { Button } from "@/app/components/ui/button";

<Button
  type="button"
  onClick={onClose}
  disabled={submitting || uploading || compressing}
  variant="outline"
  className="flex-1"
>
  キャンセル
</Button>
<Button
  type="submit"
  form={formId}
  disabled={submitting || uploading || compressing}
  className="flex-1"
>
  {/* ... */}
</Button>
```

**チェックリスト**:

- [o] `ProductCard.tsx` のボタンを置き換え
- [o] `ProductFormModal.tsx` の閉じるボタンを置き換え
- [o] `ProductFormFooter.tsx` のボタンを置き換え
- [o] ビルドエラーがないこと
- [ ] ボタンの見た目・動作が正常であること

---

### タスク3: Dialog コンポーネントの置き換え [完了]

**対象ファイル**:

- `app/dashboard/components/form/ProductFormModal.tsx`（既存・変更）

**問題点**:

モーダルがカスタム実装されており、アクセシビリティやキーボード操作（ESCで閉じる等）が不十分。

**修正内容**:

既存の `ProductFormModal` を shadcn の `Dialog` コンポーネントで実装し直す。

**実装例**:

```tsx
// app/dashboard/components/form/ProductFormModal.tsx
"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";

interface ProductFormModalProps {
  title: string;
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * 商品フォームのモーダルコンポーネント
 *
 * 商品作成・編集フォームで使用する共通のモーダルUIを提供します。
 */
export default function ProductFormModal({
  title,
  isOpen,
  onClose,
  children,
  footer,
}: ProductFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-h-[90vh] w-full max-w-full overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**チェックリスト**:

- [o] `ProductFormModal.tsx` を Dialog で実装し直す
- [o] ESCキーでモーダルが閉じること
- [o] オーバーレイクリックでモーダルが閉じること
- [o] フォーカストラップが正常に動作すること
- [o] ビルドエラーがないこと

---

### タスク4: Tabs コンポーネントの置き換え [完了]

**対象ファイル**:

- `app/dashboard/components/list/ProductListTabs.tsx`（既存・変更）
- `app/dashboard/components/layout/LayoutCategoryTabs.tsx`（既存・変更）

**問題点**:

タブがカスタム実装されており、shadcn の `Tabs` コンポーネントが使用されていない。

**修正内容**:

既存のタブを shadcn の `Tabs` コンポーネントに置き換える。

**ProductListTabs.tsx の変更**:

```tsx
// app/dashboard/components/list/ProductListTabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import type { TabType } from "../../types";

interface ProductListTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * 商品一覧のタブ切り替えコンポーネント
 *
 * 「登録済み商品一覧」と「配置変更」のタブを表示します。
 */
export default function ProductListTabs({
  activeTab,
  onTabChange,
}: ProductListTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TabType)}
      className="mb-6"
    >
      <TabsList>
        <TabsTrigger value="list">登録済み商品一覧</TabsTrigger>
        <TabsTrigger value="layout">配置変更</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

**チェックリスト**:

- [o] `ProductListTabs.tsx` を Tabs で実装し直す
- [-] `LayoutCategoryTabs.tsx` を Tabs で実装し直す（横スクロール・グラデーション機能維持のため現状維持）
- [o] タブ切り替えが正常に動作すること
- [o] キーボード操作（矢印キー）でタブ切り替えができること
- [o] ビルドエラーがないこと

---

### タスク5: Card コンポーネントの置き換え [完了]

**対象ファイル**:

- `app/dashboard/components/list/ProductCard.tsx`（既存・変更）

**問題点**:

商品カードが Tailwind CSS で直接スタイリングされており、shadcn の `Card` コンポーネントが使用されていない。

**修正内容**:

既存のカードを shadcn の `Card` コンポーネントに置き換える。

**実装例**:

```tsx
// app/dashboard/components/list/ProductCard.tsx
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import ProductCardContent from "./ProductCardContent";
import type { Product } from "../../types";

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
    <Card className={!product.published ? "bg-gray-50" : ""}>
      <CardContent className="p-1 sm:p-2 md:p-4">
        <ProductCardContent
          product={product}
          showPublishedBadge
          showCategoryBadge
          isGrayscale={!product.published}
        />
      </CardContent>
      <CardFooter className="gap-0.5 p-1 pt-0 sm:gap-1 sm:p-2 sm:pt-0 md:gap-2 md:p-4 md:pt-0">
        <Button
          onClick={() => onEdit(product)}
          size="sm"
          className="flex-1 text-[8px] sm:text-[10px] md:text-sm"
        >
          編集
        </Button>
        <Button
          onClick={() => onDelete(product.id)}
          variant="destructive"
          size="sm"
          className="flex-1 text-[8px] sm:text-[10px] md:text-sm"
        >
          削除
        </Button>
      </CardFooter>
    </Card>
  );
}
```

**チェックリスト**:

- [o] `ProductCard.tsx` を Card で実装し直す
- [ ] カードの見た目が正常であること
- [o] ビルドエラーがないこと

---

### タスク6: Badge コンポーネントの置き換え [完了]

**対象ファイル**:

- `app/components/ui/badge.tsx`（既存・変更）
- `app/dashboard/components/list/ProductCardContent.tsx`（既存・変更）

**問題点**:

公開/非公開バッジ、カテゴリーバッジが Tailwind CSS で直接スタイリングされており、shadcn の `Badge` コンポーネントが使用されていない。また、現在のBadgeには緑色（success）のバリアントがない。

**修正内容**:

1. `badge.tsx` に `success` バリアントを追加
2. 既存のバッジを shadcn の `Badge` コンポーネントに置き換える

**badge.tsx への success バリアント追加**:

```tsx
// app/components/ui/badge.tsx の variants に追加
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // 追加: 公開状態など成功を表すバリアント
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

**ProductCardContent.tsx の変更**:

```tsx
// 変更前
<span
  className={`rounded-full px-1 py-0.5 text-[8px] font-medium sm:px-1.5 sm:py-0.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs ${
    product.published
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-600"
  }`}
>
  {product.published ? "公開" : "非公開"}
</span>

// 変更後
import { Badge } from "@/app/components/ui/badge";

<Badge
  variant={product.published ? "success" : "secondary"}
  className="text-[8px] sm:text-[10px] md:text-xs"
>
  {product.published ? "公開" : "非公開"}
</Badge>
```

**チェックリスト**:

- [o] `badge.tsx` に `success` バリアントを追加
- [o] 公開/非公開バッジを Badge で置き換え
- [o] カテゴリーバッジを Badge で置き換え
- [ ] バッジの見た目が正常であること
- [o] ビルドエラーがないこと

---

### タスク7: フォーム要素の置き換え（Input, Label, Textarea, Select） [完了]

**対象ファイル**:

- `app/dashboard/components/form/ProductBasicFields.tsx`（既存・変更）
- `app/dashboard/components/form/ProductPriceFields.tsx`（既存・変更）
- `app/dashboard/components/form/ProductDateFields.tsx`（既存・変更）
- `app/dashboard/components/form/ProductDateInput.tsx`（既存・変更）
- `app/dashboard/components/form/ProductImageField.tsx`（既存・変更）
- `app/dashboard/components/form/ProductPublishedField.tsx`（既存・変更）
- `app/dashboard/components/list/ProductSearchFilters.tsx`（既存・変更）

**問題点**:

フォーム要素（input, label, textarea, select）が HTML ネイティブ要素で実装されており、shadcn のフォームコンポーネントが使用されていない。

**修正内容**:

各フォーム要素を shadcn のコンポーネントに置き換える。

**ProductBasicFields.tsx の変更例**:

```tsx
// 変更前
<label
  htmlFor={`${fieldPrefix}name`}
  className="block text-sm font-medium text-gray-700"
>
  商品名 <span className="text-red-500">*</span>
</label>
<textarea
  id={`${fieldPrefix}name`}
  required
  rows={2}
  value={formData.name}
  onChange={(e) =>
    setFormData((prev) => ({ ...prev, name: e.target.value }))
  }
  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
/>

// 変更後
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";

<div className="space-y-2">
  <Label htmlFor={`${fieldPrefix}name`}>
    商品名 <span className="text-red-500">*</span>
  </Label>
  <Textarea
    id={`${fieldPrefix}name`}
    required
    rows={2}
    value={formData.name}
    onChange={(e) =>
      setFormData((prev) => ({ ...prev, name: e.target.value }))
    }
  />
</div>
```

**Select の置き換え例**:

```tsx
// 変更前
<select
  id={`${fieldPrefix}categoryId`}
  required
  value={formData.categoryId}
  onChange={(e) =>
    setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
  }
  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
>
  {/* options */}
</select>

// 変更後
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

<Select
  value={formData.categoryId}
  onValueChange={(value) =>
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }
>
  <SelectTrigger>
    <SelectValue placeholder="選択してください" />
  </SelectTrigger>
  <SelectContent>
    {categories.map((category) => (
      <SelectItem key={category.id} value={String(category.id)}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**チェックリスト**:

- [o] `ProductBasicFields.tsx` のフォーム要素を置き換え
- [o] `ProductPriceFields.tsx` のフォーム要素を置き換え
- [o] `ProductDateFields.tsx` のフォーム要素を置き換え
- [o] `ProductDateInput.tsx` のフォーム要素を置き換え
- [o] `ProductImageField.tsx` のフォーム要素を置き換え
- [o] `ProductPublishedField.tsx` のフォーム要素を置き換え
- [o] `ProductSearchFilters.tsx` のフォーム要素を置き換え
- [ ] フォームの入力・送信が正常に動作すること
- [o] ビルドエラーがないこと

---

### タスク8: RadioGroup コンポーネントの置き換え [完了]

**対象ファイル**:

- `app/dashboard/components/list/ProductSearchFilters.tsx`（既存・変更）
- `app/dashboard/components/form/ProductPublishedField.tsx`（既存・変更）

**問題点**:

ラジオボタンが HTML ネイティブ要素で実装されており、shadcn の `RadioGroup` コンポーネントが使用されていない。

**修正内容**:

既存のラジオボタンを shadcn の `RadioGroup` コンポーネントに置き換える。

**ProductSearchFilters.tsx の変更例（公開情報フィルター）**:

```tsx
// 変更前
<div className="flex items-center gap-4">
  <label className="flex cursor-pointer items-center">
    <input
      type="radio"
      name="search-published"
      checked={searchPublished === null}
      onChange={() => setSearchPublished(null)}
      className="mr-2"
    />
    <span>すべて</span>
  </label>
  {/* ... */}
</div>

// 変更後
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";

<RadioGroup
  value={searchPublished === null ? "all" : searchPublished ? "published" : "unpublished"}
  onValueChange={(value) => {
    if (value === "all") setSearchPublished(null);
    else if (value === "published") setSearchPublished(true);
    else setSearchPublished(false);
  }}
  className="flex items-center gap-4"
>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="all" id="search-all" />
    <Label htmlFor="search-all">すべて</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="published" id="search-published" />
    <Label htmlFor="search-published">公開</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="unpublished" id="search-unpublished" />
    <Label htmlFor="search-unpublished">非公開</Label>
  </div>
</RadioGroup>
```

**チェックリスト**:

- [o] `ProductSearchFilters.tsx` のラジオボタンを置き換え
- [o] `ProductPublishedField.tsx` のラジオボタンを置き換え
- [ ] ラジオボタンの選択が正常に動作すること
- [ ] キーボード操作（矢印キー）で選択変更ができること
- [o] ビルドエラーがないこと

---

### タスク9: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと
   - [o] TypeScriptエラーがないこと
   - [o] リントエラーがないこと

2. **動作確認** (`npm run dev`)
   - [ ] 商品一覧が正常に表示されること
   - [ ] タブ切り替えが正常に動作すること
   - [ ] 検索・フィルタリングが正常に動作すること
   - [ ] 商品の新規作成が正常に動作すること
   - [ ] 商品の編集が正常に動作すること
   - [ ] 商品の削除が正常に動作すること
   - [ ] ドラッグ&ドロップによる配置変更が正常に動作すること

3. **アクセシビリティ確認**
   - [ ] キーボードのみで操作できること
   - [ ] フォーカスが適切に移動すること
   - [ ] ESCキーでモーダルが閉じること

4. **品質チェックリスト**（CLAUDE.md準拠）
   - [o] この機能は**今**必要か？（YAGNI）
   - [o] もっとシンプルな方法はないか？（KISS）
   - [o] 未使用のインポートは削除したか？
   - [o] リントエラーは解消したか？（`npm run lint`）

---

## 変更対象ファイル一覧

| ファイル                                                     | 変更内容                    | ステータス |
| ------------------------------------------------------------ | --------------------------- | :--------: |
| `app/components/ui/input.tsx`                                | **新規作成**（shadcnインストール） |    [o]     |
| `app/components/ui/label.tsx`                                | **新規作成**（shadcnインストール） |    [o]     |
| `app/components/ui/textarea.tsx`                             | **新規作成**（shadcnインストール） |    [o]     |
| `app/components/ui/select.tsx`                               | **新規作成**（shadcnインストール） |    [o]     |
| `app/components/ui/radio-group.tsx`                          | **新規作成**（shadcnインストール） |    [o]     |
| `app/components/ui/badge.tsx`                                | successバリアント追加       |    [o]     |
| `app/dashboard/components/list/ProductCard.tsx`              | Button, Card 使用           |    [o]     |
| `app/dashboard/components/list/ProductCardContent.tsx`       | Badge 使用                  |    [o]     |
| `app/dashboard/components/list/ProductListTabs.tsx`          | Tabs 使用                   |    [o]     |
| `app/dashboard/components/list/ProductSearchFilters.tsx`     | Input, Select, RadioGroup 使用 |    [o]     |
| `app/dashboard/components/layout/LayoutCategoryTabs.tsx`     | Tabs 使用                   |    [-]     |
| `app/dashboard/components/form/ProductFormModal.tsx`         | Dialog 使用                 |    [o]     |
| `app/dashboard/components/form/ProductFormFooter.tsx`        | Button 使用                 |    [o]     |
| `app/dashboard/components/form/ProductBasicFields.tsx`       | Label, Textarea, Select 使用 |    [o]     |
| `app/dashboard/components/form/ProductPriceFields.tsx`       | Label, Input 使用           |    [o]     |
| `app/dashboard/components/form/ProductDateFields.tsx`        | Label 使用                  |    [o]     |
| `app/dashboard/components/form/ProductDateInput.tsx`         | Label, Input 使用           |    [o]     |
| `app/dashboard/components/form/ProductImageField.tsx`        | Label, Input 使用           |    [o]     |
| `app/dashboard/components/form/ProductPublishedField.tsx`    | Label, RadioGroup 使用      |    [o]     |

---

## 備考

### 注意事項

- 既存の正常に動作している機能には影響を与えないこと
- リファクタリングは段階的に行い、各タスク完了後に動作確認を実施すること
- shadcn/ui のコンポーネントはデフォルトのスタイルを使用し、必要に応じて className でカスタマイズする
- ドラッグ&ドロップ機能（@dnd-kit）との競合がないことを確認すること

### 参考

- フロント側での shadcn/ui 使用例: `app/components/ui/` 配下のコンポーネント
- shadcn/ui 公式ドキュメント: https://ui.shadcn.com/

**既存のラッパーコンポーネント例**（実装の参考にする）:

| ファイル | ベース | 用途 |
|---------|-------|------|
| `badge-price.tsx` | Badge | 価格表示用 |
| `badge-question.tsx` | Badge | FAQ質問番号用 |
| `card-product.tsx` | Card | 商品タイル用 |
| `card-faq.tsx` | Card | FAQ用 |
| `card-modal.tsx` | Card | モーダル内表示用 |

これらのファイルを参考に、`ComponentPropsWithoutRef` による型継承と `cn()` によるスタイルマージのパターンを確認すること。

### 実装順序の推奨

1. タスク1（コンポーネントインストール）- 他のタスクの前提条件
2. タスク2（Button）- 影響範囲が小さく、動作確認しやすい
3. タスク3（Dialog）- モーダルの改善、アクセシビリティ向上
4. タスク4（Tabs）- タブ切り替えの改善
5. タスク5（Card）- カード表示の統一
6. タスク6（Badge）- バッジ表示の統一
7. タスク7（フォーム要素）- 最も影響範囲が大きいため後半に実施
8. タスク8（RadioGroup）- フォーム要素と併せて実施
9. タスク9（動作確認）- 上記タスク完了後に実施

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
