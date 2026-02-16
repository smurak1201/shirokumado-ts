# SEO整備 監査・改善

**日付**: 2026-02-16
**ブランチ**: claude/audit-seo-setup-Vb0tP
**対象**: SEO関連の全公開ページ・設定ファイル
**ステータス**: 完了
**完了日**: 2026-02-16

> **前提**: `robots.ts` でのクロール拒否はカスタムドメイン取得前の暫定措置として意図的に行っている。本仕様書ではそれ以外のSEO整備を対象とする。

---

## 現状の監査結果

### 整備済み（良好）

- `next/font/google` によるフォント最適化（Noto Sans JP）
- JSON-LD 構造化データ（トップ: Restaurant、about-ice: Article、faq: FAQPage）
- `next/image` の全面採用と適切な alt 属性
- `metadataBase` による絶対URL解決（`app/layout.tsx`）
- `sitemap.ts` の実装（全公開ページを網羅）
- OGP・Twitter Card の基本設定（ルートレイアウト）
- セマンティックHTML（`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`）
- `app/icon.png`, `app/apple-icon.png` によるファビコン自動生成
- `html lang="ja"` の設定
- ヒーロー画像の `priority` 属性（LCP対策）

### 改善が必要な項目

| # | 項目 | 重要度 |
|---|------|:------:|
| 1 | トップページに固有の `metadata` がない | 高 |
| 2 | 各ページに `canonical` URL が未設定 | 高 |
| 3 | ダッシュボードに `noindex` が未設定 | 高 |
| 4 | 404ページに `noindex` が未設定 | 中 |
| 5 | `manifest.webmanifest` に `description`・`lang` が未設定 | 中 |
| 6 | 各ページのOGPに `type`・`locale`・`siteName`・`images` が不足 | 中 |

---

## 進捗状況

| #   | タスク                                           | 優先度 | ステータス | 備考 |
| --- | ------------------------------------------------ | :----: | :--------: | ---- |
| 1   | トップページに固有のmetadataを追加               |   高   |    [o]     |      |
| 2   | 各公開ページにcanonical URLを設定                |   高   |    [o]     |      |
| 3   | ダッシュボードにnoindexを設定                    |   高   |    [o]     |      |
| 4   | 404ページにnoindexを設定                         |   中   |    [o]     |      |
| 5   | manifest.webmanifestにdescription・langを追加    |   中   |    [o]     |      |
| 6   | 各ページのOGP設定を補完                          |   中   |    [o]     |      |
| 7   | 動作確認・ビルドテスト                           |   -    |    [o]     | リント通過、型チェック通過（既存のHeroSection.tsxの画像import警告のみ） |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

サイトのSEO設定を監査した結果、基本的な整備は良好だが、いくつかの改善点が見つかった。カスタムドメイン取得・本番公開前に、クロール許可以外のSEO設定を整えておく。

### 課題

- **課題1**: トップページが `metadata` をexportしておらず、ルートレイアウトの `default` に依存しているため、ページ固有のSEO情報が設定できない
- **課題2**: `canonical` URLが未設定のため、重複コンテンツ問題のリスクがある
- **課題3**: ダッシュボード（管理画面）に `noindex` が未設定のため、万が一クロールされた場合にインデックスされてしまう
- **課題4**: 各ページのOGP設定が不完全で、SNSシェア時に最適な情報が表示されない可能性がある

### 設計方針

- **Next.js Metadata API を活用**: ファイルベースではなくオブジェクトベースの metadata export で統一
- **ルートレイアウトの継承を活用**: 共通設定はルートに置き、各ページでは差分のみ上書き
- **最小限の変更**: 既存のコードを壊さず、metadata の追加・補完のみ行う

### CLAUDE.md準拠事項

本改修では以下のルールに従うこと。

**設計原則**:

- **YAGNI**: 現時点で必要な機能のみ実装する
- **KISS**: 最もシンプルな解決策を選ぶ

**コード品質**:

- 未使用のインポートは削除すること
- 関数の引数と返り値には型を付けること
- リントエラーを解消すること（`npm run lint`）

