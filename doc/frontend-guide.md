# フロントエンドガイド

白熊堂プロジェクトのフロントエンド実装について詳しく説明します。

## 📋 目次

- [概要](#概要)
- [ページ構成](#ページ構成)
- [コンポーネント構成](#コンポーネント構成)
- [レイアウトとスタイリング](#レイアウトとスタイリング)
- [データフロー](#データフロー)
- [レスポンシブデザイン](#レスポンシブデザイン)

## 概要

フロントエンドは、Next.js App Router を使用した Server Components ベースの実装です。公開商品の表示、FAQページ、共通レイアウトコンポーネントで構成されています。

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

1. **ヘッダー**: ロゴ、Instagramリンク、ナビゲーション
2. **ヒーローバナー**: メイン画像（`/hero.webp`）
3. **メインコンテンツ**: カテゴリーごとの商品グリッド
4. **フッター**: 店舗情報、地図、連絡先

### FAQページ (`app/faq/page.tsx`)

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

## コンポーネント構成

### 共通コンポーネント (`app/components/`)

#### Header (`Header.tsx`)

全ページ共通のヘッダーコンポーネントです。

**機能**:

- ロゴ画像（トップページへのリンク）
- Instagramアイコン（外部リンク）
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
- Instagramアイコン
- 店舗情報（住所、営業時間、定休日、電話番号）
- Googleマップ埋め込み

**レイアウト**:

- ロゴとInstagramアイコン（1行目、横並び）
- 店舗情報（2行目、4列グリッド）
  - 住所
  - 営業情報（営業時間、定休日）
  - お問い合わせ（電話番号）
  - 地図

**特徴**:

- 常に4列のグリッドレイアウト（モバイルでも）
- レスポンシブなフォントサイズとスペーシング
- Googleマップの埋め込み

#### ProductGrid (`ProductGrid.tsx`)

カテゴリーごとの商品グリッド表示コンポーネントです。

**機能**:

- カテゴリータイトルの表示
- 商品タイルの3列グリッド表示
- 商品クリック時のモーダル表示

**特徴**:

- Client Component（`'use client'`）
- 商品がない場合は非表示
- モーダル状態管理

**実装例**:

```typescript
"use client";

export default function ProductGrid({ category, products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section>
        <h2>{category.name}</h2>
        <div className="grid grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
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

- 商品画像の表示
- 商品名の表示（2行固定）
- 価格の表示（Sサイズ、Lサイズ）
- クリック時のモーダル表示

**特徴**:

- 画像のアスペクト比を維持
- 商品名は2行で固定表示（`line-clamp-2`）
- ホバーエフェクト

#### ProductModal (`ProductModal.tsx`)

商品詳細を表示するモーダルコンポーネントです。

**機能**:

- 商品画像の拡大表示
- 商品名、説明、価格の詳細表示
- モーダルの開閉アニメーション

**特徴**:

- 背景クリックで閉じる
- ESCキーで閉じる
- フェードイン・フェードアウトアニメーション

## レイアウトとスタイリング

### Tailwind CSS

プロジェクト全体で Tailwind CSS を使用しています。

**主な設定**:

- カスタムフォント: Noto Sans JP
- カスタムカラー: グレースケール中心
- レスポンシブブレークポイント: `sm`, `md`, `lg`, `xl`

### レスポンシブデザイン

**ブレークポイント**:

- `sm`: 640px以上
- `md`: 768px以上
- `lg`: 1024px以上
- `xl`: 1280px以上

**実装例**:

```typescript
// モバイル: 小さいサイズ、デスクトップ: 大きいサイズ
className="text-sm md:text-base lg:text-lg"

// モバイル: 1列、デスクトップ: 3列
className="grid grid-cols-1 md:grid-cols-3"
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
  ↓ propsで渡す
ProductGrid (Client Component)
  ↓ 状態管理（useState）
  ↓ イベントハンドリング
ProductModal (Client Component)
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

- **グリッドレイアウト**: 常に4列（モバイルでも）
- **フォントサイズ**: モバイル `text-[10px]` → デスクトップ `text-sm`
- **スペーシング**: モバイル `gap-2` → デスクトップ `gap-4`
- **地図の高さ**: モバイル `h-32` → デスクトップ `h-48`

### 商品グリッド

- **列数**: 常に3列（モバイルでも）
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
- WebP形式への自動変換

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
- クライアントサイドのJavaScriptを最小化

### 画像最適化

- WebP形式の使用
- 適切なサイズ指定
- 優先読み込みの設定

### コード分割

- ページごとの自動コード分割
- 動的インポートの活用

## アクセシビリティ

### セマンティックHTML

- 適切なHTMLタグの使用（`<header>`, `<nav>`, `<main>`, `<footer>`）
- 見出しの階層構造

### ARIA属性

- `aria-label`の設定（Instagramリンクなど）
- 適切なalt属性

### キーボード操作

- モーダルのESCキー対応
- フォーカス管理

## 参考リンク

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
