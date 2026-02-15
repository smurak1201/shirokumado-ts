# フロントエンド SEO リファクタリング手順書（第2版）

> **更新日**: 2026-02-14
> **前回からの主な変更点**: `about-ice`ページの追加、FAQページへの`<main>`タグ追加、ナビゲーションリンクの追加を反映。

---

## 1. 現状の総合評価

**スコア: 68 / 100点**（前回: 65点）

前回からの改善点として、`about-ice`ページが適切な構造（メタデータ・h1・`<main>`・セマンティックなsection）で実装され、FixedHeaderにナビゲーションリンクが追加された。FAQページにも`<main>`タグが追加されている。一方で、**構造化データ（JSON-LD）の未実装**、**sitemap/robotsの未実装**、**ルートレイアウトのmetadataBase未設定**、**トップページのh1欠如**は依然として大きな課題。

### 項目別スコア

| 項目 | スコア | 前回 | 概評 |
|---|---|---|---|
| Metadata API | 6/10 | 5 | about-iceにページ別メタデータ追加。FAQ・shopは未設定 |
| 見出し構造 | 6/10 | 5 | about-iceにh1あり。トップページは依然h1なし |
| セマンティックHTML | 8/10 | 7 | about-ice・FAQで適切。nav要素追加。shop/authでmain欠如 |
| 画像最適化 | 8/10 | 8 | about-iceの画像も適切。ヒーロー画像のaltが非説明的 |
| 構造化データ（JSON-LD） | 0/10 | 0 | 未実装 |
| sitemap / robots | 0/10 | 0 | 未実装 |
| Core Web Vitals | 8/10 | 8 | LCP/CLS対策済み。動的インポート活用 |
| next/link / next/font | 9/10 | 9 | 適切に実装。ナビゲーションリンク追加 |
| アクセシビリティ | 7/10 | 7 | aria-label、キーボード対応あり |

### 前回からの改善サマリー

| 項目 | 状態 |
|---|---|
| about-iceページのメタデータ | 済 — 新規追加で適切に実装 |
| about-iceのh1・見出し構造 | 済 — h1→h2の正しい階層 |
| about-iceの`<main>`タグ | 済 — AboutIceContent内で使用 |
| about-iceのセマンティックHTML | 済 — `<section>`要素を適切に使用 |
| about-iceの画像alt属性 | 済 — 画像内容を説明するalt |
| FixedHeaderにナビゲーション追加 | 済 — `<nav>`要素でSEO・アクセシビリティ向上 |
| FAQページの`<main>`タグ | 済 — 追加済み |

---

## 2. 重大な問題点（Critical Issues）

### Issue 1: トップページにh1タグがない

**対象ファイル**: `app/(public)/HomeContent.tsx`

**現状**: トップページの見出し構造がh2（「冬の山奥で生まれる、特別な氷」）から始まっている。h1が存在しないため、検索エンジンがページの主題を正確に把握できない。

**影響**: 検索エンジンがページの主題を判定できず、検索順位に直接的な悪影響がある。

---

### Issue 2: FAQ・Shopページにページ別メタデータが未設定

**対象ファイル**: `app/(public)/faq/page.tsx`、`app/(public)/shop/page.tsx`

**現状**: FAQページとショップページがルートレイアウトのメタデータをそのまま継承している。about-iceページは適切に設定済み。

**影響**: 検索結果に表示されるタイトルと説明文が同じになり、各ページの個別の価値を検索エンジンに伝えられない。

---

### Issue 3: JSON-LD（構造化データ）が未実装

**対象ファイル**: なし（新規実装が必要）

**現状**: LocalBusiness、FAQPage などの構造化データが一切実装されていない。

**影響**: Googleのリッチリザルト（営業時間、FAQ表示、地図情報など）に表示される機会を完全に逃している。特にかき氷店のような実店舗ビジネスでは、LocalBusinessスキーマの有無が検索結果の表示内容に大きく影響する。

---

### Issue 4: sitemap.xml / robots.txt が未実装

**対象ファイル**: なし（新規実装が必要）

**現状**: サイトマップもrobots.txtも存在しない。

**影響**: 検索エンジンのクロール効率が低下し、新しいページや更新されたページのインデックス登録が遅れる。

