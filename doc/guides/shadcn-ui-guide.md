# shadcn/ui ガイド

白熊堂プロジェクトでの shadcn/ui の使用方法について詳しく説明します。

## このドキュメントの役割

このドキュメントは「**shadcn/ui コンポーネントの使い方**」を説明します。コンポーネントの追加、カスタマイズ、ラッパーコンポーネントの作成など、UI 実装を理解したいときに参照してください。

**関連ドキュメント**:
- [スタイリングのベストプラクティス](./styling-best-practices.md): Tailwind CSS の使い方
- [開発ガイドライン](../development-guide.md#コンポーネント設計): コンポーネント設計

## 目次

- [概要](#概要)
- [shadcn/ui とは](#shadcnui-とは)
- [セットアップ](#セットアップ)
  - [初期設定](#初期設定)
  - [コンポーネントとテーマの配置](#コンポーネントとテーマの配置)
- [コンポーネントの追加](#コンポーネントの追加)
- [ユーティリティ関数](#ユーティリティ関数)
  - [cn 関数](#cn-関数)
- [ラッパーコンポーネントの作成](#ラッパーコンポーネントの作成)
  - [ラッパーコンポーネントとは](#ラッパーコンポーネントとは)
  - [作成方法](#作成方法)
  - [ファイル命名規則](#ファイル命名規則)
- [テーマカスタマイズ](#テーマカスタマイズ)
- [ベストプラクティス](#ベストプラクティス)
  - [コンポーネントのカスタマイズ](#コンポーネントのカスタマイズ)
  - [アクセシビリティ](#アクセシビリティ)
  - [パフォーマンス](#パフォーマンス)
  - [型安全性](#型安全性)
- [参考リンク](#参考リンク)

## 概要

shadcn/ui は、Radix UI と Tailwind CSS をベースにした、コピー&ペースト可能なコンポーネントライブラリです。このアプリケーションでは、モダンで統一感のある UI を実現するために shadcn/ui を使用しています。

**shadcn/ui の主な特徴**:

- **コピー&ペースト可能**: コンポーネントをプロジェクトに直接コピーし、自由にカスタマイズ可能
- **Radix UI ベース**: アクセシビリティに優れたプリミティブコンポーネントを使用
- **Tailwind CSS**: ユーティリティファーストのスタイリング
- **TypeScript**: 完全な型安全性を提供
- **カスタマイズ可能**: コンポーネントを直接編集して、プロジェクトの要件に合わせて調整可能

**このアプリでの使われ方**:

- 商品タイル、モーダルウィンドウ、FAQ ページなどの UI コンポーネントに使用
- 統一されたデザインシステムの実現
- アクセシビリティの向上

## shadcn/ui とは

shadcn/ui は、コンポーネントを npm パッケージとしてインストールするのではなく、プロジェクトに直接コピーする方式の UI ライブラリです。これにより、コンポーネントを完全にコントロールでき、必要に応じて自由にカスタマイズできます。

**従来の UI ライブラリとの違い**:

- **npm パッケージ方式**: コンポーネントが node_modules にインストールされ、カスタマイズが困難
- **shadcn/ui 方式**: コンポーネントがプロジェクト内にコピーされ、直接編集可能

**メリット**:

- コンポーネントの完全な所有権
- 自由なカスタマイズ
- バンドルサイズの最適化（必要なコンポーネントのみを含める）
- プロジェクト固有の要件に合わせた調整が容易

## セットアップ

### 初期設定

shadcn/ui の初期設定は、`components.json` ファイルで管理されています。

**設定ファイル**: [`components.json`](../../components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/app/components",
    "utils": "@/lib/utils",
    "ui": "@/app/components/ui",
    "lib": "@/lib",
    "hooks": "@/app/hooks"
  }
}
```

**設定項目の説明**:

- `style`: デフォルトスタイルを使用
- `rsc`: React Server Components をサポート
- `tsx`: TypeScript を使用
- `baseColor`: ベースカラーとして neutral を使用
- `cssVariables`: CSS 変数を使用したテーマ管理
- `aliases`: パスエイリアスの設定

### コンポーネントとテーマの配置

**コンポーネントの配置場所**: [`app/components/ui/`](../../app/components/ui/)

shadcn/ui のコンポーネントとラッパーコンポーネントは、すべて `app/components/ui/` ディレクトリに配置されています。インストール済みのコンポーネントは、このディレクトリ内のファイル一覧で確認できます。

**テーマ変数の設定場所**: [`app/globals.css`](../../app/globals.css)

shadcn/ui のテーマ変数は、`app/globals.css` の `:root` セレクタで定義されています。詳細については、[テーマカスタマイズ](#テーマカスタマイズ)セクションを参照してください。

## コンポーネントの追加

新しいコンポーネントを追加するには、`npx shadcn@latest add` コマンドを使用します。

**コマンド例**:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add tabs
```

**非対話モード**:

```bash
npx shadcn@latest add button --yes
```

追加されたコンポーネントは、`app/components/ui/` ディレクトリに配置されます。インストール済みのコンポーネントの確認方法については、[コンポーネントとテーマの配置](#コンポーネントとテーマの配置)セクションを参照してください。

## ユーティリティ関数

### cn 関数

クラス名をマージするユーティリティ関数です。shadcn/ui コンポーネントで使用されます。

**定義**: [`lib/utils.ts`](../../lib/utils.ts)

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**使用例**:

```typescript
import { cn } from "@/lib/utils";

<Card
  className={cn(
    "group relative cursor-pointer",
    "hover:shadow-lg",
    isActive && "border-primary"
  )}
>
```

**機能**:

- `clsx`: 条件付きクラス名を処理
- `twMerge`: Tailwind CSS のクラス名を適切にマージ（競合するクラスを解決）

**メリット**:

- 条件付きクラス名の適用が容易
- Tailwind CSS のクラス名の競合を自動的に解決
- コードの可読性が向上

## ラッパーコンポーネントの作成

### ラッパーコンポーネントとは

shadcn/ui のコンポーネントをラップして、アプリ固有のデフォルトスタイルを適用したコンポーネントです。同じスタイルを複数箇所で使用する場合や、アプリ全体で統一されたデザインを実現するために使用します。

**メリット**:

- コードの簡潔化: 長い className をラッパーに集約
- 保守性の向上: スタイル変更を1箇所で管理
- 型安全性の維持: `ComponentPropsWithoutRef` で型を保持
- 再利用性の向上: 同じスタイルを複数箇所で使用可能

### 作成方法

`ComponentPropsWithoutRef` を使用して、shadcn/ui コンポーネントをラップします。

**基本的なパターン**:

```typescript
import { Card } from "./card";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ProductCardProps = ComponentPropsWithoutRef<typeof Card>;

export function ProductCard({ className, ...props }: ProductCardProps) {
  return (
    <Card
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden",
        "hover:shadow-2xl hover:shadow-primary/10",
        className
      )}
      {...props}
    />
  );
}
```

**構文の説明**:

- **`ComponentPropsWithoutRef<typeof Card>`**: React の型ユーティリティ。コンポーネントの props の型から `ref` を除いた型を取得します。これにより、型を崩さずにラッパーコンポーネントを作成できます。
- **分割代入 `{ className, ...props }`**: props から `className` を抽出し、残りの props を `props` オブジェクトにまとめます。これにより、`className` を個別に処理しつつ、他の props をそのまま渡せます。
- **スプレッド演算子 `{...props}`**: `props` オブジェクトを展開して、すべての props を子コンポーネントに渡します。

**詳細な構文の説明**:

- TypeScript の型システムについては、[TypeScript ガイド - 型定義](./typescript-guide.md#型定義) を参照してください。
- React の props については、[React ガイド - コンポーネント設計](./react-guide.md#コンポーネント設計) を参照してください。
- JSX の構文については、[JSX ガイド - 属性（Props）](./jsx-guide.md#属性props) を参照してください。

**ポイント**:

- `ComponentPropsWithoutRef<typeof Card>` で型を定義
- `cn` 関数を使用してクラス名をマージ
- `className` を props として受け取り、デフォルトスタイルとマージ
- 他の props は `...props` でそのまま渡す

**このアプリでの使用例**:

- [`app/components/ui/card-product.tsx`](../../app/components/ui/card-product.tsx): 商品タイル用の Card ラッパー
- [`app/components/ui/card-modal.tsx`](../../app/components/ui/card-modal.tsx): モーダル内で使用する Card ラッパー
- [`app/components/ui/card-faq.tsx`](../../app/components/ui/card-faq.tsx): FAQ 用の Card ラッパー
- [`app/components/ui/badge-price.tsx`](../../app/components/ui/badge-price.tsx): 価格表示用の Badge ラッパー
- [`app/components/ui/badge-question.tsx`](../../app/components/ui/badge-question.tsx): 質問番号用の Badge ラッパー

### ファイル命名規則

ラッパーコンポーネントのファイル名は、**ベースコンポーネント名-用途** の形式で命名します。

**命名規則**:

- `{ベースコンポーネント名}-{用途}.tsx`
- 例: `card-product.tsx`, `badge-price.tsx`

**理由**:

- ファイル名でソートしたときに、ベースコンポーネントごとにグループ化される
- `card.tsx` (shadcn/ui) と `card-*.tsx` (ラッパー) が近くに並ぶ
- 関連するファイルを見つけやすい

**ファイル配置**:

ラッパーコンポーネントは、shadcn/ui コンポーネントと同じ `app/components/ui/` ディレクトリに配置します。サブディレクトリは作成せず、フラットな構造を維持します。

**ファイル一覧の例**:

```
badge.tsx          (shadcn/ui)
badge-price.tsx    (ラッパー)
badge-question.tsx (ラッパー)
card.tsx           (shadcn/ui)
card-faq.tsx       (ラッパー)
card-modal.tsx     (ラッパー)
card-product.tsx   (ラッパー)
```

**推奨事項**:

- 同じスタイルを2箇所以上で使用する場合にラッパーを作成
- ラッパーが10ファイル以上になる場合は、サブディレクトリの検討を検討
- ファイル名は用途が明確になるように命名

## テーマカスタマイズ

shadcn/ui のテーマは、CSS 変数を使用してカスタマイズできます。

**テーマ変数の定義**: [`app/globals.css`](../../app/globals.css)

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --border: 0 0% 89.8%;
  --radius: 0.5rem;
}
```

**Tailwind CSS 4 との統合**:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  /* ... */
}
```

**カスタマイズ方法**:

1. `app/globals.css` の `:root` セレクタで変数を変更
2. Tailwind CSS 4 の `@theme inline` ブロックでカラーを定義
3. コンポーネント内で `bg-background`、`text-foreground` などのクラスを使用

## ベストプラクティス

### コンポーネントのカスタマイズ

shadcn/ui のコンポーネントは、プロジェクト内にコピーされているため、直接編集してカスタマイズできます。

**推奨事項**:

- プロジェクト固有の要件に合わせてコンポーネントを調整
- 共通のスタイル変更は、`app/globals.css` のテーマ変数で管理
- コンポーネント固有の変更は、各コンポーネントファイルで直接編集

### アクセシビリティ

shadcn/ui は Radix UI をベースにしているため、デフォルトでアクセシビリティに配慮されています。

**推奨事項**:

- `aria-label` を適切に設定
- キーボードナビゲーションをサポート
- フォーカス管理を適切に実装

### パフォーマンス

**推奨事項**:

- 必要なコンポーネントのみをインストール
- コンポーネントを直接編集して、不要な機能を削除可能
- `React.memo` を適切に使用して再レンダリングを最適化

### 型安全性

shadcn/ui は TypeScript を完全にサポートしています。

**推奨事項**:

- コンポーネントの props に適切な型を設定
- `cn` 関数を使用してクラス名を型安全にマージ

### スタイリングの統一

同じスタイルを複数箇所で使用する場合のベストプラクティスについては、[スタイリングのベストプラクティス](./styling-best-practices.md)を参照してください。

**主なポイント**:

- 明示的なクラス指定（デフォルト）
- ラッパーコンポーネント（複雑なスタイル）
- カスタムユーティリティクラス（限定的）

## 参考リンク

- [shadcn/ui 公式ドキュメント](https://ui.shadcn.com/)
- [Radix UI 公式ドキュメント](https://www.radix-ui.com/)
- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/)
- [このアプリのスタイリングのベストプラクティス](./styling-best-practices.md)
- [このアプリのフロントエンドガイド](./frontend-guide.md)
- [このアプリの React ガイド](./react-guide.md)
