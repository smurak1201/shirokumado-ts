# フロントエンド SEO リファクタリング手順書

## 1. 現状の総合評価

**総合スコア: 60 / 100 点**

基本的なNext.jsの機能（`next/image`、`next/link`、`next/font`、Server Components）は適切に活用されており、パフォーマンス最適化も施されている。一方で、SEOの根幹となる**Metadata APIの基盤設定**、**構造化データ（JSON-LD）**、**クロール制御（sitemap/robots）**が未整備であり、検索エンジンからの評価を十分に得られていない状態。

---

### 評価基準

以下の8項目に照らし合わせて、現状のコードを分析・評価した。

#### A. デザイナーが施すべき基本SEO（技術的土台）

1. **論理的な見出し構造**: `h1`〜`h6`が適切に階層化されているか。
2. **セマンティックHTML**: `div`を多用せず、`main`, `article`, `section`, `nav`, `figure`等を正しく使っているか。
3. **アクセシビリティ**: `img`の`alt`属性、`aria-label`、コントラスト比などの配慮があるか。

#### B. Next.js特有のSEO・パフォーマンス最適化

4. **Metadata API**: `layout.tsx`や`page.tsx`でのメタデータ設定（Title, Description, OGP）が適切か。
5. **Image Optimization**: `next/image`を使用し、`priority`, `sizes`, `alt`が最適に設定されているか。
6. **Core Web Vitals**: LCP（最大視覚コンテンツ）、CLS（レイアウトシフト）、INP（応答性）を阻害する要因（不要なクライアントサイド処理など）がないか。
7. **JSON-LD (構造化データ)**: スキーママークアップが実装されているか。
8. **Next.js標準機能の活用**: `next/link`によるプリフェッチ、`next/font`によるフォント最適化が行われているか。

---

### 評価基準別スコア

#### A. デザイナーが施すべき基本SEO（技術的土台）

| # | 評価基準 | スコア | 評価 |
|---|---|---|---|
| 1 | 論理的な見出し構造 | **75 / 100** | 概ね良好だが改善余地あり |
| 2 | セマンティックHTML | **70 / 100** | 概ね良好だが改善余地あり |
| 3 | アクセシビリティ | **80 / 100** | 良好 |

#### B. Next.js特有のSEO・パフォーマンス最適化

| # | 評価基準 | スコア | 評価 |
|---|---|---|---|
| 4 | Metadata API | **40 / 100** | 基盤設定が不足 |
| 5 | Image Optimization | **80 / 100** | 良好 |
| 6 | Core Web Vitals | **75 / 100** | 概ね良好 |
| 7 | JSON-LD（構造化データ） | **0 / 100** | 未実装 |
| 8 | Next.js標準機能の活用 | **70 / 100** | 概ね良好だがクロール制御が未実装 |

---

### 各項目の詳細評価

#### 1. 論理的な見出し構造（75点）

**良い点:**
- トップページ: HeroSection内にロゴ画像を`<h1>`として配置（alt属性「日光天然氷 白熊堂」がSEO上の見出しテキストとして機能）
- about-ice: `h1`（ページタイトル）→ `h2`（各セクション）の正しい階層
- FAQ/shop/signin/error: 各ページに`h1`あり
- ProductGrid: カテゴリー名に`h2`を使用

**問題点:**
- フッターで`<h3>`を使用しているが、先行する`<h2>`がない（見出し階層のスキップ）

#### 2. セマンティックHTML（70点）

**良い点:**
- `<header>`、`<nav>`、`<footer>`、`<section>`が適切に使用されている
- FixedHeaderに`<nav>`要素でナビゲーションリンクが設置されている
- about-iceページで`<main>`と`<motion.section>`が正しく構造化されている
- ProductGridが`<section>`で各カテゴリーを構造化

**問題点:**
- shop/signin/errorページに`<main>`タグがない
- トップページの`<main>`が商品タブのみを囲んでおり、天然氷紹介セクションがmainの外にある
- FAQSectionが`<>`（Fragment）をルート要素として使用

#### 3. アクセシビリティ（80点）

**良い点:**
- ProductTileに`role="button"`、`tabIndex={0}`、`onKeyDown`、`aria-label`を設定
- 外部リンク（Instagram）に`aria-label`を設定
- `focus-visible`によるキーボード操作時のフォーカス表示が複数箇所で実装
- Radix UIベースのAccordionでキーボードアクセス対応済み
- 電話番号リンクに`tel:`スキームを使用
- 画像のalt属性が概ね適切（商品名、「透き通った天然氷のブロック」など）

**問題点:**
- ヒーロー画像のalt属性が「ヒーロー画像」で非説明的
- フッター内の見出し階層スキップがスクリーンリーダーに影響

#### 4. Metadata API（40点）