---

### Issue 5: metadataBase / canonical URL が未設定

**対象ファイル**: `app/layout.tsx`

**現状**: `metadataBase`が設定されていないため、OGP のURLや canonical URL が正しく生成されない。

**影響**: 重複コンテンツの問題が発生する可能性がある。SNSでシェアされた際にOGPが正しく動作しない。

---

### Issue 6: about-iceページのtitleがtitle templateと重複する

**対象ファイル**: `app/(public)/about-ice/page.tsx`

**現状**: `title: "天然氷について | 白熊堂"` とフルタイトルが設定されている。ルートレイアウトに`title.template: "%s | 白熊堂"`を導入すると、「天然氷について | 白熊堂 | 白熊堂」と重複してしまう。

**影響**: タスク1（metadataBaseとtitle template設定）を実施する際に、同時に修正が必要。

---

### Issue 7: トップページの`<main>`タグの配置が不適切

**対象ファイル**: `app/(public)/HomeContent.tsx`

**現状**: `<main>`タグが商品タブセクション（83行目）だけを囲んでおり、天然氷紹介セクション（59行目）はmainの外にある。ページのメインコンテンツ全体を`<main>`で囲むべき。

**影響**: 検索エンジンやスクリーンリーダーが、天然氷紹介セクションをメインコンテンツとして認識しない。

---

## 3. 具体的な改善アドバイス

### 前提: 環境変数 `SITE_URL` の設定（設定済み）

サイトのベースURLは複数のファイル（`layout.tsx`、`sitemap.ts`、`robots.ts`、JSON-LD）で使用するため、環境変数 `SITE_URL` で一元管理する。

ローカル（`.env`）とVercelダッシュボードの両方に `SITE_URL=https://shirokumado-ts.vercel.app` を設定済み。

カスタムドメイン取得後は、以下の2箇所の値を新しいドメインに変更するだけでよい（コードの修正は不要）。

- ローカル: `.env` の `SITE_URL`
- 本番: Vercelダッシュボードの **Settings > Environment Variables** の `SITE_URL`

**注意**: `NEXT_PUBLIC_` プレフィックスは不要。`SITE_URL` はサーバーサイド（`layout.tsx`、`sitemap.ts`、`robots.ts`、Server Components）でのみ使用するため、クライアントに公開する必要がない。

---

### タスク1: metadataBaseとOGP画像の設定【優先度: 最高】

**対象ファイル**: `app/layout.tsx`

**変更内容**: `metadataBase`を追加し、`title.template`とOGP画像を設定する。これがすべてのメタデータの基盤となる。

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL!),
  title: {
    default: "白熊堂 | 本格かき氷のお店",
    template: "%s | 白熊堂",
  },
  description:
    "白熊堂は川崎ラチッタデッラにある本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "白熊堂 | 本格かき氷のお店",
    description:
      "白熊堂は川崎ラチッタデッラにある本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
    type: "website",
    locale: "ja_JP",
    siteName: "白熊堂",
    images: [
      {
        url: "/og-image.jpg", // OGP用の画像を用意して配置すること
        width: 1200,
        height: 630,
        alt: "白熊堂 - 本格かき氷のお店",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "白熊堂 | 本格かき氷のお店",
    description:
      "白熊堂は川崎ラチッタデッラにある本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
    images: ["/og-image.jpg"],
  },
};
```

**技術的根拠**: `metadataBase`を設定することで、`openGraph.images`や`alternates.canonical`のURLが自動的に絶対URLに解決される。`title.template`を使用すると、子ページで設定したtitleが「ページ名 | 白熊堂」の形式になる。

**補足**: OGP用画像（1200x630px推奨）を`public/og-image.jpg`として用意する必要がある。

---

### タスク2: about-iceページのtitle修正【優先度: 最高】

**対象ファイル**: `app/(public)/about-ice/page.tsx`

**変更内容**: タスク1で`title.template`を導入するため、titleをシンプルな文字列に変更する。

```typescript
// app/(public)/about-ice/page.tsx
export const metadata: Metadata = {
  // 変更前: "天然氷について | 白熊堂"
  // → template適用後: "天然氷について | 白熊堂 | 白熊堂" になってしまう
  // 変更後: templateが自動的に "天然氷について | 白熊堂" に展開する
  title: "天然氷について",
  description:
    "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
  openGraph: {
    title: "天然氷について | 白熊堂",
    description:
      "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
    type: "website",
  },
};
```

**技術的根拠**: ルートレイアウトの`title.template: "%s | 白熊堂"`が適用されるため、各ページのtitleは短い文字列だけでよい。openGraphのtitleはtemplateの影響を受けないため、フルタイトルを維持する。

**注意点**: タスク1と必ずセットで実施すること。

---

### タスク3: トップページにh1を追加【優先度: 最高】

**対象ファイル**: `app/(public)/HomeContent.tsx`

**変更内容**: ヒーローセクションの下にh1を追加する。視覚的なデザインを壊さないよう`sr-only`（スクリーンリーダー専用）にするか、デザインに組み込む。

```tsx
// app/(public)/HomeContent.tsx の return 部分
<HeroSection />

