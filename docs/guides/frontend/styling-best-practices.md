# スタイリングのベストプラクティス

このドキュメントでは、Tailwind CSS と shadcn/ui を使用したスタイリングのベストプラクティスを説明します。

## このドキュメントの役割

このドキュメントは「**Tailwind CSS でのスタイル統一方法**」を説明します。スタイルの再利用、ラッパーコンポーネント vs 直接クラス指定など、スタイリング方針を理解したいときに参照してください。

**関連ドキュメント**:
- [shadcn/ui ガイド](./shadcn-ui-guide.md): UI コンポーネントライブラリ
- [開発ガイドライン](../../development-guide.md): 全体的なコーディング規約

## 目次

- [概要](#概要)
- [スタイルの統一方法](#スタイルの統一方法)
- [各アプローチの比較](#各アプローチの比較)
- [推奨される使い分け](#推奨される使い分け)
- [実装例](#実装例)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

このプロジェクトでは **Tailwind CSS v4** を使用しています。v4 では CSS-first configuration が採用され、`@theme` ディレクティブでテーマをカスタマイズします。

同じスタイルを複数箇所で使用する場合、以下の2つのアプローチを推奨します：

1. **明示的なクラス指定**: Tailwind の標準クラスをそのまま使用（推奨）
2. **ラッパーコンポーネント**: shadcn/ui のコンポーネントをラップ

**注意**: Tailwind CSS v4 では `@apply` の使用は推奨されていません。コンポーネントベースのアプローチを優先してください。

それぞれの特徴と使い分けについて、以下で詳しく説明します。

## スタイルの統一方法

### 1. 明示的なクラス指定

**推奨**: 小規模な繰り返し（2-3箇所程度）

**特徴**:
- Tailwind の標準的なクラスをそのまま使用
- コードが読みやすく、意図が明確
- 学習コストが低い

**使用例**:
```tsx
<header className="border-b border-border bg-background">
<footer className="border-t border-border bg-background">
```

**メリット**:
- Tailwind の標準的な使い方
- コードが読みやすい
- デバッグが容易
- IDE の補完が効く

**デメリット**:
- 同じクラスを複数箇所で書く必要がある
- 変更時に複数箇所を修正する必要がある

**適用範囲**: 2-3箇所程度の小規模な繰り返し

---

### 2. CSS変数によるテーマカスタマイズ（v4推奨）

**推奨**: テーマ全体で統一したい値がある場合

**特徴**:
- `@theme` ディレクティブでテーマ変数を定義
- CSS変数として自動的にユーティリティクラスが生成される

**使用例**:

```css
/* globals.css */
@theme inline {
  --color-brand: #3b82f6;
  --color-brand-foreground: #ffffff;
}
```

```tsx
{/* 自動的に bg-brand, text-brand-foreground などのクラスが使用可能 */}
<button className="bg-brand text-brand-foreground">
```

**メリット**:
- v4 の公式推奨アプローチ
- CSS変数として他の場所でも再利用可能
- IDE の補完が効く

**デメリット**:
- テーマレベルの変更のみ（個別のユーティリティには不向き）

**適用範囲**: デザインシステムの色やスペーシングなど、テーマ全体で統一したい値

**注意**: `@layer utilities` と `@apply` は v4 では非推奨です。複雑なスタイルの再利用にはラッパーコンポーネントを使用してください。

---

### 3. ラッパーコンポーネント

**推奨**: 大規模な繰り返し、または複雑なスタイル

**特徴**:
- shadcn/ui のコンポーネントをラップ
- アプリ固有のデフォルトスタイルを適用
- 型安全性が保たれる

**使用例**:

```tsx
// app/components/ui/card-product.tsx
import { Card } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ProductCardProps = ComponentPropsWithoutRef<typeof Card>;

export function ProductCard({ className, ...props }: ProductCardProps) {
  return (
    <Card
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden transition-all duration-500",
        "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
        "hover:border-primary/40 border-border/60",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}
```

```tsx
<ProductCard className="h-20">...</ProductCard>
```

**メリット**:
- 型安全性が保たれる
- 再利用性が高い
- コンポーネントとして独立している
- テストしやすい

**デメリット**:
- ファイルが増える
- 過剰な抽象化のリスク

**適用範囲**: 複数のプロパティを組み合わせる場合、またはコンポーネントとして独立させる価値がある場合

---

## 各アプローチの比較

| 観点 | 明示的なクラス指定 | @theme変数 | ラッパーコンポーネント |
|------|-------------------|-----------|---------------------|
| **学習コスト** | 低い | 低い | 中程度 |
| **コードの可読性** | 高い | 高い | 高い |
| **保守性** | 低い（複数箇所） | 高い（1箇所） | 高い（1箇所） |
| **型安全性** | あり | あり | あり（より強い） |
| **適用範囲** | 小規模な繰り返し | テーマ全体 | 複雑なスタイル |
| **v4推奨** | ✓ 推奨 | ✓ 推奨 | ✓ 推奨 |

---

## 推奨される使い分け

### このプロジェクトでの推奨方針

Tailwind CSS v4 と shadcn/ui の設計思想に従い、以下の優先順位で判断します：

1. **明示的なクラス指定**（デフォルト）
   - 小規模な繰り返し（2-3箇所程度）
   - シンプルなスタイルの組み合わせ
   - Tailwind の標準クラスで表現可能な場合

2. **ラッパーコンポーネント**（複雑なスタイル）
   - 複数のプロパティを組み合わせる場合
   - コンポーネントとして独立させる価値がある場合
   - 既存のパターン（`card-product.tsx` など）に合わせる

3. **@theme変数**（テーマレベル）
   - デザインシステム全体で統一したい色やスペーシング
   - CSS変数として複数箇所で再利用したい値

**注意**: `@apply` は v4 では非推奨です。使用しないでください。

### 判断フローチャート

```
同じスタイルを複数箇所で使用する？
│
├─ テーマ全体で統一したい色やスペーシング？
│  └─ @theme変数（globals.css）
│
├─ 2-3箇所程度のシンプルなスタイル？
│  └─ 明示的なクラス指定
│
└─ 複数のプロパティを組み合わせる複雑なスタイル？
   └─ ラッパーコンポーネント
```

---

## 実装例

### 例1: ヘッダー・フッターの境界線

**推奨**: 明示的なクラス指定

```tsx
// 良い例：シンプルで明確
<header className="border-b border-border">
<footer className="border-t border-border">
```

**理由**:
- 2箇所のみの使用
- シンプルなスタイル
- Tailwind の標準的な使い方

---

### 例2: 商品カード

**推奨**: ラッパーコンポーネント

```tsx
// app/components/ui/card-product.tsx
export function ProductCard({ className, ...props }: ProductCardProps) {
  return (
    <Card
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden transition-all duration-500",
        "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
        "hover:border-primary/40 border-border/60",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}
```

**理由**:
- 複数のプロパティを組み合わせている
- 商品一覧で複数箇所で使用
- コンポーネントとして独立させる価値がある

---

## まとめ

### このプロジェクトでの推奨事項（Tailwind CSS v4）

1. **デフォルトは明示的なクラス指定**
   - Tailwind の標準的な使い方を優先
   - コードが読みやすく、学習コストが低い

2. **複雑なスタイルはラッパーコンポーネント**
   - 既存のパターン（`card-product.tsx` など）に合わせる
   - shadcn/ui の設計思想に従う

3. **テーマカスタマイズは @theme 変数**
   - `globals.css` の `@theme inline` ブロックで定義
   - CSS変数として自動的にユーティリティクラスが生成される

4. **@apply は使用しない**
   - v4 では非推奨
   - 代わりにラッパーコンポーネントを使用

5. **一貫性を保つ**
   - プロジェクト全体で同じアプローチを使用
   - 既存のコードスタイルに合わせる

### 現在の実装（ヘッダー・フッター）

```tsx
// 推奨：明示的なクラス指定
<header className="border-b border-border">
<footer className="border-t border-border">
```

**この実装が適切な理由**:
- 2箇所のみの使用
- シンプルで明確
- Tailwind の標準的な使い方
- プロジェクトの他の部分と一貫性がある

---

## 参考リンク

- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs)
- [shadcn/ui 公式ドキュメント](https://ui.shadcn.com/)
- [このプロジェクトの shadcn/ui ガイド](./shadcn-ui-guide.md)
- [このプロジェクトのフロントエンドガイド](./frontend-guide.md)