**Server/Client Components**:

- デフォルトで Server Components を使用（metadata は Server Components でのみ export 可能）

---

## タスク詳細

### タスク1: トップページに固有のmetadataを追加 [完了]

**対象ファイル**:

- `app/(public)/page.tsx`（既存・変更）

**問題点**:

トップページで `metadata` がexportされておらず、ルートレイアウトの `default` タイトル（`"白熊堂 | 本格かき氷のお店"`）がそのまま使われている。ルートのdefaultと同じ値であっても、明示的にexportすることでページ固有のmetadataとして認識され、`alternates.canonical` の設定場所にもなる。

**修正内容**:

`app/(public)/page.tsx` に `metadata` をexportする。トップページはルートと同じ title/description でよいが、canonical を含めて明示的に設定する。

**実装例**:

```tsx
// app/(public)/page.tsx に追加（importの後、dynamic の前）
import type { Metadata } from "next";

const BASE_URL = process.env.SITE_URL!;

export const metadata: Metadata = {
  title: "白熊堂 | 本格かき氷のお店",
  description:
    "白熊堂は川崎ラチッタデッラにある本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
  alternates: {
    canonical: BASE_URL,
  },
};
```

**注意**: `title` に直接文字列を指定すると、ルートの `template`（`"%s | 白熊堂"`）が適用されず、指定した文字列がそのまま使われる。トップページは「白熊堂 | 本格かき氷のお店」をそのまま表示したいので、`title.absolute` ではなく文字列直指定でよい。ただし、Next.js の仕様では `layout.tsx` で `title.template` が設定されている場合、子ページで文字列を指定すると template が適用される。トップページでは template 適用を避けたいため `title.absolute` を使うこと。

```tsx
export const metadata: Metadata = {
  title: {
    absolute: "白熊堂 | 本格かき氷のお店",
  },
  // ...
};
```

**チェックリスト**:

- [o] `app/(public)/page.tsx` に `metadata` をexport
- [o] `title.absolute` でルートと同じタイトルを設定
- [o] `description` を設定
- [o] `alternates.canonical` を設定

---

### タスク2: 各公開ページにcanonical URLを設定 [完了]

**対象ファイル**:

- `app/(public)/about-ice/page.tsx`（既存・変更）
- `app/(public)/faq/page.tsx`（既存・変更）
- `app/(public)/shop/page.tsx`（既存・変更）

**問題点**:

`alternates.canonical` が未設定のため、検索エンジンが正規URLを判断できない。`metadataBase` は相対パスを絶対パスに変換するが、canonical リンクタグの自動出力は行わない。

**修正内容**:

各ページの `metadata` に `alternates.canonical` を追加する。

**実装例**:

```tsx
// app/(public)/about-ice/page.tsx
// 既存の baseUrl 定数を活用

export const metadata: Metadata = {
  title: "天然氷について",
  description: "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
  alternates: {
    canonical: `${baseUrl}/about-ice`,
  },
  openGraph: {
    title: "天然氷について | 白熊堂",
    description: "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
    type: "website",
  },
};
```

```tsx
// app/(public)/faq/page.tsx
// BASE_URL定数を追加する必要がある

const BASE_URL = process.env.SITE_URL!;

export const metadata: Metadata = {
  title: "よくある質問（FAQ）",
  description: "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: "よくある質問（FAQ） | 白熊堂",
    description: "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
  },
};
```

```tsx
// app/(public)/shop/page.tsx
// BASE_URL定数を追加する必要がある

const BASE_URL = process.env.SITE_URL!;

export const metadata: Metadata = {
  title: "オンラインショップ",
  description: "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
  alternates: {
    canonical: `${BASE_URL}/shop`,
  },
  openGraph: {
    title: "オンラインショップ | 白熊堂",
    description: "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
  },
};
```

**チェックリスト**:

- [o] `about-ice/page.tsx` に `alternates.canonical` を追加
- [o] `faq/page.tsx` に `alternates.canonical` を追加（`BASE_URL` 定数も追加）
- [o] `shop/page.tsx` に `alternates.canonical` を追加（`BASE_URL` 定数も追加）

