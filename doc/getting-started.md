# はじめに - コードリーディングガイド

このプロジェクトのコードを理解するためのガイドです。どこから読み始めるべきか、各ディレクトリの役割を説明します。

## 🎯 このガイドの目的

このプロジェクトは Next.js App Router を使用した商品管理ダッシュボードです。以下の技術スタックを使用しています：

- **Next.js 16** (App Router)
- **React 19** (Server Components / Client Components)
- **TypeScript**
- **Prisma** (ORM)
- **Tailwind CSS**

コードを読む際は、**Server Component**と**Client Component**の違いを理解することが重要です。

## 📚 読み始める順序

### 1. まず理解すべきファイル

#### `README.md`

プロジェクトの概要、セットアップ方法、基本的な使い方を確認します。

#### `doc/architecture.md`

アーキテクチャの全体像と設計思想を理解します。

#### `doc/project-structure.md`

ディレクトリ構造と各ファイルの役割を把握します。

### 2. 設定ファイル

#### `package.json`

使用しているライブラリと依存関係を確認します。

#### `tsconfig.json`

TypeScript の設定を確認します。

#### `next.config.ts`

Next.js の設定を確認します。

### 3. 共通ライブラリ (`lib/`)

#### `lib/config.ts` ⭐ 重要

アプリケーション全体の設定値が集約されています。画像サイズ、キャッシュ期間、表示設定など、すべての設定がここにあります。

#### `lib/errors.ts`

エラーハンドリングの統一された方法を理解します。

#### `lib/api-helpers.ts`

API Routes で使用する共通のヘルパー関数を確認します。

#### `lib/prisma.ts`

データベース接続の設定と使用方法を理解します。

#### `lib/blob.ts`

画像アップロードの仕組みを理解します。

### 4. データベーススキーマ

#### `prisma/schema.prisma`

データベースの構造を理解します。どのようなテーブルがあり、どのような関係があるかを確認します。

### 5. API Routes (`app/api/`)

#### `app/api/products/route.ts`

商品一覧の取得と作成の API を確認します。

#### `app/api/products/[id]/route.ts`

個別商品の取得、更新、削除の API を確認します。

#### `app/api/products/upload/route.ts`

画像アップロードの API を確認します。

#### `app/api/products/reorder/route.ts`

商品の順序変更の API を確認します。

#### `app/api/categories/route.ts`

カテゴリー一覧の取得 API を確認します。

### 6. ダッシュボード機能 (`app/dashboard/`)

#### `app/dashboard/types.ts` ⭐ 重要

ダッシュボードで使用する型定義を確認します。`Category`と`Product`の構造を理解します。

#### `app/dashboard/page.tsx`

ダッシュボードページのエントリーポイントです。Server Component としてデータを取得し、Client Component に渡します。

#### `app/dashboard/components/DashboardContent.tsx`

ダッシュボードのメインコンテナです。商品一覧とフォームの状態を管理します。

#### `app/dashboard/components/ProductList.tsx`

商品一覧の表示と配置変更機能を実装しています。タブ切り替え、検索、ドラッグ&ドロップのロジックが含まれます。

#### `app/dashboard/components/DashboardForm.tsx`

新規商品登録フォームです。画像アップロード、バリデーション、フォーム送信の処理を確認します。

#### `app/dashboard/components/ProductEditForm.tsx`

商品編集フォームです。既存商品の更新処理を確認します。

#### `app/dashboard/components/CategoryTabs.tsx`

カテゴリータブの UI コンポーネントです。スクロール可能なタブの実装を確認します。

#### `app/dashboard/components/SortableProductItem.tsx`

ドラッグ&ドロップ可能な商品アイテムコンポーネントです。

#### `app/dashboard/hooks/useTabState.ts`

タブ状態管理のカスタムフックです。localStorage との連携方法を確認します。

#### `app/dashboard/hooks/useProductReorder.ts`

商品順序変更のロジックを実装したカスタムフックです。楽観的 UI 更新の実装を確認します。

#### `app/dashboard/utils/productUtils.ts`

商品のグループ化やフィルタリングなどのユーティリティ関数です。

## 📁 ディレクトリの役割

### `app/` - Next.js App Router

Next.js のページと API Routes を配置するディレクトリです。App Router の規約に従ってファイルを配置します。

#### `app/api/` - API Routes

サーバーサイドの API エンドポイントを定義します。各ディレクトリに`route.ts`ファイルを配置することで、RESTful API を実装できます。

**構造**:

```
app/api/
├── products/
│   ├── route.ts          # GET, POST /api/products
│   ├── upload/
│   │   └── route.ts      # POST /api/products/upload（画像アップロード）
│   ├── reorder/
│   │   └── route.ts      # POST /api/products/reorder（順序変更）
│   └── [id]/
│       └── route.ts      # GET, PUT, DELETE /api/products/[id]
└── categories/
    └── route.ts          # GET /api/categories
```

