# フロントエンドガイド

白熊堂プロジェクトのフロントエンド実装について詳しく説明します。

## このドキュメントの役割

このドキュメントは「**公開ページのフロントエンド実装**」を説明します。ホームページ、FAQ ページ、共通コンポーネントなど、ユーザー向けページの実装を理解したいときに参照してください。

**関連ドキュメント**:
- [ダッシュボードガイド](./dashboard-guide.md): 管理画面の実装
- [App Router ガイド](./app-router-guide.md): Server/Client Components

## 目次

- [概要](#概要)
- [ページ構成](#ページ構成)
- [ディレクトリ構造](#ディレクトリ構造)
- [コンポーネント構成](#コンポーネント構成)
- [レイアウトとスタイリング](#レイアウトとスタイリング)
- [データフロー](#データフロー)
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

### ホームページ ([`app/page.tsx`](../../app/(public)/page.tsx))

トップページでは、カテゴリーごとに公開されている商品を表示します。

**主な機能**:

- カテゴリーごとの商品グリッド表示
- 公開状態の自動判定（公開日・終了日の設定に基づく）
- 商品がないカテゴリーは非表示

**データ取得**:

[`lib/products.ts`](../../lib/products.ts) (`getPublishedProductsByCategory`関数)

**注意**: このコード例は簡潔化したものです。実際の実装では、`safePrismaOperation`を使用してエラーハンドリングを行っています。詳細は [`lib/products.ts`](../../lib/products.ts) を参照してください。

```typescript
  // カテゴリーと商品を並列で取得（Promise.all を使用）
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: "asc" } }),
    prisma.product.findMany({ include: { category: true } }),
  ]);

  // Promise.all の詳細は [Async/Await ガイド - Promise.all](../basics/async-await-guide.md#promiseall---このアプリで使用中) を参照

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

### FAQ ページ ([`app/faq/page.tsx`](../../app/(public)/faq/page.tsx))

よくある質問ページです。FAQデータは [`data.ts`](../../app/(public)/faq/data.ts) に分離され、[`FAQSection`](../../app/components/FAQSection.tsx) 共通コンポーネントを使用して表示します。

**主な機能**:

- 質問と回答の一覧表示（アコーディオン形式）
- レスポンシブなレイアウト
- `FAQSection` コンポーネントはホームページのFAQセクションでも共用

**注意**: プロジェクト全体のディレクトリ構造の詳細については、[プロジェクト構造ドキュメント](../../project-structure.md)を参照してください。App Router のディレクトリ構造については、[App Router ガイド](./app-router-guide.md#app-router-のディレクトリ構造)を参照してください。

## ディレクトリ構造

フロントエンドは以下のように構造化されています：

```
├── types.ts                    # 共通型定義
├── hooks/                      # カスタムフック
│   ├── useInView.ts           # ビューポート交差検知フック
│   └── useProductModal.ts     # 商品モーダル管理フック
├── components/                 # フロントエンド共通コンポーネント
│   ├── ui/                    # shadcn/ui コンポーネントとラッパーコンポーネント
│   ├── ErrorBoundary.tsx      # エラーバウンダリーコンポーネント
│   ├── FixedHeader.tsx        # 固定ヘッダーコンポーネント
│   ├── MobileMenu.tsx         # モバイルメニュー（Sheet使用）
│   ├── HeroSection.tsx        # ヒーローセクション
│   ├── Footer.tsx             # フッターコンポーネント
│   ├── LazyGoogleMap.tsx      # 遅延読み込みGoogle Map
│   ├── FAQSection.tsx         # FAQセクション（ホームページ・FAQページ共用）
│   ├── LoadingScreen.tsx      # 共通ローディング画面
│   ├── ProductCategoryTabs.tsx # カテゴリーをTabsで切り替えるコンポーネント
│   ├── ProductGrid.tsx        # 商品グリッドコンポーネント
│   ├── ProductTile.tsx        # 商品タイルコンポーネント
│   └── ProductModal.tsx       # 商品詳細モーダルコンポーネント
├── page.tsx                    # ホームページ
├── about-ice/                  # 天然氷紹介ページ
│   ├── AboutIceContent.tsx    # Client Component（スクロールアニメーション）
│   ├── data.ts                # コンテンツデータ
│   └── page.tsx               # ページ
├── faq/
│   ├── data.ts                # FAQデータ
│   └── page.tsx               # FAQページ
└── shop/
    └── page.tsx               # ショップページ
```

- **`types.ts`**: フロントエンドで使用する型を一元管理（重複を防止）
- **`hooks/`**: 状態管理や副作用をカスタムフックに分離（`useProductModal`, `useInView`）
- **`components/`**: UI コンポーネントのみを配置（見た目とレイアウト）
- **`components/ui/`**: shadcn/ui コンポーネントとラッパーコンポーネント

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

#### useProductModal (`hooks/useProductModal.ts`)

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

#### formatPrice (`lib/product-utils.ts`)

価格をフォーマットして表示用の文字列を返す関数です。

[`lib/product-utils.ts`](../../lib/product-utils.ts) (`formatPrice`関数)

**機能**:

- 数値を 3 桁区切りの文字列に変換（`1,000`形式）
- 円記号を付与（`¥1,000`形式）
- `null`や`undefined`の場合は`'-'`を返す

**補足**: 入力フィールド用には`formatPriceForInput`関数も提供されており、こちらは円記号なしの数値文字列のみを返します。

**使用例**:

#### Header (`FixedHeader.tsx`)

全ページ共通のヘッダーコンポーネントです。

**機能**:

- ロゴ画像（トップページへのリンク）
- Instagram アイコン（外部リンク）
- デスクトップ: ナビゲーションリンク（よくある質問、天然氷について、ショップ）
- モバイル: ハンバーガーメニュー（`MobileMenu` コンポーネント、shadcn/ui の Sheet 使用）

**特徴**:

- `sticky`で固定表示
- レスポンシブ対応（モバイルではSheet、デスクトップではナビゲーションリンク）
- ホバーエフェクト

**実装例**:

[`app/components/FixedHeader.tsx`](../../app/components/FixedHeader.tsx) (`Header`コンポーネント)

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
    {/* デスクトップ: ナビゲーションリンク */}
    <nav className="hidden md:flex">
      <Link href="/faq">よくある質問</Link>
      <Link href="/about-ice">天然氷について</Link>
      <Link href="/shop">ショップ</Link>
    </nav>
    {/* モバイル: ハンバーガーメニュー */}
    <div className="md:hidden">
      <MobileMenu />
    </div>
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

#### ProductCategoryTabs (`ProductCategoryTabs.tsx`)

カテゴリーを Tabs で切り替えて表示するコンポーネントです。

**機能**:

- カテゴリーごとのタブ切り替え（shadcn/ui の Tabs を使用）
- カテゴリーが1つの場合は通常のグリッド表示
- 商品がない場合は「商品の準備中です」を表示

**特徴**:

- Client Component（`'use client'`）
- shadcn/ui の Tabs コンポーネントを使用
- レスポンシブデザイン対応

**実装例**:

[`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx) (`ProductCategoryTabs`コンポーネント)

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import ProductGrid from "./ProductGrid";

export default function ProductCategoryTabs({ categoriesWithProducts }) {
  const [activeTab, setActiveTab] = useState(
    categoriesWithProducts[0]?.category.id.toString() || ""
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        {categoriesWithProducts.map(({ category }) => (
          <TabsTrigger key={category.id} value={category.id.toString()}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {categoriesWithProducts.map(({ category, products }) => (
        <TabsContent key={category.id} value={category.id.toString()}>
          <ProductGrid category={category} products={products} showCategoryTitle={false} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

#### ProductGrid (`ProductGrid.tsx`)

カテゴリーごとの商品グリッド表示コンポーネントです。

**機能**:

- 商品タイルの 3 列グリッド表示
- 商品クリック時のモーダル表示（`useProductModal`フックで管理）

**特徴**:

- Client Component（`'use client'`）
- 商品がない場合は非表示
- モーダル状態管理をカスタムフックに分離
- `showCategoryTitle` プロップでカテゴリータイトルの表示を制御可能（デフォルト: `true`）

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
- shadcn/ui の Dialog コンポーネントを使用（アクセシビリティ対応）
- 背景クリックで閉じる
- ESC キーで閉じる（shadcn/ui の Dialog で自動対応）
- モーダル表示時の背景スクロール無効化（shadcn/ui の Dialog で自動対応）
- フェードイン・フェードアウトアニメーション
- 価格フォーマット（`formatPrice`ユーティリティを使用）

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

**スタイリングのベストプラクティス**:

同じスタイルを複数箇所で使用する場合の統一方法については、[スタイリングのベストプラクティス](./styling-best-practices.md)を参照してください。

## データフロー

**注意**: アーキテクチャ的な視点（コンポーネント階層、状態管理の設計）については、[アーキテクチャドキュメント](../../architecture.md#データフロー)を参照してください。

### フロントエンドとバックエンドの使い分け

このアプリでは、フロントエンド（Client Components）とバックエンド（Server Components、API Routes）で異なる技術を使用しています：

**フロントエンド（Client Components）で使用**:

- **`fetch` API**: API Routes に HTTP リクエストを送信
  - `app/dashboard/homepage/components/form/ProductForm.tsx`: 商品作成・更新時に `/api/products` に POST/PUT リクエスト
  - `app/dashboard/homepage/components/DashboardContent.tsx`: 商品一覧取得時に `/api/products` に GET リクエスト
  - `app/dashboard/homepage/hooks/useProductReorder.ts`: 商品並び替え時に `/api/products/reorder` に POST リクエスト
  - `app/dashboard/homepage/hooks/useProductDelete.ts`: 商品削除時に `/api/products/[id]` に DELETE リクエスト
  - `app/dashboard/homepage/hooks/useProductForm.ts`: 画像アップロード時に `/api/products/upload` に POST リクエスト
- **`FormData`**: 画像アップロード時に使用
  - `app/dashboard/homepage/hooks/useProductForm.ts`: 画像ファイルを `FormData` に追加して `/api/products/upload` に送信
- **`localStorage`**: ブラウザのローカルストレージにデータを保存
  - `app/dashboard/homepage/hooks/useTabState.ts`: タブの状態を `localStorage` に保存
- **`URL.createObjectURL`**: 画像プレビュー用の URL を生成
  - `app/dashboard/homepage/hooks/useProductForm.ts`: 画像選択時にプレビュー用 URL を生成
- **動的インポート（`await import()`）**: モジュールの動的読み込み
  - `app/dashboard/homepage/hooks/useProductForm.ts`: `config` モジュールを動的インポート
- **React Hooks**: 状態管理や副作用の処理
  - `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` など

**バックエンド（Server Components、API Routes）で使用**:

- **Prisma**: データベースに直接アクセス
  - `app/page.tsx`: Prisma を使用して商品データを取得
  - `app/dashboard/homepage/page.tsx`: Prisma を使用して商品データを取得
  - `app/api/products/route.ts`: Prisma を使用して商品の CRUD 操作を実行
  - [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): Prisma を使用して個別商品の操作を実行
  - `app/api/products/reorder/route.ts`: Prisma の `$transaction` を使用して並び替えを実行
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
ProductCategoryTabs (Client Component)
  ↓ カテゴリーごとのタブ切り替え
  ↓ propsで渡す
ProductGrid (Client Component)
  ↓ カスタムフック（useProductModal）
  ↓ 状態管理とイベントハンドリング
ProductModal (Client Component)
  ↓ shadcn/ui の Dialog コンポーネント
  ↓ ESCキー処理とスクロール無効化（自動対応）
```

↓ useProductModal()
├── selectedProduct (選択された商品)
├── isModalOpen (モーダルの開閉状態)
├── handleProductClick (商品クリック時の処理)
└── handleCloseModal (モーダル閉じる時の処理)
↓
ProductModal
↓ shadcn/ui Dialog
├── ESC キー処理（自動）
└── 背景スクロール無効化（自動）

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

## パフォーマンス最適化

- **Server Components**: デフォルトで使用し、必要な場合のみClient Components
- **画像最適化**: `next/image`でWebP形式、遅延読み込み、レスポンシブ対応
- **コード分割**: Next.jsの自動コード分割を活用

詳細は[Next.js ガイド](./nextjs-guide.md)を参照。

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

- [React ガイド](./react-guide.md)
- [Next.js ガイド](./nextjs-guide.md)
- [App Router ガイド](./app-router-guide.md)
- [shadcn/ui ガイド](./shadcn-ui-guide.md)
- [スタイリングのベストプラクティス](./styling-best-practices.md)
