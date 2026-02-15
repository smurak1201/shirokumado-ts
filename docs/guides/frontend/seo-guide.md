# SEO ガイド

## このドキュメントの役割

このドキュメントは「**Next.js App Router における SEO の仕組み**」を概念から解説します。メタデータ、JSON-LD、クロール制御、セマンティック HTML など、SEO に関わる技術を理解したいときに参照してください。

**関連ドキュメント**:
- [Next.js ガイド](./nextjs-guide.md): フレームワークの全体像（メタデータとアイコンの基本設定）
- [App Router ガイド](./app-router-guide.md): Server Components やルーティングの詳細

## 目次

- [SEO の全体像](#seo-の全体像)
  - [クロール → インデックス → ランキング](#クロール--インデックス--ランキング)
  - [Next.js で対応する範囲](#nextjs-で対応する範囲)
- [Metadata API](#metadata-api)
  - [メタデータとは](#メタデータとは)
  - [HTML の head 要素](#html-の-head-要素)
  - [主要なメタデータの種類](#主要なメタデータの種類)
  - [Next.js の Metadata API による自動生成](#nextjs-の-metadata-api-による自動生成)
  - [metadataBase](#metadatabase)
  - [title.template](#titletemplate)
  - [メタデータの継承とマージ](#メタデータの継承とマージ)
- [OGP（Open Graph Protocol）](#ogpopen-graph-protocol)
  - [OGP の仕組み](#ogp-の仕組み)
  - [OGP 画像の仕様](#ogp-画像の仕様)
  - [Twitter Card](#twitter-card)
  - [OGP の動作確認](#ogp-の動作確認)
- [JSON-LD（構造化データ）](#json-ld構造化データ)
  - [JSON-LD の仕組み](#json-ld-の仕組み)
  - [リッチリザルト](#リッチリザルト)
  - [主要なスキーマタイプ](#主要なスキーマタイプ)
  - [dangerouslySetInnerHTML を使う理由](#dangerouslysetinnerhtml-を使う理由)
  - [JSON-LD の動作確認](#json-ld-の動作確認)
- [クロール制御](#クロール制御)
  - [sitemap.xml](#sitemapxml)
  - [robots.txt](#robotstxt)
  - [ステージング環境での注意](#ステージング環境での注意)
- [セマンティック HTML](#セマンティック-html)
  - [セマンティック HTML とは](#セマンティック-html-とは)
  - [主要なセマンティック要素](#主要なセマンティック要素)
  - [見出し構造（h1 から h6）](#見出し構造h1-から-h6)
  - [main タグの役割](#main-タグの役割)
- [Core Web Vitals](#core-web-vitals)
  - [3 つの指標](#3-つの指標)
  - [LCP（Largest Contentful Paint）](#lcplargest-contentful-paint)
  - [CLS（Cumulative Layout Shift）](#clscumulative-layout-shift)
  - [INP（Interaction to Next Paint）](#inpinteraction-to-next-paint)
  - [測定ツール](#測定ツール)
- [環境変数による URL 管理](#環境変数による-url-管理)
  - [SITE_URL の管理](#site_url-の管理)
  - [NEXT_PUBLIC_ が不要な理由](#next_public_-が不要な理由)
  - [ドメイン変更時の手順](#ドメイン変更時の手順)
- [このアプリでの SEO 実装まとめ](#このアプリでの-seo-実装まとめ)
- [参考リンク](#参考リンク)

---

## SEO の全体像

SEO（Search Engine Optimization、検索エンジン最適化）とは、検索エンジン（主に Google）がページの内容を正しく理解し、適切に評価できるようにするための施策のこと。

### クロール → インデックス → ランキング

検索エンジンは、大きく 3 つの段階を経てページを検索結果に表示する。

```
1. クロール     Googlebot がページを巡回して HTML を取得する
                → robots.txt / sitemap.xml で制御

2. インデックス  取得した HTML の内容を解析し、データベースに登録する
                → メタデータ / セマンティック HTML / JSON-LD が重要

3. ランキング   検索クエリに対して、どのページを上位に表示するか決定する
                → コンテンツの質 / Core Web Vitals / 被リンク 等
```

SEO 対策は、この 3 段階のそれぞれで検索エンジンに正しい情報を伝え、適切に評価してもらうために行う。

### Next.js で対応する範囲

| 段階 | 対応する施策 | Next.js の機能 |
|---|---|---|
| クロール | クロール範囲の制御 | `robots.ts` / `sitemap.ts` |
| インデックス | ページ内容の正確な伝達 | Metadata API / JSON-LD / セマンティック HTML |
| ランキング | ページ表示速度の最適化 | `next/image` / `next/font` / Server Components |

---

## Metadata API

### メタデータとは

メタデータとは「データについてのデータ」、つまりページ本体のコンテンツではなく、ページに関する補足情報のこと。

```
ページのコンテンツ（ユーザーが目にする部分）:
  白熊堂のかき氷メニュー、天然氷の紹介文、FAQ の回答 ...

メタデータ（ユーザーの目には直接見えないが、裏側で働く情報）:
  ページのタイトル、説明文、OGP 画像、文字コード、ビューポート設定 ...
```

メタデータは主に以下の 3 者が利用する。

| 利用者 | 参照するメタデータ | 用途 |
|---|---|---|
| **ブラウザ** | title、viewport、charset、favicon | タブのタイトル表示、画面サイズの制御、文字化け防止 |
| **検索エンジン** | title、description、robots | 検索結果に表示するタイトルと説明文、クロールの制御 |
| **SNS クローラー** | og:title、og:description、og:image | シェア時のプレビューカード生成 |

### HTML の head 要素

メタデータは HTML の `<head>` 要素内に記述する。`<head>` はブラウザの画面には表示されないが、ページの動作や外部からの認識に影響する重要な領域。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <!-- ここがメタデータの領域（画面には表示されない） -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>白熊堂 | 本格かき氷のお店</title>
    <meta name="description" content="白熊堂は川崎ラチッタデッラにある..." />
    <meta property="og:title" content="白熊堂 | 本格かき氷のお店" />
    <meta property="og:image" content="https://example.com/og-image.png" />
    <link rel="icon" href="/icon.png" />
  </head>
  <body>
    <!-- ここがコンテンツの領域（画面に表示される） -->
    ...
  </body>
</html>
```

### 主要なメタデータの種類

| メタデータ | HTML タグ | 役割 | 表示される場所 |
|---|---|---|---|
| **タイトル** | `<title>` | ページの名前 | ブラウザのタブ、検索結果の見出し |
| **説明文** | `<meta name="description">` | ページの概要 | 検索結果のタイトルの下 |
| **文字コード** | `<meta charset="utf-8">` | 文字化け防止 | -- |
| **ビューポート** | `<meta name="viewport">` | モバイル表示の制御 | -- |
| **OGP** | `<meta property="og:...">` | SNS シェア時の情報 | SNS のプレビューカード |
| **ファビコン** | `<link rel="icon">` | サイトのアイコン | ブラウザのタブ、ブックマーク |

検索結果での表示例:

```
Google 検索結果:
  白熊堂 | 本格かき氷のお店              ← <title> の内容
  https://example.com                    ← URL
  白熊堂は川崎ラチッタデッラにある...      ← <meta name="description"> の内容
```

**注意:** Google は description をそのまま表示するとは限らない。検索クエリに応じて、ページ本文から適切な文章を自動的に抜粋して表示することがある。それでも description を設定しておくことで、デフォルトの説明文を制御できる。

### Next.js の Metadata API による自動生成

Next.js App Router では、上記の `<meta>` タグを直接 HTML に書く必要がない。`layout.tsx` や `page.tsx` に `metadata` オブジェクトを export するだけで、`<head>` 内のメタタグが自動生成される。

```
metadata オブジェクト（TypeScript）
        ↓ Next.js が自動変換
<meta> タグ（HTML の <head> 内）
```

例えば以下のように書くと:

```typescript
export const metadata: Metadata = {
  title: "白熊堂 | 本格かき氷のお店",
  description: "白熊堂は川崎ラチッタデッラにある...",
};
```

Next.js が以下の HTML を自動生成する:

```html
<title>白熊堂 | 本格かき氷のお店</title>
<meta name="description" content="白熊堂は川崎ラチッタデッラにある..." />
```

`charset` や `viewport` など基本的なメタタグは Next.js がデフォルトで設定するため、手動で指定する必要がない。

### metadataBase

`metadataBase` は、メタデータ内の相対 URL を絶対 URL に変換するための基点。

```typescript
// app/layout.tsx
metadataBase: new URL(process.env.SITE_URL!)
```

**設定しないと何が起きるか:**

| 状態 | 生成される HTML | 問題 |
|---|---|---|
| 未設定 | `<meta property="og:image" content="/og-image.png" />` | SNS のクローラーは相対 URL を解釈できない |
| 設定済み | `<meta property="og:image" content="https://example.com/og-image.png" />` | 正しい絶対 URL が生成される |

影響を受けるフィールド: `openGraph.images`、`twitter.images`、`alternates.canonical` など。

### title.template

`title.template` を設定すると、子ページの title に自動的にサイト名が付与される。

```
ルートレイアウト（app/layout.tsx）:
  title.default  = "白熊堂 | 本格かき氷のお店"    ← トップページで使われる
  title.template = "%s | 白熊堂"                  ← 子ページの展開ルール

子ページ（app/(public)/faq/page.tsx）:
  title = "よくある質問（FAQ）"
  → 展開結果: "よくある質問（FAQ） | 白熊堂"
```

**注意点:** `title.template` は HTML の `<title>` タグにのみ適用される。`openGraph.title` には適用されないため、OGP 用にはフルタイトルを別途指定する必要がある。

```typescript
// app/(public)/faq/page.tsx
export const metadata: Metadata = {
  title: "よくある質問（FAQ）",            // template が適用 → "よくある質問（FAQ） | 白熊堂"
  openGraph: {
    title: "よくある質問（FAQ） | 白熊堂",  // template の影響を受けないのでフルタイトルを指定
  },
};
```

### メタデータの継承とマージ

Next.js の Metadata API では、親レイアウトのメタデータが子ページに自動的に継承される。子ページで同じフィールドを指定すると上書きされる。

```
app/layout.tsx（ルート）
  title.default = "白熊堂 | 本格かき氷のお店"
  description   = "白熊堂は川崎ラチッタデッラにある..."
  openGraph     = { ... }
  twitter       = { ... }
      ↓ 継承
app/(public)/faq/page.tsx
  title           = "よくある質問（FAQ）"        ← 上書き
  description     = "白熊堂への営業時間..."       ← 上書き
  openGraph.title = "よくある質問..."             ← 上書き
  （twitter は指定なし → ルートの設定を継承）
```

ルートレイアウトで共通設定をしておけば、各ページでは「そのページ固有の部分」だけを記述すればよい。

---

## OGP（Open Graph Protocol）

### OGP の仕組み

OGP は、Web ページの URL が SNS（X/Twitter、LINE、Facebook 等）でシェアされた際に、リッチなプレビューカードとして表示するための仕組み。

```
OGP なし:
  https://example.com/faq ← URL だけが表示される

OGP あり:
  ┌──────────────────────────────┐
  │  [og-image.png]              │
  │  よくある質問（FAQ） | 白熊堂   │
  │  白熊堂への営業時間、予約...    │
  └──────────────────────────────┘
  ↑ タイトル・説明文・画像付きのカードが表示される
```

Next.js では `metadata` オブジェクト内の `openGraph` フィールドで設定する。

```typescript
openGraph: {
  title: "白熊堂 | 本格かき氷のお店",
  description: "...",
  type: "website",
  locale: "ja_JP",
  siteName: "白熊堂",
  images: [
    { url: "/og-image.png", width: 1200, height: 630, alt: "白熊堂" },
  ],
},
```

### OGP 画像の仕様

| 項目 | 推奨値 | 理由 |
|---|---|---|
| サイズ | 1200 x 630px | 主要 SNS で最も表示が安定するサイズ |
| 形式 | PNG / JPG | 透過が必要なら PNG、写真系なら JPG |
| ファイルサイズ | 1MB 以下 | 大きすぎるとクローラーがタイムアウトする |
| 配置場所 | `public/og-image.png` | Next.js の静的ファイル配信で自動提供 |

### Twitter Card

X（旧 Twitter）は独自のメタタグ（`twitter:card` 等）も参照する。指定がない場合は OGP のフォールバックを使うが、明示的に設定するのが確実。

```typescript
twitter: {
  card: "summary_large_image",   // 大きな画像付きカード
  title: "白熊堂 | 本格かき氷のお店",
  description: "...",
  images: ["/og-image.png"],
}
```

`card` の種類:
- `"summary"` -- 小さいサムネイル + テキスト
- `"summary_large_image"` -- 大きい画像 + テキスト（画像が映えるサイト向け）

### OGP の動作確認

| ツール | URL | 用途 |
|---|---|---|
| X Card Validator | https://cards-dev.twitter.com/validator | X でのカード表示を確認 |
| Facebook Debugger | https://developers.facebook.com/tools/debug/ | Facebook でのシェア表示を確認 |
| OpenGraph.xyz | https://www.opengraph.xyz/ | 汎用的な OGP デバッガー |
| LINE | LINE のトーク画面に URL を貼付 | LINE でのプレビューを確認 |

---

## JSON-LD（構造化データ）

### JSON-LD の仕組み

JSON-LD（JavaScript Object Notation for Linked Data）は、ページの内容を検索エンジンが理解しやすい構造化された形式で記述するもの。HTML の `<script type="application/ld+json">` 内に JSON 形式で埋め込む。

```
通常の HTML:
  検索エンジンは HTML の文章を解析して
  「このページは何について書かれているか」を推測する

JSON-LD:
  「このページはレストラン（Restaurant）です。
   名前は白熊堂、住所は〇〇、電話番号は〇〇」
  と構造化されたデータで明示的に伝える
```

### リッチリザルト

JSON-LD を正しく実装すると、Google 検索結果に通常のリンクより目立つ「リッチリザルト」が表示される可能性がある。

```
通常の検索結果:
  白熊堂 | 本格かき氷のお店
  https://example.com
  白熊堂は川崎ラチッタデッラにある...

リッチリザルト（LocalBusiness / Restaurant）:
  白熊堂
  ★★★★☆ 4.5 (120件) - かき氷店
  営業中 - 11:00-21:00
  川崎市川崎区小川町4-1
  070-9157-3772

リッチリザルト（FAQPage）:
  よくある質問 - 白熊堂
  ▶ 予約はできますか？
    はい、お電話でご予約を承っております...
  ▶ 支払い方法は？
    現金、クレジットカード...
```

### 主要なスキーマタイプ

JSON-LD で使用するスキーマは [schema.org](https://schema.org/) で定義されている。このアプリで使用しているスキーマは以下の通り。

| スキーマ | 用途 | リッチリザルト | このアプリでの使用箇所 |
|---|---|---|---|
| `Restaurant` | 店舗情報 | 営業時間、住所、電話番号 | `app/(public)/HomeContent.tsx` |
| `FAQPage` | よくある質問 | 質問と回答が検索結果に表示 | `app/(public)/faq/page.tsx` |
| `Article` | 記事コンテンツ | 著者、公開日 | `app/(public)/about-ice/page.tsx` |

**このアプリでの実装例（Restaurant スキーマ）:**

```typescript
// app/(public)/HomeContent.tsx
const localBusinessJsonLd = {
  "@context": "https://schema.org",   // schema.org の語彙を使用することを宣言
  "@type": "Restaurant",              // このデータの種類
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
  openingHoursSpecification: { ... },
  servesCuisine: "かき氷",
  priceRange: "¥",
  image: `${BASE_URL}/og-image.png`,
};
```

### dangerouslySetInnerHTML を使う理由

JSON-LD の埋め込みでは `dangerouslySetInnerHTML` を使用する。通常このプロパティは XSS リスクがあるため使用禁止だが、JSON-LD の場合は例外。

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
/>
```

**安全な理由:**
1. `<script type="application/ld+json">` はブラウザによって JavaScript として実行されない
2. `JSON.stringify()` は入力をエスケープするため、注入攻撃ができない
3. Next.js の公式ドキュメントでもこのパターンが推奨されている

### JSON-LD の動作確認

| ツール | URL | 用途 |
|---|---|---|
| Google リッチリザルトテスト | https://search.google.com/test/rich-results | リッチリザルトの対応状況を検証 |
| Schema.org バリデーター | https://validator.schema.org/ | スキーマの文法チェック |

---

## クロール制御

### sitemap.xml

サイトマップは、検索エンジンに「このサイトにはこれらのページがあります」と伝える XML ファイル。

```
検索エンジンはリンクを辿ってページを発見するが、
リンクが少ないページや新しいページは発見されにくい。
サイトマップを提供することで、すべてのページを確実に伝えられる。
```

Next.js では `app/sitemap.ts` を作成すると、`/sitemap.xml` の URL で自動的にアクセス可能になる。

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://example.com",       // ページの URL（絶対 URL で指定）
      lastModified: new Date(),         // 最終更新日
      changeFrequency: "weekly",        // 更新頻度のヒント
      priority: 1,                      // 重要度（0.0 から 1.0）
    },
  ];
}
```

各フィールドの意味:

| フィールド | 説明 | 補足 |
|---|---|---|
| `url` | ページの URL | 絶対 URL で指定する必要がある |
| `lastModified` | 最終更新日 | Googlebot が再クロールの判断材料にする |
| `changeFrequency` | 更新頻度のヒント | あくまでヒント。Googlebot は必ずしも従わない |
| `priority` | サイト内での相対的な重要度 | 他サイトとの比較には使われない。自サイト内の優先順位 |

### robots.txt

`robots.txt` は、検索エンジンのクローラーに「どのページをクロールしてよいか」を指示するファイル。

```
User-agent: *            ← すべてのクローラーに対して
Disallow: /dashboard/    ← /dashboard/ 以下のクロールを拒否
Disallow: /auth/         ← /auth/ 以下のクロールを拒否
Disallow: /api/          ← /api/ 以下のクロールを拒否
Allow: /                 ← それ以外はクロール許可

Sitemap: https://example.com/sitemap.xml  ← サイトマップの場所を通知
```

Next.js では `app/robots.ts` を作成すると、`/robots.txt` の URL で自動的にアクセス可能になる。

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

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

**重要な概念:** `robots.txt` の `Disallow` はクロールを拒否するだけで、インデックス（検索結果への登録）を完全には防げない。他のサイトからリンクされている場合、URL 自体はインデックスされる可能性がある。完全にインデックスを防ぎたい場合は、HTML の `<meta name="robots" content="noindex">` も併用する必要がある。

### ステージング環境での注意

カスタムドメイン取得前（Vercel の URL で公開中）は、検索エンジンにインデックスされないよう注意が必要。

```
問題:
  Vercel の URL（xxxx.vercel.app）が検索結果に登録される
  → カスタムドメイン取得後、同じコンテンツが 2 つの URL で存在する（重複コンテンツ）
  → 検索エンジンの評価が分散し、ランキングが下がる

対策:
  カスタムドメイン取得前は robots.txt で全クロールを拒否する
```

```typescript
// カスタムドメイン取得前（現在の設定）
rules: [{ userAgent: "*", disallow: "/" }]

// カスタムドメイン取得後に切り替える設定
rules: [{
  userAgent: "*",
  allow: "/",
  disallow: ["/dashboard/", "/auth/", "/api/"],
}]
```

---

## セマンティック HTML

### セマンティック HTML とは

セマンティック（意味論的）HTML とは、HTML タグをその意味に沿って正しく使うこと。検索エンジンとスクリーンリーダー（視覚障害者向け読み上げソフト）の両方が、ページの構造を正確に理解できるようになる。

```
セマンティクスが弱い:                  セマンティクスが強い:
  <div class="header">                  <header>
    <div class="nav">...</div>            <nav>...</nav>
  </div>                                </header>
  <div class="content">...</div>        <main>...</main>
  <div class="footer">...</div>         <footer>...</footer>
```

どちらもブラウザ上の見た目は同じだが、検索エンジンとスクリーンリーダーにとっては右側の方が構造を理解しやすい。

### 主要なセマンティック要素

| 要素 | 意味 | 使い方 |
|---|---|---|
| `<header>` | ヘッダー | サイトのロゴ、ナビゲーション |
| `<nav>` | ナビゲーション | メニューリンクの集まり |
| `<main>` | ページの主コンテンツ | 1 ページに 1 つだけ |
| `<article>` | 独立したコンテンツ | ブログ記事、ニュース記事 |
| `<section>` | テーマ的にまとまった部分 | 見出し付きのコンテンツブロック |
| `<footer>` | フッター | 著作権表示、連絡先 |

### 見出し構造（h1 から h6）

見出しタグは文書の論理的な階層を表す。スタイリング目的ではなく、文書構造を示すために使う。

```
正しい見出し構造:
  h1: 白熊堂                ← ページのメインタイトル
    h2: 天然氷について       ← セクションの見出し
    h2: メニュー
      h3: 期間限定           ← サブセクションの見出し
      h3: 定番メニュー

間違った見出し構造（階層のスキップ）:
  h1: 白熊堂
    h3: 住所                ← h2 がないのに h3 を使っている（NG）
    h3: 営業時間
```

**フッターでの注意:** フッター内の「住所」「営業時間」などの項目名は文書の見出しではなくラベル。`<h3>` ではなく `<p>` を使い、スタイリングは CSS クラスで行う。

### main タグの役割

`<main>` は「このページで最も重要なコンテンツはここです」と検索エンジンとスクリーンリーダーに伝える要素。

- 1 ページに 1 つだけ使用する
- ヘッダーやフッターは含めない
- ページのメインコンテンツ全体を囲む

```tsx
// このアプリのトップページ（HomeContent.tsx）での使い方
<FixedHeader />         {/* ヘッダー: main の外 */}
<HeroSection />         {/* ヒーロー: main の外 */}

<main>
  <section>...</section>    {/* 天然氷紹介: main の中 */}
  <div>
    <ProductCategoryTabs />  {/* 商品一覧: main の中 */}
  </div>
</main>

<Footer />              {/* フッター: main の外 */}
```

---

## Core Web Vitals

Core Web Vitals は、Google がページの「ユーザー体験の質」を測定する 3 つの指標。2021 年からランキング要因にもなっている。

### 3 つの指標

| 指標 | 名前 | 測定内容 | 良好 | 要改善 |
|---|---|---|---|---|
| LCP | Largest Contentful Paint | 最大コンテンツの表示時間 | 2.5 秒以内 | 4.0 秒以上で不良 |
| CLS | Cumulative Layout Shift | レイアウトのずれ量 | 0.1 以下 | 0.25 以上で不良 |
| INP | Interaction to Next Paint | 操作への応答時間 | 200ms 以下 | 500ms 以上で不良 |

### LCP（Largest Contentful Paint）

ページ内で最も大きなコンテンツ（通常はヒーロー画像やメインの見出し）が表示されるまでの時間。

**Next.js での対策:**

| 対策 | 説明 | このアプリでの実装 |
|---|---|---|
| `priority` 属性 | ヒーロー画像の遅延読み込みを無効化 | `HeroSection.tsx` |
| `sizes` 属性 | 必要なサイズの画像だけを配信 | `ProductTile.tsx` 等 |
| `next/font` | フォント読み込みの最適化 | `layout.tsx`（Noto Sans JP） |
| `next/dynamic` | 重いコンポーネントの遅延読み込み | `page.tsx`（ProductGrid） |

### CLS（Cumulative Layout Shift）

ページ読み込み中に要素の位置がずれる量。画像の読み込みでコンテンツが押し下げられるなど、ユーザーにとってストレスになる現象。

**Next.js での対策:**

| 対策 | 説明 | このアプリでの実装 |
|---|---|---|
| `width`/`height` or `fill` | 画像の領域を事前に確保 | `next/image` で全画像に設定 |
| `AspectRatio` | アスペクト比を固定 | `ProductTile.tsx` |
| ヘッダースペーサー | `position: fixed` による領域不足を補う | `HomeContent.tsx` 等 |
| `scrollbar-gutter: stable` | スクロールバー出現時のずれを防止 | `globals.css` |

### INP（Interaction to Next Paint）

ユーザーがクリックやタップをしてから、画面が更新されるまでの時間。

**Next.js での対策:**

| 対策 | 説明 | このアプリでの実装 |
|---|---|---|
| `React.memo` | 不要な再レンダリングを防止 | `ProductTile.tsx` |
| `useCallback` | イベントハンドラーのメモ化 | 各 Client Component |
| `next/dynamic` | 重いコンポーネントの遅延読み込み | `page.tsx` |

### 測定ツール

| ツール | 用途 |
|---|---|
| [PageSpeed Insights](https://pagespeed.web.dev/) | URL を入力して各指標を計測 |
| Chrome DevTools（Lighthouse タブ） | ローカル環境での計測 |
| Google Search Console（Core Web Vitals レポート） | 本番サイトの実測データ（要ドメイン登録） |

---

## 環境変数による URL 管理

### SITE_URL の管理

サイトのベース URL は複数のファイルで使用される。

| ファイル | 用途 |
|---|---|
| `app/layout.tsx` | `metadataBase` |
| `app/sitemap.ts` | 各ページの URL |
| `app/robots.ts` | サイトマップの URL |
| `app/(public)/HomeContent.tsx` | JSON-LD の `url`、`image` |
| `app/(public)/about-ice/page.tsx` | JSON-LD の `mainEntityOfPage` |

これらすべてに URL をハードコードすると、ドメイン変更時に全ファイルの修正が必要になる。環境変数 `SITE_URL` で一元管理することで、変更箇所を 2 箇所（ローカルの `.env` と Vercel ダッシュボード）に限定できる。

### NEXT_PUBLIC_ が不要な理由

Next.js の環境変数には 2 種類ある。

| 種類 | アクセス可能な範囲 | 用途 |
|---|---|---|
| `SITE_URL` | サーバーサイドのみ | Server Component で使用する変数 |
| `NEXT_PUBLIC_SITE_URL` | サーバー + クライアントの両方 | クライアントでも使用する変数 |

`SITE_URL` を使用するファイル（`layout.tsx`、`sitemap.ts`、`robots.ts`、`page.tsx`）はすべて Server Component であり、クライアントサイドからアクセスする必要がない。`NEXT_PUBLIC_` プレフィックスを付けると、ビルド時にクライアントバンドルに URL が埋め込まれるため、不要な情報公開になる。

### ドメイン変更時の手順

カスタムドメインを取得した場合、以下を変更する。コードの修正は不要。

1. ローカルの `.env` の `SITE_URL` を新しいドメインに変更
2. Vercel ダッシュボードの **Settings > Environment Variables** の `SITE_URL` を変更
3. `app/robots.ts` をクロール許可の設定に切り替え

---

## このアプリでの SEO 実装まとめ

| 項目 | ファイル | 内容 |
|---|---|---|
| **メタデータ基盤** | `app/layout.tsx` | `metadataBase` / `title.template` / OGP / Twitter Card |
| **FAQ メタデータ** | `app/(public)/faq/page.tsx` | ページ固有の title / description / OGP |
| **天然氷メタデータ** | `app/(public)/about-ice/page.tsx` | ページ固有の title / description / OGP |
| **ショップメタデータ** | `app/(public)/shop/page.tsx` | ページ固有の title / description / OGP |
| **サイトマップ** | `app/sitemap.ts` | 全公開ページの URL を登録 |
| **robots.txt** | `app/robots.ts` | 現在は全クロール拒否（ドメイン取得後に切替） |
| **OGP 画像** | `public/og-image.png` | 1200 x 630px |
| **PWA マニフェスト** | `public/manifest.webmanifest` | アプリ名、アイコン |
| **JSON-LD: Restaurant** | `app/(public)/HomeContent.tsx` | 店舗名、住所、営業時間、電話番号 |
| **JSON-LD: FAQPage** | `app/(public)/faq/page.tsx` | FAQ データから動的生成 |
| **JSON-LD: Article** | `app/(public)/about-ice/page.tsx` | 天然氷の記事情報 |

---

## 参考リンク

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata) - 公式ドキュメント
- [Next.js generateSitemaps](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) - サイトマップの公式ガイド
- [Google 検索セントラル - SEO スターターガイド](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) - Google 公式の SEO 入門
- [schema.org](https://schema.org/) - 構造化データのスキーマ定義
- [Google リッチリザルトテスト](https://search.google.com/test/rich-results) - JSON-LD の検証ツール
- [web.dev - Core Web Vitals](https://web.dev/articles/vitals) - パフォーマンス指標の詳細
- [PageSpeed Insights](https://pagespeed.web.dev/) - パフォーマンス計測ツール
