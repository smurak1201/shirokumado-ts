# 勉強用ガイド

このプロジェクトで使用されている技術スタックを勉強するためのガイドです。Java、PHP、Laravel の経験がある方向けに、既存の知識と比較しながら学習を進められるよう構成しています。

## 目次

- [このガイドの目的](#このガイドの目的)
- [学習の進め方](#学習の進め方)
  - [ステップ 1: 全体像の把握](#ステップ1-全体像の把握)
  - [ステップ 2: 基礎技術の理解](#ステップ2-基礎技術の理解)
  - [ステップ 3: フレームワークの理解](#ステップ3-フレームワークの理解)
  - [ステップ 4: 実装の詳細理解](#ステップ4-実装の詳細理解)
- [ガイドドキュメントの読み順序](#ガイドドキュメントの読み順序)
- [ファイルの読み順序](#ファイルの読み順序)
- [ソースコードを読むときのコツ](#ソースコードを読むときのコツ)
- [技術スタック別おすすめファイル](#技術スタック別おすすめファイル)
  - [TypeScript](#typescript)
  - [React](#react)
  - [Next.js](#nextjs)
  - [Prisma](#prisma)
  - [Tailwind CSS](#tailwind-css)
  - [shadcn/ui](#shadcnui)
- [Java/PHP/Laravel 経験者向けの補足](#javaphplaravel経験者向けの補足)
- [よくある質問](#よくある質問)

## このガイドの目的

このプロジェクトは、以下の技術スタックを使用しています：

- **TypeScript**: 型安全な JavaScript
- **React**: UI ライブラリ
- **Next.js**: React フレームワーク
- **Prisma**: ORM（データベースアクセス）
- **Tailwind CSS**: CSS フレームワーク
- **shadcn/ui**: UI コンポーネントライブラリ

Java、PHP、Laravel の経験がある方は、以下のような知識を活用できます：

- **オブジェクト指向プログラミング**: クラス、継承、ポリモーフィズム
- **MVC パターン**: モデル、ビュー、コントローラーの分離
- **データベース操作**: SQL、ORM、マイグレーション
- **サーバーサイド開発**: リクエスト/レスポンス、API 設計

このガイドでは、これらの知識を活かしながら、モダンな Web 開発の概念を学習できるよう、段階的に説明します。

## 学習の進め方

### ステップ 1: 全体像の把握

まず、プロジェクトの全体像を把握します。どのような機能があるか、どのような技術が使われているかを理解しましょう。

**推奨ドキュメント**:

1. [`README.md`](../../README.md) - プロジェクトの概要とセットアップ方法
2. [`doc/tech-stack.md`](../tech-stack.md) - 使用している技術スタックの一覧
3. [`doc/project-structure.md`](../project-structure.md) - ディレクトリ構造と各ファイルの役割

**推奨ファイル**:

- [`package.json`](../../package.json) - 使用しているライブラリの確認
- [`prisma/schema.prisma`](../../prisma/schema.prisma) - データベース構造の確認

**学習のポイント**:

- このアプリが何をするものか（商品管理システム）を理解する
- 使用している主要な技術（TypeScript、React、Next.js、Prisma）を把握する
- ディレクトリ構造がどのように整理されているかを確認する

### ステップ 2: 基礎技術の理解

次に、各技術の基礎を理解します。既存の知識と比較しながら学習を進めましょう。

**推奨ドキュメント**:

1. [`doc/guides/typescript-guide.md`](./typescript-guide.md) - TypeScript の基礎
2. [`doc/guides/react-guide.md`](./react-guide.md) - React の基礎
3. [`doc/guides/async-await-guide.md`](./async-await-guide.md) - 非同期処理の基礎

**推奨ファイル**:

- [`app/types.ts`](../../app/types.ts) - 型定義の例
- [`app/utils/format.ts`](../../app/utils/format.ts) - ユーティリティ関数の例

**学習のポイント**:

- TypeScript の型システム（Java の型システムと比較）
- React のコンポーネント（Laravel の Blade テンプレートと比較）
- 非同期処理（async/await、Promise）

### ステップ 3: フレームワークの理解

フレームワークの概念と使い方を理解します。

**推奨ドキュメント**:

1. [`doc/guides/nextjs-guide.md`](./nextjs-guide.md) - Next.js の基礎
2. [`doc/guides/app-router-guide.md`](./app-router-guide.md) - App Router の詳細
3. [`doc/guides/prisma-guide.md`](./prisma-guide.md) - Prisma の基礎

**推奨ファイル**:

- [`app/page.tsx`](../../app/page.tsx) - Server Component の例
- [`app/api/products/route.ts`](../../app/api/products/route.ts) - API Route の例
- [`lib/prisma.ts`](../../lib/prisma.ts) - Prisma Client の設定

**学習のポイント**:

- Next.js の App Router（Laravel のルーティングと比較）
- Server Components と Client Components の違い
- Prisma の ORM（Laravel の Eloquent と比較）

### ステップ 4: 実装の詳細理解

最後に、実際の実装を詳しく読み、各機能がどのように実装されているかを理解します。

**推奨ドキュメント**:

1. [`doc/guides/frontend-guide.md`](./frontend-guide.md) - フロントエンド実装の詳細
2. [`doc/guides/dashboard-guide.md`](./dashboard-guide.md) - ダッシュボード機能の詳細
3. [`doc/development-guide.md`](../development-guide.md) - 開発ガイドライン

**推奨ファイル**:

- [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) - ダッシュボードページ
- [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx) - 新規商品登録フォーム（`useProductForm`フックと`ProductFormFields`コンポーネントを使用）
- [`app/dashboard/components/ProductEditForm.tsx`](../../app/dashboard/components/ProductEditForm.tsx) - 商品編集フォーム（`useProductForm`フックと`ProductFormFields`コンポーネントを使用）
- [`app/dashboard/components/ProductFormFields.tsx`](../../app/dashboard/components/ProductFormFields.tsx) - 商品フォームフィールド（共通コンポーネント）
- [`app/dashboard/hooks/useProductForm.ts`](../../app/dashboard/hooks/useProductForm.ts) - 商品フォームの状態管理フック
- [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) - コンポーネント実装

**学習のポイント**:

- コンポーネントの分割と再利用
- 状態管理（useState、useEffect）
- カスタムフックの使い方

## ガイドドキュメントの読み順序

### 最初に読むべきドキュメント（必須）

1. **[`README.md`](../../README.md)**

   - プロジェクトの概要とセットアップ方法
   - 開発コマンドの確認

2. **[`doc/tech-stack.md`](../tech-stack.md)**

   - 使用している技術スタックの一覧
   - 各技術の特徴とこのアプリでの使われ方

3. **[`doc/project-structure.md`](../project-structure.md)**
   - ディレクトリ構造と各ファイルの役割
   - ファイル命名規則

### 基礎を学ぶためのドキュメント（推奨）

4. **[`doc/guides/typescript-guide.md`](./typescript-guide.md)**

   - TypeScript の基礎
   - 型定義、インターフェース、ジェネリクス

5. **[`doc/guides/react-guide.md`](./react-guide.md)**

   - React の基礎
   - コンポーネント、Hooks、状態管理

6. **[`doc/guides/async-await-guide.md`](./async-await-guide.md)**
   - 非同期処理の基礎
   - async/await、Promise、エラーハンドリング

### フレームワークを学ぶためのドキュメント（重要）

7. **[`doc/guides/nextjs-guide.md`](./nextjs-guide.md)**

   - Next.js の基礎
   - 画像最適化、フォント最適化、メタデータ

8. **[`doc/guides/app-router-guide.md`](./app-router-guide.md)**

   - App Router の詳細
   - Server Components、Client Components、API Routes

9. **[`doc/guides/prisma-guide.md`](./prisma-guide.md)**
   - Prisma の基礎
   - スキーマ定義、クエリ、マイグレーション

### 実装を理解するためのドキュメント（応用）

10. **[`doc/guides/frontend-guide.md`](./frontend-guide.md)**

    - フロントエンド実装の詳細
    - ページ構成、コンポーネント、データフロー

11. **[`doc/guides/dashboard-guide.md`](./dashboard-guide.md)**

    - ダッシュボード機能の詳細
    - フォーム、状態管理、API 連携

12. **[`doc/development-guide.md`](../development-guide.md)**
    - 開発ガイドライン
    - コーディング規約、ベストプラクティス

### その他のドキュメント（参考）

13. **[`doc/guides/jsx-guide.md`](./jsx-guide.md)**

    - JSX の構文と使用方法
    - HTML との違い、ベストプラクティス

14. **[`doc/guides/utilities-guide.md`](./utilities-guide.md)**

    - ユーティリティ関数の詳細
    - 画像圧縮、Blob Storage、設定管理

15. **[`doc/guides/shadcn-ui-guide.md`](./shadcn-ui-guide.md)**

    - shadcn/ui の使用方法
    - ラッパーコンポーネントの作成
    - UI コンポーネントライブラリの活用

16. **[`doc/architecture.md`](../architecture.md)**
    - アーキテクチャと設計思想
    - 設計の意図と理由

## ファイルの読み順序

### 1. 設定ファイル（最初に確認）

**目的**: プロジェクトの設定と依存関係を理解する

1. [`package.json`](../../package.json)

   - 使用しているライブラリとバージョン
   - 開発コマンドの確認

2. [`tsconfig.json`](../../tsconfig.json)

   - TypeScript の設定
   - パスエイリアス（`@/`）の設定

3. [`next.config.ts`](../../next.config.ts)

   - Next.js の設定
   - 画像最適化の設定

4. [`prisma/schema.prisma`](../../prisma/schema.prisma)
   - データベース構造の確認
   - テーブルとリレーションの理解

### 2. 共通ライブラリ（基礎を理解）

**目的**: プロジェクト全体で使用される共通機能を理解する

5. [`lib/config.ts`](../../lib/config.ts)

   - アプリケーション設定の一元管理
   - 画像サイズ、キャッシュ期間などの設定値

6. [`lib/prisma.ts`](../../lib/prisma.ts)

   - Prisma Client の設定
   - データベース接続の管理

7. [`lib/errors.ts`](../../lib/errors.ts)

   - エラーハンドリングの統一
   - エラークラスの定義

8. [`lib/api-helpers.ts`](../../lib/api-helpers.ts)
   - API Routes 用のヘルパー関数
   - エラーハンドリングのラッパー

### 3. 型定義（データ構造を理解）

**目的**: アプリケーションで使用されるデータ構造を理解する

9. [`app/types.ts`](../../app/types.ts)

   - フロントエンド共通型定義
   - Category、Product、ProductTile の型

10. [`app/dashboard/types.ts`](../../app/dashboard/types.ts)
    - ダッシュボード用の型定義
    - フォームデータの型

### 4. シンプルなコンポーネント（React の基礎）

**目的**: React の基本的な使い方を理解する

11. [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)

    - シンプルなコンポーネントの例
    - props、JSX、スタイリング

12. [`app/components/Header.tsx`](../../app/components/Header.tsx)
    - レイアウトコンポーネントの例
    - ナビゲーション、リンク

### 5. Server Component（Next.js の特徴）

**目的**: Server Component の概念を理解する

13. [`app/page.tsx`](../../app/page.tsx)

    - Server Component の例
    - データベースからのデータ取得
    - データの変換とフィルタリング
    - `ProductCategoryTabs` コンポーネントへのデータ受け渡し

14. [`app/faq/page.tsx`](../../app/faq/page.tsx)
    - シンプルな Server Component の例
    - 静的コンテンツの表示

### 6. Client Component（インタラクティブな機能）

**目的**: Client Component と状態管理を理解する

15. [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

    - Client Component の例
    - カスタムフックの使用
    - イベントハンドリング

16. [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts)

    - カスタムフックの例
    - useState の使い方
    - 状態管理のパターン

17. [`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx)
    - カテゴリーをTabsで切り替えるコンポーネント
    - useState の使い方
    - shadcn/ui の Tabs コンポーネントの使用例

### 7. API Routes（バックエンド）

**目的**: サーバーサイドの API 実装を理解する

18. [`app/api/products/route.ts`](../../app/api/products/route.ts)

    - GET/POST エンドポイントの実装
    - バリデーション、エラーハンドリング
    - Prisma を使ったデータベース操作

19. [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts)

    - 動的ルートの実装
    - PUT/DELETE エンドポイント

20. [`app/api/products/upload/route.ts`](../../app/api/products/upload/route.ts)
    - ファイルアップロードの実装
    - Blob Storage への保存

### 8. 複雑な機能（応用）

**目的**: 複雑な機能の実装を理解する

21. [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)

    - ダッシュボードページの実装
    - Server Component と Client Component の連携

22. [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx)

    - フォーム実装の詳細
    - `useProductForm`フックの使用
    - `ProductFormFields`コンポーネントの使用
    - 画像アップロード、バリデーション

23. [`app/dashboard/components/ProductEditForm.tsx`](../../app/dashboard/components/ProductEditForm.tsx)

    - 商品編集フォームの実装
    - `useProductForm`フックの使用（初期値設定）
    - `ProductFormFields`コンポーネントの使用

24. [`app/dashboard/hooks/useProductForm.ts`](../../app/dashboard/hooks/useProductForm.ts)

    - カスタムフックの実装例
    - フォーム状態管理
    - 画像の圧縮とアップロード
    - 公開状態の自動計算

25. [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx)

    - 複雑な状態管理
    - コンポーネントの分割（`ProductListContent`、`ProductSearchFilters`）
    - ドラッグ&ドロップ、検索機能

## ソースコードを読むときのコツ

### 1. 上から下に読むのではなく、目的から逆算する

**悪い例**: ファイルの最初から最後まで順番に読む

**良い例**:

- 「商品一覧を表示する機能を理解したい」→ [`app/page.tsx`](../../app/page.tsx)、[`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx)、[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)を読む
- 「商品を追加する機能を理解したい」→ [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx)、[`app/dashboard/hooks/useProductForm.ts`](../../app/dashboard/hooks/useProductForm.ts)、[`app/dashboard/components/ProductFormFields.tsx`](../../app/dashboard/components/ProductFormFields.tsx)を読む
- 「商品を編集する機能を理解したい」→ [`app/dashboard/components/ProductEditForm.tsx`](../../app/dashboard/components/ProductEditForm.tsx)、[`app/dashboard/hooks/useProductForm.ts`](../../app/dashboard/hooks/useProductForm.ts)を読む
- 「商品一覧の検索機能を理解したい」→ [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx)、[`app/dashboard/components/ProductSearchFilters.tsx`](../../app/dashboard/components/ProductSearchFilters.tsx)、[`app/dashboard/utils/productUtils.ts`](../../app/dashboard/utils/productUtils.ts)を読む
- 「データベースから商品を取得する方法を知りたい」→ [`app/api/products/route.ts`](../../app/api/products/route.ts)を読む

### 2. 型定義を先に確認する

TypeScript では、型定義を見ることで、そのコードが何をするものかが理解しやすくなります。

**例**: [`app/types.ts`](../../app/types.ts)を読んで、`Product`型の構造を確認してから、商品を扱うコンポーネントを読む

### 3. インポート文から依存関係を把握する

ファイルの先頭の`import`文を見ることで、そのファイルがどのような機能に依存しているかがわかります。

**例**:

```typescript
import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/errors";
```

→ このファイルはデータベース操作とエラーハンドリングを使用している

### 4. コメントを活用する

このプロジェクトでは、コンポーネント、カスタムフック、APIエンドポイントなどに機能説明のコメント（JSDoc形式）が書かれています。コメントを読むことで、コードの意図や使用方法を理解できます。

**機能説明のコメントの例**:

- **コンポーネント**: [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) - 商品タイルコンポーネントの機能説明
- **カスタムフック**: [`app/dashboard/hooks/useProductForm.ts`](../../app/dashboard/hooks/useProductForm.ts) - 商品フォームの状態管理フックの機能説明
- **APIエンドポイント**: [`app/api/products/route.ts`](../../app/api/products/route.ts) - 商品一覧取得APIの機能説明

**特殊な実装の説明の例**: [`app/page.tsx`](../../app/page.tsx)のコメントで、なぜ`dynamic = "force-dynamic"`を設定しているかが説明されている

**注意**: コードから明らかに分かるコメント（例：「商品名を設定」「フォームを閉じる」など）は書かれていません。コメントは、コードからは明確に分からない情報（コンポーネントの目的、提供する機能、使用方法など）のみを簡潔に記述しています。

### 5. 小さな単位で理解する

一度にすべてを理解しようとせず、小さな単位で理解を深めましょう。

**例**:

1. まず`ProductTile`コンポーネントだけを理解する
2. 次に`ProductGrid`コンポーネントを理解する
3. 最後に`page.tsx`でそれらがどのように組み合わせられているかを理解する

### 6. 実際に動かしながら読む

コードを読むだけでなく、実際にアプリケーションを動かしながら読むと理解が深まります。

**手順**:

1. `npm run dev`で開発サーバーを起動
2. ブラウザでアプリケーションを開く
3. コードを変更して、動作がどう変わるか確認する

### 7. デバッガーを使う

ブラウザの開発者ツールや VS Code のデバッガーを使って、実際の動作を確認しましょう。

**例**:

- `console.log`を追加して、変数の値を確認する
- ブレークポイントを設定して、実行の流れを追う

### 8. 関連ファイルを一緒に読む

一つのファイルだけを読むのではなく、関連するファイルを一緒に読むと理解が深まります。

**例**:

- [`app/api/products/route.ts`](../../app/api/products/route.ts)を読むときは、[`lib/prisma.ts`](../../lib/prisma.ts)と[`lib/errors.ts`](../../lib/errors.ts)も一緒に読む
- [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)を読むときは、[`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts)と[`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx)も一緒に読む

### 9. パターンを探す

コードを読むときは、繰り返し使われているパターンを探しましょう。

**例**:

- エラーハンドリングのパターン（`withErrorHandling`の使用）
- データベース操作のパターン（`safePrismaOperation`の使用）
- コンポーネントのパターン（Server Component と Client Component の使い分け）

### 10. 疑問を持ったらドキュメントを参照する

コードを読んでいて疑問が生じたら、関連するドキュメントを参照しましょう。

**例**:

- Prisma の使い方がわからない → [`doc/guides/prisma-guide.md`](./prisma-guide.md)
- React Hooks の使い方がわからない → [`doc/guides/react-guide.md`](./react-guide.md)
- Next.js の概念がわからない → [`doc/guides/nextjs-guide.md`](./nextjs-guide.md)

## 技術スタック別おすすめファイル

### TypeScript

**学習のポイント**: Java の型システムと比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`app/types.ts`](../../app/types.ts)**

   - 型定義の基本
   - インターフェース、型エイリアス
   - オプショナルプロパティ（`?`）

2. **[`app/dashboard/types.ts`](../../app/dashboard/types.ts)**

   - より複雑な型定義
   - 型の再利用

3. **[`lib/api-types.ts`](../../lib/api-types.ts)**

   - API レスポンスの型定義
   - ジェネリクスの使用例（`ApiSuccessResponse<T>`）

**詳細**: ジェネリクスの詳細な説明については、[TypeScript ガイド - ジェネリクス](./typescript-guide.md#ジェネリクス)を参照してください。

4. **[`lib/products.ts`](../../lib/products.ts)（20-26 行目、81-99 行目）**
   - 型ガードの使用例
   - `Prisma.Decimal`型の変換
   - 型の絞り込み（type narrowing）

**Java との比較**:

- TypeScript の`interface`は Java の`interface`に似ているが、より柔軟
- TypeScript の`type`は Java にはない概念（型エイリアス）
- TypeScript の`?`（オプショナル）は Java の`Optional<T>`に似ている

**学習の順序**:

1. 基本的な型（string、number、boolean）を理解する
2. インターフェースと型エイリアスを理解する
3. ジェネリクスを理解する
4. 型ガードと型アサーションを理解する

### React

**学習のポイント**: Laravel の Blade テンプレートと比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)**

   - シンプルなコンポーネント
   - props、JSX、スタイリング
   - `React.memo`の使用例

2. **[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)**

   - コンポーネントの組み合わせ
   - カスタムフックの使用
   - `useCallback`の使用例

3. **[`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts)**

   - カスタムフックの実装
   - `useState`の使い方
   - 状態管理のパターン

4. **[`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx)**

   - カテゴリーをTabsで切り替えるコンポーネント
   - `useState`の使い方
   - shadcn/ui の Tabs コンポーネントの使用例

5. **[`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx)**
   - 複雑な状態管理
   - 複数の Hooks の組み合わせ

**Laravel との比較**:

- React のコンポーネントは Laravel の Blade コンポーネントに似ている
- React の`props`は Laravel の`@props`に似ている
- React の`useState`は Laravel のセッション管理に似ている（ただし、クライアントサイド）

**学習の順序**:

1. JSX の構文を理解する（[`doc/guides/jsx-guide.md`](./jsx-guide.md)を参照）
2. コンポーネントと props を理解する
3. 状態管理（useState）を理解する
4. 副作用（useEffect）を理解する
5. カスタムフックを理解する

### Next.js

**学習のポイント**: Laravel のルーティングと MVC パターンと比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`app/page.tsx`](../../app/page.tsx)**

   - Server Component の例
   - データベースからのデータ取得
   - 動的レンダリングの設定
   - `ProductCategoryTabs` コンポーネントへのデータ受け渡し

2. **[`app/layout.tsx`](../../app/layout.tsx)**

   - ルートレイアウト
   - メタデータ、フォントの設定

3. **[`app/api/products/route.ts`](../../app/api/products/route.ts)**

   - API Route の実装
   - GET/POST エンドポイント
   - エラーハンドリング

4. **[`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts)**

   - 動的ルートの実装
   - PUT/DELETE エンドポイント

5. **[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)**
   - Server Component と Client Component の連携
   - データの受け渡し

**Laravel との比較**:

- Next.js の`app/page.tsx`は Laravel の`routes/web.php`と`resources/views`の組み合わせに似ている
- Next.js の`app/api/`は Laravel の`routes/api.php`に似ている
- Next.js の Server Component は Laravel のコントローラーに似ている（サーバーサイドで実行）

**学習の順序**:

1. App Router の基本概念を理解する（[`doc/guides/app-router-guide.md`](./app-router-guide.md)を参照）
2. Server Component と Client Component の違いを理解する
3. API Routes の実装を理解する
4. ルーティングとレイアウトを理解する

### Prisma

**学習のポイント**: Laravel の Eloquent ORM と比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`prisma/schema.prisma`](../../prisma/schema.prisma)**

   - スキーマ定義の基本
   - モデル、リレーション、インデックス

2. **[`lib/prisma.ts`](../../lib/prisma.ts)**

   - Prisma Client の設定
   - シングルトンパターン
   - エラーハンドリング

3. **[`app/api/products/route.ts`](../../app/api/products/route.ts)（32-43 行目）**

   - `findMany`の使用例
   - `include`によるリレーションの取得（N+1 問題の回避）

4. **[`app/api/products/route.ts`](../../app/api/products/route.ts)（120-139 行目）**

   - `create`の使用例
   - データの作成とリレーションの設定

5. **[`lib/products.ts`](../../lib/products.ts)（44-70 行目）**
   - 複雑なクエリの例
   - `orderBy`、`include`の組み合わせ
   - `Promise.all`による並列処理

**Laravel との比較**:

- Prisma の`model`は Laravel の`Model`クラスに似ている
- Prisma の`findMany`は Laravel の`Model::all()`に似ている
- Prisma の`include`は Laravel の`with()`に似ている（Eager Loading）

**学習の順序**:

1. スキーマ定義を理解する（[`doc/guides/prisma-guide.md`](./prisma-guide.md)を参照）
2. 基本的なクエリ（findMany、findUnique、create、update、delete）を理解する
3. リレーションの取得を理解する
4. トランザクションを理解する

### Tailwind CSS

**学習のポイント**: 従来の CSS や Bootstrap と比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)**

   - 基本的なユーティリティクラス
   - レスポンシブデザイン（`md:`, `lg:`）
   - ホバーエフェクト（`hover:`）

2. **[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)**

   - グリッドレイアウト（`grid-cols-3`）
   - スペーシング（`gap-3`, `mb-8`）

3. **[`app/components/Header.tsx`](../../app/components/Header.tsx)**

   - フレックスボックスレイアウト（`flex`）
   - ナビゲーションのスタイリング

4. **[`app/globals.css`](../../app/globals.css)**
   - グローバルスタイルの設定
   - カスタム CSS 変数

**従来の CSS との比較**:

- Tailwind のユーティリティクラスは、インラインスタイルに似ているが、より柔軟
- Tailwind のレスポンシブプレフィックス（`md:`, `lg:`）は、メディアクエリに似ている
- Tailwind の`hover:`プレフィックスは、`:hover`疑似クラスに似ている

**学習の順序**:

1. 基本的なユーティリティクラスを理解する
2. レスポンシブデザインを理解する
3. カスタマイズ方法を理解する

**スタイリングのベストプラクティス**:

同じスタイルを複数箇所で使用する場合の統一方法については、[スタイリングのベストプラクティス](./styling-best-practices.md)を参照してください。

### shadcn/ui

**学習のポイント**: コンポーネントライブラリの使い方とラッパーコンポーネントの作成方法を理解する

**おすすめファイル**:

1. **[`app/components/ui/card.tsx`](../../app/components/ui/card.tsx)**

   - shadcn/ui の基本コンポーネント
   - Radix UI との統合
   - 型安全性の実装

2. **[`app/components/ui/card-product.tsx`](../../app/components/ui/card-product.tsx)**

   - ラッパーコンポーネントの実装例
   - `ComponentPropsWithoutRef` の使用
   - アプリ固有のデフォルトスタイルの適用

3. **[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)**

   - shadcn/ui コンポーネントの使用例
   - Card、AspectRatio、Tooltip の組み合わせ
   - ラッパーコンポーネントの活用

4. **[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx)**

   - Dialog コンポーネントの使用例
   - ScrollArea の使用例
   - ラッパーコンポーネント（ModalImageCard、ModalContentCard、ModalPriceCard）の活用

5. **[`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx)**

   - Tabs コンポーネントの使用例
   - タブ切り替えの実装

6. **[`app/faq/page.tsx`](../../app/faq/page.tsx)**

   - Card コンポーネントの使用例
   - Badge コンポーネントの使用例
   - ラッパーコンポーネント（FAQCard、QuestionBadge）の活用

**特徴**:

- コピー&ペースト可能なコンポーネントライブラリ
- Radix UI ベースでアクセシビリティに優れている
- TypeScript で完全な型安全性を提供
- ラッパーコンポーネントでアプリ固有のスタイルを適用可能

**学習の順序**:

1. shadcn/ui の基本概念を理解する（[`doc/guides/shadcn-ui-guide.md`](./shadcn-ui-guide.md)を参照）
2. 基本的なコンポーネント（Card、Dialog、Tabs）の使い方を理解する
3. ラッパーコンポーネントの作成方法を理解する
4. 実際のコンポーネントでの使用例を確認する

## Java/PHP/Laravel 経験者向けの補足

### オブジェクト指向プログラミング

**Java/PHP との違い**:

- TypeScript/JavaScript は、クラスベースの OOP だけでなく、関数型プログラミングのパラダイムも使用する
- React では、クラスコンポーネントよりも関数コンポーネントが推奨される

**このアプリでの例**:

- [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)は関数コンポーネント
- [`lib/errors.ts`](../../lib/errors.ts)ではクラスを使用（エラークラス）

### MVC パターン

**Laravel との比較**:

- **Model**: Prisma のスキーマ（[`prisma/schema.prisma`](../../prisma/schema.prisma)）と Prisma Client（[`lib/prisma.ts`](../../lib/prisma.ts)）
- **View**: React コンポーネント（[`app/components/`](../../app/components/)）
- **Controller**: Next.js の API Routes（[`app/api/`](../../app/api/)）と Server Components（[`app/page.tsx`](../../app/page.tsx)）

**違い**:

- Next.js では、Server Component が View と Controller の両方の役割を果たすことがある
- クライアントサイドの状態管理は、React の Hooks で行う（Laravel のセッションとは異なる）

### データベース操作

**Laravel の Eloquent との比較**:

| Laravel                   | Prisma                                                   | 説明                   |
| ------------------------- | -------------------------------------------------------- | ---------------------- |
| `Model::all()`            | `prisma.model.findMany()`                                | すべてのレコードを取得 |
| `Model::find($id)`        | `prisma.model.findUnique({ where: { id } })`             | ID で検索              |
| `Model::create($data)`    | `prisma.model.create({ data })`                          | レコードを作成         |
| `$model->update($data)`   | `prisma.model.update({ where, data })`                   | レコードを更新         |
| `$model->delete()`        | `prisma.model.delete({ where })`                         | レコードを削除         |
| `Model::with('relation')` | `prisma.model.findMany({ include: { relation: true } })` | リレーションを取得     |

**例**: [`app/api/products/route.ts`](../../app/api/products/route.ts)の 32-43 行目

### ルーティング

**Laravel との比較**:

| Laravel                         | Next.js                                 | 説明                          |
| ------------------------------- | --------------------------------------- | ----------------------------- |
| `routes/web.php`                | `app/page.tsx`                          | Web ページのルーティング      |
| `routes/api.php`                | `app/api/route.ts`                      | API のルーティング            |
| `Route::get('/products', ...)`  | `app/products/page.tsx`                 | GET リクエストのハンドリング  |
| `Route::post('/products', ...)` | `app/api/products/route.ts`の`POST`関数 | POST リクエストのハンドリング |

**例**: [`app/api/products/route.ts`](../../app/api/products/route.ts)

### テンプレートエンジン

**Laravel の Blade との比較**:

| Laravel Blade                | React JSX                            | 説明             |
| ---------------------------- | ------------------------------------ | ---------------- |
| `@extends('layout')`         | `<Layout>`コンポーネント             | レイアウトの継承 |
| `@section('content')`        | コンポーネントの children            | コンテンツの挿入 |
| `@if ($condition)`           | `{condition && <Component />}`       | 条件分岐         |
| `@foreach ($items as $item)` | `{items.map(item => <Component />)}` | ループ処理       |
| `{{ $variable }}`            | `{variable}`                         | 変数の出力       |

**例**: [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)の 46-58 行目（ループ処理）

### セッション管理

**Laravel との違い**:

- Laravel では、サーバーサイドでセッションを管理する
- React では、クライアントサイドで状態を管理する（`useState`、`useReducer`）
- 永続化が必要な場合は、`localStorage`や`sessionStorage`を使用する

**例**: [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts)で`localStorage`を使用

### ミドルウェア

**Laravel との比較**:

- Laravel のミドルウェアは、リクエストの前後で処理を実行する
- Next.js では、ミドルウェアの代わりに、API Routes でエラーハンドリングを行う（[`lib/api-helpers.ts`](../../lib/api-helpers.ts)の`withErrorHandling`）

**例**: [`app/api/products/route.ts`](../../app/api/products/route.ts)の 29 行目で`withErrorHandling`を使用

## よくある質問

### Q1: Server Component と Client Component の違いがよくわからない

**A**: Server Component はサーバーサイドで実行され、データベースに直接アクセスできます。Client Component はブラウザで実行され、インタラクティブな機能（useState、useEffect など）を使用できます。

**おすすめファイル**:

- Server Component: [`app/page.tsx`](../../app/page.tsx)
- Client Component: [`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx)、[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)

**詳細**: [`doc/guides/app-router-guide.md`](./app-router-guide.md)を参照

### Q2: 型定義が複雑で理解できない

**A**: まず、シンプルな型定義から始めましょう。`app/types.ts`の`Category`型から始めて、徐々に複雑な型を理解していきます。

**おすすめファイル**:

1. [`app/types.ts`](../../app/types.ts)の`Category`型（シンプル）
2. [`app/types.ts`](../../app/types.ts)の`Product`型（中程度）
3. [`lib/api-types.ts`](../../lib/api-types.ts)の`GetProductsResponse`型（複雑）

**詳細**: [`doc/guides/typescript-guide.md`](./typescript-guide.md)を参照

### Q3: React Hooks の使い方がわからない

**A**: まず、`useState`と`useEffect`の基本を理解しましょう。その後、カスタムフックを理解します。

**おすすめファイル**:

1. [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts)（useState の例）
2. [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)（カスタムフックの使用例）
3. [`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx)（useState の例）

**詳細**: [`doc/guides/react-guide.md`](./react-guide.md)を参照

### Q4: Prisma のクエリが複雑で理解できない

**A**: まず、基本的なクエリ（findMany、findUnique、create）を理解しましょう。その後、リレーションの取得を理解します。

**おすすめファイル**:

1. [`app/api/products/route.ts`](../../app/api/products/route.ts)の 32-43 行目（findMany の例）
2. [`app/api/products/route.ts`](../../app/api/products/route.ts)の 120-139 行目（create の例）
3. [`lib/products.ts`](../../lib/products.ts)の 44-70 行目（複雑なクエリの例、`Promise.all`による並列処理）

**詳細**: [`doc/guides/prisma-guide.md`](./prisma-guide.md)を参照

### Q5: 非同期処理（async/await）が理解できない

**A**: まず、`async/await`の基本構文を理解しましょう。その後、`Promise.all`などの便利なメソッドを理解します。

**おすすめファイル**:

1. [`app/api/products/route.ts`](../../app/api/products/route.ts)の 29 行目（async 関数の例）
2. [`lib/products.ts`](../../lib/products.ts)の 44-70 行目（Promise.all の例）

**詳細**: [`doc/guides/async-await-guide.md`](./async-await-guide.md)を参照

### Q6: エラーハンドリングの方法がわからない

**A**: このプロジェクトでは、統一されたエラーハンドリングを使用しています。`withErrorHandling`と`safePrismaOperation`の使い方を理解しましょう。

**おすすめファイル**:

1. [`lib/errors.ts`](../../lib/errors.ts)（エラークラスの定義）
2. [`lib/api-helpers.ts`](../../lib/api-helpers.ts)（withErrorHandling の実装）
3. [`lib/prisma.ts`](../../lib/prisma.ts)（safePrismaOperation の実装）
4. [`app/api/products/route.ts`](../../app/api/products/route.ts)（実際の使用例）

**詳細**: [`doc/development-guide.md`](../development-guide.md)の「エラーハンドリング」セクションを参照

### Q7: コンポーネントの分割方法がわからない

**A**: コンポーネントは、再利用性と保守性を重視して分割します。小さなコンポーネントから始めて、徐々に大きなコンポーネントを理解しましょう。

**おすすめファイル**:

1. [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)（小さなコンポーネント）
2. [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx)（コンポーネントの組み合わせ）
3. [`app/dashboard/components/DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx)（大きなコンポーネントの分割例）

**詳細**: [`doc/guides/frontend-guide.md`](./frontend-guide.md)を参照

### Q8: 状態管理の方法がわからない

**A**: このプロジェクトでは、React の`useState`とカスタムフックを使用して状態管理を行います。グローバル状態管理ライブラリ（Redux など）は使用していません。

**おすすめファイル**:

1. [`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts)（シンプルな状態管理）
2. [`app/dashboard/hooks/useTabState.ts`](../../app/dashboard/hooks/useTabState.ts)（localStorage との連携）
3. [`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx)（複雑な状態管理）

**詳細**: [`doc/guides/react-guide.md`](./react-guide.md)の「状態管理」セクションを参照

## まとめ

このガイドでは、以下の内容を説明しました：

1. **学習の進め方**: 全体像の把握 → 基礎技術の理解 → フレームワークの理解 → 実装の詳細理解
2. **ガイドドキュメントの読み順序**: 必須 → 推奨 → 重要 → 応用
3. **ファイルの読み順序**: 設定ファイル → 共通ライブラリ → 型定義 → コンポーネント → API Routes
4. **ソースコードを読むときのコツ**: 目的から逆算、型定義を先に確認、小さな単位で理解するなど
5. **技術スタック別おすすめファイル**: TypeScript、React、Next.js、Prisma、Tailwind CSS それぞれのおすすめファイル
6. **Java/PHP/Laravel 経験者向けの補足**: 既存の知識と比較しながら学習できるよう、対応表を提供

学習を進める際は、このガイドを参考にしながら、実際にコードを読んで、動かして、理解を深めていきましょう。疑問が生じたら、関連するドキュメントを参照するか、実際にコードを変更して動作を確認してみてください。
