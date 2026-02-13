# フロントエンド SEO リファクタリング手順書

## 1. 現状の総合評価

**スコア: 65 / 100点**

基本的なNext.jsのパフォーマンス最適化（`next/image`、`next/font`、`next/link`、動的インポート、Server Components）は適切に実装されている。一方で、SEOにおいて重要な**構造化データ（JSON-LD）の未実装**、**ページ別メタデータの未設定**、**sitemap/robotsの未実装**、**トップページのh1欠如**が大きな減点要因となっている。

### 項目別スコア

| 項目 | スコア | 概評 |
|---|---|---|
| Metadata API | 5/10 | ルートレイアウトのみ。ページ別・OG画像・canonical未設定 |
| 見出し構造 | 5/10 | トップページにh1なし。フッターのh3が階層を無視 |
| セマンティックHTML | 7/10 | header/main/nav/footer/section使用。一部ページでmain欠如 |
| 画像最適化 | 8/10 | alt/priority/sizes適切。ヒーロー画像のaltが非説明的 |
| 構造化データ（JSON-LD） | 0/10 | 未実装 |
| sitemap / robots | 0/10 | 未実装 |
| Core Web Vitals | 8/10 | LCP/CLS対策済み。動的インポート活用 |
| next/link / next/font | 9/10 | 適切に実装 |
| アクセシビリティ | 7/10 | aria-label、キーボード対応あり |

---

## 2. 重大な問題点（Critical Issues）

### Issue 1: トップページにh1タグがない

**対象ファイル**: `app/(public)/HomeContent.tsx`

**現状**: トップページの見出し構造がh2（カテゴリー名）から始まっている。h1が存在しないため、検索エンジンがページの主題を正確に把握できない。

**影響**: 検索エンジンがページの主題を判定できず、検索順位に直接的な悪影響がある。

---

### Issue 2: ページ別メタデータが未設定

**対象ファイル**: `app/(public)/page.tsx`、`app/(public)/faq/page.tsx`、`app/(public)/shop/page.tsx`

**現状**: すべてのページがルートレイアウト（`app/layout.tsx`）のメタデータをそのまま継承している。FAQページもショップページも同一のtitle/descriptionになっている。

**影響**: 検索結果に表示されるタイトルと説明文がすべて同じになり、各ページの個別の価値を検索エンジンに伝えられない。

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

## 3. 具体的な改善アドバイス

### タスク1: metadataBaseとOGP画像の設定【優先度: 最高】

**対象ファイル**: `app/layout.tsx`

**変更内容**: `metadataBase`を追加し、OGP画像を設定する。これがすべてのメタデータの基盤となる。

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://shirokumado.com"), // 本番URLに変更すること
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

### タスク2: トップページにh1を追加【優先度: 最高】

**対象ファイル**: `app/(public)/HomeContent.tsx`

**変更内容**: ヒーローセクションの下にh1を追加する。視覚的なデザインを壊さないよう`sr-only`（スクリーンリーダー専用）にするか、デザインに組み込む。

```tsx
// app/(public)/HomeContent.tsx の return 部分
<HeroSection />

{/* ページの主題を示すh1 - SEOとスクリーンリーダーのため */}
<h1 className="sr-only">白熊堂 - 川崎ラチッタデッラの本格かき氷</h1>

<div className="mx-auto max-w-7xl px-2 md:px-6 lg:px-8">
  <Separator className="bg-border/60" />
</div>
```

**技術的根拠**: h1はページの最も重要な見出しであり、検索エンジンがページの主題を判定する最重要要素。`sr-only`を使えばビジュアルデザインに影響を与えずにSEO効果を得られる。

**注意点**: `sr-only`によるh1の隠蔽はGoogleが推奨する手法ではないが、ビジュアルデザイン上の制約がある場合は許容される。理想的にはヒーローセクション内にテキストとして表示するのが最善。

---

### タスク3: ページ別メタデータの設定【優先度: 最高】

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

### タスク4: sitemap.xml の実装【優先度: 高】

**対象ファイル**: `app/sitemap.ts`（新規作成）