---

### タスク3: ダッシュボードにnoindexを設定 [完了]

**対象ファイル**:

- `app/dashboard/layout.tsx`（既存・変更）

**問題点**:

管理画面（ダッシュボード）に `noindex` が設定されていない。`robots.ts` で全体のクロールを拒否しているため現時点では問題ないが、カスタムドメイン取得後にクロールを許可した際、管理画面がインデックスされるリスクがある。

**修正内容**:

`app/dashboard/layout.tsx` の `metadata` に `robots: { index: false, follow: false }` を追加する。

**実装例（11行目付近のmetadataを変更）**:

```tsx
// 変更前
export const metadata: Metadata = {
  title: {
    default: "ダッシュボード | 白熊堂",
    template: "%s | 白熊堂 管理画面",
  },
  description: "白熊堂の管理画面",
  openGraph: {
    title: "ダッシュボード | 白熊堂",
    description: "白熊堂の管理画面",
  },
};

// 変更後
export const metadata: Metadata = {
  title: {
    default: "ダッシュボード | 白熊堂",
    template: "%s | 白熊堂 管理画面",
  },
  description: "白熊堂の管理画面",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "ダッシュボード | 白熊堂",
    description: "白熊堂の管理画面",
  },
};
```

**チェックリスト**:

- [o] `app/dashboard/layout.tsx` の metadata に `robots: { index: false, follow: false }` を追加

---

### タスク4: 404ページにnoindexを設定 [完了]

**対象ファイル**:

- `app/not-found.tsx`（既存・変更）

**問題点**:

404ページに `metadata` がexportされていない。404ページがインデックスされると、検索結果にエラーページが表示される可能性がある。

**修正内容**:

`app/not-found.tsx` に `metadata` をexportし、`robots: { index: false }` を設定する。

**実装例（import文の後に追加）**:

```tsx
// app/not-found.tsx に追加
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: {
    index: false,
  },
};
```

**チェックリスト**:

- [o] `app/not-found.tsx` に `metadata` をexport
- [o] `title` と `robots.index: false` を設定

---

### タスク5: manifest.webmanifestにdescription・langを追加 [完了]

**対象ファイル**:

- `public/manifest.webmanifest`（既存・変更）

**問題点**:

`description` と `lang` フィールドが未設定。PWAとしての情報が不完全で、ブラウザやストアでの表示に影響する可能性がある。

**修正内容**:

`description`、`lang`、`categories` を追加する。

**実装例**:

```json
{
  "name": "白熊堂 | 本格かき氷のお店",
  "short_name": "白熊堂",
  "description": "川崎ラチッタデッラにある本格かき氷のお店。ふわふわの日光天然氷とこだわりのシロップでお待ちしています。",
  "lang": "ja",
  "categories": ["food"],
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff"
}
```

**チェックリスト**:

- [o] `description` を追加
- [o] `lang: "ja"` を追加
- [o] `categories: ["food"]` を追加

---

### タスク6: 各ページのOGP設定を補完 [完了]

**対象ファイル**:

- `app/(public)/about-ice/page.tsx`（既存・変更）
- `app/(public)/faq/page.tsx`（既存・変更）
- `app/(public)/shop/page.tsx`（既存・変更）

**問題点**:

各ページのOGP設定に `type`・`locale`・`siteName`・`images` が不足している。ルートレイアウトで設定している値の一部は Next.js のマージ動作で継承されるが、`images` は子ページで `openGraph` を設定すると上書きされるため、明示的に指定する必要がある。

**修正内容**:

各ページの `openGraph` に不足しているフィールドを追加する。Next.js の metadata マージ仕様では、`openGraph` を子ページで定義すると親の `openGraph` をシャロ―マージ（トップレベルのキーのみマージ）する。`images` はネストされたフィールドなので、子で `openGraph` を定義する場合は `images` も明示的に含める必要がある。

**実装例**:

