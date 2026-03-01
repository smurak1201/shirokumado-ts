# Next.js App Router ガイド

## このドキュメントの役割

このドキュメントは「**App Router の使い方**」を説明します。Server/Client Components、データフェッチ、ルーティングなど、App Router の詳細を理解したいときに参照してください。

**関連ドキュメント**:
- [Next.js ガイド](./nextjs-guide.md): フレームワークの全体像
- [開発ガイドライン](../../development-guide.md#nextjs-app-router): コーディング規約
- [プロジェクト構造](../../project-structure.md): ディレクトリ構造

## 目次

- [概要](#概要)
- [App Router とは](#app-router-とは)
- [App Router のディレクトリ構造](#app-router-のディレクトリ構造)
- [Server Components と Client Components](#server-components-と-client-components)
  - [Server Components](#server-components)
  - [Client Components](#client-components)
- [データフェッチング](#データフェッチング)
  - [Server Components でのデータフェッチング](#server-components-でのデータフェッチング)
  - [Client Components でのデータフェッチング](#client-components-でのデータフェッチング)
  - [動的レンダリングの設定](#動的レンダリングとisrの設定)
- [動的ルーティング](#動的ルーティング)
- [Parallel Routes と Intercepting Routes](#parallel-routes-と-intercepting-routes)
  - [Parallel Routes](#parallel-routes)
  - [Intercepting Routes](#intercepting-routes)
- [API Routes](#api-routes)
  - [Server Actions](#server-actions)
- [画像最適化](#画像最適化)
- [レイアウトとテンプレート](#レイアウトとテンプレート)
  - [ルートレイアウト](#ルートレイアウト)
  - [メタデータ](#メタデータ)
  - [フォント最適化](#フォント最適化)
- [このアプリでの App Router の使用例まとめ](#このアプリでの-app-router-の使用例まとめ)
  - [ページ構成](#ページ構成)
  - [API Routes 構成](#api-routes-構成)
  - [ベストプラクティス](#ベストプラクティス)
- [参考リンク](#参考リンク)

## 概要

Next.js App Router は、Next.js 13 以降で導入された新しいルーティングシステムです。ファイルベースのルーティングと、React Server Components を活用したサーバーサイドレンダリングを提供します。

このアプリケーションでは、Next.js 16.1.1 の App Router を使用して、ホームページ、FAQ ページ、天然氷紹介ページ、商品詳細ページ（Parallel Routes + Intercepting Routes によるモーダル表示）、ダッシュボード、API Routes を実装しています。

## App Router とは

**Next.js 全体の説明については、[Next.js ガイド](./nextjs-guide.md) を参照してください。**

**App Router の主な特徴**:

- **ファイルベースのルーティング**: `app/` ディレクトリ内のファイル構造がそのまま URL ルートになる
- **Server Components**: デフォルトでサーバーサイドでレンダリングされ、クライアントサイドの JavaScript を最小化
- **レイアウトシステム**: ネストされたレイアウトにより、ページ間で共通の UI を共有
- **API Routes**: `route.ts` ファイルで API エンドポイントを実装
- **データフェッチング**: Server Components で直接データベースにアクセス可能
- **動的ルーティング**: `[id]` などの動的セグメントを使用した柔軟なルーティング

## App Router のディレクトリ構造

App Router では、`app/` ディレクトリ内のファイル構造がそのまま URL ルートになります。

**注意**: プロジェクト全体のディレクトリ構造の詳細については、[プロジェクト構造ドキュメント](../../project-structure.md)を参照してください。設計思想については、[アーキテクチャドキュメント](../../architecture.md#ディレクトリ構造の設計思想)を参照してください。

**このアプリでの App Router のディレクトリ構造**:

```
├── (public)/          # 公開ページ用ルートグループ
│   ├── @modal/        # Parallel Routes（モーダル用スロット）
│   │   ├── (.)menu/[id]/
│   │   │   ├── page.tsx              # Server Component: データ取得
│   │   │   └── ProductModalRoute.tsx # Client Component: Dialogでモーダル表示
│   │   └── default.tsx # モーダル非表示時のfallback
│   ├── menu/[id]/     # 商品詳細ページ（/menu/[id]）
│   │   ├── page.tsx   # フルページ表示（SEO/OGP対応、generateMetadata）
│   │   └── ScrollToTop.tsx # リロード時のスクロール位置リセット
│   ├── about-ice/     # 天然氷紹介ページ（/about-ice）
│   │   ├── AboutIceContent.tsx # Client Component（スクロールアニメーション）
│   │   ├── data.ts    # コンテンツデータ
│   │   └── page.tsx   # ページ
│   ├── faq/
│   │   ├── data.ts    # FAQデータ
│   │   └── page.tsx   # FAQページ（/faq）
│   ├── shop/
│   │   └── page.tsx   # ショップページ（/shop）
│   ├── default.tsx    # childrenスロットのfallback
│   ├── error.tsx      # エラーUI
│   ├── layout.tsx     # 公開ページレイアウト（children + modal並列描画）
│   ├── HomeContent.tsx # ホームページのメインコンテンツ（Server Component）
│   └── page.tsx       # ホームページ（/）
├── api/               # API Routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts # NextAuth認証エンドポイント
│   ├── cron/
│   │   └── cleanup-sessions/
│   │       └── route.ts # セッションクリーンアップ
│   └── products/
│       ├── [id]/
│       │   ├── route.ts # GET, PUT, DELETE /api/products/[id]
│       │   ├── get.ts   # GET処理の実装
│       │   ├── put.ts   # PUT処理の実装
│       │   ├── put-validation.ts # PUT用バリデーション
│       │   └── delete.ts # DELETE処理の実装
│       ├── reorder/
│       │   └── route.ts # POST /api/products/reorder
│       ├── route.ts   # GET, POST /api/products
│       └── upload/
│           └── route.ts # POST /api/products/upload
├── auth/              # 認証ページ（管理者用）
│   ├── error/
│   │   └── page.tsx   # 認証エラーページ
│   └── signin/
│       ├── page.tsx   # サインインページ
│       └── WebViewGuard.tsx # WebView検出コンポーネント
├── components/        # 共通コンポーネント
│   ├── ErrorBoundary.tsx # エラーバウンダリー
│   ├── FAQSection.tsx # FAQセクション（ホームページ・FAQページ共用）
│   ├── FixedHeader.tsx # 固定ヘッダー
│   ├── Footer.tsx     # フッター
│   ├── HeroSection.tsx # ヒーローセクション
│   ├── LazyGoogleMap.tsx # 遅延読み込みGoogle Map
│   ├── LoadingScreen.tsx # 共通ローディング画面
│   ├── MobileMenu.tsx # モバイルメニュー（Sheet使用）
│   ├── ProductCategoryTabs.tsx # カテゴリータブ
│   ├── ProductGrid.tsx # 商品グリッド
│   ├── ProductTile.tsx # 商品タイル（memo化）
│   └── ui/            # shadcn/uiコンポーネント
├── dashboard/         # 管理用ページ（ルートグループ外）
│   ├── page.tsx       # /dashboard → /dashboard/homepage へリダイレクト
│   ├── layout.tsx     # 共通レイアウト（認証チェック・ヘッダー）
│   ├── loading.tsx    # ローディングUI
│   ├── components/    # 共通コンポーネント
│   │   └── DashboardHeader.tsx
│   ├── homepage/      # 商品管理ページ
│   │   ├── page.tsx   # ダッシュボード本体（/dashboard/homepage）
│   │   ├── types.ts   # 型定義
│   │   ├── components/
│   │   │   ├── DashboardContent.tsx
│   │   │   ├── form/  # フォーム関連コンポーネント
│   │   │   ├── list/  # 一覧表示関連コンポーネント
│   │   │   └── layout/ # レイアウト管理関連コンポーネント
│   │   ├── hooks/     # カスタムフック
│   │   └── utils/     # ユーティリティ関数
│   └── shop/          # ショップ管理ページ
│       └── page.tsx
├── globals.css        # グローバルスタイル
├── hooks/             # カスタムフック
│   └── useInView.ts   # ビューポート交差検知フック
├── layout.tsx         # ルートレイアウト（全ページ共通）
├── not-found.tsx      # 404ページ
├── robots.ts          # robots.txt生成
├── sitemap.ts         # サイトマップ生成
└── types.ts           # 型定義
```

**ルートグループ `(public)` について**:

ルートグループは括弧で囲まれたフォルダ名（例: `(public)`）で、URLには影響を与えずにルートを整理できます。このアプリでは、公開ページと管理ページで `error.tsx` の適用範囲を分けるために使用しています。

- `(public)/page.tsx` → `/` としてアクセス可能
- `(public)/faq/page.tsx` → `/faq` としてアクセス可能
- `dashboard/page.tsx` → `/dashboard` としてアクセス可能（`(public)` の `error.tsx` は適用されない）

- `page.tsx`: ページコンポーネント（ルートとして機能） - **このアプリで使用中**
- `layout.tsx`: レイアウトコンポーネント（ネストされたレイアウト） - **このアプリで使用中**
- `route.ts`: API エンドポイント（API Routes） - **このアプリで使用中**
- `error.tsx`: エラー UI - **このアプリで使用中**（[`app/(public)/error.tsx`](../../app/(public)/error.tsx)）
- `loading.tsx`: ローディング UI - **このアプリで使用中**（`dashboard/loading.tsx`）。公開ページではSuspenseを使用
- `not-found.tsx`: 404 ページ - **このアプリで使用中**（[`app/not-found.tsx`](../../app/not-found.tsx)）
- `template.tsx`: テンプレートコンポーネント - **このアプリでは未使用**

**使用中のファイル**:

**`error.tsx`** - Next.js App Router のエラーハンドリング

このアプリでは [`app/(public)/error.tsx`](../../app/(public)/error.tsx) でエラーハンドリングを実装しています。Server Componentsでエラーが発生した場合に表示されるエラーページです。`(public)` ルートグループ内に配置しているため、公開ページでのみ適用されます。

**注意**: `error.tsx`はNext.js App Routerのエラーハンドリング用ファイルです。Reactのエラーバウンダリーコンポーネント（[`app/components/ErrorBoundary.tsx`](../../app/components/ErrorBoundary.tsx)）とは異なります。詳細は [React ガイド - エラーバウンダリー](./react-guide.md#エラーバウンダリー) を参照してください。

**`loading.tsx`** - ローディング UI

`loading.tsx`はNext.js App Routerの機能で、Server Componentsでデータフェッチ中にローディングUIを表示できます。ただし、**クライアントサイドナビゲーション時のみ**表示され、初回ロードやブラウザリロード時には表示されません。

**このアプリでの方針**:

公開ページでは`loading.tsx`を使用せず、**Suspenseを使って各ページで個別にローディング制御**しています。これにより以下のメリットがあります：

- 初回ロード/リロード時にもローディング画面が表示される
- 静的なページ（FAQ等）では不要なローディングを省略できる

ダッシュボード（`dashboard/loading.tsx`）ではページ遷移時のローディング表示として使用しています。

**共通ローディングコンポーネント**:

ローディングUIは [`app/components/LoadingScreen.tsx`](../../app/components/LoadingScreen.tsx) として共通コンポーネント化しています。白熊アイコン、店名、キャッチフレーズ、ドットアニメーションを含むブランド要素を持つデザインです。

**トップページでのローディング実装**:

トップページではISR（Incremental Static Regeneration）+ オンデマンド再検証を採用しています。`Suspense`を使用してストリーミングレンダリングを実現しており、キャッシュミス時（デプロイ直後や商品更新後の初回アクセス）のみローディング画面が表示されます。キャッシュヒット時はページが即座に返却されます。

```typescript
// app/(public)/page.tsx
import { Suspense } from "react";
import LoadingScreen from "@/app/components/LoadingScreen";
import HomeContent from "./HomeContent";

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}
```

**Suspenseの仕組み**:

1. `Suspense`でラップされたコンポーネント（`HomeContent`）が非同期処理（データ取得）を行う
2. 非同期処理中は`fallback`に指定したコンポーネント（`LoadingScreen`）が表示される
3. Next.jsのストリーミングSSRにより、`fallback`のHTMLが即座にクライアントに送信される
4. データ取得完了後、コンテンツがストリーミングで送信される
5. クライアントサイドナビゲーション時も同様に`fallback`が表示される

**拡張性**:

この設計パターンは、将来的に他のページでも同様に適用できます：

```
app/
├── (public)/
│   ├── page.tsx + HomeContent.tsx  ← ISR + Suspense（キャッシュミス時のみローディング）
│   ├── faq/page.tsx                ← 静的ページ（ローディング不要）
│   └── shop/                       ← 将来: Suspense
│       └── page.tsx
└── account/                        ← 将来: 認証が必要なページ
    ├── orders/page.tsx             ← Suspense（注文履歴取得）
    └── checkout/page.tsx           ← Suspense（購入処理）
```

各ページで以下を判断できます：
- ローディング画面が必要か（静的ページは不要）
- ISRを使うか動的レンダリングを使うか

**オンデマンド再検証（revalidatePath）**:

トップページはISR + オンデマンド再検証でキャッシュを管理しています。管理画面から商品を変更した際に`revalidatePath('/')`でキャッシュを無効化し、次のリクエストで再レンダリングします。

```typescript
// 商品変更API（POST/PUT/DELETE/reorder）で呼び出し
import { revalidatePath } from 'next/cache';

// トップページのISRキャッシュを無効化
revalidatePath('/');
```

**ローディング表示の動作まとめ**:

| シナリオ | 表示される仕組み |
|---------|----------------|
| キャッシュヒット時のアクセス | ローディングなし（即座にページ返却） |
| デプロイ直後の初回アクセス | `Suspense fallback`が表示される |
| 商品更新後の初回アクセス | `Suspense fallback`が表示される |
| FAQページにアクセス | ローディングなし（静的ページ） |

**Safari/iOSに関する注意**:

SafariにはストリーミングSSRの最小チャンクサイズ制限（約1KB）があります。`LoadingScreen`のHTML出力が1KB未満の場合、初回ロード時にローディング画面が表示されない可能性があります。このアプリでは、白熊アイコン（SVG）やキャッチフレーズなどを含めることで約2KBのHTML出力を確保し、Safari対応しています。

参考:
- [WebKit Bug #252413](https://bugs.webkit.org/show_bug.cgi?id=252413)
- [Next.js Issue #52444](https://github.com/vercel/next.js/issues/52444)

**`not-found.tsx`** - 404 ページ

このアプリでは [`app/not-found.tsx`](../../app/not-found.tsx) で404ページを実装しています。存在しないURLにアクセスした時に表示されます。ルートレベルに配置しているため、アプリ全体に適用されます。

**未使用ファイルの説明**:

このアプリでは、以下のファイルは使用されていませんが、知っておくと便利な機能です：

**`template.tsx`** - テンプレートコンポーネント

`layout.tsx`と似ていますが、ナビゲーション時に毎回新しいインスタンスが作成されます。アニメーションや状態のリセットが必要な場合に使用します。

**使用例**:

```typescript
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in transition-opacity duration-300">
      {children}
    </div>
  );
}
```

**注意**: このアプリでは `template.tsx` は使用されていません。上記は参考例です。

- エラーハンドリング: `(public)/error.tsx` で公開ページのエラーを処理し、API Routes では `withErrorHandling` で統一して実装している
- ローディング状態: `loading.tsx`は使用せず、各ページでSuspenseを使用して個別に制御（トップページはISRによりキャッシュヒット時はローディングなし）
- 404 ページ: `not-found.tsx` でカスタム404ページを表示
- テンプレート機能は現在の要件では不要

## Server Components と Client Components

### Server Components

**説明**: Server Components は、デフォルトでサーバーサイドでレンダリングされるコンポーネントです。データベースに直接アクセスでき、クライアントサイドの JavaScript を最小化します。

**特徴**:

- サーバーサイドで実行される（ブラウザに JavaScript が送信されない）
- データベースやファイルシステムに直接アクセス可能
- シークレットや API キーを安全に使用可能
- パフォーマンスが向上（バンドルサイズの削減）

**このアプリでの使用箇所**:

1. **[`app/(public)/page.tsx`](../../app/(public)/page.tsx) (`Home`コンポーネント)** - ホームページ（Server Component + Suspense + ISR）

ホームページはISR + オンデマンド再検証でキャッシュを管理し、キャッシュミス時のみ`Suspense`のfallbackでローディング画面を表示します。データ取得は`HomeContent`コンポーネントで行います。

```typescript
// app/(public)/page.tsx
import { Suspense } from "react";
import LoadingScreen from "@/app/components/LoadingScreen";
import HomeContent from "./HomeContent";

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}
```

**[`app/(public)/HomeContent.tsx`](../../app/(public)/HomeContent.tsx) (`HomeContent`コンポーネント)** - データ取得とメインコンテンツ

```typescript
// app/(public)/HomeContent.tsx
export default async function HomeContent() {
  const data = await getPublishedProductsByCategory();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FixedHeader />
      <div style={{ height: "var(--header-height)" }} />
      <HeroSection />
      {/* ... */}
      <Footer />
    </div>
  );
}
```

2. **[`app/(public)/faq/page.tsx`](../../app/(public)/faq/page.tsx) (`FAQPage`コンポーネント)** - FAQ ページ（Server Component）

FAQデータは `data.ts` に分離されており、`FAQSection` 共通コンポーネントを使用して表示します。

```typescript
// app/(public)/faq/data.ts
export const faqs: FAQ[] = [
  {
    question: "かき氷の販売は夏だけですか？",
    answer: "通年で営業しており、季節ごとに異なるメニューもご用意しています。",
  },
  // ... 他のFAQデータ
];

// app/(public)/faq/page.tsx
import { faqs } from "./data";
import FAQSection from "@/app/components/FAQSection";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FixedHeader />
      {/* ... */}
      <main>
        <FAQSection items={faqs} />
      </main>
      <Footer />
    </div>
  );
}
```

3. **[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)** - ダッシュボードルート（リダイレクト）

`/dashboard` へのアクセスは `/dashboard/homepage` にリダイレクトされます。実際のダッシュボード本体は [`app/dashboard/homepage/page.tsx`](../../app/dashboard/homepage/page.tsx) にあります。

```typescript
// app/dashboard/page.tsx
import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/dashboard/homepage");
}
```

**[`app/dashboard/homepage/page.tsx`](../../app/dashboard/homepage/page.tsx)** - ダッシュボード本体（Server Component）

```typescript
const data = await getDashboardData();
const { categories, products } = data;

return <DashboardContent categories={categories} initialProducts={products} />;
```

認証チェックとヘッダーは [`dashboard/layout.tsx`](../../app/dashboard/layout.tsx) で処理されます。

### Client Components

**説明**: Client Components は、`'use client'` ディレクティブを使用してクライアントサイドでレンダリングされるコンポーネントです。インタラクティブな機能（状態管理、イベントハンドラーなど）を実装するために使用します。

**特徴**:

- クライアントサイドで実行される（ブラウザで JavaScript が実行される）
- `useState`、`useEffect` などの React Hooks が使用可能
- イベントハンドラー（`onClick`、`onChange` など）が使用可能
- ブラウザ API（`localStorage`、`window` など）にアクセス可能

**このアプリでの使用箇所**:

- [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx): 商品グリッド（アニメーション制御）
- [`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx): 商品タイル（Linkによるページ遷移、memo化）
- [`app/components/ProductCategoryTabs.tsx`](../../app/components/ProductCategoryTabs.tsx): カテゴリータブ切り替え
- [`app/components/MobileMenu.tsx`](../../app/components/MobileMenu.tsx): モバイルメニュー（Sheet使用）
- [`app/components/LazyGoogleMap.tsx`](../../app/components/LazyGoogleMap.tsx): 遅延読み込みGoogle Map
- [`app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx`](../../app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx): 商品モーダル表示（Intercepting Routes、Dialog使用）
- [`app/(public)/menu/[id]/ScrollToTop.tsx`](../../app/(public)/menu/[id]/ScrollToTop.tsx): スクロール位置リセット
- [`app/(public)/about-ice/AboutIceContent.tsx`](../../app/(public)/about-ice/AboutIceContent.tsx): 天然氷紹介（スクロールアニメーション）
- [`app/dashboard/homepage/components/DashboardContent.tsx`](../../app/dashboard/homepage/components/DashboardContent.tsx): ダッシュボードコンテンツ（フォーム送信、状態管理）

**Server Components と Client Components の使い分け**:

- **Server Components**: データフェッチング、静的なコンテンツ表示
  - Prisma を使用してデータベースに直接アクセス
  - React Hooks（`useState`、`useEffect` など）は使用しない
  - イベントハンドラー（`onClick`、`onChange` など）は使用しない
- **Client Components**: インタラクティブな機能、状態管理、ブラウザ API の使用
  - `fetch` API を使用して API Routes にアクセス
  - React Hooks（`useState`、`useEffect`、`useRef` など）を使用
  - イベントハンドラー（`onClick`、`onChange` など）を使用
  - Prisma は使用しない（データベースに直接アクセスしない）

## データフェッチング

### Server Components でのデータフェッチング

**説明**: Server Components では、`async/await` を使用してデータベースから直接データを取得できます。`fetch` API を使用する必要はありません。

**詳細は [Async/Await ガイド - Server Components でのデータフェッチング](../basics/async-await-guide.md#server-components-でのデータフェッチング) を参照してください。**

**このアプリでの使用箇所**:

1. **[`lib/products.ts`](../../lib/products.ts) (`getPublishedProductsByCategory`関数)** - 公開商品をカテゴリーごとに取得

**注意**: このコード例は簡潔化したものです。実際の実装では、`safePrismaOperation`を使用してエラーハンドリングを行っています。詳細は [`lib/products.ts`](../../lib/products.ts) を参照してください。

```typescript
async function getPublishedProductsByCategory(): Promise<
  CategoryWithProducts[]
> {
  // カテゴリーと商品を並列で取得（Promise.all を使用）
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: "asc" } }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { displayOrder: { sort: "asc", nulls: "last" } },
    }),
  ]);

  // 公開商品のフィルタリングとカテゴリーごとのグループ化
  // ...
}
```

2. **[`lib/products.ts`](../../lib/products.ts) (`getProductById`関数)** - 商品IDから単一商品を取得

商品詳細ページ（`menu/[id]/page.tsx`）やIntercepting Route（`@modal/(.)menu/[id]/page.tsx`）から呼び出されます。

3. **[`app/dashboard/homepage/page.tsx`](../../app/dashboard/homepage/page.tsx) (`getDashboardData`関数)** - ダッシュボードデータを取得

```typescript
async function getDashboardData() {
  // カテゴリーと商品を並列で取得（Promise.all を使用）
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: "asc" } }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { categories, products };
}
```

**async/await と Promise.all の詳細な使用方法は [Async/Await ガイド](../basics/async-await-guide.md) を参照してください。**

### Client Components でのデータフェッチング

**説明**: Client Components では、ユーザーの操作（商品の追加・更新・削除など）に応じて動的にデータを取得する必要があります。この場合、`fetch` API を使用して API Routes を呼び出します。

**なぜ Server Components で直接データベースにアクセスしないのか**:

- Server Components は初期レンダリング時にのみ実行される
- ユーザーの操作（ボタンクリック、フォーム送信など）に応じて動的にデータを取得する必要がある
- Client Components では `useState`、`useEffect` などの Hooks を使用して状態管理を行う

**フロントエンドとバックエンドの使い分け**:

- **Client Components（フロントエンド）**: `fetch` API を使用して API Routes にアクセス
  - Prisma は使用しない（データベースに直接アクセスしない）
  - React Hooks（`useState`、`useEffect`、`useRef` など）を使用
  - ブラウザ API（`localStorage`、`window`、`URL.createObjectURL` など）を使用可能
- **API Routes（バックエンド）**: Prisma を使用してデータベースに直接アクセス
  - `fetch` API は使用しない（外部 API を呼び出す場合を除く）
  - React Hooks は使用しない（サーバーサイドで実行されるため）
  - ブラウザ API は使用しない（サーバーサイドで実行されるため）

**このアプリでの使用箇所**:

1. **[`app/dashboard/homepage/components/DashboardContent.tsx`](../../app/dashboard/homepage/components/DashboardContent.tsx) (`refreshProducts`関数)** - 商品一覧の更新

```typescript
  const data = await fetchJson<{ products: Product[] }>(
    `/api/products?t=${Date.now()}`
  );
  setProducts(data.products || []);
```

`fetchJson`（`lib/client-fetch.ts`）はレスポンスの`ok`チェックとJSONパースを統一的に行います。


2. **[`app/dashboard/homepage/hooks/useProductDelete.ts`](../../app/dashboard/homepage/hooks/useProductDelete.ts) (`handleDelete`関数)** - 商品の削除

商品削除処理は `useProductDelete` カスタムフックに分離されています。`fetchJson` を使用して API を呼び出し、`sonner` の `toast` で通知します。

```typescript
const { handleDelete } = useProductDelete(refreshProducts);

// useProductDelete フック内の実装:
// 1. 確認ダイアログを表示
// 2. fetchJson で DELETE リクエストを送信
// 3. toast.success / toast.error で通知
// 4. refreshProducts() で商品一覧を更新
```

3. **[`app/dashboard/homepage/hooks/useProductReorder.ts`](../../app/dashboard/homepage/hooks/useProductReorder.ts) (`reorderProducts`関数)** - 商品順序の変更

```typescript
// API を呼び出して商品の順序をサーバーに保存
const response = await fetch("/api/products/reorder", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ productOrders }),
});

// レスポンスがエラーの場合は例外を投げる
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error || "順序の更新に失敗しました");
}
```

4. **`app/dashboard/homepage/components/form/ProductForm.tsx`** - 商品の作成と画像アップロード

**画像アップロード（FormData を使用）**:

このアプリでは、画像アップロード処理は`useProductForm`カスタムフック内で実装されています。

[`app/dashboard/homepage/hooks/useProductForm.ts`](../../app/dashboard/homepage/hooks/useProductForm.ts) (`uploadImage`関数)

```typescript
const uploadImage = useCallback(async (): Promise<string | null> => {
  if (!formData.imageFile) {
    return formData.imageUrl || null;
  }

  setUploading(true);
  try {
    const uploadFormData = new FormData();
    uploadFormData.append("file", formData.imageFile);

    const uploadResponse = await fetch("/api/products/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      let errorMessage = "画像のアップロードに失敗しました";
      try {
        const contentType = uploadResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await uploadResponse.json();
          errorMessage = error.error || errorMessage;
        } else {
          const text = await uploadResponse.text();
          errorMessage = text || errorMessage;
        }
      } catch (parseError) {
        errorMessage = `画像のアップロードに失敗しました (${uploadResponse.status})`;
      }
      throw new Error(errorMessage);
    }

    const uploadData = await uploadResponse.json();
    return uploadData.url;
  } finally {
    setUploading(false);
  }
}, [formData.imageFile, formData.imageUrl]);
```

[`app/dashboard/homepage/components/form/ProductForm.tsx`](../../app/dashboard/homepage/components/form/ProductForm.tsx) (商品登録処理)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const imageUrl = await uploadImage();

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        imageUrl,
        categoryId: parseInt(formData.categoryId),
        priceS: formData.priceS ? parseFloat(formData.priceS) : null,
        priceL: formData.priceL ? parseFloat(formData.priceL) : null,
        published: formData.published,
        publishedAt: formData.publishedAt || null,
        endedAt: formData.endedAt || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "登録に失敗しました");
    }
```

**fetch の使用パターン**:

1. **GET リクエスト**: データの取得

   - キャッシュを無効化する場合は、タイムスタンプをクエリパラメータに追加
   - `cache: "no-store"` オプションを使用

2. **POST/PUT リクエスト（JSON データ）**: データの作成・更新

   - `Content-Type: application/json` ヘッダーを設定
   - `body` に `JSON.stringify()` で変換した JSON 文字列を渡す

3. **POST リクエスト（FormData）**: ファイルアップロード

   - `FormData` オブジェクトを作成し、`append()` でファイルを追加
   - `body` に `FormData` を直接渡す（`Content-Type` ヘッダーは設定しない）

4. **DELETE リクエスト**: データの削除
   - `method: "DELETE"` を指定

**エラーハンドリング**:

```typescript
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "リクエストに失敗しました");
  }

  const result = await response.json();
  // 成功時の処理
} catch (error) {
  console.error("エラー:", error);
  // エラー時の処理（ユーザーへの通知など）
}
```

- **常に最新データを取得**: `cache: "no-store"` とタイムスタンプを使用
- **Next.js のキャッシュを無効化**: `cache: "no-store"` オプション
- **ブラウザのキャッシュを無効化**: `Cache-Control: "no-cache"` ヘッダー

**Server Components と Client Components の使い分け**:

- **Server Components**: 初期データの取得（Prisma で直接データベースにアクセス）
- **Client Components**: ユーザーの操作に応じた動的なデータ取得（fetch API で API Routes を呼び出し）

### 動的レンダリングとISRの設定

**説明**: Next.js App Routerでは、ルートごとにレンダリング方式を制御できます。`export const dynamic = "force-dynamic"` で毎リクエストSSRを強制、動的APIを使用しないルートはISR（キャッシュ＋オンデマンド再検証）として動作します。

**このアプリでのレンダリング方式**:

| ルート | レンダリング方式 | 理由 |
|--------|-----------------|------|
| トップページ（`page.tsx`） | ISR + オンデマンド再検証 | 商品データの更新頻度は低く、キャッシュで十分。更新時は`revalidatePath('/')`で無効化 |
| 管理画面（`dashboard/homepage/page.tsx`） | `force-dynamic` | 常に最新データが必要 |
| API Routes（`api/products/`） | `force-dynamic` | 管理画面から常に最新データを返す必要がある |

**トップページのISR + オンデマンド再検証**:

トップページは`force-dynamic`を使用せず、ISRとして動作します。商品変更API（POST/PUT/DELETE/reorder）で`revalidatePath('/')`を呼び出し、キャッシュを無効化します。

```typescript
// 商品変更APIでの再検証
import { revalidatePath } from 'next/cache';

// 商品を更新した後
revalidatePath('/');  // トップページのキャッシュを無効化
```

**管理画面・API Routesでの動的レンダリング**:

1. **[`app/dashboard/homepage/page.tsx`](../../app/dashboard/homepage/page.tsx) (`dynamic`エクスポート)** - 動的レンダリングを強制

```typescript
/**
 * 動的レンダリングを強制
 *
 * 理由:
 * 1. 商品情報の頻繁な更新: ダッシュボードでは商品情報を頻繁に更新する可能性がある
 * 2. データベースから最新のデータを取得: 常に最新のデータを取得する必要がある
 * 3. 公開状態の確認: 公開日・終了日に基づく公開状態を正確に表示する必要がある
 */
export const dynamic = "force-dynamic";
```

3. **[`app/api/products/route.ts`](../../app/api/products/route.ts) (`dynamic`エクスポート)** - API Route での動的レンダリング

```typescript
/**
 * 動的レンダリングを強制
 *
 * 理由:
 * 1. 商品情報の頻繁な更新: 常に最新のデータを返す必要がある
 * 2. 公開状態の自動判定: 公開日・終了日に基づく公開状態の自動判定が正しく動作するため
 * 3. データベースから最新のデータを取得: 常に最新のデータを取得する必要がある
 */
export const dynamic = "force-dynamic";
```

## 動的ルーティング

**説明**: 動的ルーティングを使用すると、URL パラメータに基づいて動的にページを生成できます。

**このアプリでの使用箇所**:

- **`app/api/products/[id]/route.ts`**: 商品 ID に基づく動的ルーティング

```typescript
import { parseProductId } from '@/lib/api-helpers';

// ...

  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const productId = parseProductId(id);

  const product = await safePrismaOperation(
    () =>
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
        },
      }),
    `GET /api/products/${id}`
  );

  if (!product) {
    throw new NotFoundError('商品');
  }

  return apiSuccess({ product });
});
```

**動的ルートの規則**:

- `[id]`: 単一の動的セグメント
- `[...slug]`: キャッチオールルート（複数のセグメントをキャッチ）
- `[[...slug]]`: オプショナルキャッチオールルート

## Parallel Routes と Intercepting Routes

### Parallel Routes

**説明**: Parallel Routes は、同じレイアウト内で複数のページ（スロット）を同時に描画する仕組み。`@` プレフィックス付きのフォルダがスロットになり、親の `layout.tsx` がそれらを props として受け取る。

```
app/(public)/
├── @modal/           # ← スロット（URLには影響しない）
│   └── default.tsx   # モーダルが表示されていない時のfallback
├── layout.tsx        # children と modal を並列に描画
├── default.tsx       # children スロットのfallback
└── page.tsx          # children スロットの中身
```

```tsx
// app/(public)/layout.tsx
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

**ポイント**:

- `@modal` はスロット名で、URLセグメントにはならない
- `layout.tsx` の props 名（`modal`）は `@modal` のフォルダ名と一致させる
- すべてのスロットに `default.tsx` が必要（ないとビルドエラー）。暗黙の `children` スロットも含む

### Intercepting Routes

**説明**: Intercepting Routes は、サイト内のリンククリック（ソフトナビゲーション）時に、本来のルートの代わりに別のコンポーネント（モーダルなど）を表示する仕組み。直接URLアクセスやリロード時は本来のルートが表示される。

```
サイト内クリック: / → /menu/1  → @modal/(.)menu/[id] のモーダルが表示される
直接アクセス:     /menu/1     → menu/[id]/page.tsx のフルページが表示される
```

**インターセプトの規約**:

| 規約 | 意味 | 例 |
|---|---|---|
| `(.)` | 同じルートセグメントレベル | `@modal/(.)menu` → `menu` をインターセプト |
| `(..)` | 1つ上のレベル | `(..)photo` → 親の `photo` をインターセプト |
| `(...)` | ルートレベル | `(...)photo` → app直下の `photo` をインターセプト |

`@modal`（スロット）と `(public)`（Route Group）はルートセグメントとしてカウントされないため、`@modal/(.)menu/[id]` で `(public)/menu/[id]` を正しくインターセプトできる。

**このアプリでの使用箇所**:

```
app/(public)/
├── @modal/
│   ├── (.)menu/[id]/
│   │   ├── page.tsx              # Server Component: getProductByIdでデータ取得
│   │   └── ProductModalRoute.tsx # Client Component: Dialogでモーダル表示、router.back()で閉じる
│   └── default.tsx               # モーダル非表示時はnullを返す
├── menu/[id]/
│   ├── page.tsx                  # フルページ表示（SEO/OGP対応、generateMetadata）
│   └── ScrollToTop.tsx           # リロード時のスクロール位置リセット
├── layout.tsx                    # children + modal を並列描画
└── default.tsx                   # childrenスロットのfallback
```

**モーダル側（Intercepting Route）の実装パターン**:

```tsx
// @modal/(.)menu/[id]/page.tsx - Server Component
export default async function InterceptedMenuPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(parseInt(id));
  if (!product) notFound();
  return <ProductModalRoute product={product} />;
}
```

```tsx
// @modal/(.)menu/[id]/ProductModalRoute.tsx - Client Component
"use client";
export default function ProductModalRoute({ product }: { product: Product }) {
  const router = useRouter();
  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent>{/* 商品情報 */}</DialogContent>
    </Dialog>
  );
}
```

**注意点**:

- モーダルを閉じるには `router.back()` を使用する（URLが元に戻る）
- `Link` に `scroll={false}` を指定しないと、モーダル表示時に背景のスクロール位置がリセットされる
- フルページ側ではリロード時のブラウザスクロール復元対策が必要（`ScrollToTop` コンポーネント）
- モーダル側は `"use client"` が必要（`router.back()` を使うため）。データ取得の `page.tsx` は Server Component のまま

## API Routes

**説明**: API Routes を使用すると、Next.js アプリケーション内で RESTful API を実装できます。`app/api/` ディレクトリ内に `route.ts` ファイルを配置することで、HTTP メソッド（GET、POST、PUT、DELETE など）をエクスポートできます。

**このアプリでの使用箇所**:

1. **[`app/api/products/route.ts`](../../app/api/products/route.ts) (`GET`エクスポート)** - 商品一覧の取得と作成

```typescript
  // データベースから商品を取得
  // include でカテゴリー情報も一緒に取得することで、N+1問題を回避します
  const products = await safePrismaOperation(
    () =>
      prisma.product.findMany({
        include: {
          category: true, // 関連するカテゴリー情報も取得
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順でソート（新しい順）
        },
      }),
    'GET /api/products'
  );

  const response = NextResponse.json({ products }, { status: 200 });
  // Content-Typeヘッダーを設定（日本語を含むJSONの文字化けを防ぐ）
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  // キャッシュヘッダーを設定
  // s-maxage: CDNでのキャッシュ期間
  // stale-while-revalidate: キャッシュが古くなっても、再検証中は古いデータを返す
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.PRODUCT_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.PRODUCT_LIST_STALE_WHILE_REVALIDATE_SECONDS}`
  );
  return response;
});
```

[`app/api/products/route.ts`](../../app/api/products/route.ts) (`POST`エクスポート)

```typescript
  const body = await request.json();

  // ===== バリデーション =====
  // 商品名の検証
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new ValidationError('商品名は必須です');
  }

  // 商品説明の検証
  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    throw new ValidationError('商品説明は必須です');
  }

  // カテゴリーIDの検証
  if (!body.categoryId || typeof body.categoryId !== 'number') {
    throw new ValidationError('カテゴリーは必須です');
  }

  // ===== カテゴリーの存在確認 =====
  // 指定されたカテゴリーがデータベースに存在するか確認
  const category = await safePrismaOperation(
    () => prisma.category.findUnique({ where: { id: body.categoryId } }),
    'POST /api/products - category check'
  );

  if (!category) {
    throw new ValidationError('指定されたカテゴリーが存在しません');
  }

  // ===== 公開日・終了日の処理 =====
  // 文字列形式の日時を Date オブジェクトに変換
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  const endedAt = body.endedAt ? new Date(body.endedAt) : null;

  // ===== 公開状態の自動判定 =====
  // 公開日・終了日が設定されている場合は自動判定
  // 設定されていない場合は手動設定値（デフォルトは true）を使用
  const published = (publishedAt || endedAt)
    ? calculatePublishedStatus(publishedAt, endedAt)
    : (body.published !== undefined ? body.published : true);

  // ===== 商品の作成 =====
  const product = await safePrismaOperation(
    () =>
      prisma.product.create({
        data: {
          name: body.name.trim(), // 前後の空白を削除
          description: body.description.trim(), // 前後の空白を削除
          imageUrl: body.imageUrl || null, // 画像URLが指定されていない場合は null
          priceS: body.priceS ? parseFloat(body.priceS) : null, // 文字列を数値に変換
          priceL: body.priceL ? parseFloat(body.priceL) : null, // 文字列を数値に変換
          categoryId: body.categoryId,
          published, // 自動判定または手動設定された公開状態
          publishedAt,
          endedAt,
        },
        include: {
          category: true, // 作成された商品にカテゴリー情報も含める
        },
      }),
    'POST /api/products'
  );

  // 201 Created ステータスでレスポンスを返す
  return apiSuccess({ product }, 201);
});
```

2. **[`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts) (`PUT`エクスポート)** - 個別商品の操作

```typescript
import { parseProductId } from '@/lib/api-helpers';

// ...

  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const productId = parseProductId(id);
  const body = await request.json();

  // 商品の存在確認
  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `PUT /api/products/${id} - existence check`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // バリデーション
  if (body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new ValidationError('商品名は必須です');
    }
  }

  if (body.description !== undefined) {
    if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
      throw new ValidationError('商品説明は必須です');
    }
  }

  // カテゴリーの存在確認（指定されている場合）
  if (body.categoryId !== undefined) {
    if (typeof body.categoryId !== 'number') {
      throw new ValidationError('カテゴリーIDは数値である必要があります');
    }

    const category = await safePrismaOperation(
      () => prisma.category.findUnique({ where: { id: body.categoryId } }),
      `PUT /api/products/${id} - category check`
    );

    if (!category) {
      throw new ValidationError('指定されたカテゴリーが存在しません');
    }
  }

  // 公開日・終了日の処理
  const publishedAt = body.publishedAt !== undefined
    ? (body.publishedAt ? new Date(body.publishedAt) : null)
    : existingProduct.publishedAt;
  const endedAt = body.endedAt !== undefined
    ? (body.endedAt ? new Date(body.endedAt) : null)
    : existingProduct.endedAt;

  // 公開情報の自動判定
  // 公開日・終了日が設定されている場合は自動判定、そうでない場合は手動設定値を使用
  const published = (publishedAt || endedAt)
    ? calculatePublishedStatus(publishedAt, endedAt)
    : (body.published !== undefined ? body.published : existingProduct.published);

  // 画像が更新される場合、元の画像を削除
  const oldImageUrl = existingProduct.imageUrl;
  const newImageUrl = body.imageUrl !== undefined ? (body.imageUrl || null) : oldImageUrl;

  // 新しい画像URLが設定され、元の画像URLと異なる場合、元の画像を削除
  if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
    try {
      await deleteFile(oldImageUrl);
      console.log(`元の画像を削除しました: ${oldImageUrl}`);
    } catch (error) {
      // 画像削除に失敗しても商品更新は続行（エラーログのみ）
      console.error(`元の画像の削除に失敗しました: ${oldImageUrl}`, error);
    }
  }

  // 商品を更新
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.description !== undefined) updateData.description = body.description.trim();
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
  if (body.priceS !== undefined) updateData.priceS = body.priceS ? parseFloat(body.priceS) : null;
  if (body.priceL !== undefined) updateData.priceL = body.priceL ? parseFloat(body.priceL) : null;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
  updateData.published = published;
  if (body.publishedAt !== undefined) updateData.publishedAt = publishedAt;
  if (body.endedAt !== undefined) updateData.endedAt = endedAt;

  const product = await safePrismaOperation(
    () =>
      prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
        },
      }),
    `PUT /api/products/${id}`
  );

  return apiSuccess({ product });
});
```

**API Routes の特徴**:

- Server Component として実行される（`'use client'` は不要）
- データベースに直接アクセス可能
- 統一されたエラーハンドリング（`withErrorHandling` を使用）
- 型安全なリクエスト・レスポンス処理
- 日本語対応: `apiSuccess`、`apiError`、`handleApiError`関数は自動的に`Content-Type: application/json; charset=utf-8`ヘッダーを設定し、日本語を含む JSON の文字化けを防止

### Server Actions

**説明**: Server Actions は、Client Component から直接サーバー側の関数を呼び出すことができる機能です。`'use server'`ディレクティブを使用してサーバー側の関数を定義し、フォーム送信やボタンクリックなどから直接呼び出せます。

**このアプリでの使用箇所**: 現在は使用されていません。

**使用例**:

```typescript
"use server";

import { prisma } from "@/lib/prisma";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      // ...
    },
  });

  return product;
}
```

**Client Component での使用例**:

```typescript
"use client";

import { createProduct } from "@/app/actions";

export default function ProductForm() {
  async function handleSubmit(formData: FormData) {
    const product = await createProduct(formData);
    console.log("商品を作成しました:", product);
  }

  return (
    <form action={handleSubmit}>
      <input name="name" />
      <textarea name="description" />
      <button type="submit">作成</button>
    </form>
  );
}
```

**注意**: このアプリでは Server Actions は使用していません。上記は参考例です。

- API Routes を書く必要がなく、よりシンプルなコードになる
- 型安全性が高い（TypeScript と統合されている）
- フォーム送信が簡単（`action`プロップに直接関数を渡せる）
- プログレッシブエンハンスメントに対応（JavaScript が無効でも動作）

**このアプリで使用しない理由**:

- API Routes を使用することで、RESTful な API 設計を維持している
- エラーハンドリングを統一するために`withErrorHandling`を使用している
- 既存のコードベースとの一貫性を保つため
- API Routes の方が、外部からのアクセスやテストが容易

## 画像最適化

Next.js の `Image` コンポーネントを使用すると、画像の自動最適化、WebP 変換、レスポンシブ画像の生成などが自動で行われます。

**詳細な説明**: 画像最適化の詳細な設定、使用方法、このアプリでの実装例については、[Next.js ガイド - 画像最適化](./nextjs-guide.md#画像最適化) を参照してください。

**このアプリでの使用箇所**:

- **[`app/(public)/HomeContent.tsx`](../../app/(public)/HomeContent.tsx)**: ヒーロー画像の最適化
- **[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)**: 商品画像の最適化
- **[`app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx`](../../app/(public)/@modal/(.)menu/[id]/ProductModalRoute.tsx)**: モーダル内の商品画像
- **[`app/(public)/menu/[id]/page.tsx`](../../app/(public)/menu/[id]/page.tsx)**: 商品詳細ページの画像

## レイアウトとテンプレート

### ルートレイアウト

**説明**: [`app/layout.tsx`](../../app/layout.tsx) は、すべてのページに適用されるルートレイアウトです。メタデータ、フォント、グローバルスタイルなどを設定します。

**このアプリでの使用箇所**:

[`app/layout.tsx`](../../app/layout.tsx) (`RootLayout`コンポーネント)

```typescript
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
```

`<Toaster />` は `sonner` のトースト通知コンポーネントです。

### メタデータ

**説明**: `metadata` オブジェクトをエクスポートすることで、ページのメタデータ（タイトル、説明、OGP など）を設定できます。メタデータや SEO の詳細については [SEO ガイド](./seo-guide.md) を参照してください。

**このアプリでの使用箇所**:

[`app/layout.tsx`](../../app/layout.tsx) (`metadata`エクスポート)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL!),
  title: {
    default: "白熊堂 | 本格かき氷のお店",
    template: "%s | 白熊堂",
  },
  description:
    "白熊堂は川崎ラチッタデッラにある本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
  openGraph: { ... },
  twitter: { ... },
};
```

### フォント最適化

**説明**: Next.js の `next/font/google` を使用すると、Google Fonts を最適化して読み込めます。

**このアプリでの使用箇所**:

[`app/layout.tsx`](../../app/layout.tsx) (`notoSansJP`フォント設定)

```typescript
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
```

## このアプリでの App Router の使用例まとめ

### ページ構成

**公開ページ** (`(public)` ルートグループ内):

1. **ホームページ** ([`app/(public)/page.tsx`](../../app/(public)/page.tsx))

   - Server Component + Suspense + ISR構造
   - ISR + オンデマンド再検証でキャッシュを管理
   - キャッシュミス時のみ`Suspense`のfallbackでローディング画面を表示
   - データ取得は[`HomeContent.tsx`](../../app/(public)/HomeContent.tsx)で行う
   - ローディングUIは[`LoadingScreen.tsx`](../../app/components/LoadingScreen.tsx)で共通化

2. **FAQ ページ** ([`app/(public)/faq/page.tsx`](../../app/(public)/faq/page.tsx))

   - Server Component
   - 静的なコンテンツを表示

3. **ショップページ** ([`app/(public)/shop/page.tsx`](../../app/(public)/shop/page.tsx))

   - Server Component
   - 準備中メッセージを表示

4. **商品詳細ページ** ([`app/(public)/menu/[id]/page.tsx`](../../app/(public)/menu/[id]/page.tsx))

   - Server Component + 動的ルーティング
   - `generateMetadata`でSEO/OGP対応
   - サイト内リンクからはIntercepting Routeでモーダル表示
   - 直接アクセス・リロード時はフルページ表示

5. **天然氷紹介ページ** ([`app/(public)/about-ice/page.tsx`](../../app/(public)/about-ice/page.tsx))

   - Server Component + Client Component（スクロールアニメーション）

**管理ページ** (ルートグループ外):

6. **ダッシュボード** ([`app/dashboard/page.tsx`](../../app/dashboard/page.tsx))
   - Server Component
   - データベースから商品とカテゴリーを取得
   - Client Component にデータを渡す
   - ルートグループ外なので `(public)` のレイアウト・エラーハンドリングは適用されない

### API Routes 構成

1. **商品 API** (`app/api/products/`)

   - `GET /api/products`: 商品一覧取得
   - `POST /api/products`: 商品作成
   - `GET /api/products/[id]`: 個別商品取得（商品詳細モーダル・商品詳細ページで`getProductById`経由で使用）
   - `PUT /api/products/[id]`: 商品更新
   - `DELETE /api/products/[id]`: 商品削除
   - `POST /api/products/upload`: 画像アップロード
   - `POST /api/products/reorder`: 商品順序変更

### ベストプラクティス

**データフェッチング**:
- Server Components: Prismaで直接データベースにアクセス
- Client Components: `fetch` APIでAPI Routesを呼び出し
- 独立した操作は`Promise.all`で並列化

**キャッシュ制御**:
- トップページ: ISR + オンデマンド再検証（商品変更時に`revalidatePath('/')`で無効化）
- 管理画面・API: `export const dynamic = "force-dynamic"`で常に最新データ
- Client側: タイムスタンプと`cache: "no-store"`を使用

**エラーハンドリング**:
- API Routesでは`withErrorHandling`で統一

## 参考リンク

- [Next.js ガイド](./nextjs-guide.md)
- [React ガイド](./react-guide.md)
- [Next.js 公式ドキュメント - App Router](https://nextjs.org/docs/app)
