# フロントエンドガイド

白熊堂プロジェクトのフロントエンド実装について詳しく説明します。

## 目次

- [概要](#概要)
- [ページ構成](#ページ構成)
- [ディレクトリ構造](#ディレクトリ構造)
- [コンポーネント構成](#コンポーネント構成)
- [レイアウトとスタイリング](#レイアウトとスタイリング)
- [データフロー](#データフロー)
- [画像最適化](#画像最適化)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [アクセシビリティ](#アクセシビリティ)
- [参考リンク](#参考リンク)

## 概要

フロントエンドは、Next.js App Router を使用した Server Components ベースの実装です。公開商品の表示、FAQ ページ、共通レイアウトコンポーネントで構成されています。

### 技術スタック

- **Next.js 16** (App Router)
- **React 19** (Server Components / Client Components)
- **TypeScript**
- **Tailwind CSS**
- **Next.js Image** (画像最適化)

## ページ構成

### ホームページ ([`app/page.tsx`](../../app/page.tsx))

トップページでは、カテゴリーごとに公開されている商品を表示します。

**主な機能**:

- カテゴリーごとの商品グリッド表示
- 公開状態の自動判定（公開日・終了日の設定に基づく）
- 商品がないカテゴリーは非表示

**データ取得**:

[`app/page.tsx`](../../app/page.tsx) (`getPublishedProductsByCategory`関数)

```typescript
  // カテゴリーと商品を並列で取得（Promise.all を使用）
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: "asc" } }),
    prisma.product.findMany({ include: { category: true } }),
  ]);

  // Promise.all の詳細は [Async/Await ガイド - Promise.all](./async-await-guide.md#promiseall---このアプリで使用中) を参照

  // 公開商品のみをフィルタリング
  const publishedProducts = products.filter((product) => {
    if (product.publishedAt || product.endedAt) {
      return calculatePublishedStatus(product.publishedAt, product.endedAt);
    }
    return product.published;
  });

  // カテゴリーごとにグループ化
  // ...
}
```

1. **ヘッダー**: ロゴ、Instagram リンク、ナビゲーション
2. **ヒーローバナー**: メイン画像（`/hero.webp`）
3. **メインコンテンツ**: カテゴリーごとの商品グリッド
4. **フッター**: 店舗情報、地図、連絡先

### FAQ ページ ([`app/faq/page.tsx`](../../app/faq/page.tsx))

よくある質問ページです。静的なコンテンツを表示します。

**主な機能**:

- 質問と回答の一覧表示
- レスポンシブなレイアウト

**構造**:

```typescript
  { question: "質問", answer: "回答" },
  // ...
];
```

**注意**: プロジェクト全体のディレクトリ構造の詳細については、[プロジェクト構造ドキュメント](../project-structure.md)を参照してください。App Router のディレクトリ構造については、[App Router ガイド](./app-router-guide.md#app-router-のディレクトリ構造)を参照してください。

## ディレクトリ構造

フロントエンドは以下のように構造化されています：

```
├── types.ts                    # 共通型定義
├── hooks/                      # カスタムフック
│   ├── useModal.ts            # モーダル管理フック
│   └── useProductModal.ts    # 商品モーダル管理フック
├── utils/                      # ユーティリティ関数
│   └── format.ts              # フォーマット関数
├── components/                 # UIコンポーネント
│   ├── icons/                 # アイコンコンポーネント
│   │   └── CloseIcon.tsx     # 閉じるアイコン
│   ├── Header.tsx             # ヘッダー
│   ├── Footer.tsx             # フッター
│   ├── ProductGrid.tsx        # 商品グリッド
│   ├── ProductTile.tsx        # 商品タイル
│   └── ProductModal.tsx       # 商品モーダル
├── page.tsx                    # ホームページ
└── faq/
    └── page.tsx               # FAQページ
```

- **`types.ts`**: フロントエンドで使用する型を一元管理（重複を防止）
- **`hooks/`**: 状態管理や副作用をカスタムフックに分離（再利用可能）
- **`utils/`**: 純粋関数として実装可能なビジネスロジック（テストしやすい）
- **`components/`**: UI コンポーネントのみを配置（見た目とレイアウト）
- **`components/icons/`**: アイコンコンポーネントを分離（再利用性）

## コンポーネント構成

### 共通型定義 ([`app/types.ts`](../../app/types.ts))

フロントエンドで使用する型定義を一元管理します。

**主要な型**:

- **`Category`**: カテゴリー情報
- **`Product`**: 商品情報（詳細表示用）
- **`ProductTile`**: 商品情報（タイル表示用、最小限の情報）

**利点**:

- 型定義の重複を防止
- 一貫性の確保
- 変更時の影響範囲が明確

### カスタムフック (`app/hooks/`)

#### useModal (`hooks/useModal.ts`)

モーダルの開閉状態と ESC キー処理を管理するカスタムフックです。

**機能**:

- ESC キーでモーダルを閉じる
- モーダル表示時の背景スクロール無効化

**使用例**:

[`app/hooks/useModal.ts`](../../app/hooks/useModal.ts) (`useModal`フック)

```typescript
useModal(isOpen, onClose);
```

商品モーダルの状態管理を行うカスタムフックです。

**機能**:

- 選択された商品の管理
- モーダルの開閉状態管理
- 商品クリック時のハンドリング
- モーダル閉じる時のアニメーション考慮

**使用例**:

[`app/hooks/useProductModal.ts`](../../app/hooks/useProductModal.ts) (`useProductModal`フック)

```typescript
useProductModal();
```

#### formatPrice (`utils/format.ts`)

価格をフォーマットして表示用の文字列を返す関数です。

[`app/utils/format.ts`](../../app/utils/format.ts) (`formatPrice`関数)

**機能**:

- 数値を 3 桁区切りの文字列に変換
- 円記号を付与

**使用例**:

#### Header (`Header.tsx`)

全ページ共通のヘッダーコンポーネントです。

**機能**:

- ロゴ画像（トップページへのリンク）
- Instagram アイコン（外部リンク）
- ナビゲーションリンク（よくある質問）

**特徴**:

- `sticky`で固定表示
- レスポンシブ対応
- ホバーエフェクト

**実装例**:

[`app/components/Header.tsx`](../../app/components/Header.tsx) (`Header`コンポーネント)

```typescript
  <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
    {/* ロゴとInstagram */}
    <div className="flex items-center gap-3">
      <Link href="/">
        <Image src="/logo.webp" alt="白熊堂" />
      </Link>
      <a href="https://www.instagram.com/shirokumado2021/">
        <Image src="/logo-instagram.svg" alt="Instagram" />
      </a>
    </div>
    {/* ナビゲーション */}
    <nav>
      <Link href="/faq">よくある質問</Link>
    </nav>
  </div>
</header>
```

全ページ共通のフッターコンポーネントです。

**機能**:

- ロゴ画像（トップページへのリンク）
- Instagram アイコン
- 店舗情報（住所、営業時間、定休日、電話番号）
- Google マップ埋め込み

**レイアウト**:

- ロゴと Instagram アイコン（1 行目、横並び）
- 店舗情報（2 行目、4 列グリッド）
  - 住所
  - 営業情報（営業時間、定休日）
  - お問い合わせ（電話番号）
  - 地図

**特徴**:

- 常に 4 列のグリッドレイアウト（モバイルでも）
- レスポンシブなフォントサイズとスペーシング
- Google マップの埋め込み

#### ProductGrid (`ProductGrid.tsx`)

カテゴリーごとの商品グリッド表示コンポーネントです。

**機能**:

- カテゴリータイトルの表示
- 商品タイルの 3 列グリッド表示
- 商品クリック時のモーダル表示（`useProductModal`フックで管理）

**特徴**:

- Client Component（`'use client'`）
- 商品がない場合は非表示
- モーダル状態管理をカスタムフックに分離

**実装例**:

[`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx) (`ProductGrid`コンポーネント)

```typescript
import { useProductModal } from "../hooks/useProductModal";

export default function ProductGrid({ category, products }) {
  const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
    useProductModal();

  return (
    <>
      <section>
        <h2>{category.name}</h2>
        <div className="grid grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductTile
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
              }}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      </section>
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
```

個別商品のタイル表示コンポーネントです。

**機能**:

- 商品画像の表示（Next.js Image を使用）
- 商品名の表示（2 行固定）
- クリック時のモーダル表示

**特徴**:

- Next.js Image コンポーネントを使用（画像最適化）
- 画像のアスペクト比を維持（1:1）
- 商品名は 2 行で固定表示（`line-clamp-2`）
- ホバーエフェクト（画像の拡大、影の追加）
- アクセシビリティ対応（aria-label）

#### ProductModal (`ProductModal.tsx`)

商品詳細を表示するモーダルコンポーネントです。

**機能**:

- 商品画像の拡大表示（Next.js Image を使用）
- 商品名、説明、価格の詳細表示
- モーダルの開閉アニメーション

**特徴**:

- Next.js Image コンポーネントを使用（画像最適化）
- 背景クリックで閉じる
- ESC キーで閉じる（`useModal`フックで実装）
- モーダル表示時の背景スクロール無効化（`useModal`フックで実装）
- スクロールしても右上に固定表示される閉じるボタン（`sticky`を使用）
- フェードイン・フェードアウトアニメーション
- 価格フォーマット（`formatPrice`ユーティリティを使用）

#### CloseIcon (`components/icons/CloseIcon.tsx`)

閉じるアイコンコンポーネントです。

**機能**:

- X アイコンの表示
- モーダルやダイアログの閉じるボタンで使用

**特徴**:

- 再利用可能なアイコンコンポーネント
- アクセシビリティ対応（`aria-hidden`）

## レイアウトとスタイリング

### Tailwind CSS

プロジェクト全体で Tailwind CSS を使用しています。

**主な設定**:

- カスタムフォント: Noto Sans JP
- カスタムカラー: グレースケール中心
- レスポンシブブレークポイント: `sm`, `md`, `lg`, `xl`

### レスポンシブデザイン

**ブレークポイント**:

- `sm`: 640px 以上
- `md`: 768px 以上
- `lg`: 1024px 以上
- `xl`: 1280px 以上

**実装例**:

```typescript
className = "text-sm md:text-base lg:text-lg";

// モバイル: 1列、デスクトップ: 3列
className = "grid grid-cols-1 md:grid-cols-3";
```

- **ヘッダー**: 高さ固定 `h-20` (80px)、ロゴサイズ `max-h-20` (80px)
- **フッター**: 常に 4 列グリッド、フォントサイズ `text-[10px]` → `text-sm`、スペーシング `gap-2` → `gap-4`、地図の高さ `h-32` → `h-48`
- **商品グリッド**: 常に 3 列、ギャップ `gap-3` → `gap-6`、カテゴリータイトル `text-lg` → `text-2xl`
- **ヒーローバナー**: 高さ `h-[30vh]` → `h-[60vh]`、最小高さ `min-h-[200px]` → `min-h-[500px]`

### 共通スタイル

**グローバルスタイル** (`app/globals.css`):

- フォント設定
- スクロールバーの設定
- カスタムアニメーション（フェードイン）

## データフロー

**注意**: アーキテクチャ的な視点（コンポーネント階層、状態管理の設計）については、[アーキテクチャドキュメント](../architecture.md#データフロー)を参照してください。

### フロントエンドとバックエンドの使い分け

このアプリでは、フロントエンド（Client Components）とバックエンド（Server Components、API Routes）で異なる技術を使用しています：

**フロントエンド（Client Components）で使用**:

- **`fetch` API**: API Routes に HTTP リクエストを送信
  - `app/dashboard/components/DashboardForm.tsx`: 商品作成時に `/api/products` に POST リクエスト
  - `app/dashboard/components/ProductEditForm.tsx`: 商品更新時に `/api/products/[id]` に PUT リクエスト
  - `app/dashboard/components/DashboardContent.tsx`: 商品一覧取得時に `/api/products` に GET リクエスト
  - `app/dashboard/hooks/useProductReorder.ts`: 商品並び替え時に `/api/products/reorder` に POST リクエスト
  - `app/dashboard/components/ProductList.tsx`: 商品削除時に `/api/products/[id]` に DELETE リクエスト
- **`FormData`**: 画像アップロード時に使用
  - `app/dashboard/components/DashboardForm.tsx`: 画像ファイルを `FormData` に追加して `/api/products/upload` に送信
  - `app/dashboard/components/ProductEditForm.tsx`: 同様に画像アップロード時に使用
- **`localStorage`**: ブラウザのローカルストレージにデータを保存
  - `app/dashboard/hooks/useTabState.ts`: タブの状態を `localStorage` に保存
- **`URL.createObjectURL`**: 画像プレビュー用の URL を生成
  - `app/dashboard/components/DashboardForm.tsx`: 画像選択時にプレビュー用 URL を生成
- **動的インポート（`await import()`）**: モジュールの動的読み込み
  - `app/dashboard/components/DashboardForm.tsx`: `config` モジュールを動的インポート
  - `app/dashboard/components/ProductEditForm.tsx`: `config` モジュールを動的インポート
- **React Hooks**: 状態管理や副作用の処理
  - `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` など

**バックエンド（Server Components、API Routes）で使用**:

- **Prisma**: データベースに直接アクセス
  - `app/page.tsx`: Prisma を使用して商品データを取得
  - `app/dashboard/page.tsx`: Prisma を使用して商品データを取得
  - `app/api/products/route.ts`: Prisma を使用して商品の CRUD 操作を実行
  - [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): Prisma を使用して個別商品の操作を実行
  - `app/api/products/reorder/route.ts`: Prisma の `$transaction` を使用して並び替えを実行
  - `app/api/categories/route.ts`: Prisma を使用してカテゴリー一覧を取得
- **`safePrismaOperation`**: Prisma 操作のエラーハンドリング
  - すべての API Routes で使用
- **`FormData` の受信**: 画像アップロード時に `FormData` を受信
  - `app/api/products/upload/route.ts`: `FormData` から画像ファイルを取得

**バックエンドで使用していない機能**:

- **React Hooks**: サーバーサイドで実行されるため、`useState`、`useEffect` などの Hooks は使用しない
- **`fetch` API**: バックエンドでは Prisma を直接使用するため、`fetch` は使用しない（外部 API を呼び出す場合を除く）
- **`localStorage`**: サーバーサイドではブラウザ API にアクセスできないため、使用しない
- **`window`、`document`**: サーバーサイドではブラウザ API にアクセスできないため、使用しない

### Server Component → Client Component

```
  ↓ データ取得（Prisma）
  ↓ 公開商品のフィルタリング
  ↓ propsで渡す
ProductGrid (Client Component)
  ↓ カスタムフック（useProductModal）
  ↓ 状態管理とイベントハンドリング
ProductModal (Client Component)
  ↓ カスタムフック（useModal）
  ↓ ESCキー処理とスクロール無効化
```

↓ useProductModal()
├── selectedProduct (選択された商品)
├── isModalOpen (モーダルの開閉状態)
├── handleProductClick (商品クリック時の処理)
└── handleCloseModal (モーダル閉じる時の処理)
↓
ProductModal
↓ useModal(isOpen, onClose)
├── ESC キー処理
└── 背景スクロール無効化

````

商品の公開状態は、以下のロジックで判定されます：

1. **公開日・終了日が設定されている場合**: `calculatePublishedStatus()`で自動判定
2. **公開日・終了日が設定されていない場合**: `published`フィールドの値を使用

```typescript
  if (product.publishedAt || product.endedAt) {
    return calculatePublishedStatus(product.publishedAt, product.endedAt);
  }
  return product.published;
});
````

### Next.js Image コンポーネント

すべての画像は `next/image` を使用して最適化されています。

**特徴**:

- 自動的な画像最適化
- 遅延読み込み（`loading="lazy"`）
- レスポンシブ画像（`sizes`属性）
- WebP 形式への自動変換

**実装例**:

```typescript
  src="/logo.webp"
  alt="白熊堂"
  width={120}
  height={45}
  className="h-auto w-auto max-h-20"
  priority // 優先読み込み（ヘッダーのロゴなど）
/>
```

### Server Components

- デフォルトで Server Components を使用
- データベースへの直接アクセス
- クライアントサイドの JavaScript を最小化

**詳細な説明**: Server Components の詳細については、[App Router ガイド - Server Components と Client Components](./app-router-guide.md#server-components-と-client-components) を参照してください。

### 画像最適化

画像最適化の詳細については、[Next.js ガイド - 画像最適化](./nextjs-guide.md#画像最適化) を参照してください。

**このアプリでの実装**:

- WebP 形式の使用
- 適切なサイズ指定
- 優先読み込みの設定

**詳細な説明**: 画像最適化の詳細については、[Next.js ガイド - 画像最適化](./nextjs-guide.md#画像最適化) を参照してください。

### コード分割

- ページごとの自動コード分割 - **このアプリで使用中**
- コンポーネントの動的インポート（`React.lazy`や`next/dynamic`） - **このアプリでは未使用**
- モジュールの動的インポート（`await import()`） - **このアプリで使用中**

**コンポーネントの動的インポートについて**:

このアプリでは、コンポーネントの動的インポート（`React.lazy`や`next/dynamic`）は使用されていませんが、知っておくと便利な機能です。

**使用例**:

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>読み込み中...</div>,
  ssr: false, // サーバーサイドレンダリングを無効化
});

// React.lazyを使用した動的インポート
import { lazy, Suspense } from "react";

const LazyComponent = lazy(() => import("./LazyComponent"));

function App() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

- 初期バンドルサイズを削減できる
- 必要な時だけコンポーネントを読み込める
- パフォーマンスの向上

**このアプリで使用しない理由**:

- コンポーネント数が比較的少なく、コード分割の必要性が低い
- Next.js の自動コード分割で十分に対応できている
- すべてのコンポーネントを初期ロードしてもパフォーマンスへの影響が小さい

**モジュールの動的インポート**:

このアプリでは、`await import()`を使用したモジュールの動的インポートが**フロントエンド（Client Components）**で使用されています。

**使用箇所**:

- [`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx): `config`モジュールの動的インポート（Client Component）
- [`app/dashboard/components/ProductEditForm.tsx`](../../app/dashboard/components/ProductEditForm.tsx): `config`モジュールの動的インポート（Client Component）

**注意**: これらは Client Components（`'use client'`）内で使用されているため、フロントエンドで実行されます。バックエンド（Server Components、API Routes）では使用されていません。

**使用例**:

```typescript
const { config } = await import("@/lib/config");
```

- 必要な時だけモジュールを読み込める
- コード分割により、初期バンドルサイズを削減

## アクセシビリティ

### セマンティック HTML

- 適切な HTML タグの使用（`<header>`, `<nav>`, `<main>`, `<footer>`）
- 見出しの階層構造

### ARIA 属性

- `aria-label`の設定（Instagram リンクなど）
- 適切な alt 属性

### キーボード操作

- モーダルの ESC キー対応
- フォーカス管理

## 参考リンク

- **[React ガイド](./react-guide.md)**: React の包括的なガイド
- **[JSX ガイド](./jsx-guide.md)**: JSX の構文と使用方法
- **[Next.js ガイド](./nextjs-guide.md)**: Next.js の詳細な使用方法
- **[App Router ガイド](./app-router-guide.md)**: App Router の詳細な使用方法
- **[Async/Await ガイド](./async-await-guide.md)**: async/await と Promise の使用方法
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