```tsx
// app/(public)/about-ice/page.tsx
export const metadata: Metadata = {
  title: "天然氷について",
  description: "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
  alternates: {
    canonical: `${baseUrl}/about-ice`,
  },
  openGraph: {
    title: "天然氷について | 白熊堂",
    description: "白熊堂が使用する日光・松月氷室の天然氷。冬の山奥で自然の力だけで生まれる特別な氷の物語。",
    type: "website",
    url: `${baseUrl}/about-ice`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "白熊堂 - 本格かき氷のお店" }],
  },
};
```

```tsx
// app/(public)/faq/page.tsx
export const metadata: Metadata = {
  title: "よくある質問（FAQ）",
  description: "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: "よくある質問（FAQ） | 白熊堂",
    description: "白熊堂への営業時間、予約、お支払い方法などのよくある質問と回答をまとめています。",
    type: "website",
    url: `${BASE_URL}/faq`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "白熊堂 - 本格かき氷のお店" }],
  },
};
```

```tsx
// app/(public)/shop/page.tsx
export const metadata: Metadata = {
  title: "オンラインショップ",
  description: "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
  alternates: {
    canonical: `${BASE_URL}/shop`,
  },
  openGraph: {
    title: "オンラインショップ | 白熊堂",
    description: "白熊堂のオンラインショップは現在準備中です。もうしばらくお待ちください。",
    type: "website",
    url: `${BASE_URL}/shop`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "白熊堂 - 本格かき氷のお店" }],
  },
};
```

**チェックリスト**:

- [o] `about-ice/page.tsx` の OGP に `url`・`images` を追加
- [o] `faq/page.tsx` の OGP に `type`・`url`・`images` を追加
- [o] `shop/page.tsx` の OGP に `type`・`url`・`images` を追加

---

### タスク7: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと（※環境のネットワーク制限によりGoogle Fontsフェッチ不可のため `next build` は実行不可。`tsc --noEmit` で型チェック通過を確認）
   - [o] TypeScriptエラーがないこと（既存の `HeroSection.tsx` の画像import警告のみ。今回の変更に起因するエラーなし）

2. **リント確認** (`npm run lint`)
   - [o] リントエラーがないこと

3. **品質チェックリスト**（CLAUDE.md準拠）
   - [o] この機能は**今**必要か？（YAGNI）
   - [o] もっとシンプルな方法はないか？（KISS）
   - [o] 未使用のインポートは削除したか？

---

## 変更対象ファイル一覧

| ファイル                              | 変更内容                            | ステータス |
| ------------------------------------- | ----------------------------------- | :--------: |
| `app/(public)/page.tsx`               | metadata export追加（title, desc, canonical） |    [o]     |
| `app/(public)/about-ice/page.tsx`     | canonical追加、OGP補完、baseUrl宣言位置修正 |    [o]     |
| `app/(public)/faq/page.tsx`           | canonical追加、OGP補完、BASE_URL追加 |    [o]     |
| `app/(public)/shop/page.tsx`          | canonical追加、OGP補完、BASE_URL追加 |    [o]     |
| `app/dashboard/layout.tsx`            | robots noindex追加                  |    [o]     |
| `app/not-found.tsx`                   | metadata export追加（title, noindex）|    [o]     |
| `public/manifest.webmanifest`         | description, lang, categories追加   |    [o]     |

---

## 備考

### 対象外とした項目

- **`robots.ts`のクロール許可**: カスタムドメイン取得前のため対象外（取得後に `allow: "/"` と `sitemap` 指定を追加すること）
- **ページ固有のOGP画像**: 現時点では全ページ共通の `og-image.png` で十分。ページ固有の画像が必要になった際に対応
- **Twitter Card の各ページ設定**: Next.js では `layout.tsx` の `twitter` 設定が子ページに継承されるため、現状のルート設定で十分
- **`<article>` タグの追加**: 現在の構造で十分セマンティック
- **`HeroSection` の `<main>` 配置**: レイアウト変更が大きいため今回は対象外

### 参考

- Next.js Metadata API: `Metadata` オブジェクトの各フィールドは親レイアウトから子ページへシャロ―マージされる
- `metadataBase` が設定されていれば、`alternates.canonical` に相対パスを指定しても絶対URLに変換される

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