**良い点:**
- ルートレイアウトにtitle/description/openGraphを設定
- about-iceページにページ固有のメタデータを設定
- `manifest`の設定あり

**問題点:**
- `metadataBase`が未設定（OGP URLが相対URLのまま）
- `title.template`が未設定（各ページで「ページ名 | 白熊堂」の自動展開ができない）
- OGP画像が未指定（SNS共有時にサムネイルが表示されない）
- Twitter Card設定なし
- FAQ/shopページにページ固有のメタデータがない
- about-iceのtitleがフルタイトル指定（template導入時に重複する）

#### 5. Image Optimization（80点）

**良い点:**
- 全画像で`next/image`を使用
- ヒーロー画像に`priority`と`sizes="100vw"`を設定（LCP最適化）
- ProductTileに`sizes`（レイアウト別）と`loading="lazy"`を設定
- `AspectRatio`コンポーネントでアスペクト比を固定（CLS防止）
- 商品名をalt属性に使用

**問題点:**
- ヒーロー画像のaltが非説明的
- `next.config.ts`で`images.unoptimized: true`（サーバーサイド最適化が無効）
  - 理由: クライアント側で圧縮済みのため意図的な設定

#### 6. Core Web Vitals（75点）

**LCP対策（良好）:**
- ヒーロー画像に`priority`フラグ
- `next/dynamic`で商品グリッドをコード分割
- `Suspense`でローディング状態を表示

**CLS対策（良好）:**
- `scrollbar-gutter: stable`でスクロールバー領域を確保
- ヘッダーに固定高さ（5rem）+ スペーサー配置
- ヒーローセクションに`aspect-ratio`設定
- 商品タイルに`AspectRatio ratio={1}`

**INP対策（良好）:**
- `React.memo`で商品タイルの不要な再レンダリングを防止
- `useCallback`でイベントハンドラーをメモ化
- イベントハンドラー内で重い処理なし

**問題点:**
- ヒーローセクションの`motion.div`アニメーション（opacity: 0 → 1、1秒間）がLCPを視覚的に遅延させる
- 最低ローディング表示時間（1.5秒）がLCP計測に影響
- framer-motionの複数アニメーションが連鎖して初期表示が遅延

#### 7. JSON-LD 構造化データ（0点）

**現状: 完全に未実装**

LocalBusiness（店舗情報）、FAQPage（FAQ）、Article（天然氷記事）のいずれも実装されていない。検索結果にリッチリザルト（営業時間、FAQ表示、地図情報）が表示される機会を逃している。

#### 8. Next.js標準機能の活用（70点）

**良い点:**
- `next/link`: すべての内部リンクで使用（プリフェッチはデフォルト有効）
- `next/font`: Noto Sans JPを`next/font/google`で最適化（CSS変数として割り当て、必要なweightのみ指定）
- Server Components: デフォルトで使用、Client Componentsは必要な箇所のみ
- `next/dynamic`: ProductGridの動的インポート
- Error Boundary + `error.tsx`の二重保護
- セキュリティヘッダー（X-Frame-Options、X-Content-Type-Options等）
- `manifest.webmanifest`の設定

**問題点:**
- `sitemap.ts`が未実装
- `robots.ts`が未実装

---

## 2. 重大な問題点（Critical Issues）

### Issue 1: FAQ/Shopページにページ別メタデータが未設定

**対象ファイル**: `app/(public)/faq/page.tsx`、`app/(public)/shop/page.tsx`

**現状**: FAQページとショップページがルートレイアウトのメタデータをそのまま継承している。about-iceページは適切に設定済み。

**影響**: 検索結果に表示されるタイトルと説明文が同じになり、各ページの個別の価値を検索エンジンに伝えられない。

---

### Issue 2: JSON-LD（構造化データ）が未実装

**対象ファイル**: なし（新規実装が必要）

**現状**: LocalBusiness、FAQPage などの構造化データが一切実装されていない。

**影響**: Googleのリッチリザルト（営業時間、FAQ表示、地図情報など）に表示される機会を完全に逃している。特にかき氷店のような実店舗ビジネスでは、LocalBusinessスキーマの有無が検索結果の表示内容に大きく影響する。

---

### Issue 3: sitemap.xml / robots.txt が未実装

**対象ファイル**: なし（新規実装が必要）

**現状**: サイトマップもrobots.txtも存在しない。

**影響**: 検索エンジンのクロール効率が低下し、新しいページや更新されたページのインデックス登録が遅れる。

---

### Issue 4: metadataBase / canonical URL が未設定

**対象ファイル**: `app/layout.tsx`

**現状**: `metadataBase`が設定されていないため、OGP のURLや canonical URL が正しく生成されない。

**影響**: 重複コンテンツの問題が発生する可能性がある。SNSでシェアされた際にOGPが正しく動作しない。

---

### Issue 5: about-iceページのtitleがtitle templateと重複する