**特徴**:

- Server Component として実行される（`'use client'`は不要）
- データベースに直接アクセス可能
- 統一されたエラーハンドリング（`withErrorHandling`を使用）

#### `app/dashboard/` - ダッシュボード機能

商品管理ダッシュボードの実装です。機能ごとにディレクトリを分割しており、保守性と再利用性を重視した設計になっています。

**構造**:

```
app/dashboard/
├── page.tsx              # ダッシュボードページ（Server Component）
├── types.ts              # 共通型定義（Category, Product）
├── components/           # UI コンポーネント
│   ├── DashboardContent.tsx      # メインコンテナ
│   ├── DashboardForm.tsx         # 新規商品登録フォーム
│   ├── DashboardFormWrapper.tsx  # フォームラッパー
│   ├── ProductList.tsx           # 商品一覧・配置変更
│   ├── ProductEditForm.tsx       # 商品編集フォーム
│   ├── CategoryTabs.tsx          # カテゴリータブ
│   └── SortableProductItem.tsx   # ドラッグ&ドロップ可能な商品アイテム
├── hooks/                # カスタムフック（状態管理ロジック）
│   ├── useTabState.ts            # タブ状態管理（localStorage連携）
│   └── useProductReorder.ts      # 商品順序変更ロジック
└── utils/                # ユーティリティ関数（ビジネスロジック）
    └── productUtils.ts           # 商品のグループ化・フィルタリング
```

**設計思想**:

- **`types.ts`**: その機能で使用する型を一元管理（重複を防止）
- **`components/`**: UI コンポーネントのみを配置（見た目とレイアウト）
- **`hooks/`**: 状態管理や副作用をカスタムフックに分離（再利用可能）
- **`utils/`**: 純粋関数として実装可能なビジネスロジック（テストしやすい）

#### `app/page.tsx` - ホームページ

トップページのコンポーネントです。Server Component として実装されています。カテゴリーごとに公開されている商品を表示します。

#### `app/faq/page.tsx` - FAQ ページ

よくある質問ページです。Server Component として実装されています。

#### `app/types.ts` - フロントエンド共通型定義

フロントエンドで使用する型定義を一元管理します。

**主要な型**:

- **`Category`**: カテゴリー情報
- **`Product`**: 商品情報（詳細表示用）
- **`ProductTile`**: 商品情報（タイル表示用、最小限の情報）

#### `app/hooks/` - カスタムフック

フロントエンドで使用するカスタムフックを配置します。

**主要なフック**:

- **`useModal.ts`**: モーダルの開閉状態と ESC キー処理を管理
- **`useProductModal.ts`**: 商品モーダルの状態管理

#### `app/utils/` - ユーティリティ関数

フロントエンドで使用するユーティリティ関数を配置します。

**主要な関数**:

- **`format.ts`**: フォーマット関数（価格フォーマットなど）

#### `app/components/` - フロントエンド共通コンポーネント

フロントエンドで使用する共通コンポーネントを配置します。

**主要なコンポーネント**:

- **`Header.tsx`**: ヘッダーコンポーネント（ロゴ、Instagram リンク、ナビゲーション）
- **`Footer.tsx`**: フッターコンポーネント（店舗情報、地図、連絡先）
- **`ProductGrid.tsx`**: カテゴリーごとの商品グリッド表示（Client Component）
- **`ProductTile.tsx`**: 商品タイルコンポーネント（個別商品の表示）
- **`ProductModal.tsx`**: 商品詳細モーダルコンポーネント

**アイコンコンポーネント** (`components/icons/`):

- **`CloseIcon.tsx`**: 閉じるアイコンコンポーネント

#### `app/layout.tsx` - ルートレイアウト

全ページ共通のレイアウトです。メタデータやフォントの設定など、全ページで共通の要素を定義します。

### `lib/` - 共通ライブラリ

プロジェクト全体で使用するユーティリティ関数や設定を配置します。どの機能からでも使用できる汎用的なコードを配置します。

**主要なファイル**:

- **`config.ts`**: アプリケーション設定の一元管理
  - 画像サイズ、圧縮設定
  - Blob Storage 設定
  - API キャッシュ設定
  - UI 表示設定
- **`prisma.ts`**: データベース接続とエラーハンドリング
- **`blob.ts`**: Vercel Blob Storage への画像アップロード・削除
- **`errors.ts`**: 統一されたエラークラス（ValidationError, NotFoundError など）
- **`api-helpers.ts`**: API Routes 用ヘルパー（`withErrorHandling`, `apiSuccess` など）
- **`image-compression.ts`**: クライアントサイドでの画像圧縮（Canvas API を使用）
- **`product-utils.ts`**: 商品関連ユーティリティ（公開状態の計算など）

**設計思想**:

- プロジェクト全体で使用するコードのみを配置
- 機能固有のコードは `app/[feature]/utils/` に配置
- 設定値は `config.ts` に一元管理