{/* ページの主題を示すh1 - SEOとスクリーンリーダーのため */}
<h1 className="sr-only">白熊堂 - 川崎ラチッタデッラの本格かき氷</h1>

{/* 天然氷紹介セクション */}
<section className="mx-auto max-w-6xl px-4 py-10 ...">
```

**技術的根拠**: h1はページの最も重要な見出しであり、検索エンジンがページの主題を判定する最重要要素。`sr-only`を使えばビジュアルデザインに影響を与えずにSEO効果を得られる。

**注意点**: `sr-only`によるh1の隠蔽はGoogleが推奨する手法ではないが、ビジュアルデザイン上の制約がある場合は許容される。理想的にはヒーローセクション内にテキストとして表示するのが最善。

---

### タスク4: ページ別メタデータの設定【優先度: 最高】

**対象ファイル**: `app/(public)/faq/page.tsx`、`app/(public)/shop/page.tsx`

**変更内容**: 各ページに固有のメタデータを設定する。

```typescript
// app/(public)/faq/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "よくある質問（FAQ）",
  description:
    "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
  openGraph: {
    title: "よくある質問（FAQ） | 白熊堂",
    description:
      "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
  },
};
```

```typescript
// app/(public)/shop/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "オンラインショップ",
  description:
    "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
  openGraph: {
    title: "オンラインショップ | 白熊堂",
    description:
      "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
  },
};
```

**技術的根拠**: ルートレイアウトで`title.template: "%s | 白熊堂"`を設定しているため、各ページのtitleは`"よくある質問（FAQ）"`のように短い文字列だけでよい。Next.jsが自動的に「よくある質問（FAQ） | 白熊堂」に展開する。

---

### タスク5: sitemap.xml の実装【優先度: 高 / カスタムドメイン取得後に実施】

**対象ファイル**: `app/sitemap.ts`（新規作成）

**前提条件**: カスタムドメインを取得・設定済みであること。VercelのURLでサイトマップを公開すると、そのURLが検索エンジンに正規URLとして登録されてしまい、ドメイン移行時に再インデックスが必要になる。

**変更内容**: Next.jsの`sitemap()`関数を使って動的にサイトマップを生成する。about-iceページを追加。

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.SITE_URL!;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
}
```

**技術的根拠**: Next.js App Routerの`sitemap.ts`は、ビルド時に自動的に`/sitemap.xml`としてアクセス可能になる。検索エンジンがサイト構造を効率的に把握できるようになる。

**実施タイミング**: タスク6のrobots.tsを本番用に切り替えるタイミングと同時に実施する。

---

### タスク6: robots.txt の実装【優先度: 高】

**対象ファイル**: `app/robots.ts`（新規作成）

このタスクは2段階で実施する。

#### Step 1: 現時点（カスタムドメイン取得前）