**対象ファイル**: `app/(public)/about-ice/page.tsx`

**現状**: `title: "天然氷について | 白熊堂"` とフルタイトルが設定されている。ルートレイアウトに`title.template: "%s | 白熊堂"`を導入すると、「天然氷について | 白熊堂 | 白熊堂」と重複してしまう。

**影響**: タスク1（metadataBaseとtitle template設定）を実施する際に、同時に修正が必要。

---

### Issue 6: トップページの`<main>`タグの配置が不適切

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
**影響する評価項目**: 4. Metadata API

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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
  },
};
```

**技術的根拠**: `metadataBase`を設定することで、`openGraph.images`や`alternates.canonical`のURLが自動的に絶対URLに解決される。`title.template`を使用すると、子ページで設定したtitleが「ページ名 | 白熊堂」の形式になる。

**補足**: OGP用画像（1200x630px）は`public/og-image.png`として配置済み。

---

### タスク2: about-iceページのtitle修正【優先度: 最高】

**対象ファイル**: `app/(public)/about-ice/page.tsx`
**影響する評価項目**: 4. Metadata API

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

### タスク3: ページ別メタデータの設定【優先度: 最高】

**対象ファイル**: `app/(public)/faq/page.tsx`、`app/(public)/shop/page.tsx`
**影響する評価項目**: 4. Metadata API

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

### タスク4: sitemap.xml の実装【優先度: 高 / カスタムドメイン取得後に実施】

**対象ファイル**: `app/sitemap.ts`（新規作成）
**影響する評価項目**: 8. Next.js標準機能の活用

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

**実施タイミング**: タスク5のrobots.tsを本番用に切り替えるタイミングと同時に実施する。

---

### タスク5: robots.txt の実装【優先度: 高】

**対象ファイル**: `app/robots.ts`（新規作成）
**影響する評価項目**: 8. Next.js標準機能の活用

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

カスタムドメインを取得・設定したら、以下の本番用コードに差し替える。タスク4（sitemap.ts）も同時に実施すること。

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

### タスク6: JSON-LD 構造化データの実装【優先度: 高】

**対象ファイル**: `app/(public)/HomeContent.tsx`、`app/(public)/faq/page.tsx`、`app/(public)/about-ice/page.tsx`
**影響する評価項目**: 7. JSON-LD（構造化データ）

#### 6-1. トップページにLocalBusinessスキーマを追加

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
  image: `${baseUrl}/og-image.png`,
};

// JSX内に追加
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
/>
```

#### 6-2. FAQページにFAQPageスキーマを追加

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

#### 6-3. 天然氷ページにArticleスキーマを追加

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

### タスク7: トップページの`<main>`タグ配置修正【優先度: 中】

**対象ファイル**: `app/(public)/HomeContent.tsx`
**影響する評価項目**: 2. セマンティックHTML

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

### タスク8: ヒーロー画像のalt属性改善【優先度: 中】

**対象ファイル**: `app/components/HeroSection.tsx`（46行目）
**影響する評価項目**: 3. アクセシビリティ、5. Image Optimization

**現状**: `alt="ヒーロー画像"` -- 画像の内容を説明していない。

**変更内容**:

```tsx
// 変更前
alt="ヒーロー画像"

// 変更後（実際の画像内容に合わせて調整すること）
alt="白熊堂の店舗外観"
```

**技術的根拠**: alt属性は画像の内容を説明するものであり、「ヒーロー画像」という技術用語はユーザーにとって無意味。実際の画像内容を記述することで、画像検索からの流入も期待できる。

---

### タスク9: FAQページのセマンティックHTML改善【優先度: 中】

**対象ファイル**: `app/components/FAQSection.tsx`
**影響する評価項目**: 2. セマンティックHTML、3. アクセシビリティ

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

### タスク10: 一部ページで`<main>`タグを追加【優先度: 中】

**対象ファイル**:
- `app/auth/signin/page.tsx` -- `<main>`なし
- `app/auth/error/page.tsx` -- `<main>`なし
- `app/(public)/shop/page.tsx` -- `<main>`なし

**影響する評価項目**: 2. セマンティックHTML、3. アクセシビリティ

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

### タスク11: フッターの見出し階層修正【優先度: 中】

**対象ファイル**: `app/components/Footer.tsx`（53行目、63行目、79行目）
**影響する評価項目**: 1. 論理的な見出し構造

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

### タスク12: copyright年の更新【優先度: 低】

**対象ファイル**: `app/components/Footer.tsx`（126行目）
**影響する評価項目**: なし（コード品質）

**現状**: `(C) 2024 白熊堂` とハードコードされている。

**変更内容**: 年を更新する、または開業年から現在年の範囲表記にする。

```tsx
// 変更案
<p className="text-xs text-muted-foreground">
  (C) 2024-{new Date().getFullYear()} 白熊堂
</p>
```

