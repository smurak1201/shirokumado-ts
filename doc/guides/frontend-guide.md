# フロントエンドガイド

白熊堂プロジェクトのフロントエンド実装について詳しく説明します。

## 目次

- [概要](#概要)
- [ディレクトリ構造](#ディレクトリ構造)
- [ページ構成](#ページ構成)
- [コンポーネント構成](#コンポーネント構成)
- [型定義](#型定義)
- [カスタムフック](#カスタムフック)
- [ユーティリティ関数](#ユーティリティ関数)
- [レイアウトとスタイリング](#レイアウトとスタイリング)
- [データフロー](#データフロー)
- [レスポンシブデザイン](#レスポンシブデザイン)

## 概要

フロントエンドは、Next.js App Router を使用した Server Components ベースの実装です。公開商品の表示、FAQ ページ、共通レイアウトコンポーネントで構成されています。

### 技術スタック

- **Next.js 16** (App Router)
- **React 19** (Server Components / Client Components)
- **TypeScript**
- **Tailwind CSS**
- **Next.js Image** (画像最適化)

## ページ構成

### ホームページ (`app/page.tsx`)

トップページでは、カテゴリーごとに公開されている商品を表示します。

**主な機能**:

- カテゴリーごとの商品グリッド表示
- 公開状態の自動判定（公開日・終了日の設定に基づく）
- 商品がないカテゴリーは非表示

**データ取得**:

```typescript
async function getPublishedProductsByCategory() {
  // カテゴリーと商品を並列で取得
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: "asc" } }),
    prisma.product.findMany({ include: { category: true } }),
  ]);

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

**レイアウト**:

1. **ヘッダー**: ロゴ、Instagram リンク、ナビゲーション
2. **ヒーローバナー**: メイン画像（`/hero.webp`）
3. **メインコンテンツ**: カテゴリーごとの商品グリッド
4. **フッター**: 店舗情報、地図、連絡先

### FAQ ページ (`app/faq/page.tsx`)

よくある質問ページです。静的なコンテンツを表示します。

**主な機能**:

- 質問と回答の一覧表示
- レスポンシブなレイアウト

**構造**:

```typescript
const faqs = [
  { question: "質問", answer: "回答" },
  // ...
];
```

## ディレクトリ構造

フロントエンドは以下のように構造化されています：

```
app/
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

**設計思想**:

- **`types.ts`**: フロントエンドで使用する型を一元管理（重複を防止）
- **`hooks/`**: 状態管理や副作用をカスタムフックに分離（再利用可能）
- **`utils/`**: 純粋関数として実装可能なビジネスロジック（テストしやすい）
- **`components/`**: UI コンポーネントのみを配置（見た目とレイアウト）
- **`components/icons/`**: アイコンコンポーネントを分離（再利用性）

## コンポーネント構成

### 共通型定義 (`app/types.ts`)

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

```typescript
import { useModal } from "../hooks/useModal";

useModal(isOpen, onClose);
```

#### useProductModal (`hooks/useProductModal.ts`)

商品モーダルの状態管理を行うカスタムフックです。

**機能**:

- 選択された商品の管理
- モーダルの開閉状態管理
- 商品クリック時のハンドリング
- モーダル閉じる時のアニメーション考慮

**使用例**:

```typescript
const { selectedProduct, isModalOpen, handleProductClick, handleCloseModal } =
  useProductModal();
```

### ユーティリティ関数 (`app/utils/`)

#### formatPrice (`utils/format.ts`)

価格をフォーマットして表示用の文字列を返す関数です。

**機能**:

- 数値を 3 桁区切りの文字列に変換
- 円記号を付与

**使用例**:

```typescript
formatPrice(1000); // "¥1,000"
```

### 共通コンポーネント (`app/components/`)

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

```typescript
<header className="sticky top-0 z-50 h-20 overflow-visible bg-white">
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

#### Footer (`Footer.tsx`)

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

```typescript
"use client";

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

#### ProductTile (`ProductTile.tsx`)

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
// モバイル: 小さいサイズ、デスクトップ: 大きいサイズ
className = "text-sm md:text-base lg:text-lg";

// モバイル: 1列、デスクトップ: 3列
className = "grid grid-cols-1 md:grid-cols-3";
```

### 共通スタイル

**グローバルスタイル** (`app/globals.css`):

- フォント設定
- スクロールバーの設定
- カスタムアニメーション（フェードイン）

## データフロー

### Server Component → Client Component

```
app/page.tsx (Server Component)
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

### 状態管理の流れ

```
ProductGrid
  ↓ useProductModal()
  ├── selectedProduct (選択された商品)
  ├── isModalOpen (モーダルの開閉状態)
  ├── handleProductClick (商品クリック時の処理)
  └── handleCloseModal (モーダル閉じる時の処理)
  ↓
ProductModal
  ↓ useModal(isOpen, onClose)
  ├── ESCキー処理
  └── 背景スクロール無効化
```

### 公開状態の判定

商品の公開状態は、以下のロジックで判定されます：

1. **公開日・終了日が設定されている場合**: `calculatePublishedStatus()`で自動判定
2. **公開日・終了日が設定されていない場合**: `published`フィールドの値を使用

```typescript
const publishedProducts = products.filter((product) => {
  if (product.publishedAt || product.endedAt) {
    return calculatePublishedStatus(product.publishedAt, product.endedAt);
  }
  return product.published;
});
```

## レスポンシブデザイン

### ヘッダー

- **高さ**: 固定 `h-20` (80px)
- **ロゴサイズ**: `max-h-20` (80px)
- **ナビゲーション**: モバイルでも表示

### フッター

- **グリッドレイアウト**: 常に 4 列（モバイルでも）
- **フォントサイズ**: モバイル `text-[10px]` → デスクトップ `text-sm`
- **スペーシング**: モバイル `gap-2` → デスクトップ `gap-4`
- **地図の高さ**: モバイル `h-32` → デスクトップ `h-48`

### 商品グリッド

- **列数**: 常に 3 列（モバイルでも）
- **ギャップ**: モバイル `gap-3` → デスクトップ `gap-6`
- **カテゴリータイトル**: モバイル `text-lg` → デスクトップ `text-2xl`

### ヒーローバナー

- **高さ**: モバイル `h-[30vh]` → デスクトップ `h-[60vh]`
- **最小高さ**: モバイル `min-h-[200px]` → デスクトップ `min-h-[500px]`

## 画像最適化

### Next.js Image コンポーネント

すべての画像は `next/image` を使用して最適化されています。

**特徴**:

- 自動的な画像最適化
- 遅延読み込み（`loading="lazy"`）
- レスポンシブ画像（`sizes`属性）
- WebP 形式への自動変換

**実装例**:

```typescript
<Image
  src="/logo.webp"
  alt="白熊堂"
  width={120}
  height={45}
  className="h-auto w-auto max-h-20"
  priority // 優先読み込み（ヘッダーのロゴなど）
/>
```

## パフォーマンス最適化

### Server Components

- デフォルトで Server Components を使用
- データベースへの直接アクセス
- クライアントサイドの JavaScript を最小化

### 画像最適化

- WebP 形式の使用
- 適切なサイズ指定
- 優先読み込みの設定

### コード分割

- ページごとの自動コード分割
- 動的インポートの活用

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

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