VercelのURLで公開中の間は、検索エンジンにインデックスされないようすべてのクロールを拒否する。

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
```

**技術的根拠**: `disallow: "/"` はサイト全体のクロールを拒否する。VercelのURLが検索結果に登録されると、カスタムドメイン移行後に重複コンテンツの問題が発生するため、この段階ではインデックスを防ぐのが適切。sitemapの指定もクロール拒否中は不要。

#### Step 2: カスタムドメイン取得後（本番用に切り替え）

カスタムドメインを取得・設定したら、以下の本番用コードに差し替える。タスク5（sitemap.ts）も同時に実施すること。

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.SITE_URL!;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/auth/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

**技術的根拠**: `/dashboard/`、`/auth/`、`/api/`は管理者向けまたは内部APIであり、検索エンジンにインデックスされる必要がない。これらを`disallow`に指定することで、クロールバジェットを公開ページに集中できる。

---

### タスク7: JSON-LD 構造化データの実装【優先度: 高】

**対象ファイル**: `app/(public)/HomeContent.tsx`、`app/(public)/faq/page.tsx`、`app/(public)/about-ice/page.tsx`

#### 7-1. トップページにLocalBusinessスキーマを追加

```tsx
// app/(public)/HomeContent.tsx の return 部分に追加
const baseUrl = process.env.SITE_URL!;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "白熊堂",
  description: "川崎ラチッタデッラにある本格かき氷のお店",
  url: baseUrl,
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
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday",
    ],
    opens: "11:00",
    closes: "21:00",
  },
  servesCuisine: "かき氷",
  priceRange: "¥",
  image: `${baseUrl}/og-image.jpg`,
};

// JSX内に追加
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
/>
```

#### 7-2. FAQページにFAQPageスキーマを追加

```tsx
// app/(public)/faq/page.tsx に追加

// FAQデータからJSON-LDを生成
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

// JSX内に追加
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
/>
```

#### 7-3. 天然氷ページにArticleスキーマを追加

```tsx
// app/(public)/about-ice/page.tsx に追加
const baseUrl = process.env.SITE_URL!;

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

// JSX内に追加
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
/>
```

**技術的根拠**: `dangerouslySetInnerHTML`は原則使用禁止だが、JSON-LDの埋め込みは`<script type="application/ld+json">`内で行われるため、XSSリスクがない唯一の例外。Next.jsの公式ドキュメントでもこのパターンが推奨されている。

**期待される効果**:
- Google検索結果にリッチリザルト（営業時間、住所、FAQ）が表示される
- 「川崎 かき氷」などのローカル検索での表示順位向上
- 天然氷の記事がArticleとして認識され、検索結果に構造化表示される

---

### タスク8: トップページの`<main>`タグ配置修正【優先度: 中】

**対象ファイル**: `app/(public)/HomeContent.tsx`

**現状**: `<main>`タグが商品タブセクション（83行目）だけを囲んでおり、天然氷紹介セクション（59〜81行目）がmainの外にある。

**変更内容**: `<main>`タグをヒーローセクション以下のメインコンテンツ全体を囲むように移動する。

```tsx
// 変更前
<HeroSection />

<section className="mx-auto max-w-6xl ...">  {/* 天然氷紹介 */}
  ...
</section>

<main className="mx-auto max-w-7xl ...">  {/* 商品タブのみ */}
  <ProductCategoryTabs ... />
</main>

// 変更後
<HeroSection />

<main>
  <section className="mx-auto max-w-6xl ...">  {/* 天然氷紹介 */}
    ...
  </section>

  <div className="mx-auto max-w-7xl px-2 py-10 md:px-6 md:py-16 lg:px-8 lg:py-20 overflow-x-hidden">
    <ProductCategoryTabs ... />
  </div>
</main>
```

**技術的根拠**: `<main>`要素はページの主コンテンツ全体を示すランドマーク。天然氷紹介セクションも商品一覧もトップページの主要コンテンツであり、両方を`<main>`で囲むのが正しいHTML構造。

---

### タスク9: ヒーロー画像のalt属性改善【優先度: 中】

**対象ファイル**: `app/components/HeroSection.tsx`（46行目）

**現状**: `alt="ヒーロー画像"` — 画像の内容を説明していない。

**変更内容**:

```tsx
// 変更前
alt="ヒーロー画像"

