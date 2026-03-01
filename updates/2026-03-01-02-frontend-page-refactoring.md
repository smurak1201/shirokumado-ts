# フロント側ページのリファクタリング

**日付**: 2026-03-01
**ブランチ**: feature/frontend-page-refactoring
**対象**: `app/(public)/` 配下のページコンポーネント
**ステータス**: 未着手
**完了日**: -

---

## 目次

- [進捗状況](#進捗状況)
- [改修の目的](#改修の目的)
- [タスク詳細](#タスク詳細)
  - [タスク1: 絵文字使用禁止ルール違反を修正](#タスク1-絵文字使用禁止ルール違反を修正)
  - [タスク2: ページレイアウトを公開サイト用layoutに集約](#タスク2-ページレイアウトを公開サイト用layoutに集約)
  - [タスク3: 商品詳細の表示コード重複を解消](#タスク3-商品詳細の表示コード重複を解消)
  - [タスク4: アニメーション用動的クラスのユーティリティ関数を作成](#タスク4-アニメーション用動的クラスのユーティリティ関数を作成)
  - [タスク5: 動作確認・ビルドテスト](#タスク5-動作確認ビルドテスト)
- [変更対象ファイル一覧](#変更対象ファイル一覧)
- [備考](#備考)

---

## 進捗状況

| #   | タスク                                           | 対応課題 | 優先度 | ステータス | 備考                                     |
| --- | ------------------------------------------------ | :------: | :----: | :--------: | ---------------------------------------- |
| 1   | 絵文字使用禁止ルール違反を修正                   |    2     |   高   |    [ ]     |                                          |
| 2   | ページレイアウトを公開サイト用layoutに集約        |   4,5    |   中   |    [ ]     | faq/page.tsxのスペーサー不統一も同時解消 |
| 3   | 商品詳細の表示コード重複を解消                   |    1     |   高   |    [ ]     |                                          |
| 4   | アニメーション用動的クラスのユーティリティ関数    |    6     |   低   |    [ ]     |                                          |
| 5   | 動作確認・ビルドテスト                           |    -     |   -    |    [ ]     |                                          |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

CLAUDE.mdのルールに基づいてフロント側ページコンポーネントを調査した結果、コード重複やルール違反などの改善点が検出された。

### 課題

- **課題1**: `menu/[id]/page.tsx`と`ProductModalRoute.tsx`で商品画像・名前・価格の表示コード（約80行）がほぼ完全に重複している（DRY原則違反）
- **課題2**: `shop/page.tsx`でCLAUDE.mdの絵文字禁止ルールに違反している
- **課題3**: 不要なコメント（`ProductTile.tsx`の`React.memo`コメント）→ 調査の結果、初心者向けの説明として有用なため対応不要と判断
- **課題4**: 4ページで`FixedHeader` + スペーサー + `Footer`の同一パターンが繰り返されている
- **課題5**: `faq/page.tsx`のスペーサーのみ`className="h-20"`でCSS変数を参照しておらず、ヘッダー高さ変更時に追随しないリスクがある
- **課題6**: `animate-on-scroll` + `stagger-delay-N` + `is-visible`の動的クラス生成パターンが3ファイル5箇所で重複している

### 設計方針

- **DRY**: 重複コードを共通コンポーネント/ユーティリティに集約する
- **KISS**: 過度な抽象化を避け、シンプルな解決策を選ぶ
- **YAGNI**: 検出された問題の修正のみ行い、不要な機能追加はしない

---

## タスク詳細

### タスク1: 絵文字使用禁止ルール違反を修正

**対象ファイル**:

- `app/(public)/shop/page.tsx`（既存・変更）

**問題点**:

46行目で絵文字`🏪`を使用しており、CLAUDE.mdの「絵文字は一切使用しないこと」ルールに違反している。

**修正内容**:

絵文字をLucide Reactの`Store`アイコンに置き換える。プロジェクトでは既に`lucide-react`を使用中（`MobileMenu.tsx`等）。

**変更箇所（shop/page.tsx）**:

```tsx
// 変更前
import Link from "next/link";

// 変更後
import Link from "next/link";
import { Store } from "lucide-react";
```

```tsx
// 変更前
<div className="mb-6 text-6xl">🏪</div>

// 変更後
<div className="mb-6">
  <Store className="mx-auto h-16 w-16 text-gray-400" />
</div>
```

---

### タスク2: ページレイアウトを公開サイト用layoutに集約

**対象ファイル**:

- `app/(public)/layout.tsx`（既存・変更）
- `app/(public)/HomeContent.tsx`（既存・変更）
- `app/(public)/faq/page.tsx`（既存・変更）
- `app/(public)/about-ice/page.tsx`（既存・変更）
- `app/(public)/menu/[id]/page.tsx`（既存・変更）
- `app/(public)/shop/page.tsx`（既存・変更）

**問題点**:

4ページで`FixedHeader` + スペーサー + `Footer`の同一パターンが繰り返されている。さらに`faq/page.tsx`のみスペーサーが`className="h-20"`でCSS変数を参照していない。

**修正内容**:

`app/(public)/layout.tsx`に`FixedHeader` + スペーサー + `Footer`を集約し、各ページから除去する。

<details>
<summary>layout.tsx の変更後コード（クリックで展開）</summary>

```tsx
/**
 * 公開サイト用レイアウト
 *
 * 全公開ページ共通のFixedHeader + スペーサー + Footerを配置。
 * Parallel Routesの@modalスロットを受け取り、
 * メインコンテンツと並列にモーダルを描画する。
 */
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";

export default function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FixedHeader />
      {/*
       * position:fixed のヘッダーに対応するスペーサー
       * fixedは通常フローから外れるため、このスペーサーがないと
       * 下のコンテンツがヘッダーの裏に隠れてしまう
       */}
      <div style={{ height: "var(--header-height)" }} />
      {children}
      <Footer />
      {modal}
    </div>
  );
}
```

</details>

**HomeContent.tsx の変更**:

- `<div className="min-h-screen bg-background overflow-x-hidden">` をフラグメント `<>` に変更
- `<FixedHeader />`、スペーサー（コメント + div）、`<Footer />` を除去
- `FixedHeader`, `Footer` のimport文を除去

<details>
<summary>HomeContent.tsx の変更後コード（クリックで展開）</summary>

```tsx
/**
 * トップページのメインコンテンツ
 *
 * データ取得と表示を担当するServer Component。
 * ISR + オンデマンド再検証でキャッシュを管理。
 * キャッシュミス時のみSuspense fallback（ローディング画面）が表示される。
 */
import Link from "next/link";
import Image from "next/image";
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "@/app/components/ProductCategoryTabs";
import HeroSection from "@/app/components/HeroSection";
import { log } from "@/lib/logger";

const BASE_URL = process.env.SITE_URL!;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "白熊堂",
  description: "川崎ラチッタデッラにある本格かき氷のお店",
  url: BASE_URL,
  telephone: "070-9157-3772",
  address: {
    "@type": "PostalAddress",
    streetAddress: "小川町4-1 ラチッタデッラ マッジョーレ1F",
    addressLocality: "川崎市川崎区",
    addressRegion: "神奈川県",
    postalCode: "210-0023",
    addressCountry: "JP",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "11:00",
    closes: "21:00",
  },
  servesCuisine: ["かき氷", "スイーツ", "デザート"],
  priceRange: "¥",
  image: `${BASE_URL}/og-image.png`,
};

export default async function HomeContent() {
  let categoriesWithProducts: CategoryWithProducts[] = [];

  try {
    categoriesWithProducts = await getPublishedProductsByCategory();
  } catch (error) {
    // 設計判断: データ取得エラー時もページは表示する（部分的なダウンタイムを許容）
    // ユーザーには通知せず、運用者のみログで確認
    log.error("商品データの取得に失敗しました", {
      context: "HomeContent",
      error,
    });
    categoriesWithProducts = [];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      <HeroSection />

      <main>
        {/* 天然氷紹介: カード形式で白基調に馴染ませる */}
        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16 lg:px-8">
          <Link
            href="/about-ice"
            className="group relative block h-[28svh] overflow-hidden rounded-xl shadow-md ring-1 ring-border/50 transition-shadow duration-500 hover:shadow-xl md:h-[35vh] lg:h-[40vh]"
          >
            <Image
              src="/S__3301389.jpg"
              alt="透き通った天然氷のブロック"
              fill
              priority
              fetchPriority="high"
              quality={50}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(min-width: 1280px) 1088px, (min-width: 1024px) calc(100vw - 64px), (min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center drop-shadow-lg md:gap-6">
              <h2 className="text-lg font-normal tracking-widest text-white md:text-2xl lg:text-3xl">
                冬の山奥で生まれる、特別な氷
              </h2>
              <span className="border-b border-white/60 pb-0.5 text-xs font-normal tracking-wider text-white transition-colors group-hover:border-white md:text-sm">
                天然氷について →
              </span>
            </div>
          </Link>
        </section>

        <div className="mx-auto max-w-7xl px-2 py-10 md:px-6 md:py-16 lg:px-8 lg:py-20 overflow-x-hidden">
          <ProductCategoryTabs categoriesWithProducts={categoriesWithProducts} />
        </div>
      </main>
    </>
  );
}
```

</details>

**faq/page.tsx の変更**:

- `<div className="min-h-screen bg-background">` をフラグメント `<>` に変更
- `<FixedHeader />`、スペーサー（コメント + `<div className="h-20" />`）、`<Footer />` を除去
- `FixedHeader`, `Footer` のimport文を除去

<details>
<summary>faq/page.tsx の変更後コード（クリックで展開）</summary>

```tsx
/**
 * FAQページ
 *
 * よくある質問と回答をアコーディオン形式で表示。
 * データは app/(public)/faq/data.ts から取得。
 */
import type { Metadata } from "next";
import FAQSection from "@/app/components/FAQSection";
import { faqs } from "./data";

const BASE_URL = process.env.SITE_URL!;

export const metadata: Metadata = {
  title: "よくある質問（FAQ）",
  description:
    "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: "よくある質問（FAQ） | 白熊堂",
    description:
      "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
    type: "website",
    url: `${BASE_URL}/faq`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "白熊堂 - 本格かき氷のお店",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "よくある質問（FAQ） | 白熊堂",
    description:
      "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
    images: ["/og-image.png"],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        <FAQSection faqs={faqs} showTitle={true} />
      </main>
    </>
  );
}
```

</details>

**about-ice/page.tsx の変更**:

- `<div className="min-h-screen bg-background">` をフラグメント `<>` に変更
- `<FixedHeader />`、スペーサー（コメント + div）、`<Footer />` を除去
- `FixedHeader`, `Footer` のimport文を除去

<details>
<summary>about-ice/page.tsx の変更後コード（クリックで展開）</summary>

```tsx
/**
 * 天然氷紹介ページ
 *
 * 白熊堂が使用する天然氷のこだわりやストーリーを伝えるページ。
 */
import type { Metadata } from "next";
import AboutIceContent from "./AboutIceContent";

const baseUrl = process.env.SITE_URL!;

export const metadata: Metadata = {
  title: "天然氷について",
  description:
    "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
  alternates: {
    canonical: `${baseUrl}/about-ice`,
  },
  openGraph: {
    title: "天然氷について | 白熊堂",
    description:
      "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
    type: "website",
    url: `${baseUrl}/about-ice`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "白熊堂 - 本格かき氷のお店",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "天然氷について | 白熊堂",
    description:
      "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
    images: ["/og-image.png"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "天然氷について",
  description:
    "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
  author: {
    "@type": "Organization",
    name: "白熊堂",
  },
  publisher: {
    "@type": "Organization",
    name: "白熊堂",
    url: baseUrl,
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${baseUrl}/about-ice`,
  },
};

export default function AboutIcePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <AboutIceContent />
    </>
  );
}
```

</details>

**menu/[id]/page.tsx の変更**:

- `<div className="min-h-screen bg-background overflow-x-hidden">` をフラグメント `<>` に変更
- `<FixedHeader />`、スペーサー（コメント + div）、`<Footer />` を除去
- `FixedHeader`, `Footer` のimport文を除去
- `<ScrollToTop />` はchildren先頭に残す

**shop/page.tsx の変更**:

layoutが`FixedHeader` + `Footer`を自動的に提供するため、ページの`<main>`を調整する。

```tsx
// 変更前
<main className="flex min-h-screen items-center justify-center bg-gray-50">

// 変更後（min-h-screenとbg-*はlayoutが担当）
<main className="flex flex-1 items-center justify-center">
```

---

### タスク3: 商品詳細の表示コード重複を解消

**対象ファイル**:

- `app/components/ProductDetail.tsx`（**新規作成**）
- `app/(public)/menu/[id]/page.tsx`（既存・変更）
- `app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx`（既存・変更）

**問題点**:

`menu/[id]/page.tsx`の82-161行目と`ProductModalRoute.tsx`の46-125行目で、商品画像・名前・説明・価格の表示コード（約80行）がほぼ完全に重複している。差分は商品名・説明の表示要素のみ（page.tsxは`h1`+`p`、モーダルは`DialogTitle`+`DialogDescription`）。

**修正内容**:

共通部分（画像カード + 価格カード）を`ProductDetail`コンポーネントに抽出する。商品名・説明は各呼び出し側で異なるため、`headerSlot`（React.ReactNode）として渡す。

<details>
<summary>ProductDetail.tsx の全体コード（クリックで展開）</summary>

```tsx
"use client";

import Image from "next/image";
import type { Product } from "@/app/types";
import { formatPrice } from "@/lib/product-utils";
import { Separator } from "@/app/components/ui/separator";
import { PriceBadge } from "@/app/components/ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "@/app/components/ui/card-modal";

interface ProductDetailProps {
  product: Product;
  /** 商品名・説明の表示をカスタマイズ（モーダルではDialog系要素を使用するため） */
  headerSlot: React.ReactNode;
}

export default function ProductDetail({ product, headerSlot }: ProductDetailProps) {
  return (
    <>
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
            {headerSlot}
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
    </>
  );
}
```

</details>

**menu/[id]/page.tsx の変更（タスク2の変更後の状態から）**:

82-161行目の画像・コンテンツ・価格カードを`ProductDetail`に置き換える。

```tsx
// 追加import
import ProductDetail from "@/app/components/ProductDetail";

// 不要になるimport（削除）
// - formatPrice（ProductDetailが内部で使用）
// - Separator（ProductDetailが内部で使用）
// - PriceBadge（ProductDetailが内部で使用）
// - ModalImageCard, ModalPriceCard, ModalCardHeader（ProductDetailが内部で使用）
// ModalContentCard, ModalCardContent は引き続き不要（headerSlot内では使わない）
```

<details>
<summary>menu/[id]/page.tsx のreturn部分の変更後コード（クリックで展開）</summary>

```tsx
return (
  <>
    <ScrollToTop />

    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="flex flex-col gap-4">
        <ProductDetail
          product={product}
          headerSlot={
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
          }
        />
      </div>
    </main>
  </>
);
```

</details>

**ProductModalRoute.tsx の変更**:

46-125行目の画像・コンテンツ・価格カードを`ProductDetail`に置き換える。

```tsx
// 追加import
import ProductDetail from "@/app/components/ProductDetail";

// 不要になるimport（削除）
// - Image（ProductDetailが内部で使用）
// - formatPrice（ProductDetailが内部で使用）
// - Separator（ProductDetailが内部で使用）
// - PriceBadge（ProductDetailが内部で使用）
// - ModalImageCard, ModalPriceCard, ModalCardHeader（ProductDetailが内部で使用）
// ModalContentCard, ModalCardContent は引き続き不要（headerSlot内では使わない）
```

<details>
<summary>ProductModalRoute.tsx の変更後コード（クリックで展開）</summary>

```tsx
/**
 * Intercepting Route用モーダルコンポーネント
 *
 * サイト内遷移時に商品詳細をモーダルとして表示する。
 * router.back()でモーダルを閉じ、元のページのURLに戻す。
 */
"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import ProductDetail from "@/app/components/ProductDetail";

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
            <ProductDetail
              product={product}
              headerSlot={
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
              }
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

</details>

---

### タスク4: アニメーション用動的クラスのユーティリティ関数を作成

**対象ファイル**:

- `lib/animation.ts`（**新規作成**）
- `app/components/ProductGrid.tsx`（既存・変更）
- `app/components/FAQSection.tsx`（既存・変更）
- `app/(public)/about-ice/AboutIceContent.tsx`（既存・変更）

**問題点**:

`animate-on-scroll` + `stagger-delay-N` + `is-visible`の動的クラス生成パターンが3ファイル5箇所で重複している。DRYの「3箇所目で共通化を検討」に該当。

**修正内容**:

ユーティリティ関数`scrollAnimationClass`を作成し、各ファイルで使用する。

**lib/animation.ts（新規作成）**:

```ts
/**
 * スクロールアニメーション用のクラス名を生成
 *
 * animate-on-scroll + stagger-delay-N + is-visible の組み合わせを統一
 */
export function scrollAnimationClass(
  isInView: boolean,
  staggerIndex?: number
): string {
  const base = "animate-on-scroll";
  const stagger =
    staggerIndex !== undefined
      ? ` stagger-delay-${Math.min(staggerIndex + 1, 8)}`
      : "";
  const visible = isInView ? " is-visible" : "";
  return `${base}${stagger}${visible}`;
}
```

**ProductGrid.tsx の変更**:

```tsx
// 追加import
import { scrollAnimationClass } from "@/lib/animation";

// 35行目 変更前
className={`animate-on-scroll mb-8 flex items-center justify-center md:mb-12 lg:mb-16 ${titleInView ? "is-visible" : ""}`}

// 35行目 変更後
className={`${scrollAnimationClass(titleInView)} mb-8 flex items-center justify-center md:mb-12 lg:mb-16`}

// 53行目 変更前
className={`animate-on-scroll stagger-delay-${Math.min(index + 1, 8)} ${gridInView ? "is-visible" : ""}`}

// 53行目 変更後
className={scrollAnimationClass(gridInView, index)}
```

**FAQSection.tsx の変更**:

```tsx
// 追加import
import { scrollAnimationClass } from "@/lib/animation";

// 41行目 変更前
className={`animate-on-scroll mb-10 flex flex-col items-center gap-4 md:mb-12 ${titleInView ? "is-visible" : ""}`}

// 41行目 変更後
className={`${scrollAnimationClass(titleInView)} mb-10 flex flex-col items-center gap-4 md:mb-12`}

// 58行目 変更前
className={`animate-on-scroll stagger-delay-${Math.min(index + 1, 8)} ${listInView ? "is-visible" : ""}`}

// 58行目 変更後
className={scrollAnimationClass(listInView, index)}
```

**AboutIceContent.tsx の変更**:

```tsx
// 追加import
import { scrollAnimationClass } from "@/lib/animation";

// 31行目 変更前
className={`animate-on-scroll mb-6 text-lg font-normal tracking-wide text-foreground md:text-xl lg:text-2xl ${isInView ? "is-visible" : ""}`}

// 31行目 変更後
className={`${scrollAnimationClass(isInView)} mb-6 text-lg font-normal tracking-wide text-foreground md:text-xl lg:text-2xl`}

// 39行目 変更前
className={`animate-on-scroll stagger-delay-${Math.min(i + 1, 8)} text-sm leading-loose text-muted-foreground md:text-base ${isInView ? "is-visible" : ""}`}

// 39行目 変更後
className={`${scrollAnimationClass(isInView, i)} text-sm leading-loose text-muted-foreground md:text-base`}

// 49行目 変更前
className={`animate-on-scroll stagger-delay-${Math.min(section.paragraphs.length + 1, 8)} ${isReversed ? "md:order-1" : ""} ${isInView ? "is-visible" : ""}`}

// 49行目 変更後
className={`${scrollAnimationClass(isInView, section.paragraphs.length)} ${isReversed ? "md:order-1" : ""}`}
```

---

### タスク5: 動作確認・ビルドテスト

**自動確認**（Claudeが実行）:

1. **ビルド確認** (`npm run build`)
   - ビルドエラーがないこと
   - TypeScriptエラーがないこと

2. **リント確認** (`npm run lint`)
   - リントエラーがないこと
   - 未使用のインポートがないこと

**手動確認**（ユーザーが実行）:

1. **トップページ** (`/`)
   - ヒーロー画像、天然氷カード、商品グリッドが正しく表示されること
   - FixedHeaderとFooterが表示されること
   - スクロールアニメーションが動作すること

2. **商品詳細モーダル** (トップページから商品をクリック)
   - モーダルが開き、商品画像・名前・説明・価格が表示されること
   - モーダルを閉じるとトップページに戻ること

3. **商品詳細ページ** (`/menu/[id]` に直接アクセス)
   - フルページで商品画像・名前・説明・価格が表示されること
   - FixedHeaderとFooterが表示されること

4. **FAQページ** (`/faq`)
   - アコーディオンが正しく動作すること
   - FixedHeaderとFooterが表示されること
   - スクロールアニメーションが動作すること

5. **天然氷ページ** (`/about-ice`)
   - 画像と文章が正しく表示されること
   - FixedHeaderとFooterが表示されること
   - スクロールアニメーションが動作すること

6. **ショップページ** (`/shop`)
   - Storeアイコンが表示されること（絵文字ではないこと）
   - FixedHeaderとFooterが表示されること

---

## 変更対象ファイル一覧

| ファイル                                              | 変更内容                                           |
| ----------------------------------------------------- | -------------------------------------------------- |
| `app/(public)/shop/page.tsx`                          | 絵文字をLucideアイコンに置き換え、レイアウト調整   |
| `app/(public)/layout.tsx`                             | FixedHeader + スペーサー + Footer を集約           |
| `app/(public)/HomeContent.tsx`                        | FixedHeader/スペーサー/Footer を除去               |
| `app/(public)/faq/page.tsx`                           | FixedHeader/スペーサー/Footer を除去               |
| `app/(public)/about-ice/page.tsx`                     | FixedHeader/スペーサー/Footer を除去               |
| `app/(public)/menu/[id]/page.tsx`                     | FixedHeader/スペーサー/Footer除去、ProductDetail使用 |
| `app/components/ProductDetail.tsx`                    | **新規作成** - 商品詳細の共通コンポーネント        |
| `app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx` | ProductDetail使用に置き換え                     |
| `lib/animation.ts`                                    | **新規作成** - scrollAnimationClassユーティリティ   |
| `app/components/ProductGrid.tsx`                      | scrollAnimationClass使用に置き換え                 |
| `app/components/FAQSection.tsx`                       | scrollAnimationClass使用に置き換え                 |
| `app/(public)/about-ice/AboutIceContent.tsx`          | scrollAnimationClass使用に置き換え                 |

---

## 備考

### 変更しないもの

- `app/components/ProductTile.tsx` の73行目のコメント（`React.memo`の説明）: 初心者向けの有用な説明のため残す
- `app/not-found.tsx`: `(public)`レイアウト外のため、今回のlayout変更の対象外
- `app/components/FixedHeader.tsx`, `app/components/Footer.tsx`: コンポーネント自体は変更しない（配置場所のみ変更）
- 管理画面（`app/dashboard/`）配下のファイル

### 注意事項

- タスク2でlayoutにFixedHeader/Footerを移動するため、タスク3のpage.tsx変更は**タスク2の完了後の状態**を基準に行うこと
- `ProductDetail`は`"use client"`だが、Server Componentの`menu/[id]/page.tsx`からimportして使用可能（Next.jsの標準パターン）。`headerSlot`はReact.ReactNodeなので、Server Component側でJSXとして渡せる
- タスク2,3は並列実行不可（タスク3はタスク2の完了を前提としている）
- タスク1,4はそれぞれ独立しているため、他のタスクと並列実行可能
