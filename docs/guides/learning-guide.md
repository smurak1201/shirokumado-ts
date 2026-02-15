# 勉強用ガイド

このプロジェクトで使用されている技術スタックを勉強するためのガイドです。Java、PHP、Laravel の経験がある方向けに、既存の知識と比較しながら学習を進められるよう構成しています。

## このドキュメントの役割

このドキュメントは「**どの順番で学習を進めるか**」を説明します。プロジェクトに参加したばかりの方や、技術スタックを体系的に学びたい方が最初に読むドキュメントです。

**関連ドキュメント**:

- [TypeScript ガイド](./basics/typescript-guide.md): 型システムの基礎
- [React ガイド](./frontend/react-guide.md): コンポーネントと状態管理
- [Next.js ガイド](./frontend/nextjs-guide.md): フレームワークの全体像

## 目次

- [技術スタック](#技術スタック)
- [学習の進め方](#学習の進め方)
- [ドキュメントの読み順序](#ドキュメントの読み順序)
- [ファイルの読み順序](#ファイルの読み順序)
- [ソースコードを読むときのコツ](#ソースコードを読むときのコツ)
- [技術スタック別おすすめファイル](#技術スタック別おすすめファイル)
- [Java/PHP/Laravel 経験者向けの補足](#javaphplaravel経験者向けの補足)
- [よくある質問](#よくある質問)

## 技術スタック

このプロジェクトは、以下の技術スタックを使用しています：

| 技術 | バージョン | 説明 |
|------|----------|------|
| **TypeScript** | 5.x | 型安全な JavaScript |
| **React** | 19.x | UI ライブラリ |
| **Next.js** | 16.x | React フレームワーク（App Router） |
| **Prisma** | 7.x | ORM（データベースアクセス） |
| **Tailwind CSS** | 4.x | CSS フレームワーク（CSS-based 設定） |
| **Auth.js** | 5.x | 認証ライブラリ（旧 NextAuth.js） |
| **shadcn/ui** | - | UI コンポーネントライブラリ |
| **Node.js** | 24.x | ランタイム |

Java、PHP、Laravel の経験がある方は、以下の知識を活用できます：

- **オブジェクト指向プログラミング**: クラス、継承、ポリモーフィズム
- **MVC パターン**: モデル、ビュー、コントローラーの分離
- **データベース操作**: SQL、ORM、マイグレーション
- **サーバーサイド開発**: リクエスト/レスポンス、API 設計

## 学習の進め方

### ステップ 1: 全体像の把握

まず、プロジェクトの全体像を把握します。

**読むべきドキュメント**:

1. [`README.md`](../../README.md) - プロジェクトの概要とセットアップ方法
2. [`docs/tech-stack.md`](../tech-stack.md) - 使用している技術スタックの一覧
3. [`docs/project-structure.md`](../project-structure.md) - ディレクトリ構造と各ファイルの役割

**確認すべきファイル**:

- [`package.json`](../../package.json) - 使用しているライブラリの確認
- [`prisma/schema.prisma`](../../prisma/schema.prisma) - データベース構造の確認

### ステップ 2: 基礎技術の理解

各技術の基礎を理解します。

**読むべきドキュメント**:

1. [TypeScript ガイド](./basics/typescript-guide.md) - 型システムの基礎
2. [React ガイド](./frontend/react-guide.md) - コンポーネント、Hooks、状態管理
3. [Async/Await ガイド](./basics/async-await-guide.md) - 非同期処理の基礎

**確認すべきファイル**:

- [`app/types.ts`](../../app/types.ts) - 型定義の例
- [`lib/product-utils.ts`](../../lib/product-utils.ts) - ユーティリティ関数の例

### ステップ 3: フレームワークの理解

Next.js の概念と使い方を理解します。

**読むべきドキュメント**:

1. [Next.js ガイド](./frontend/nextjs-guide.md) - Next.js の基礎
2. [App Router ガイド](./frontend/app-router-guide.md) - App Router の詳細
3. [Prisma ガイド](./backend/prisma-guide.md) - Prisma の基礎

**確認すべきファイル**:

- [`app/(public)/page.tsx`](../../app/(public)/page.tsx) - Server Component の例
- [`app/api/products/route.ts`](../../app/api/products/route.ts) - API Route の例
- [`lib/prisma.ts`](../../lib/prisma.ts) - Prisma Client の設定

### ステップ 4: 認証とセキュリティの理解

認証システムとセキュリティの実装を理解します。

**読むべきドキュメント**:

1. [Auth.js ガイド](./backend/authjs-guide.md) - 認証システムの実装
2. [認証ドキュメント](../authentication.md) - プロジェクトの認証詳細

**確認すべきファイル**:

- [`auth.ts`](../../auth.ts) - Auth.js エントリーポイント
- [`lib/auth-config.ts`](../../lib/auth-config.ts) - 認証設定
- [`app/dashboard/layout.tsx`](../../app/dashboard/layout.tsx) - 認証チェックの実装

### ステップ 5: 実装の詳細理解

実際の実装を詳しく読み、各機能がどのように実装されているかを理解します。

**読むべきドキュメント**:

1. [フロントエンドガイド](./frontend/frontend-guide.md) - フロントエンド実装の詳細
2. [ダッシュボードガイド](./frontend/dashboard-guide.md) - ダッシュボード機能の詳細
3. [開発ガイドライン](../development-guide.md) - コーディング規約

**確認すべきファイル**:

- [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) - ダッシュボードページ
- [`app/dashboard/homepage/components/form/ProductForm.tsx`](../../app/dashboard/homepage/components/form/ProductForm.tsx) - 商品フォーム
- [`app/dashboard/homepage/hooks/useProductForm.ts`](../../app/dashboard/homepage/hooks/useProductForm.ts) - フォーム状態管理フック
- [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) - コンポーネント実装

## ドキュメントの読み順序

### 必須（最初に読む）

| 順番 | ドキュメント | 内容 |
|------|-------------|------|
| 1 | [`README.md`](../../README.md) | プロジェクト概要、セットアップ方法 |
| 2 | [`docs/tech-stack.md`](../tech-stack.md) | 技術スタック一覧 |
| 3 | [`docs/project-structure.md`](../project-structure.md) | ディレクトリ構造、ファイル命名規則 |

### 基礎（推奨）

| 順番 | ドキュメント | 内容 |
|------|-------------|------|
| 4 | [TypeScript ガイド](./basics/typescript-guide.md) | 型定義、インターフェース、ジェネリクス |
| 5 | [React ガイド](./frontend/react-guide.md) | コンポーネント、Hooks、状態管理 |
| 6 | [Async/Await ガイド](./basics/async-await-guide.md) | 非同期処理、Promise、エラーハンドリング |
| 6.5 | [Node.js ガイド](./backend/nodejs-guide.md) | ランタイム、npm、環境変数管理 |

### フレームワーク（重要）

| 順番 | ドキュメント | 内容 |
|------|-------------|------|
| 7 | [Next.js ガイド](./frontend/nextjs-guide.md) | 画像最適化、フォント最適化、メタデータ |
| 8 | [App Router ガイド](./frontend/app-router-guide.md) | Server/Client Components、API Routes |
| 9 | [Prisma ガイド](./backend/prisma-guide.md) | スキーマ定義、クエリ、マイグレーション |
| 10 | [Auth.js ガイド](./backend/authjs-guide.md) | 認証システム、OAuth、セッション管理 |

### 実装詳細（応用）

| 順番 | ドキュメント | 内容 |
|------|-------------|------|
| 11 | [フロントエンドガイド](./frontend/frontend-guide.md) | ページ構成、コンポーネント、データフロー |
| 12 | [ダッシュボードガイド](./frontend/dashboard-guide.md) | フォーム、状態管理、API 連携 |
| 13 | [開発ガイドライン](../development-guide.md) | コーディング規約、ベストプラクティス |

### その他（参考）

| ドキュメント | 内容 |
|-------------|------|
| [Node.js ガイド](./backend/nodejs-guide.md) | ランタイム、npm、環境変数管理 |
| [JSX ガイド](./basics/jsx-guide.md) | JSX 構文、HTML との違い |
| [ユーティリティガイド](./backend/utilities-guide.md) | 画像圧縮、Blob Storage、設定管理 |
| [shadcn/ui ガイド](./frontend/shadcn-ui-guide.md) | UI コンポーネントライブラリの使用方法 |
| [スタイリングベストプラクティス](./frontend/styling-best-practices.md) | Tailwind CSS の使い方 |
| [SEO ガイド](./frontend/seo-guide.md) | メタデータ、JSON-LD、クロール制御、Core Web Vitals |
| [Git/GitHub ガイド](./tools/git-github-guide.md) | Git 操作、GitHub の使い方 |
| [アーキテクチャ](../architecture.md) | 設計思想と理由 |
| [認証ドキュメント](../authentication.md) | 認証の詳細実装 |

## ファイルの読み順序

### 1. 設定ファイル

| ファイル | 役割 |
|---------|------|
| [`package.json`](../../package.json) | 依存関係、開発コマンド |
| [`tsconfig.json`](../../tsconfig.json) | TypeScript 設定、パスエイリアス |
| [`next.config.ts`](../../next.config.ts) | Next.js 設定、画像最適化 |
| [`prisma/schema.prisma`](../../prisma/schema.prisma) | データベーススキーマ |

### 2. 共通ライブラリ

| ファイル | 役割 |
|---------|------|
| [`lib/config.ts`](../../lib/config.ts) | アプリケーション設定の一元管理 |
| [`lib/prisma.ts`](../../lib/prisma.ts) | Prisma Client、`safePrismaOperation` |
| [`lib/errors.ts`](../../lib/errors.ts) | エラークラス、エラーコード定数 |
| [`lib/api-helpers.ts`](../../lib/api-helpers.ts) | API Routes 用ヘルパー関数 |

### 3. 型定義

| ファイル | 役割 |
|---------|------|
| [`app/types.ts`](../../app/types.ts) | フロントエンド共通型（Category, Product, ProductTile） |
| [`app/dashboard/homepage/types.ts`](../../app/dashboard/homepage/types.ts) | ダッシュボード用型定義 |
| [`lib/api-types.ts`](../../lib/api-types.ts) | API レスポンス型（ジェネリクス使用） |

### 4. シンプルなコンポーネント

| ファイル | 学べること |
|---------|-----------|
| [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) | props、JSX、スタイリング、`React.memo` |
| [`app/components/FixedHeader.tsx`](../../app/components/FixedHeader.tsx) | ナビゲーション、レイアウト |

### 5. Server Component

| ファイル | 学べること |
|---------|-----------|
| [`app/(public)/page.tsx`](../../app/(public)/page.tsx) | データベースからのデータ取得、動的レンダリング |
| [`app/(public)/faq/page.tsx`](../../app/(public)/faq/page.tsx) | 静的コンテンツの表示 |

### 6. Client Component

| ファイル | 学べること |
|---------|-----------|
| [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) | `useCallback`、カスタムフックの使用 |
| [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) | `useState`、状態管理パターン |
| [`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx) | タブ切り替え、shadcn/ui の使用 |

### 7. API Routes

| ファイル | 学べること |
|---------|-----------|
| [`app/api/products/route.ts`](../../app/api/products/route.ts) | GET/POST、バリデーション、Prisma |
| [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts) | 動的ルート、PUT/DELETE |
| [`app/api/products/upload/route.ts`](../../app/api/products/upload/route.ts) | ファイルアップロード |

### 8. 複雑な機能

| ファイル | 学べること |
|---------|-----------|
| [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) | Server/Client Component の連携 |
| [`app/dashboard/homepage/components/form/ProductForm.tsx`](../../app/dashboard/homepage/components/form/ProductForm.tsx) | フォーム実装、カスタムフック使用 |
| [`app/dashboard/homepage/hooks/useProductForm.ts`](../../app/dashboard/homepage/hooks/useProductForm.ts) | 複雑な状態管理、画像アップロード |
| [`app/dashboard/homepage/components/list/ProductList.tsx`](../../app/dashboard/homepage/components/list/ProductList.tsx) | 検索、フィルタリング、ドラッグ&ドロップ |

## ソースコードを読むときのコツ

### 1. 目的から逆算する

ファイルを順番に読むのではなく、目的から必要なファイルを特定します。

| 目的 | 読むファイル |
|------|-------------|
| 商品一覧表示 | `app/(public)/page.tsx` → `ProductCategoryTabs.tsx` → `ProductGrid.tsx` |
| 商品追加 | `ProductForm.tsx` → `useProductForm.ts` → `ProductFormFields.tsx` |
| 検索機能 | `ProductList.tsx` → `ProductSearchFilters.tsx` → `productUtils.ts` |
| データベース取得 | `app/api/products/route.ts` → `lib/prisma.ts` |

### 2. 型定義を先に確認する

`app/types.ts` で `Product` 型の構造を確認してから、商品を扱うコンポーネントを読みます。

### 3. インポート文から依存関係を把握する

```typescript
import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/errors";
```

→ このファイルはデータベース操作とエラーハンドリングを使用している

### 4. パターンを探す

プロジェクト全体で繰り返し使われているパターン：

- **エラーハンドリング**: `withErrorHandling` ラッパーの使用
- **データベース操作**: `safePrismaOperation` の使用
- **コンポーネント**: Server Component と Client Component の使い分け

### 5. 実際に動かしながら読む

```bash
npm run dev
```

コードを変更して、動作がどう変わるか確認しながら読むと理解が深まります。

## 技術スタック別おすすめファイル

### TypeScript

Java の型システムと比較しながら学習すると理解しやすいです。

| ファイル | 学べること |
|---------|-----------|
| [`app/types.ts`](../../app/types.ts) | 型定義、インターフェース、オプショナルプロパティ |
| [`lib/api-types.ts`](../../lib/api-types.ts) | ジェネリクス（`ApiSuccessResponse<T>`） |
| [`lib/products.ts`](../../lib/products.ts) | 型ガード、型の絞り込み |

**Java との比較**:

- `interface`: Java の interface より柔軟
- `type`: 型エイリアス（Java にはない概念）
- `?`: オプショナル（Java の `Optional<T>` に似ている）

### React

Laravel の Blade テンプレートと比較しながら学習すると理解しやすいです。

| ファイル | 学べること |
|---------|-----------|
| [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) | props、JSX、`React.memo` |
| [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) | `useCallback`、カスタムフック |
| [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) | `useState`、状態管理 |

**Laravel との比較**:

- React コンポーネント ≈ Blade コンポーネント
- `props` ≈ `@props`
- `useState` ≈ セッション管理（クライアントサイド）

### Next.js

Laravel のルーティングと MVC パターンと比較しながら学習すると理解しやすいです。

| ファイル | 学べること |
|---------|-----------|
| [`app/(public)/page.tsx`](../../app/(public)/page.tsx) | Server Component、動的レンダリング |
| [`app/layout.tsx`](../../app/layout.tsx) | ルートレイアウト、メタデータ |
| [`app/api/products/route.ts`](../../app/api/products/route.ts) | API Route、GET/POST |

**Laravel との比較**:

- `app/page.tsx` ≈ `routes/web.php` + `resources/views`
- `app/api/` ≈ `routes/api.php`
- Server Component ≈ コントローラー

### Prisma

Laravel の Eloquent ORM と比較しながら学習すると理解しやすいです。

| ファイル | 学べること |
|---------|-----------|
| [`prisma/schema.prisma`](../../prisma/schema.prisma) | スキーマ定義、リレーション |
| [`lib/prisma.ts`](../../lib/prisma.ts) | Prisma Client、エラーハンドリング |
| [`app/api/products/route.ts`](../../app/api/products/route.ts) | findMany、create、include |

**Laravel との比較**:

| Laravel | Prisma |
|---------|--------|
| `Model::all()` | `prisma.model.findMany()` |
| `Model::find($id)` | `prisma.model.findUnique({ where: { id } })` |
| `Model::create($data)` | `prisma.model.create({ data })` |
| `with('relation')` | `include: { relation: true }` |

### Tailwind CSS

Tailwind CSS v4 では CSS-based 設定を使用しています。

| ファイル | 学べること |
|---------|-----------|
| [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) | ユーティリティクラス、レスポンシブ |
| [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) | グリッドレイアウト、スペーシング |
| [`app/globals.css`](../../app/globals.css) | CSS 変数、`@theme inline` |

### Auth.js（認証）

| ファイル | 学べること |
|---------|-----------|
| [`auth.ts`](../../auth.ts) | Auth.js エントリーポイント |
| [`lib/auth-config.ts`](../../lib/auth-config.ts) | 認証設定、プロバイダー |
| [`app/dashboard/layout.tsx`](../../app/dashboard/layout.tsx) | 認証チェック、保護されたルート |

## Java/PHP/Laravel 経験者向けの補足

### MVC パターンの対応

| 概念 | Laravel | このプロジェクト |
|------|---------|-----------------|
| **Model** | Eloquent Model | Prisma スキーマ + Prisma Client |
| **View** | Blade テンプレート | React コンポーネント |
| **Controller** | Controller クラス | API Routes + Server Components |

### ルーティングの対応

| Laravel | Next.js |
|---------|---------|
| `routes/web.php` | `app/page.tsx` |
| `routes/api.php` | `app/api/route.ts` |
| `Route::get('/products')` | `app/products/page.tsx` |
| `Route::post('/products')` | `app/api/products/route.ts` の `POST` |

### テンプレートの対応

| Laravel Blade | React JSX |
|---------------|-----------|
| `@extends('layout')` | `<Layout>` コンポーネント |
| `@if ($condition)` | `{condition && <Component />}` |
| `@foreach ($items as $item)` | `{items.map(item => <Component />)}` |
| `{{ $variable }}` | `{variable}` |

### ミドルウェアの対応

- Laravel: ミドルウェアクラス
- Next.js: API Routes で `withErrorHandling` ラッパー + 認証は Auth.js で管理

## よくある質問

### Q1: Server Component と Client Component の違いがわからない

**A**: Server Component はサーバーで実行（データベース直接アクセス可能）。Client Component はブラウザで実行（useState、useEffect 使用可能）。

- Server Component: [`app/(public)/page.tsx`](../../app/(public)/page.tsx)
- Client Component: [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

詳細: [App Router ガイド](./frontend/app-router-guide.md)

### Q2: 型定義が複雑で理解できない

**A**: シンプルな型から始めましょう。

1. [`app/types.ts`](../../app/types.ts) の `Category` 型（シンプル）
2. [`app/types.ts`](../../app/types.ts) の `Product` 型（中程度）
3. [`lib/api-types.ts`](../../lib/api-types.ts) の `GetProductsResponse` 型（複雑）

詳細: [TypeScript ガイド](./basics/typescript-guide.md)

### Q3: React Hooks の使い方がわからない

**A**: `useState` から始めましょう。

1. [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) - useState の例
2. [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) - カスタムフックの使用例

詳細: [React ガイド](./frontend/react-guide.md)

### Q4: Prisma のクエリが理解できない

**A**: 基本的なクエリから始めましょう。

1. `findMany` の例: [`app/api/products/route.ts`](../../app/api/products/route.ts)
2. `create` の例: 同ファイルの POST 関数
3. 複雑なクエリ: [`lib/products.ts`](../../lib/products.ts)

詳細: [Prisma ガイド](./backend/prisma-guide.md)

### Q5: エラーハンドリングの方法がわからない

**A**: このプロジェクトでは統一されたエラーハンドリングを使用しています。

1. [`lib/errors.ts`](../../lib/errors.ts) - エラークラスの定義
2. [`lib/api-helpers.ts`](../../lib/api-helpers.ts) - `withErrorHandling` の実装
3. [`lib/prisma.ts`](../../lib/prisma.ts) - `safePrismaOperation` の実装

詳細: [開発ガイドライン](../development-guide.md)

### Q6: 認証の仕組みがわからない

**A**: Auth.js（旧 NextAuth.js）を使用しています。

1. [`auth.ts`](../../auth.ts) - エントリーポイント
2. [`lib/auth-config.ts`](../../lib/auth-config.ts) - 設定
3. [`app/dashboard/layout.tsx`](../../app/dashboard/layout.tsx) - 保護されたルート

詳細: [Auth.js ガイド](./backend/authjs-guide.md)、[認証ドキュメント](../authentication.md)

## まとめ

このガイドの主要なポイント：

1. **学習の進め方**: 全体像 → 基礎技術 → フレームワーク → 認証 → 実装詳細
2. **ドキュメントの順序**: 必須 → 基礎 → フレームワーク → 応用
3. **ファイルの順序**: 設定 → ライブラリ → 型 → コンポーネント → API
4. **コードを読むコツ**: 目的から逆算、型定義を先に確認、パターンを探す

実際にアプリケーションを動かしながら学習を進めることで、理解が深まります。
