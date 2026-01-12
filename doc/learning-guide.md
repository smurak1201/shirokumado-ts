# 勉強用ガイド

このプロジェクトで使用されている技術スタックを勉強するためのガイドです。Java、PHP、Laravelの経験がある方向けに、既存の知識と比較しながら学習を進められるよう構成しています。

## 目次

- [このガイドの目的](#このガイドの目的)
- [学習の進め方](#学習の進め方)
  - [ステップ1: 全体像の把握](#ステップ1-全体像の把握)
  - [ステップ2: 基礎技術の理解](#ステップ2-基礎技術の理解)
  - [ステップ3: フレームワークの理解](#ステップ3-フレームワークの理解)
  - [ステップ4: 実装の詳細理解](#ステップ4-実装の詳細理解)
- [ガイドドキュメントの読み順序](#ガイドドキュメントの読み順序)
- [ファイルの読み順序](#ファイルの読み順序)
- [ソースコードを読むときのコツ](#ソースコードを読むときのコツ)
- [技術スタック別おすすめファイル](#技術スタック別おすすめファイル)
  - [TypeScript](#typescript)
  - [React](#react)
  - [Next.js](#nextjs)
  - [Prisma](#prisma)
  - [Tailwind CSS](#tailwind-css)
- [Java/PHP/Laravel経験者向けの補足](#javaphplaravel経験者向けの補足)
- [よくある質問](#よくある質問)

## このガイドの目的

このプロジェクトは、以下の技術スタックを使用しています：

- **TypeScript**: 型安全なJavaScript
- **React**: UIライブラリ
- **Next.js**: Reactフレームワーク
- **Prisma**: ORM（データベースアクセス）
- **Tailwind CSS**: CSSフレームワーク

Java、PHP、Laravelの経験がある方は、以下のような知識を活用できます：

- **オブジェクト指向プログラミング**: クラス、継承、ポリモーフィズム
- **MVCパターン**: モデル、ビュー、コントローラーの分離
- **データベース操作**: SQL、ORM、マイグレーション
- **サーバーサイド開発**: リクエスト/レスポンス、API設計

このガイドでは、これらの知識を活かしながら、モダンなWeb開発の概念を学習できるよう、段階的に説明します。

## 学習の進め方

### ステップ1: 全体像の把握

まず、プロジェクトの全体像を把握します。どのような機能があるか、どのような技術が使われているかを理解しましょう。

**推奨ドキュメント**:
1. [`README.md`](../README.md) - プロジェクトの概要とセットアップ方法
2. [`doc/tech-stack.md`](./tech-stack.md) - 使用している技術スタックの一覧
3. [`doc/project-structure.md`](./project-structure.md) - ディレクトリ構造と各ファイルの役割

**推奨ファイル**:
- [`package.json`](../package.json) - 使用しているライブラリの確認
- [`prisma/schema.prisma`](../prisma/schema.prisma) - データベース構造の確認

**学習のポイント**:
- このアプリが何をするものか（商品管理システム）を理解する
- 使用している主要な技術（TypeScript、React、Next.js、Prisma）を把握する
- ディレクトリ構造がどのように整理されているかを確認する

### ステップ2: 基礎技術の理解

次に、各技術の基礎を理解します。既存の知識と比較しながら学習を進めましょう。

**推奨ドキュメント**:
1. [`doc/guides/typescript-guide.md`](./guides/typescript-guide.md) - TypeScriptの基礎
2. [`doc/guides/react-guide.md`](./guides/react-guide.md) - Reactの基礎
3. [`doc/guides/async-await-guide.md`](./guides/async-await-guide.md) - 非同期処理の基礎

**推奨ファイル**:
- [`app/types.ts`](../app/types.ts) - 型定義の例
- [`app/utils/format.ts`](../app/utils/format.ts) - ユーティリティ関数の例

**学習のポイント**:
- TypeScriptの型システム（Javaの型システムと比較）
- Reactのコンポーネント（LaravelのBladeテンプレートと比較）
- 非同期処理（async/await、Promise）

### ステップ3: フレームワークの理解

フレームワークの概念と使い方を理解します。

**推奨ドキュメント**:
1. [`doc/guides/nextjs-guide.md`](./guides/nextjs-guide.md) - Next.jsの基礎
2. [`doc/guides/app-router-guide.md`](./guides/app-router-guide.md) - App Routerの詳細
3. [`doc/guides/prisma-guide.md`](./guides/prisma-guide.md) - Prismaの基礎

**推奨ファイル**:
- [`app/page.tsx`](../app/page.tsx) - Server Componentの例
- [`app/api/products/route.ts`](../app/api/products/route.ts) - API Routeの例
- [`lib/prisma.ts`](../lib/prisma.ts) - Prisma Clientの設定

**学習のポイント**:
- Next.jsのApp Router（Laravelのルーティングと比較）
- Server ComponentsとClient Componentsの違い
- PrismaのORM（LaravelのEloquentと比較）

### ステップ4: 実装の詳細理解

最後に、実際の実装を詳しく読み、各機能がどのように実装されているかを理解します。

**推奨ドキュメント**:
1. [`doc/guides/frontend-guide.md`](./guides/frontend-guide.md) - フロントエンド実装の詳細
2. [`doc/guides/dashboard-guide.md`](./guides/dashboard-guide.md) - ダッシュボード機能の詳細
3. [`doc/development-guide.md`](./development-guide.md) - 開発ガイドライン

**推奨ファイル**:
- [`app/dashboard/page.tsx`](../app/dashboard/page.tsx) - ダッシュボードページ
- [`app/dashboard/components/DashboardForm.tsx`](../app/dashboard/components/DashboardForm.tsx) - フォーム実装
- [`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx) - コンポーネント実装

**学習のポイント**:
- コンポーネントの分割と再利用
- 状態管理（useState、useEffect）
- カスタムフックの使い方

## ガイドドキュメントの読み順序

### 最初に読むべきドキュメント（必須）

1. **[`README.md`](../README.md)**
   - プロジェクトの概要とセットアップ方法
   - 開発コマンドの確認

2. **[`doc/tech-stack.md`](./tech-stack.md)**
   - 使用している技術スタックの一覧
   - 各技術の特徴とこのアプリでの使われ方

3. **[`doc/project-structure.md`](./project-structure.md)**
   - ディレクトリ構造と各ファイルの役割
   - ファイル命名規則

### 基礎を学ぶためのドキュメント（推奨）

4. **[`doc/guides/typescript-guide.md`](./guides/typescript-guide.md)**
   - TypeScriptの基礎
   - 型定義、インターフェース、ジェネリクス

5. **[`doc/guides/react-guide.md`](./guides/react-guide.md)**
   - Reactの基礎
   - コンポーネント、Hooks、状態管理

6. **[`doc/guides/async-await-guide.md`](./guides/async-await-guide.md)**
   - 非同期処理の基礎
   - async/await、Promise、エラーハンドリング

### フレームワークを学ぶためのドキュメント（重要）

7. **[`doc/guides/nextjs-guide.md`](./guides/nextjs-guide.md)**
   - Next.jsの基礎
   - 画像最適化、フォント最適化、メタデータ

8. **[`doc/guides/app-router-guide.md`](./guides/app-router-guide.md)**
   - App Routerの詳細
   - Server Components、Client Components、API Routes

9. **[`doc/guides/prisma-guide.md`](./guides/prisma-guide.md)**
   - Prismaの基礎
   - スキーマ定義、クエリ、マイグレーション

### 実装を理解するためのドキュメント（応用）

10. **[`doc/guides/frontend-guide.md`](./guides/frontend-guide.md)**
    - フロントエンド実装の詳細
    - ページ構成、コンポーネント、データフロー

11. **[`doc/guides/dashboard-guide.md`](./guides/dashboard-guide.md)**
    - ダッシュボード機能の詳細
    - フォーム、状態管理、API連携

12. **[`doc/development-guide.md`](./development-guide.md)**
    - 開発ガイドライン
    - コーディング規約、ベストプラクティス

### その他のドキュメント（参考）

13. **[`doc/guides/jsx-guide.md`](./guides/jsx-guide.md)**
    - JSXの構文と使用方法
    - HTMLとの違い、ベストプラクティス

14. **[`doc/guides/utilities-guide.md`](./guides/utilities-guide.md)**
    - ユーティリティ関数の詳細
    - 画像圧縮、Blob Storage、設定管理

15. **[`doc/architecture.md`](./architecture.md)**
    - アーキテクチャと設計思想
    - 設計の意図と理由

## ファイルの読み順序

### 1. 設定ファイル（最初に確認）

**目的**: プロジェクトの設定と依存関係を理解する

1. [`package.json`](../package.json)
   - 使用しているライブラリとバージョン
   - 開発コマンドの確認

2. [`tsconfig.json`](../tsconfig.json)
   - TypeScriptの設定
   - パスエイリアス（`@/`）の設定

3. [`next.config.ts`](../next.config.ts)
   - Next.jsの設定
   - 画像最適化の設定

4. [`prisma/schema.prisma`](../prisma/schema.prisma)
   - データベース構造の確認
   - テーブルとリレーションの理解

### 2. 共通ライブラリ（基礎を理解）

**目的**: プロジェクト全体で使用される共通機能を理解する

5. [`lib/config.ts`](../lib/config.ts)
   - アプリケーション設定の一元管理
   - 画像サイズ、キャッシュ期間などの設定値

6. [`lib/prisma.ts`](../lib/prisma.ts)
   - Prisma Clientの設定
   - データベース接続の管理

7. [`lib/errors.ts`](../lib/errors.ts)
   - エラーハンドリングの統一
   - エラークラスの定義

8. [`lib/api-helpers.ts`](../lib/api-helpers.ts)
   - API Routes用のヘルパー関数
   - エラーハンドリングのラッパー

### 3. 型定義（データ構造を理解）

**目的**: アプリケーションで使用されるデータ構造を理解する

9. [`app/types.ts`](../app/types.ts)
   - フロントエンド共通型定義
   - Category、Product、ProductTileの型

10. [`app/dashboard/types.ts`](../app/dashboard/types.ts)
    - ダッシュボード用の型定義
    - フォームデータの型

### 4. シンプルなコンポーネント（Reactの基礎）

**目的**: Reactの基本的な使い方を理解する

11. [`app/components/ProductTile.tsx`](../app/components/ProductTile.tsx)
    - シンプルなコンポーネントの例
    - props、JSX、スタイリング

12. [`app/components/Header.tsx`](../app/components/Header.tsx)
    - レイアウトコンポーネントの例
    - ナビゲーション、リンク

### 5. Server Component（Next.jsの特徴）

**目的**: Server Componentの概念を理解する

13. [`app/page.tsx`](../app/page.tsx)
    - Server Componentの例
    - データベースからのデータ取得
    - データの変換とフィルタリング

14. [`app/faq/page.tsx`](../app/faq/page.tsx)
    - シンプルなServer Componentの例
    - 静的コンテンツの表示

### 6. Client Component（インタラクティブな機能）

**目的**: Client Componentと状態管理を理解する

15. [`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx)
    - Client Componentの例
    - カスタムフックの使用
    - イベントハンドリング

16. [`app/hooks/useModal.ts`](../app/hooks/useModal.ts)
    - カスタムフックの例
    - useEffect、useRefの使い方

17. [`app/hooks/useProductModal.ts`](../app/hooks/useProductModal.ts)
    - 状態管理のカスタムフック
    - useStateの使い方

### 7. API Routes（バックエンド）

**目的**: サーバーサイドのAPI実装を理解する

18. [`app/api/products/route.ts`](../app/api/products/route.ts)
    - GET/POSTエンドポイントの実装
    - バリデーション、エラーハンドリング
    - Prismaを使ったデータベース操作

19. [`app/api/products/[id]/route.ts`](../app/api/products/[id]/route.ts)
    - 動的ルートの実装
    - PUT/DELETEエンドポイント

20. [`app/api/products/upload/route.ts`](../app/api/products/upload/route.ts)
    - ファイルアップロードの実装
    - Blob Storageへの保存

### 8. 複雑な機能（応用）

**目的**: 複雑な機能の実装を理解する

21. [`app/dashboard/page.tsx`](../app/dashboard/page.tsx)
    - ダッシュボードページの実装
    - Server ComponentとClient Componentの連携

22. [`app/dashboard/components/DashboardForm.tsx`](../app/dashboard/components/DashboardForm.tsx)
    - フォーム実装の詳細
    - 画像アップロード、バリデーション

23. [`app/dashboard/components/ProductList.tsx`](../app/dashboard/components/ProductList.tsx)
    - 複雑な状態管理
    - ドラッグ&ドロップ、検索機能

## ソースコードを読むときのコツ

### 1. 上から下に読むのではなく、目的から逆算する

**悪い例**: ファイルの最初から最後まで順番に読む

**良い例**: 
- 「商品一覧を表示する機能を理解したい」→ [`app/page.tsx`](../app/page.tsx)を読む
- 「商品を追加する機能を理解したい」→ [`app/dashboard/components/DashboardForm.tsx`](../app/dashboard/components/DashboardForm.tsx)を読む
- 「データベースから商品を取得する方法を知りたい」→ [`app/api/products/route.ts`](../app/api/products/route.ts)を読む

### 2. 型定義を先に確認する

TypeScriptでは、型定義を見ることで、そのコードが何をするものかが理解しやすくなります。

**例**: [`app/types.ts`](../app/types.ts)を読んで、`Product`型の構造を確認してから、商品を扱うコンポーネントを読む

### 3. インポート文から依存関係を把握する

ファイルの先頭の`import`文を見ることで、そのファイルがどのような機能に依存しているかがわかります。

**例**: 
```typescript
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
```
→ このファイルはデータベース操作とエラーハンドリングを使用している

### 4. コメントを活用する

このプロジェクトでは、各ファイルに詳細なコメントが書かれています。コメントを読むことで、コードの意図を理解できます。

**例**: [`app/page.tsx`](../app/page.tsx)のコメントで、なぜ`dynamic = "force-dynamic"`を設定しているかが説明されている

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

ブラウザの開発者ツールやVS Codeのデバッガーを使って、実際の動作を確認しましょう。

**例**: 
- `console.log`を追加して、変数の値を確認する
- ブレークポイントを設定して、実行の流れを追う

### 8. 関連ファイルを一緒に読む

一つのファイルだけを読むのではなく、関連するファイルを一緒に読むと理解が深まります。

**例**: 
- [`app/api/products/route.ts`](../app/api/products/route.ts)を読むときは、[`lib/prisma.ts`](../lib/prisma.ts)と[`lib/errors.ts`](../lib/errors.ts)も一緒に読む
- [`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx)を読むときは、[`app/hooks/useProductModal.ts`](../app/hooks/useProductModal.ts)も一緒に読む

### 9. パターンを探す

コードを読むときは、繰り返し使われているパターンを探しましょう。

**例**:
- エラーハンドリングのパターン（`withErrorHandling`の使用）
- データベース操作のパターン（`safePrismaOperation`の使用）
- コンポーネントのパターン（Server ComponentとClient Componentの使い分け）

### 10. 疑問を持ったらドキュメントを参照する

コードを読んでいて疑問が生じたら、関連するドキュメントを参照しましょう。

**例**:
- Prismaの使い方がわからない → [`doc/guides/prisma-guide.md`](./guides/prisma-guide.md)
- React Hooksの使い方がわからない → [`doc/guides/react-guide.md`](./guides/react-guide.md)
- Next.jsの概念がわからない → [`doc/guides/nextjs-guide.md`](./guides/nextjs-guide.md)

## 技術スタック別おすすめファイル

### TypeScript

**学習のポイント**: Javaの型システムと比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`app/types.ts`](../app/types.ts)**
   - 型定義の基本
   - インターフェース、型エイリアス
   - オプショナルプロパティ（`?`）

2. **[`app/dashboard/types.ts`](../app/dashboard/types.ts)**
   - より複雑な型定義
   - 型の再利用

3. **[`lib/api-types.ts`](../lib/api-types.ts)**
   - APIレスポンスの型定義
   - ジェネリクスの使用例

4. **[`app/page.tsx`](../app/page.tsx)（28-34行目）**
   - 型ガードの使用例
   - `Prisma.Decimal`型の変換

**Javaとの比較**:
- TypeScriptの`interface`はJavaの`interface`に似ているが、より柔軟
- TypeScriptの`type`はJavaにはない概念（型エイリアス）
- TypeScriptの`?`（オプショナル）はJavaの`Optional<T>`に似ている

**学習の順序**:
1. 基本的な型（string、number、boolean）を理解する
2. インターフェースと型エイリアスを理解する
3. ジェネリクスを理解する
4. 型ガードと型アサーションを理解する

### React

**学習のポイント**: LaravelのBladeテンプレートと比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`app/components/ProductTile.tsx`](../app/components/ProductTile.tsx)**
   - シンプルなコンポーネント
   - props、JSX、スタイリング
   - `React.memo`の使用例

2. **[`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx)**
   - コンポーネントの組み合わせ
   - カスタムフックの使用
   - `useCallback`の使用例

3. **[`app/hooks/useModal.ts`](../app/hooks/useModal.ts)**
   - カスタムフックの実装
   - `useEffect`、`useRef`の使い方
   - クリーンアップ関数

4. **[`app/hooks/useProductModal.ts`](../app/hooks/useProductModal.ts)**
   - 状態管理のカスタムフック
   - `useState`の使い方

5. **[`app/dashboard/components/ProductList.tsx`](../app/dashboard/components/ProductList.tsx)**
   - 複雑な状態管理
   - 複数のHooksの組み合わせ

**Laravelとの比較**:
- ReactのコンポーネントはLaravelのBladeコンポーネントに似ている
- Reactの`props`はLaravelの`@props`に似ている
- Reactの`useState`はLaravelのセッション管理に似ている（ただし、クライアントサイド）

**学習の順序**:
1. JSXの構文を理解する（[`doc/guides/jsx-guide.md`](./guides/jsx-guide.md)を参照）
2. コンポーネントとpropsを理解する
3. 状態管理（useState）を理解する
4. 副作用（useEffect）を理解する
5. カスタムフックを理解する

### Next.js

**学習のポイント**: LaravelのルーティングとMVCパターンと比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`app/page.tsx`](../app/page.tsx)**
   - Server Componentの例
   - データベースからのデータ取得
   - 動的レンダリングの設定

2. **[`app/layout.tsx`](../app/layout.tsx)**
   - ルートレイアウト
   - メタデータ、フォントの設定

3. **[`app/api/products/route.ts`](../app/api/products/route.ts)**
   - API Routeの実装
   - GET/POSTエンドポイント
   - エラーハンドリング

4. **[`app/api/products/[id]/route.ts`](../app/api/products/[id]/route.ts)**
   - 動的ルートの実装
   - PUT/DELETEエンドポイント

5. **[`app/dashboard/page.tsx`](../app/dashboard/page.tsx)**
   - Server ComponentとClient Componentの連携
   - データの受け渡し

**Laravelとの比較**:
- Next.jsの`app/page.tsx`はLaravelの`routes/web.php`と`resources/views`の組み合わせに似ている
- Next.jsの`app/api/`はLaravelの`routes/api.php`に似ている
- Next.jsのServer ComponentはLaravelのコントローラーに似ている（サーバーサイドで実行）

**学習の順序**:
1. App Routerの基本概念を理解する（[`doc/guides/app-router-guide.md`](./guides/app-router-guide.md)を参照）
2. Server ComponentとClient Componentの違いを理解する
3. API Routesの実装を理解する
4. ルーティングとレイアウトを理解する

### Prisma

**学習のポイント**: LaravelのEloquent ORMと比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`prisma/schema.prisma`](../prisma/schema.prisma)**
   - スキーマ定義の基本
   - モデル、リレーション、インデックス

2. **[`lib/prisma.ts`](../lib/prisma.ts)**
   - Prisma Clientの設定
   - シングルトンパターン
   - エラーハンドリング

3. **[`app/api/products/route.ts`](../app/api/products/route.ts)（32-43行目）**
   - `findMany`の使用例
   - `include`によるリレーションの取得（N+1問題の回避）

4. **[`app/api/products/route.ts`](../app/api/products/route.ts)（120-139行目）**
   - `create`の使用例
   - データの作成とリレーションの設定

5. **[`app/page.tsx`](../app/page.tsx)（64-90行目）**
   - 複雑なクエリの例
   - `orderBy`、`include`の組み合わせ
   - `Promise.all`による並列処理

**Laravelとの比較**:
- Prismaの`model`はLaravelの`Model`クラスに似ている
- Prismaの`findMany`はLaravelの`Model::all()`に似ている
- Prismaの`include`はLaravelの`with()`に似ている（Eager Loading）

**学習の順序**:
1. スキーマ定義を理解する（[`doc/guides/prisma-guide.md`](./guides/prisma-guide.md)を参照）
2. 基本的なクエリ（findMany、findUnique、create、update、delete）を理解する
3. リレーションの取得を理解する
4. トランザクションを理解する

### Tailwind CSS

**学習のポイント**: 従来のCSSやBootstrapと比較しながら学習すると理解しやすい

**おすすめファイル**:

1. **[`app/components/ProductTile.tsx`](../app/components/ProductTile.tsx)**
   - 基本的なユーティリティクラス
   - レスポンシブデザイン（`md:`, `lg:`）
   - ホバーエフェクト（`hover:`）

2. **[`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx)**
   - グリッドレイアウト（`grid-cols-3`）
   - スペーシング（`gap-3`, `mb-8`）

3. **[`app/components/Header.tsx`](../app/components/Header.tsx)**
   - フレックスボックスレイアウト（`flex`）
   - ナビゲーションのスタイリング

4. **[`app/globals.css`](../app/globals.css)**
   - グローバルスタイルの設定
   - カスタムCSS変数

**従来のCSSとの比較**:
- Tailwindのユーティリティクラスは、インラインスタイルに似ているが、より柔軟
- Tailwindのレスポンシブプレフィックス（`md:`, `lg:`）は、メディアクエリに似ている
- Tailwindの`hover:`プレフィックスは、`:hover`疑似クラスに似ている

**学習の順序**:
1. 基本的なユーティリティクラスを理解する
2. レスポンシブデザインを理解する
3. カスタマイズ方法を理解する

## Java/PHP/Laravel経験者向けの補足

### オブジェクト指向プログラミング

**Java/PHPとの違い**:
- TypeScript/JavaScriptは、クラスベースのOOPだけでなく、関数型プログラミングのパラダイムも使用する
- Reactでは、クラスコンポーネントよりも関数コンポーネントが推奨される

**このアプリでの例**:
- [`app/components/ProductTile.tsx`](../app/components/ProductTile.tsx)は関数コンポーネント
- [`lib/errors.ts`](../lib/errors.ts)ではクラスを使用（エラークラス）

### MVCパターン

**Laravelとの比較**:
- **Model**: Prismaのスキーマ（[`prisma/schema.prisma`](../prisma/schema.prisma)）とPrisma Client（[`lib/prisma.ts`](../lib/prisma.ts)）
- **View**: Reactコンポーネント（[`app/components/`](../app/components/)）
- **Controller**: Next.jsのAPI Routes（[`app/api/`](../app/api/)）とServer Components（[`app/page.tsx`](../app/page.tsx)）

**違い**:
- Next.jsでは、Server ComponentがViewとControllerの両方の役割を果たすことがある
- クライアントサイドの状態管理は、ReactのHooksで行う（Laravelのセッションとは異なる）

### データベース操作

**LaravelのEloquentとの比較**:

| Laravel | Prisma | 説明 |
|---------|--------|------|
| `Model::all()` | `prisma.model.findMany()` | すべてのレコードを取得 |
| `Model::find($id)` | `prisma.model.findUnique({ where: { id } })` | IDで検索 |
| `Model::create($data)` | `prisma.model.create({ data })` | レコードを作成 |
| `$model->update($data)` | `prisma.model.update({ where, data })` | レコードを更新 |
| `$model->delete()` | `prisma.model.delete({ where })` | レコードを削除 |
| `Model::with('relation')` | `prisma.model.findMany({ include: { relation: true } })` | リレーションを取得 |

**例**: [`app/api/products/route.ts`](../app/api/products/route.ts)の32-43行目

### ルーティング

**Laravelとの比較**:

| Laravel | Next.js | 説明 |
|---------|---------|------|
| `routes/web.php` | `app/page.tsx` | Webページのルーティング |
| `routes/api.php` | `app/api/route.ts` | APIのルーティング |
| `Route::get('/products', ...)` | `app/products/page.tsx` | GETリクエストのハンドリング |
| `Route::post('/products', ...)` | `app/api/products/route.ts`の`POST`関数 | POSTリクエストのハンドリング |

**例**: [`app/api/products/route.ts`](../app/api/products/route.ts)

### テンプレートエンジン

**LaravelのBladeとの比較**:

| Laravel Blade | React JSX | 説明 |
|---------------|-----------|------|
| `@extends('layout')` | `<Layout>`コンポーネント | レイアウトの継承 |
| `@section('content')` | コンポーネントのchildren | コンテンツの挿入 |
| `@if ($condition)` | `{condition && <Component />}` | 条件分岐 |
| `@foreach ($items as $item)` | `{items.map(item => <Component />)}` | ループ処理 |
| `{{ $variable }}` | `{variable}` | 変数の出力 |

**例**: [`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx)の62-72行目

### セッション管理

**Laravelとの違い**:
- Laravelでは、サーバーサイドでセッションを管理する
- Reactでは、クライアントサイドで状態を管理する（`useState`、`useReducer`）
- 永続化が必要な場合は、`localStorage`や`sessionStorage`を使用する

**例**: [`app/dashboard/hooks/useTabState.ts`](../app/dashboard/hooks/useTabState.ts)で`localStorage`を使用

### ミドルウェア

**Laravelとの比較**:
- Laravelのミドルウェアは、リクエストの前後で処理を実行する
- Next.jsでは、ミドルウェアの代わりに、API Routesでエラーハンドリングを行う（[`lib/api-helpers.ts`](../lib/api-helpers.ts)の`withErrorHandling`）

**例**: [`app/api/products/route.ts`](../app/api/products/route.ts)の29行目で`withErrorHandling`を使用

## よくある質問

### Q1: Server ComponentとClient Componentの違いがよくわからない

**A**: Server Componentはサーバーサイドで実行され、データベースに直接アクセスできます。Client Componentはブラウザで実行され、インタラクティブな機能（useState、useEffectなど）を使用できます。

**おすすめファイル**:
- Server Component: [`app/page.tsx`](../app/page.tsx)
- Client Component: [`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx)

**詳細**: [`doc/guides/app-router-guide.md`](./guides/app-router-guide.md)を参照

### Q2: 型定義が複雑で理解できない

**A**: まず、シンプルな型定義から始めましょう。`app/types.ts`の`Category`型から始めて、徐々に複雑な型を理解していきます。

**おすすめファイル**:
1. [`app/types.ts`](../app/types.ts)の`Category`型（シンプル）
2. [`app/types.ts`](../app/types.ts)の`Product`型（中程度）
3. [`lib/api-types.ts`](../lib/api-types.ts)の`GetProductsResponse`型（複雑）

**詳細**: [`doc/guides/typescript-guide.md`](./guides/typescript-guide.md)を参照

### Q3: React Hooksの使い方がわからない

**A**: まず、`useState`と`useEffect`の基本を理解しましょう。その後、カスタムフックを理解します。

**おすすめファイル**:
1. [`app/hooks/useProductModal.ts`](../app/hooks/useProductModal.ts)（useStateの例）
2. [`app/hooks/useModal.ts`](../app/hooks/useModal.ts)（useEffect、useRefの例）
3. [`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx)（useCallbackの例）

**詳細**: [`doc/guides/react-guide.md`](./guides/react-guide.md)を参照

### Q4: Prismaのクエリが複雑で理解できない

**A**: まず、基本的なクエリ（findMany、findUnique、create）を理解しましょう。その後、リレーションの取得を理解します。

**おすすめファイル**:
1. [`app/api/products/route.ts`](../app/api/products/route.ts)の32-43行目（findManyの例）
2. [`app/api/products/route.ts`](../app/api/products/route.ts)の120-139行目（createの例）
3. [`app/page.tsx`](../app/page.tsx)の64-90行目（複雑なクエリの例）

**詳細**: [`doc/guides/prisma-guide.md`](./guides/prisma-guide.md)を参照

### Q5: 非同期処理（async/await）が理解できない

**A**: まず、`async/await`の基本構文を理解しましょう。その後、`Promise.all`などの便利なメソッドを理解します。

**おすすめファイル**:
1. [`app/api/products/route.ts`](../app/api/products/route.ts)の29行目（async関数の例）
2. [`app/page.tsx`](../app/page.tsx)の62-91行目（Promise.allの例）

**詳細**: [`doc/guides/async-await-guide.md`](./guides/async-await-guide.md)を参照

### Q6: エラーハンドリングの方法がわからない

**A**: このプロジェクトでは、統一されたエラーハンドリングを使用しています。`withErrorHandling`と`safePrismaOperation`の使い方を理解しましょう。

**おすすめファイル**:
1. [`lib/errors.ts`](../lib/errors.ts)（エラークラスの定義）
2. [`lib/api-helpers.ts`](../lib/api-helpers.ts)（withErrorHandlingの実装）
3. [`lib/prisma.ts`](../lib/prisma.ts)（safePrismaOperationの実装）
4. [`app/api/products/route.ts`](../app/api/products/route.ts)（実際の使用例）

**詳細**: [`doc/development-guide.md`](./development-guide.md)の「エラーハンドリング」セクションを参照

### Q7: コンポーネントの分割方法がわからない

**A**: コンポーネントは、再利用性と保守性を重視して分割します。小さなコンポーネントから始めて、徐々に大きなコンポーネントを理解しましょう。

**おすすめファイル**:
1. [`app/components/ProductTile.tsx`](../app/components/ProductTile.tsx)（小さなコンポーネント）
2. [`app/components/ProductGrid.tsx`](../app/components/ProductGrid.tsx)（コンポーネントの組み合わせ）
3. [`app/dashboard/components/DashboardContent.tsx`](../app/dashboard/components/DashboardContent.tsx)（大きなコンポーネントの分割例）

**詳細**: [`doc/guides/frontend-guide.md`](./guides/frontend-guide.md)を参照

### Q8: 状態管理の方法がわからない

**A**: このプロジェクトでは、Reactの`useState`とカスタムフックを使用して状態管理を行います。グローバル状態管理ライブラリ（Reduxなど）は使用していません。

**おすすめファイル**:
1. [`app/hooks/useProductModal.ts`](../app/hooks/useProductModal.ts)（シンプルな状態管理）
2. [`app/dashboard/hooks/useTabState.ts`](../app/dashboard/hooks/useTabState.ts)（localStorageとの連携）
3. [`app/dashboard/components/ProductList.tsx`](../app/dashboard/components/ProductList.tsx)（複雑な状態管理）

**詳細**: [`doc/guides/react-guide.md`](./guides/react-guide.md)の「状態管理」セクションを参照

## まとめ

このガイドでは、以下の内容を説明しました：

1. **学習の進め方**: 全体像の把握 → 基礎技術の理解 → フレームワークの理解 → 実装の詳細理解
2. **ガイドドキュメントの読み順序**: 必須 → 推奨 → 重要 → 応用
3. **ファイルの読み順序**: 設定ファイル → 共通ライブラリ → 型定義 → コンポーネント → API Routes
4. **ソースコードを読むときのコツ**: 目的から逆算、型定義を先に確認、小さな単位で理解するなど
5. **技術スタック別おすすめファイル**: TypeScript、React、Next.js、Prisma、Tailwind CSSそれぞれのおすすめファイル
6. **Java/PHP/Laravel経験者向けの補足**: 既存の知識と比較しながら学習できるよう、対応表を提供

学習を進める際は、このガイドを参考にしながら、実際にコードを読んで、動かして、理解を深めていきましょう。疑問が生じたら、関連するドキュメントを参照するか、実際にコードを変更して動作を確認してみてください。