**変更内容**: Next.jsの`sitemap()`関数を使って動的にサイトマップを生成する。

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://shirokumado.com"; // 本番URLに変更すること

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
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

---

### タスク5: robots.txt の実装【優先度: 高】

**対象ファイル**: `app/robots.ts`（新規作成）

**変更内容**: Next.jsの`robots()`関数を使ってrobots.txtを生成する。

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://shirokumado.com"; // 本番URLに変更すること

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

**対象ファイル**: `app/(public)/HomeContent.tsx`、`app/(public)/faq/page.tsx`

#### 6-1. トップページにLocalBusinessスキーマを追加

```tsx
// app/(public)/HomeContent.tsx の return 部分に追加
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "白熊堂",
  description: "川崎ラチッタデッラにある本格かき氷のお店",
  url: "https://shirokumado.com",
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
  image: "https://shirokumado.com/og-image.jpg",
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

**技術的根拠**: `dangerouslySetInnerHTML`は原則使用禁止だが、JSON-LDの埋め込みは`<script type="application/ld+json">`内で行われるため、XSSリスクがない唯一の例外。Next.jsの公式ドキュメントでもこのパターンが推奨されている。

**期待される効果**:
- Google検索結果にリッチリザルト（営業時間、住所、FAQ）が表示される
- 「川崎 かき氷」などのローカル検索での表示順位向上

---

### タスク7: ヒーロー画像のalt属性改善【優先度: 中】

**対象ファイル**: `app/components/HeroSection.tsx`（49行目）

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

### タスク8: FAQページのセマンティックHTML改善【優先度: 中】

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

### タスク9: 一部ページで`<main>`タグを追加【優先度: 中】

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

### タスク10: フッターの見出し階層修正【優先度: 中】

**対象ファイル**: `app/components/Footer.tsx`（53行目、63行目、79行目）

**現状**: フッター内で`<h3>`が使われているが、先行する`<h2>`がない。これは見出し階層のスキップにあたる。

**変更内容**: フッター内の見出しタグをすべて削除し、代わりにスタイリング用の`<p>`や`<span>`に変更する。フッターの情報は補助的なものであり、見出しタグは不要。

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

### タスク11: copyright年の更新【優先度: 低】

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

### Phase 1: 基盤整備（SEOの土台）

| # | タスク | 対象ファイル | インパクト |
|---|---|---|---|
| 1 | metadataBaseとOGP画像の設定 | `app/layout.tsx` | **最大** — すべてのメタデータの基盤 |
| 2 | トップページにh1を追加 | `app/(public)/HomeContent.tsx` | **最大** — 検索エンジンの主題判定に直結 |
| 3 | ページ別メタデータの設定 | `app/(public)/faq/page.tsx` 等 | **大** — 検索結果の表示品質向上 |

### Phase 2: クロール最適化

| # | タスク | 対象ファイル | インパクト |
|---|---|---|---|
| 4 | sitemap.xml の実装 | `app/sitemap.ts`（新規） | **大** — クロール効率の向上 |
| 5 | robots.txt の実装 | `app/robots.ts`（新規） | **大** — クロールバジェットの最適化 |

### Phase 3: リッチリザルト対応

| # | タスク | 対象ファイル | インパクト |
|---|---|---|---|
| 6 | JSON-LD 構造化データの実装 | `HomeContent.tsx`、`faq/page.tsx` | **大** — リッチリザルト表示 |

### Phase 4: セマンティクスとアクセシビリティ改善

| # | タスク | 対象ファイル | インパクト |
|---|---|---|---|
| 7 | ヒーロー画像のalt属性改善 | `HeroSection.tsx` | **中** — 画像検索対策 |
| 8 | FAQセクションのセマンティクス改善 | `FAQSection.tsx` | **中** — 文書構造の改善 |
| 9 | 一部ページに`<main>`タグ追加 | `signin/page.tsx` 等 | **中** — アクセシビリティ |
| 10 | フッターの見出し階層修正 | `Footer.tsx` | **中** — 見出し階層の正規化 |
| 11 | copyright年の更新 | `Footer.tsx` | **低** — 正確性の確保 |

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