// 変更後（実際の画像内容に合わせて調整すること）
alt="白熊堂のふわふわかき氷"
```

**技術的根拠**: alt属性は画像の内容を説明するものであり、「ヒーロー画像」という技術用語はユーザーにとって無意味。実際の画像内容を記述することで、画像検索からの流入も期待できる。

---

### タスク10: FAQページのセマンティックHTML改善【優先度: 中】

**対象ファイル**: `app/components/FAQSection.tsx`

**現状**: FAQSection は `<>（Fragment）` をルート要素として使っている。FAQ一覧を`<section>`で囲むとセマンティクス的に改善される。

**変更内容**:

```tsx
// 変更前
return (
  <>
    {showTitle && ( ... )}
    <motion.div ...>
      <Accordion ...>
```

```tsx
// 変更後
return (
  <section aria-labelledby={showTitle ? "faq-title" : undefined}>
    {showTitle && (
      <motion.div ...>
        <h1 id="faq-title" ...>
          よくある質問
        </h1>
```

**技術的根拠**: `<section>`はテーマ的にまとまったコンテンツを示し、`aria-labelledby`でセクションの見出しを紐付けることで、スクリーンリーダーでの理解性が向上する。

---

### タスク11: 一部ページで`<main>`タグを追加【優先度: 中】

**対象ファイル**:
- `app/auth/signin/page.tsx` — `<main>`なし
- `app/auth/error/page.tsx` — `<main>`なし
- `app/(public)/shop/page.tsx` — `<main>`なし

**変更内容**: 各ページの最外殻の`<div>`を`<main>`に変更する。

```tsx
// 変更前（例: shop/page.tsx）
<div className="flex min-h-screen items-center justify-center bg-gray-50">

// 変更後
<main className="flex min-h-screen items-center justify-center bg-gray-50">
```

**技術的根拠**: `<main>`要素はページの主コンテンツを示すランドマーク。スクリーンリーダーユーザーがメインコンテンツに直接ジャンプできるため、アクセシビリティが向上する。SEO上も検索エンジンがページの主要コンテンツを正確に識別できる。

**注意点**: auth関連ページはrobots.txtでdisallowしているため、SEO効果は限定的。ただしアクセシビリティの観点から改善する価値がある。

---

### タスク12: フッターの見出し階層修正【優先度: 中】

**対象ファイル**: `app/components/Footer.tsx`（53行目、63行目、79行目）

**現状**: フッター内で`<h3>`が使われているが、先行する`<h2>`がない。これは見出し階層のスキップにあたる。

**変更内容**: フッター内の見出しタグをすべて削除し、代わりにスタイリング用の`<p>`に変更する。フッターの情報は補助的なものであり、見出しタグは不要。

```tsx
// 変更前
<h3 className="text-[8px] font-normal uppercase tracking-wider text-foreground md:text-sm">
  住所
</h3>

// 変更後
<p className="text-[8px] font-normal uppercase tracking-wider text-foreground md:text-sm">
  住所
</p>
```

**技術的根拠**: HTML仕様上、見出しタグ（h1〜h6）はコンテンツの階層を表す。h2を飛ばしてh3を使うと、検索エンジンやスクリーンリーダーが文書構造を誤解する可能性がある。フッター内のラベルは見出しではなく単なるテキストとして扱うのが適切。

---

### タスク13: copyright年の更新【優先度: 低】

**対象ファイル**: `app/components/Footer.tsx`（126行目）

**現状**: `© 2024 白熊堂` とハードコードされている。

**変更内容**: 年を更新する、または開業年から現在年の範囲表記にする。

```tsx
// 変更案
<p className="text-xs text-muted-foreground">
  © 2024-{new Date().getFullYear()} 白熊堂
</p>
```

**補足**: Server Componentでレンダリングされるため、ビルド時の年が表示される。年が変わるたびに再デプロイが必要になるが、実運用上は問題にならない。

---

## 4. 優先順位付きタスクリスト

### Phase 0: 環境変数の設定

| # | タスク | 対象 | インパクト | 備考 |
|---|---|---|---|---|
| 0 | `SITE_URL` 環境変数の設定 | `.env` / Vercelダッシュボード | **前提** | **設定済み**。カスタムドメイン取得後に値を変更するだけでよい |

### Phase 1: 基盤整備（SEOの土台）

| # | タスク | 対象ファイル | インパクト | 前回からの変化 |
|---|---|---|---|---|
| 1 | metadataBaseとOGP画像の設定 | `app/layout.tsx` | **最大** | `process.env.SITE_URL`を使用 |
| 2 | about-iceのtitle修正 | `app/(public)/about-ice/page.tsx` | **最大** | **新規** — タスク1と同時実施 |
| 3 | トップページにh1を追加 | `app/(public)/HomeContent.tsx` | **最大** | 変更なし |
| 4 | ページ別メタデータの設定 | `faq/page.tsx`、`shop/page.tsx` | **大** | about-ice分は実装済み |

### Phase 2: クロール最適化

| # | タスク | 対象ファイル | インパクト | 前回からの変化 |
|---|---|---|---|---|
| 5 | sitemap.xml の実装 | `app/sitemap.ts`（新規） | **大** | カスタムドメイン取得後に実施 |
| 6 | robots.txt の実装（Step 1: クロール拒否） | `app/robots.ts`（新規） | **大** | **今すぐ実施可能** |
| 6' | robots.txt の本番切り替え（Step 2） | `app/robots.ts` | **大** | カスタムドメイン取得後にタスク5と同時実施 |

### Phase 3: リッチリザルト対応

| # | タスク | 対象ファイル | インパクト | 前回からの変化 |
|---|---|---|---|---|
| 7 | JSON-LD 構造化データの実装 | `HomeContent.tsx`、`faq/page.tsx`、`about-ice/page.tsx` | **大** | about-ice用Articleスキーマ追加 |

### Phase 4: セマンティクスとアクセシビリティ改善

| # | タスク | 対象ファイル | インパクト | 前回からの変化 |
|---|---|---|---|---|
| 8 | トップページの`<main>`配置修正 | `HomeContent.tsx` | **中** | **新規** |
| 9 | ヒーロー画像のalt属性改善 | `HeroSection.tsx` | **中** | 変更なし |
| 10 | FAQセクションのセマンティクス改善 | `FAQSection.tsx` | **中** | 変更なし |
| 11 | 一部ページに`<main>`タグ追加 | `shop/page.tsx`、`signin/page.tsx`等 | **中** | FAQ分は実装済み |
| 12 | フッターの見出し階層修正 | `Footer.tsx` | **中** | 変更なし |
| 13 | copyright年の更新 | `Footer.tsx` | **低** | 変更なし |

---

## 5. 現状で適切に実装されている項目（変更不要）

以下の項目は現状で適切に実装されているため、変更は不要。

- **`next/image`の使用**: alt属性、priority、sizes、lazy loadingが適切に設定されている
- **`next/link`の使用**: 内部遷移にすべて使用されている
- **`next/font`の使用**: Noto Sans JP が適切に設定されている
- **Server Components**: デフォルトでServer Componentsが使われ、Client Componentsは必要な箇所のみ
- **パフォーマンス最適化**: `next/dynamic`、`Promise.all`、`React.memo`、Suspenseが活用されている
- **セキュリティヘッダー**: X-Frame-Options、X-Content-Type-Options等が設定済み
- **アクセシビリティ**: aria-label、キーボードナビゲーション、focus-visible対応が実装されている
- **エラーハンドリング**: Error Boundary + error.tsx の二重保護
- **ナビゲーション構造**: FixedHeaderに`<nav>`要素でリンクが設置されている
- **about-iceページ**: メタデータ・見出し構造・セマンティックHTML・画像alt属性がすべて適切に実装されている

---

## 6. about-iceページの良い実装パターン（参考）

新しく追加された`about-ice`ページは、他のページの改善時のお手本となる実装がされている。

| 項目 | 実装内容 |
|---|---|
| メタデータ | ページ固有のtitle・description・openGraphを設定 |
| 見出し構造 | h1（ページタイトル）→ h2（各セクション）の正しい階層 |
| `<main>`タグ | AboutIceContent内で`<main>`を使用 |
| セマンティクス | 各コンテンツブロックを`<motion.section>`で構造化 |
| 画像alt属性 | 「杉林に囲まれた天然氷の池」など内容を説明するalt |
| 画像sizes | `(min-width: 768px) 50vw, 100vw` — レイアウトに合ったsizes指定 |
| レスポンシブ | モバイルファーストで、奇数/偶数セクションの左右入れ替え |
