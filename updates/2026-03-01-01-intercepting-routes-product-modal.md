# Intercepting Routes + Parallel Routes による商品モーダルURL化

**日付**: 2026-03-01
**ブランチ**: feature/intercepting-routes-product-modal
**対象**: フロント側商品モーダル（`app/(public)/`）
**ステータス**: 未着手
**完了日**: -

---

## 目次

- [進捗状況](#進捗状況)
- [改修の目的](#改修の目的)
- [タスク詳細](#タスク詳細)
  - [タスク1: getProductById関数の追加](#タスク1-getproductbyid関数の追加)
  - [タスク2: (public)/layout.tsxとdefault.tsxの新規作成](#タスク2-publiclayouttsxとdefaulttsxの新規作成)
  - [タスク3: @modalスロットの作成](#タスク3-modalスロットの作成)
  - [タスク4: menu/[id]/page.tsxの新規作成（商品詳細ページ）](#タスク4-menuidpagetsxの新規作成商品詳細ページ)
  - [タスク5: ProductTile.tsxの変更](#タスク5-producttiletsxの変更)
  - [タスク6: ProductGrid.tsxの変更](#タスク6-productgridtsxの変更)
  - [タスク7: 不要ファイルの削除](#タスク7-不要ファイルの削除)
  - [タスク8: sitemap.tsの更新](#タスク8-sitemaptsの更新)
  - [タスク9: 動作確認・ビルドテスト](#タスク9-動作確認ビルドテスト)
- [変更対象ファイル一覧](#変更対象ファイル一覧)
- [備考](#備考)
- [実装後の更新](#実装後の更新)

---

## 進捗状況

| #   | タスク                                          | 優先度 | ステータス | 備考 |
| --- | ----------------------------------------------- | :----: | :--------: | ---- |
| 1   | `getProductById`関数の追加                      |   高   |    [ ]     |      |
| 2   | `(public)/layout.tsx`と`default.tsx`の新規作成   |   高   |    [ ]     |      |
| 3   | `@modal`スロットの作成                          |   高   |    [ ]     |      |
| 4   | `menu/[id]/page.tsx`の新規作成（商品詳細ページ） |   高   |    [ ]     |      |
| 5   | `ProductTile.tsx`の変更                         |   高   |    [ ]     |      |
| 6   | `ProductGrid.tsx`の変更                         |   高   |    [ ]     |      |
| 7   | 不要ファイルの削除                              |   中   |    [ ]     |      |
| 8   | `sitemap.ts`の更新                              |   中   |    [ ]     |      |
| 9   | 動作確認・ビルドテスト                          |   -    |    [ ]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

現在、フロント側の商品詳細はクライアント側の状態管理（`useProductModal`フック）によるモーダル表示のみで、個別URLを持っていない。検索エンジンが個別商品ページをインデックスできず、SNS共有時にOGP（サムネイル・タイトル・説明）が表示されない。

### 課題

- **課題1**: 商品ごとの個別URLが存在しないため、検索エンジンがインデックスできない
- **課題2**: 商品ページをSNSで共有した際にOGP情報が表示されない
- **課題3**: 商品ページへの直接リンク（ブックマーク等）ができない

### 設計方針

- **Intercepting Routes + Parallel Routes**: サイト内遷移時はモーダル表示（見た目は現在と同じ）、直接URLアクセス時はフルページ表示
- **URL形式**: `/menu/[id]`（将来のECサイト`/shop/products/`との棲み分けを考慮）
- **既存UIの維持**: モーダルの見た目・アニメーションは現在のものを踏襲
- **SEO対策**: `generateMetadata`によるtitle, description, OGP, canonical URLの生成

### CLAUDE.md準拠事項

本改修では以下のルールに従うこと。

**設計原則**:

- **YAGNI**: 構造化データ（JSON-LD）は今回のスコープ外。メタデータのみ実装する
- **KISS**: `ProductModalContent`のような共通化コンポーネントは作らない。モーダルとフルページで表示要件が異なる（DialogHeader等のアクセシビリティ制約）ため、それぞれ独立して実装する
- **DRY**: UI部品（`ModalImageCard`, `PriceBadge`等）は既存コンポーネントを再利用する

**コード品質**:

- 未使用のインポートは削除すること
- 関数の引数と返り値には型を付けること
- リントエラーを解消すること（`npm run lint`）

**Server/Client Components**:

- デフォルトで Server Components を使用
- モーダル制御（`router.back()`）が必要な`ProductModalRoute.tsx`のみ`"use client"`

**Prisma**:

- すべての操作は`safePrismaOperation`でラップすること
- 公開状態チェックは`calculatePublishedStatus`を使用すること

---

## タスク詳細

### タスク1: `getProductById`関数の追加

**対象ファイル**:

- `lib/products.ts`（既存・変更）

**問題点**:

個別商品をIDで取得し、公開状態をチェックする関数が存在しない。

**修正内容**:

`getPublishedProductsByCategory`と同様のパターンで、IDを指定して1件取得する関数を追加する。既存の`convertPrice`関数と`calculatePublishedStatus`を再利用する。

<details>
<summary>実装例（クリックで展開）</summary>

```typescript
// lib/products.ts（末尾に追加）

/**
 * IDを指定して公開中の商品を1件取得
 *
 * 非公開の商品はnullを返す（404扱い）
 */
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const product = await safePrismaOperation(
      () =>
        prisma.product.findUnique({
          where: { id },
          include: { category: true },
        }),
      `getProductById(${id})`
    );

    if (!product) {
      return null;
    }

    // 公開状態チェック
    if (product.publishedAt || product.endedAt) {
      if (!calculatePublishedStatus(product.publishedAt, product.endedAt)) {
        return null;
      }
    } else if (!product.published) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      priceS: convertPrice(product.priceS),
      priceL: convertPrice(product.priceL),
    };
  } catch (error) {
    log.error("商品の取得に失敗しました", {
      context: `getProductById(${id})`,
      error,
    });
    throw error;
  }
}
```

</details>

**チェックリスト**:

- [ ] `getProductById`関数を`lib/products.ts`に追加
- [ ] 既存の`convertPrice`と`calculatePublishedStatus`を再利用していること
- [ ] `safePrismaOperation`でラップしていること
- [ ] 非公開商品に対してnullを返すこと

---

### タスク2: `(public)/layout.tsx`と`default.tsx`の新規作成

**対象ファイル**:

- `app/(public)/layout.tsx`（**新規作成**）
- `app/(public)/default.tsx`（**新規作成**）

**問題点**:

Parallel Routes（`@modal`スロット）を使用するには、同階層にスロットを受け取る`layout.tsx`が必要。現在`(public)`にはlayout.tsxが存在しない。

**修正内容**:

`@modal`スロットを受け取るレイアウトを新規作成する。FixedHeader/Footerは各ページ側で管理する既存パターンを維持するため、レイアウトは`children`と`modal`を並列に描画するだけのシンプルな構造にする。

Next.js 16ではParallel Routeを使用する場合、すべてのスロット（暗黙の`children`を含む）に`default.tsx`が必須。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/(public)/layout.tsx（新規作成）

/**
 * 公開サイト用レイアウト
 *
 * Parallel Routesの@modalスロットを受け取り、
 * メインコンテンツと並列にモーダルを描画する。
 */
export default function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

```tsx
// app/(public)/default.tsx（新規作成）

export default function Default() {
  return null;
}
```

</details>

**チェックリスト**:

- [ ] `app/(public)/layout.tsx`を新規作成
- [ ] `app/(public)/default.tsx`を新規作成
- [ ] `layout.tsx`が`modal`プロップを受け取っていること
- [ ] `"use client"`は不要（Server Componentのままでよい）

---

### タスク3: `@modal`スロットの作成

**対象ファイル**:

- `app/(public)/@modal/default.tsx`（**新規作成**）
- `app/(public)/@modal/(.)menu/[id]/page.tsx`（**新規作成**）
- `app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx`（**新規作成**）

**問題点**:

Intercepting Routeを実現するための`@modal`スロットが存在しない。

**修正内容**:

3つのファイルを作成する:

1. `@modal/default.tsx`: モーダルが表示されていない時のfallback（null返却）
2. `@modal/(.)menu/[id]/page.tsx`: Server Component。`getProductById`でデータを取得し、`ProductModalRoute`に渡す
3. `@modal/(.)menu/[id]/ProductModalRoute.tsx`: Client Component。Radix UI Dialogを表示し、`router.back()`で閉じる

`(.)menu` の `(.)` は「同じルートセグメントレベル」を意味する。`@modal`はスロット、`(public)`はRoute Groupであり、どちらもルートセグメントとしてカウントされないため、`(.)` で `(public)/menu/[id]` を正しくインターセプトできる。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/(public)/@modal/default.tsx（新規作成）

export default function ModalDefault() {
  return null;
}
```

```tsx
// app/(public)/@modal/(.)menu/[id]/page.tsx（新規作成）

import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import ProductModalRoute from "./ProductModalRoute";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InterceptedMenuPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return <ProductModalRoute product={product} />;
}
```

```tsx
// app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx（新規作成）

/**
 * Intercepting Route用モーダルコンポーネント
 *
 * サイト内遷移時に商品詳細をモーダルとして表示する。
 * router.back()でモーダルを閉じ、元のページのURLに戻す。
 */
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/app/types";
import { formatPrice } from "@/lib/product-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Separator } from "@/app/components/ui/separator";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { PriceBadge } from "@/app/components/ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "@/app/components/ui/card-modal";

interface ProductModalRouteProps {
  product: Product;
}

export default function ProductModalRoute({ product }: ProductModalRouteProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden sm:rounded-lg">
        <ScrollArea className="max-h-[90vh]">
          <div className="animate-modal-stagger flex flex-col gap-4 p-4 md:p-6 lg:p-8">
            <div className="transition-transform duration-300 hover:scale-[1.02]">
              <ModalImageCard>
                <ModalCardHeader>
                  <div className="relative h-[40vh] min-h-50 max-h-112.5 md:h-[45vh] md:max-h-125 overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <div className="relative h-full w-full flex items-center justify-center p-4 md:p-6 transition-transform duration-400 hover:scale-105">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 672px"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
                    )}
                  </div>
                </ModalCardHeader>
              </ModalImageCard>
            </div>

            <div>
              <ModalContentCard>
                <ModalCardContent>
                  <DialogHeader className="space-y-3 mb-0">
                    <DialogTitle className="whitespace-pre-wrap text-center text-xl font-normal tracking-wide leading-tight text-muted-foreground md:text-2xl lg:text-3xl">
                      {product.name}
                    </DialogTitle>
                    {product.description && (
                      <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg mt-2">
                        {product.description}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                </ModalCardContent>
              </ModalContentCard>
            </div>

            {(product.priceS || product.priceL) && (
              <div>
                <ModalPriceCard>
                  <ModalCardContent>
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                      {product.priceS && (
                        <div className="flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
                          <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
                            Small
                          </span>
                          <PriceBadge className="text-lg md:text-xl">
                            {formatPrice(product.priceS)}
                          </PriceBadge>
                        </div>
                      )}
                      {product.priceS && product.priceL && (
                        <div className="flex flex-col items-center">
                          <Separator
                            orientation="vertical"
                            className="h-12 md:h-16 bg-border/50"
                          />
                        </div>
                      )}
                      {product.priceL && (
                        <div className="flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
                          <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
                            Large
                          </span>
                          <PriceBadge className="text-lg md:text-xl">
                            {formatPrice(product.priceL)}
                          </PriceBadge>
                        </div>
                      )}
                    </div>
                  </ModalCardContent>
                </ModalPriceCard>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

</details>

**チェックリスト**:

- [ ] `@modal/default.tsx`がnullを返すこと
- [ ] `@modal/(.)menu/[id]/page.tsx`がServer Componentであること
- [ ] `ProductModalRoute.tsx`が`"use client"`であること
- [ ] モーダルの見た目が現在の`ProductModal.tsx`と同じであること
- [ ] `router.back()`でモーダルが閉じること
- [ ] 存在しないIDで`notFound()`が呼ばれること

---

### タスク4: `menu/[id]/page.tsx`の新規作成（商品詳細ページ）

**対象ファイル**:

- `app/(public)/menu/[id]/page.tsx`（**新規作成**）

**問題点**:

`/menu/[id]`に直接アクセスした場合に表示する商品詳細ページが存在しない。

**修正内容**:

SSRで商品データを取得し、メタデータ（title, description, OGP, canonical）を生成する商品詳細ページを作成する。FixedHeader/Footerを含むフルページレイアウトで、セマンティックHTML（`h1`, `p`等）を使用する。

表示要素はモーダルと同じ（画像、商品名、説明、価格）だが、Dialog専用コンポーネント（`DialogHeader`, `DialogTitle`, `DialogDescription`）は使わない。

<details>
<summary>実装例（クリックで展開）</summary>

```tsx
// app/(public)/menu/[id]/page.tsx（新規作成）

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { formatPrice } from "@/lib/product-utils";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import { Separator } from "@/app/components/ui/separator";
import { PriceBadge } from "@/app/components/ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "@/app/components/ui/card-modal";

const BASE_URL = process.env.SITE_URL!;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return { title: "商品が見つかりません" };
  }

  const product = await getProductById(productId);

  if (!product) {
    return { title: "商品が見つかりません" };
  }

  return {
    title: product.name,
    description: product.description || `${product.name} - 白熊堂のメニュー`,
    alternates: {
      canonical: `${BASE_URL}/menu/${id}`,
    },
    openGraph: {
      title: `${product.name} | 白熊堂`,
      description: product.description || `${product.name} - 白熊堂のメニュー`,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function MenuItemPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FixedHeader />

      {/* position:fixed のヘッダーに対応するスペーサー */}
      <div style={{ height: "var(--header-height)" }} />

      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <div className="flex flex-col gap-4">
          <div className="transition-transform duration-300 hover:scale-[1.02]">
            <ModalImageCard>
              <ModalCardHeader>
                <div className="relative h-[40vh] min-h-50 max-h-112.5 md:h-[45vh] md:max-h-125 overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <div className="relative h-full w-full flex items-center justify-center p-4 md:p-6 transition-transform duration-400 hover:scale-105">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 672px"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
                  )}
                </div>
              </ModalCardHeader>
            </ModalImageCard>
          </div>

          <div>
            <ModalContentCard>
              <ModalCardContent>
                <div className="space-y-3">
                  <h1 className="whitespace-pre-wrap text-center text-xl font-normal tracking-wide leading-tight text-muted-foreground md:text-2xl lg:text-3xl">
                    {product.name}
                  </h1>
                  {product.description && (
                    <p className="text-center text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg mt-2">
                      {product.description}
                    </p>
                  )}
                </div>
              </ModalCardContent>
            </ModalContentCard>
          </div>

          {(product.priceS || product.priceL) && (
            <div>
              <ModalPriceCard>
                <ModalCardContent>
                  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                    {product.priceS && (
                      <div className="flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
                        <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
                          Small
                        </span>
                        <PriceBadge className="text-lg md:text-xl">
                          {formatPrice(product.priceS)}
                        </PriceBadge>
                      </div>
                    )}
                    {product.priceS && product.priceL && (
                      <div className="flex flex-col items-center">
                        <Separator
                          orientation="vertical"
                          className="h-12 md:h-16 bg-border/50"
                        />
                      </div>
                    )}
                    {product.priceL && (
                      <div className="flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
                        <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">
                          Large
                        </span>
                        <PriceBadge className="text-lg md:text-xl">
                          {formatPrice(product.priceL)}
                        </PriceBadge>
                      </div>
                    )}
                  </div>
                </ModalCardContent>
              </ModalPriceCard>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

</details>

**チェックリスト**:

- [ ] `menu/[id]/page.tsx`を新規作成
- [ ] `generateMetadata`でtitle, description, OGP, canonicalを生成していること
- [ ] `FixedHeader`と`Footer`を含むこと
- [ ] Dialog専用コンポーネントを使わず、セマンティックHTML（`h1`, `p`）を使用していること
- [ ] 存在しないIDで`notFound()`が呼ばれること
- [ ] 非公開商品で`notFound()`が呼ばれること

---

### タスク5: `ProductTile.tsx`の変更

**対象ファイル**:

- `app/components/ProductTile.tsx`（既存・変更）

**問題点**:

現在は`onClick`プロップでクライアント側のモーダル状態を制御している。Intercepting Routesでは`Link`コンポーネントで`/menu/[id]`に遷移する必要がある。

**修正内容**:

- `onClick`プロップを削除
- `next/link`の`Link`コンポーネントで`ProductCard`全体をラップ
- `ProductCard`の`role="button"`, `tabIndex`, `onKeyDown`を削除（`Link`がアクセシビリティを提供するため不要）

**変更前（26-38行目）**:

```tsx
function ProductTile({ product, onClick }: ProductTileProps) {
  return (
    <ProductCard
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${product.name}の詳細を見る`}
    >
```

<details>
<summary>変更後の全体コード（クリックで展開）</summary>

```tsx
// app/components/ProductTile.tsx

/**
 * 商品タイルコンポーネント
 *
 * 商品グリッドに表示される個別の商品タイル。
 * 商品画像と名前を表示し、クリックで商品詳細ページ（/menu/[id]）に遷移する。
 * サイト内遷移時はIntercepting Routeによりモーダルとして表示される。
 */
"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProductTile as ProductTileType } from "../types";
import { ProductCard, ProductCardContent, ProductCardHeader } from "./ui/card-product";
import { AspectRatio } from "./ui/aspect-ratio";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ProductTileProps {
  product: ProductTileType;
}

function ProductTile({ product }: ProductTileProps) {
  return (
    <Link href={`/menu/${product.id}`}>
      <ProductCard aria-label={`${product.name}の詳細を見る`}>
        <ProductCardHeader>
          {/* 以降の内部構造は既存のまま変更なし */}
```

</details>

**チェックリスト**:

- [ ] `onClick`プロップを削除
- [ ] `Link`で`/menu/[id]`に遷移する実装に変更
- [ ] `role="button"`, `tabIndex`, `onKeyDown`を削除
- [ ] `aria-label`は`ProductCard`に維持
- [ ] `import Link from "next/link"`を追加
- [ ] `ProductTileProps`インターフェースから`onClick`を削除
- [ ] 内部の表示構造（画像、商品名、Tooltip）は変更しない

---

### タスク6: `ProductGrid.tsx`の変更

**対象ファイル**:

- `app/components/ProductGrid.tsx`（既存・変更）

**問題点**:

`useProductModal`フックと`ProductModal`コンポーネントへの依存が不要になる。

**修正内容**:

- `useProductModal`フックのインポートと使用を削除
- `ProductModal`の動的インポートと描画を削除
- `ProductTile`の`onClick`プロップを削除
- Fragment（`<>...</>`）をsectionのみに簡素化

<details>
<summary>変更後の全体コード（クリックで展開）</summary>

```tsx
// app/components/ProductGrid.tsx

/**
 * 商品グリッドコンポーネント
 *
 * カテゴリーごとに商品を3列のグリッドレイアウトで表示する。
 */
"use client";

import ProductTile from "./ProductTile";
import type { Category, Product } from "../types";
import { useInView } from "../hooks/useInView";

interface ProductGridProps {
  category: Category;
  products: Product[];
  showCategoryTitle?: boolean;
}

export default function ProductGrid({
  category,
  products,
  showCategoryTitle = true,
}: ProductGridProps) {
  const { ref: titleRef, isInView: titleInView } = useInView<HTMLDivElement>();
  const { ref: gridRef, isInView: gridInView } = useInView<HTMLDivElement>({ margin: "-50px" });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 md:mb-20 lg:mb-24">
      {showCategoryTitle && (
        <div
          ref={titleRef}
          className={`animate-on-scroll mb-8 flex items-center justify-center md:mb-12 lg:mb-16 ${titleInView ? "is-visible" : ""}`}
        >
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <h2 className="text-center text-xl font-normal tracking-wide text-muted-foreground md:text-4xl lg:text-5xl">
              {category.name}
            </h2>
            <div className="h-px w-20 bg-linear-to-r from-transparent via-border/60 to-transparent md:w-32" />
          </div>
        </div>
      )}

      <div
        ref={gridRef}
        className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`animate-on-scroll stagger-delay-${Math.min(index + 1, 8)} ${gridInView ? "is-visible" : ""}`}
          >
            <ProductTile
              product={{
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

</details>

**チェックリスト**:

- [ ] `useProductModal`のインポートと使用を削除
- [ ] `dynamic`インポートの`ProductModal`を削除
- [ ] `ProductModal`コンポーネントの描画を削除
- [ ] `ProductTile`の`onClick`プロップを削除
- [ ] `<>...</>`を`<section>...</section>`に変更
- [ ] `dynamic`と`next/dynamic`のインポートを削除
- [ ] 表示レイアウト（タイトル、グリッド）は変更しない

---

### タスク7: 不要ファイルの削除

**対象ファイル**:

- `app/components/ProductModal.tsx`（**削除**）
- `app/hooks/useProductModal.ts`（**削除**）

**修正内容**:

Intercepting Routesへの移行により、以下のファイルが不要になるため削除する:

- `ProductModal.tsx`: モーダルUIの役割が`ProductModalRoute.tsx`に移管された
- `useProductModal.ts`: クライアント側のモーダル状態管理が不要になった

`lib/config.ts`の`MODAL_CLOSE_DELAY_MS`は、削除後に他で参照されていなければ削除する。ただし他の設定値と同じオブジェクト内にあるため、プロパティの削除のみ行う。

**チェックリスト**:

- [ ] `app/components/ProductModal.tsx`を削除
- [ ] `app/hooks/useProductModal.ts`を削除
- [ ] 他のファイルから`ProductModal`や`useProductModal`をインポートしている箇所がないことを確認
- [ ] `MODAL_CLOSE_DELAY_MS`への参照がなければ`lib/config.ts`から削除

---

### タスク8: `sitemap.ts`の更新

**対象ファイル**:

- `app/sitemap.ts`（既存・変更）

**問題点**:

現在のsitemapは静的な4ページのみで、商品ページが含まれていない。

**修正内容**:

`sitemap()`を`async`関数に変更し、`getPublishedProductsByCategory`で取得した商品のURLを動的に追加する。

<details>
<summary>変更後の全体コード（クリックで展開）</summary>

```typescript
// app/sitemap.ts

import type { MetadataRoute } from "next";
import { getPublishedProductsByCategory } from "@/lib/products";

const BASE_URL = process.env.SITE_URL!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about-ice`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 公開中の商品ページを動的に追加
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getPublishedProductsByCategory();
    const products = categories.flatMap((c) => c.products);
    productPages = products.map((product) => ({
      url: `${BASE_URL}/menu/${product.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // 商品データ取得失敗時は静的ページのみのsitemapを返す
    productPages = [];
  }

  return [...staticPages, ...productPages];
}
```

</details>

**チェックリスト**:

- [ ] `sitemap()`を`async`関数に変更
- [ ] `getPublishedProductsByCategory`をインポート
- [ ] 商品ページのURLが`/menu/[id]`形式であること
- [ ] エラー時に静的ページのみのsitemapが返ること
- [ ] 既存の静的ページはそのまま維持

---

### タスク9: 動作確認・ビルドテスト

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [ ] トップページから商品クリック → モーダル表示 + URLが`/menu/[id]`に変化
   - [ ] モーダルを閉じる → 元のURL（`/`）に戻る
   - [ ] `/menu/[id]`に直接アクセス → フルページで商品詳細表示（FixedHeader/Footer含む）
   - [ ] フルページでリロード → 商品詳細ページが正常表示
   - [ ] 存在しないIDでアクセス（`/menu/99999`） → 404表示
   - [ ] `/about-ice`ページから`/menu/[id]`へ遷移 → モーダル表示
   - [ ] ブラウザバック → 正常に元のページに戻る
   - [ ] カテゴリータブの切り替え → 正常に動作すること
   - [ ] モーダル内のアニメーション（段階的フェードイン） → 正常に動作すること

2. **ビルド確認** (`npm run build`)
   - [ ] ビルドエラーがないこと
   - [ ] TypeScriptエラーがないこと

3. **品質チェックリスト**（CLAUDE.md準拠）
   - [ ] 未使用のインポートは削除したか
   - [ ] リントエラーは解消したか（`npm run lint`）
   - [ ] 関数の引数と返り値に型が付いているか
   - [ ] `safePrismaOperation`でDB操作をラップしているか

---

## 変更対象ファイル一覧

| ファイル                                                 | 変更内容                                      |
| -------------------------------------------------------- | --------------------------------------------- |
| `lib/products.ts`                                        | `getProductById`関数を追加                     |
| `app/(public)/layout.tsx`                                | **新規作成** - @modalスロット受け取り          |
| `app/(public)/default.tsx`                               | **新規作成** - childrenスロットfallback         |
| `app/(public)/@modal/default.tsx`                        | **新規作成** - モーダルスロットfallback         |
| `app/(public)/@modal/(.)menu/[id]/page.tsx`              | **新規作成** - Intercepting Route              |
| `app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx` | **新規作成** - モーダルUI（Client Component）  |
| `app/(public)/menu/[id]/page.tsx`                        | **新規作成** - 商品詳細ページ（SSR）           |
| `app/components/ProductTile.tsx`                         | `onClick` → `Link`に変更                       |
| `app/components/ProductGrid.tsx`                         | モーダル依存を削除                             |
| `app/components/ProductModal.tsx`                        | **削除**                                       |
| `app/hooks/useProductModal.ts`                           | **削除**                                       |
| `app/sitemap.ts`                                         | 商品ページを動的追加（async化）                |
| `lib/config.ts`                                          | `MODAL_CLOSE_DELAY_MS`削除（参照確認後）       |

---

## 備考

### 注意事項

- **Intercepting Routeの規約**: `(.)` は「同じルートセグメントレベル」を意味する。`@modal`（スロット）と`(public)`（Route Group）はルートセグメントとしてカウントされないため、`@modal/(.)menu/[id]` で正しく `(public)/menu/[id]` をインターセプトできる
- **Next.js 16の要件**: すべてのParallel Routeスロットに`default.tsx`が必須。ないとビルドが失敗する
- **`params`の型**: Next.js 15以降、動的ルートの`params`は`Promise<{ id: string }>`型であり、`await`が必要
- **スクロール復元**: `router.back()`でモーダルを閉じた際のスクロール位置は、Next.js App Routerの標準的な挙動で復元される
- **Prefetch**: `Link`コンポーネントはデフォルトでprefetchを行う。商品数が多い場合にパフォーマンス問題があれば`prefetch={false}`を検討

### 将来的なアーキテクチャ変更について

現在はIntercepting Routesでモーダル表示と個別URLを両立しているが、将来的に商品個別ページの情報量が増えた場合（アレルギー情報、口コミ、関連商品、写真ギャラリーなど）、モーダルでは情報が収まりきらなくなる可能性がある。

その場合、通常のページ遷移に切り替えることが容易にできる:

1. `app/(public)/@modal/` ディレクトリを削除
2. `app/(public)/layout.tsx` から `modal` プロップを削除（または layout.tsx ごと削除）
3. `app/(public)/menu/[id]/page.tsx`（フルページ）はそのまま利用可能
4. フルページの内容を充実させる

Intercepting Routesの設計上、フルページ（`menu/[id]/page.tsx`）が独立して存在するため、モーダル表示をやめてもSEO対応（個別URL、メタデータ、SSR）はそのまま維持される。モーダル関連のコードを削除するだけで、通常のページ遷移に移行できる。

### 参考

- 現在のモーダル実装: `app/components/ProductModal.tsx`
- Intercepting Routes公式ドキュメント: Next.js App Router Intercepting Routes
- Parallel Routes公式ドキュメント: Next.js App Router Parallel Routes

---

## 実装後の更新

各タスクの進捗に応じて以下を更新する:

**状態遷移ルール**（共通）:

- `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

1. **進捗状況テーブル**
   - 上記の状態遷移ルールに従って更新
   - 備考欄に補足情報があれば記載

2. **タスクの見出し**
   - 完了時に「[完了]」を追記する（例: `### タスク1: ... [完了]`）

3. **タスク内のチェックリスト**
   - `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

### 完了時の更新

1. ステータスを「完了」に変更
2. 完了日を追記
3. チェックリストを更新
4. 仕様書ファイルを `updates/completed/` ディレクトリに移動してよいか確認し、許可があれば移動

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