**補足**: Server Componentでレンダリングされるため、ビルド時の年が表示される。年が変わるたびに再デプロイが必要になるが、実運用上は問題にならない。

---

## 4. 優先順位付きタスクリスト

### Phase 0: 環境変数の設定

| # | タスク | 対象 | インパクト | 備考 |
|---|---|---|---|---|
| 0 | `SITE_URL` 環境変数の設定 | `.env` / Vercelダッシュボード | **前提** | **設定済み** |

### Phase 1: 基盤整備（SEOの土台）

| # | タスク | 対象ファイル | インパクト | 影響する評価項目 |
|---|---|---|---|---|
| 1 | metadataBaseとOGP画像の設定 | `app/layout.tsx` | **最大** | 4. Metadata API |
| 2 | about-iceのtitle修正 | `app/(public)/about-ice/page.tsx` | **最大** | 4. Metadata API |
| 3 | ページ別メタデータの設定 | `faq/page.tsx`、`shop/page.tsx` | **大** | 4. Metadata API |

### Phase 2: クロール最適化

| # | タスク | 対象ファイル | インパクト | 影響する評価項目 |
|---|---|---|---|---|
| 4 | sitemap.xml の実装 | `app/sitemap.ts`（新規） | **大** | 8. Next.js標準機能 |
| 5 | robots.txt の実装（クロール拒否） | `app/robots.ts`（新規） | **大** | 8. Next.js標準機能 |

### Phase 3: リッチリザルト対応

| # | タスク | 対象ファイル | インパクト | 影響する評価項目 |
|---|---|---|---|---|
| 6 | JSON-LD 構造化データの実装 | `HomeContent.tsx`、`faq/page.tsx`、`about-ice/page.tsx` | **大** | 7. JSON-LD |

### Phase 4: セマンティクスとアクセシビリティ改善

| # | タスク | 対象ファイル | インパクト | 影響する評価項目 |
|---|---|---|---|---|
| 7 | トップページの`<main>`配置修正 | `HomeContent.tsx` | **中** | 2. セマンティックHTML |
| 8 | ヒーロー画像のalt属性改善 | `HeroSection.tsx` | **中** | 3. アクセシビリティ / 5. Image |
| 9 | FAQセクションのセマンティクス改善 | `FAQSection.tsx` | **中** | 2. セマンティックHTML |
| 10 | 一部ページに`<main>`タグ追加 | `shop/page.tsx`、`signin/page.tsx`等 | **中** | 2. セマンティックHTML |
| 11 | フッターの見出し階層修正 | `Footer.tsx` | **中** | 1. 見出し構造 |
| 12 | copyright年の更新 | `Footer.tsx` | **低** | -- |

### 全タスク完了後の予想スコア

| # | 評価基準 | 現在 | 完了後 | 改善幅 |
|---|---|---|---|---|
| 1 | 論理的な見出し構造 | 75 | 85 | +10 |
| 2 | セマンティックHTML | 70 | 90 | +20 |
| 3 | アクセシビリティ | 80 | 90 | +10 |
| 4 | Metadata API | 40 | 90 | +50 |
| 5 | Image Optimization | 80 | 85 | +5 |
| 6 | Core Web Vitals | 75 | 75 | -- |
| 7 | JSON-LD（構造化データ） | 0 | 90 | +90 |
| 8 | Next.js標準機能の活用 | 70 | 90 | +20 |
| **総合** | | **60** | **87** | **+27** |

### カスタムドメイン取得後の作業

| # | タスク | 対象 |
|---|---|---|
| A | `SITE_URL` の変更 | `.env` と Vercelダッシュボード |
| B | `robots.ts` を本番用に切り替え（クロール許可 + sitemap指定） | `app/robots.ts` |

---

## 5. 現状で適切に実装されている項目（変更不要）

以下の項目は現状で適切に実装されているため、変更は不要。

- **`next/image`の使用**: alt属性、priority、sizes、lazy loadingが適切に設定されている
- **`next/link`の使用**: 内部遷移にすべて使用されている（プリフェッチはデフォルト有効）
- **`next/font`の使用**: Noto Sans JPが`next/font/google`で最適化されている（CSS変数割り当て、必要なweightのみ指定）
- **Server Components**: デフォルトでServer Componentsが使われ、Client Componentsは必要な箇所のみ
- **パフォーマンス最適化**: `next/dynamic`、`Promise.all`、`React.memo`、`useCallback`、Suspenseが活用されている
- **CLS対策**: `scrollbar-gutter: stable`、固定ヘッダーのスペーサー、画像のアスペクト比固定
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
| 画像sizes | `(min-width: 768px) 50vw, 100vw` -- レイアウトに合ったsizes指定 |
| レスポンシブ | モバイルファーストで、奇数/偶数セクションの左右入れ替え |