### `prisma/` - データベース

Prisma の設定とスキーマを管理します。

- **`schema.prisma`**: データベーススキーマ定義
  - テーブル構造
  - リレーション
  - インデックス
- **`migrations/`**: マイグレーションファイル（自動生成）

**データベース構造**:

- `Category`: カテゴリーテーブル（id, name）
- `Product`: 商品テーブル（id, name, description, imageUrl, priceS, priceL, categoryId, published, publishedAt, endedAt, displayOrder）

### `public/` - 静的ファイル

画像やファビコンなどの静的ファイルを配置します。Next.js では、`public/` 配下のファイルは `/` から直接アクセスできます。

**例**: `public/favicon.ico` → `http://localhost:3000/favicon.ico`

### `doc/` - ドキュメント

プロジェクトのドキュメントを配置します。

- **`getting-started.md`**: コードリーディングガイド（このファイル）
- **`architecture.md`**: アーキテクチャと設計思想
- **`project-structure.md`**: プロジェクト構造の詳細
- **`development-guide.md`**: 開発ガイドライン（コーディング標準とベストプラクティスを含む）
- **`tech-stack.md`**: 技術スタックの詳細
- **`guides/frontend-guide.md`**: フロントエンドガイド
- **`guides/dashboard-guide.md`**: ダッシュボードガイド
- **`guides/prisma-guide.md`**: Prisma ガイド
- **`guides/app-router-guide.md`**: App Router ガイド
- **`setup-prisma-blob.md`**: Prisma & Blob セットアップガイド
- **`deployment.md`**: デプロイメントガイド

## 🔍 コードの読み方

### Server Component vs Client Component

#### Server Component（デフォルト）

- サーバーサイドで実行される
- データベースへの直接アクセスが可能
- `'use client'`ディレクティブがない

**例**: `app/dashboard/page.tsx`

```typescript
// Server Component
export default async function DashboardPage() {
  const data = await getDashboardData(); // サーバーで実行
  return <DashboardContent data={data} />;
}
```

#### Client Component

- ブラウザで実行される
- インタラクティブな機能（useState、useEffect など）が必要な場合に使用
- `'use client'`ディレクティブが必要

**例**: `app/dashboard/components/ProductList.tsx`

```typescript
"use client"; // Client Component

export default function ProductList() {
  const [state, setState] = useState(); // クライアントで実行
  // ...
}
```

### データフロー

1. **Server Component**でデータを取得
2. **props**で Client Component に渡す
3. **Client Component**で状態管理と UI 更新

### 型定義の確認方法

型定義は以下の場所にあります：

- **共通型**: `app/dashboard/types.ts`
- **Prisma 型**: `prisma/schema.prisma`から自動生成
- **関数の型**: 各ファイル内で定義

### エラーハンドリングの確認

エラーハンドリングは統一されています：

- **API Routes**: `lib/api-helpers.ts`の`withErrorHandling`を使用
- **エラークラス**: `lib/errors.ts`で定義
- **データベース操作**: `lib/prisma.ts`の`safePrismaOperation`を使用

## 💡 理解を深めるためのヒント

### 1. 設定値の確認

`lib/config.ts`を確認すると、アプリケーション全体の設定が一覧できます。

### 2. 型定義の追跡

`app/dashboard/types.ts`から始めて、各コンポーネントでどのように型が使用されているかを追跡します。

### 3. データフローの追跡

1. `app/dashboard/page.tsx`でデータ取得
2. `app/dashboard/components/DashboardContent.tsx`で状態管理
3. 各子コンポーネントで表示

### 4. API 呼び出しの追跡

1. Client Component で`fetch`を呼び出す
2. `app/api/`の対応する`route.ts`で処理
3. `lib/prisma.ts`でデータベース操作

## 📖 参考ドキュメント

### プロジェクト内のドキュメント

- **[Next.js ガイド](./guides/nextjs-guide.md)** - Next.js の詳細な使用方法。画像最適化、フォント最適化、メタデータ、ビルドとデプロイなどの説明と、このアプリでの実際の使用箇所を説明します。
- **[App Router ガイド](./guides/app-router-guide.md)** - Next.js App Router の詳細な使用方法。Server Components、Client Components、API Routes などの説明と、このアプリでの実際の使用箇所を説明します。
- **[React ガイド](./guides/react-guide.md)** - React の詳細な使用方法。Hooks、カスタムフック、コンポーネント設計などの説明と、このアプリでの実際の使用箇所を説明します。
- **[TypeScript ガイド](./guides/typescript-guide.md)** - TypeScript の詳細な使用方法。型定義、型安全性、Prisma との統合などの説明と、このアプリでの実際の使用箇所を説明します。
- **[Prisma ガイド](./guides/prisma-guide.md)** - Prisma の詳細な使用方法。各関数の説明と、このアプリでの実際の使用箇所を説明します。

### 外部ドキュメント

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
