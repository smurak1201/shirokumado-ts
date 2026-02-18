# Next.js ガイド

## このドキュメントの役割

このドキュメントは「**Next.js フレームワークの全体像**」を説明します。設定ファイル、画像最適化、SEO など、Next.js の機能を理解したいときに参照してください。

**関連ドキュメント**:
- [App Router ガイド](./app-router-guide.md): ルーティングとデータフェッチの詳細
- [開発ガイドライン](../../development-guide.md#nextjs-app-router): コーディング規約

## 目次

- [概要](#概要)
- [Next.js とは](#nextjs-とは)
- [App Router](#app-router)
- [Proxy（Next.js 16）](#proxy（nextjs-16）)
- [設定ファイル](#設定ファイル)
  - [next.config.ts](#nextconfigts)
- [画像最適化](#画像最適化)
  - [Image コンポーネントの特徴](#image-コンポーネントの特徴)
  - [このアプリでの使用箇所](#このアプリでの使用箇所)
  - [画像最適化の設定](#画像最適化の設定)
- [フォント最適化](#フォント最適化)
  - [フォント最適化の特徴](#フォント最適化の特徴)
  - [このアプリでの使用箇所](#このアプリでの使用箇所)
- [メタデータと SEO](#メタデータと-seo)
  - [アイコンとファビコン](#アイコンとファビコン)
- [ビルドとデプロイ](#ビルドとデプロイ)
  - [ビルドプロセス](#ビルドプロセス)
  - [デプロイメント](#デプロイメント)
- [パフォーマンス最適化](#パフォーマンス最適化)
  - [自動的な最適化](#自動的な最適化)
  - [Server Components](#server-components)
- [このアプリでの Next.js の使用例まとめ](#このアプリでの-nextjs-の使用例まとめ)
  - [ページ構成と API Routes](#ページ構成と-api-routes)
  - [設定ファイル](#設定ファイル-1)
  - [最適化機能](#最適化機能)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

Next.js は、React ベースの本番環境対応フレームワークです。サーバーサイドレンダリング（SSR）、静的サイト生成（SSG）、API Routes などの機能を統合的に提供し、モダンな Web アプリケーション開発を効率的に行えます。

このアプリケーションでは、**Next.js 16.1.1** を使用して、ホームページ、FAQ ページ、ダッシュボード、API Routes を実装しています。

**Next.js の主な特徴**:

- **App Router**: ファイルベースのルーティングシステムで、直感的なページ構造を実現
- **Server Components**: デフォルトでサーバーサイドでレンダリングされ、クライアントサイドの JavaScript を最小化
- **自動的な最適化**: 画像最適化、コード分割、バンドル最適化が自動で行われる
- **API Routes**: フロントエンドとバックエンドを同じプロジェクトで管理可能
- **型安全性**: TypeScript との統合が優れており、型安全な開発が可能
- **デプロイメント**: Vercel との統合により、簡単にデプロイ可能

## Next.js とは

Next.js は、Vercel が開発した、React ベースの本番環境対応フレームワークです。React アプリケーションを本番環境で運用するために必要な機能を統合的に提供します。

**Next.js の主な機能**:

- **サーバーサイドレンダリング（SSR）**: サーバー側で HTML を生成し、初期表示を高速化 - **このアプリで使用中**
- **静的サイト生成（SSG）**: ビルド時に HTML を生成し、パフォーマンスを最適化 - **このアプリでは未使用**
- **インクリメンタル静的再生成（ISR）**: 静的ページを段階的に再生成 - **このアプリで使用中**（トップページ）
- **App Router**: ファイルベースのルーティングシステム（Next.js 13 以降） - **このアプリで使用中**
- **API Routes**: サーバーレス関数として API エンドポイントを実装 - **このアプリで使用中**
- **画像最適化**: 自動的な画像最適化と WebP/AVIF 変換 - **このアプリで使用中**
- **コード分割**: ページごとに自動的にコードを分割し、バンドルサイズを削減 - **このアプリで使用中**
- **フォント最適化**: Google Fonts などのフォントを最適化して読み込み - **このアプリで使用中**

**未使用機能の説明**:

**静的サイト生成（SSG）**

このアプリでは SSG は使用されていません。商品データはDBから取得する必要があるため、ビルド時の静的生成は適していません。

**インクリメンタル静的再生成（ISR）**

このアプリでは、トップページでISR + オンデマンド再検証を使用しています。`force-dynamic`を使わず、ページを一度レンダリングしてキャッシュし、管理画面から商品を更新した際に`revalidatePath('/')`でキャッシュを無効化します。

- キャッシュヒット時は即座にページを返却（ローディング画面なし）
- 商品変更後の初回アクセス時のみ再レンダリング
- LCPの改善とDBアクセスの削減を実現

```typescript
// 商品変更APIでの再検証
import { revalidatePath } from 'next/cache';

// 商品を更新・作成・削除・並び替えした後
revalidatePath('/');  // トップページのキャッシュを無効化
```

**注意**: 管理画面（`dashboard/page.tsx`）やAPI Routesでは、常に最新データが必要なため`force-dynamic`を維持しています。

**具体例**:

```typescript
// calculatePublishedStatus() は現在時刻を使用
export function calculatePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null
): boolean {
  const now = getJapanTime(); // 現在時刻を使用
  // 公開日が未来の場合は非公開
  if (publishedAt && new Date(publishedAt) > now) {
    return false;
  }
  // 終了日が過去の場合は非公開
  if (endedAt && new Date(endedAt) < now) {
    return false;
  }
  return true;
}
```

この関数は、リクエストごとに現在時刻を取得して公開状態を判定するため、動的レンダリングが必要です。

**詳細な説明は [Next.js 公式ドキュメント](https://nextjs.org/docs) を参照してください。**

**このアプリでの使われ方**:

- App Router を使用して、ファイルベースのルーティングを実装
- Server Components を活用し、データベースから直接データを取得してレンダリング
- API Routes で商品管理の CRUD 操作を実装
- Next.js Image コンポーネントで画像の自動最適化と WebP 変換を実現
- メタデータとフォント最適化により、SEO とパフォーマンスを向上

## App Router

Next.js 13 以降で導入された新しいルーティングシステムです。ファイルベースのルーティングと、React Server Components を活用したサーバーサイドレンダリングを提供します。

**App Router の詳細な使用方法については、[App Router ガイド](./app-router-guide.md) を参照してください。**

このガイドでは、App Router の以下の内容について詳しく説明しています：

- ディレクトリ構造とルーティングの規則
- Server Components と Client Components の使い分け
- データフェッチングの方法
- 動的ルーティング
- API Routes の実装
- 画像最適化
- レイアウトとテンプレート

このアプリでは、App Router を使用して以下のページと API を実装しています：

- **ページ**: [`app/page.tsx`](../../app/(public)/page.tsx)（ホームページ）、[`app/faq/page.tsx`](../../app/(public)/faq/page.tsx)（FAQ ページ）、[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)（ダッシュボード）
- **API Routes**: `app/api/products/`

## Proxy（Next.js 16）

Next.js 16では、従来の`middleware.ts`に代わり`proxy.ts`を使用してリクエストの前処理を行います。

**このアプリでの使用箇所**:

- [`proxy.ts`](../../proxy.ts): 認証状態に基づくルートガード

**Proxyの特徴**:

- **リクエストの前処理**: ページやAPIへのリクエストが処理される前に実行される
- **認証ガード**: 認証状態に基づいてリダイレクトを制御
- **パターンマッチング**: `matcher`設定で対象となるパスを指定

**このアプリでの実装**:

```typescript
import { auth } from '@/auth';

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 未認証ユーザーがダッシュボードへアクセス → ログインページへ
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', req.url));
  }

  // 認証済みユーザーが認証ページへアクセス → ダッシュボードへ
  if (pathname.startsWith('/auth') && isLoggedIn) {
    return Response.redirect(new URL('/dashboard/homepage', req.url));
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
```

**ポイント**:

- NextAuth v5の`auth()`関数をラップして使用することで、セッションの有効性を確認
- リダイレクトロジックを一元管理し、リダイレクトループを防止
- `matcher`で対象パスを限定することで、不要なパス（静的ファイルなど）での実行を回避

**詳細な認証フローについては、[認証システム](../../authentication.md#protected-routes（proxy）) を参照してください。**

## 設定ファイル

### next.config.ts

Next.js の設定を管理するファイルです。画像最適化、実験的な機能、TypeScript の設定などを定義します。

**このアプリでの使用箇所**:

- [`next.config.ts`](../../next.config.ts): Next.js の設定ファイル

**設定内容**:

[`next.config.ts`](../../next.config.ts) (`nextConfig`設定)

```typescript
const nextConfig: NextConfig = {
  // 画像最適化の設定
  images: {
    // 画像最適化を無効化（Edge Requestを削減するため）
    // 理由: 画像は既にクライアントサイドで圧縮・WebP形式に変換されているため、
    // Next.jsのサーバーサイド最適化は不要。遅延読み込みなどの機能は引き続き機能する。
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  // 実験的な機能（必要に応じて）
  experimental: {
    // サーバーアクションの最適化
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // 型チェックの設定
  typescript: {
    // 本番ビルド時に型エラーがある場合、ビルドを失敗させる
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

**設定項目の詳細**:

1. **画像最適化** (`images`):

   - `unoptimized: true`: 画像最適化を無効化
     - **理由**: 画像は既にクライアントサイドで圧縮・WebP 形式に変換されているため、Next.js のサーバーサイド最適化は不要です
     - **効果**: Vercel の Edge Request を大幅に削減できます（各画像の最適化リクエストが Edge Request としてカウントされるため）
     - **注意**: `unoptimized: true`を設定しても、遅延読み込み（`loading="lazy"`）や`priority`属性などの機能は引き続き機能します
   - `formats: ['image/avif', 'image/webp']`: AVIF と WebP 形式を優先的に使用（設定は残していますが、`unoptimized: true`により実際には使用されません）
   - `remotePatterns`: 外部ドメインからの画像読み込みを許可
     - `protocol: 'https'`: HTTPS プロトコルのみ許可（セキュリティ）
     - `hostname: '*.public.blob.vercel-storage.com'`: Vercel Blob Storage からの画像読み込みを許可
     - ワイルドカード（`*`）を使用して、すべてのサブドメインを許可

2. **実験的な機能** (`experimental`):

   - `serverActions.bodySizeLimit: '2mb'`: サーバーアクションのボディサイズ制限を 2MB に設定
     - ファイルアップロードなどの大きなペイロードを処理する際の制限
     - このアプリでは画像アップロードに使用（実際の画像は Blob Storage に直接アップロード）

3. **TypeScript** (`typescript`):

   - `ignoreBuildErrors: false`: 本番ビルド時に型エラーがある場合、ビルドを失敗させる
     - 型安全性を確保し、実行時エラーを防止
     - 開発環境では型エラーがあってもビルドは続行されるが、本番環境では型エラーがあるとビルドが失敗

**設定の変更方法**:

設定を変更する場合は、[`next.config.ts`](../../next.config.ts) を編集し、開発サーバーを再起動してください。

**理由**:

- **Edge Request の削減**: `unoptimized: true`により、Vercel の Edge Request を大幅に削減できます。画像は既にクライアントサイドで最適化されているため、サーバーサイドでの再処理は不要です
- **パフォーマンス**: 画像は既にクライアントサイドで圧縮・WebP 形式に変換されているため、追加の最適化は不要です。遅延読み込みなどの機能は引き続き機能します
- **セキュリティ**: `remotePatterns` により、許可されたドメインからのみ画像を読み込む
- **型安全性**: TypeScript の設定により、型エラーを早期に検出

## 画像最適化

Next.js は、`next/image` コンポーネントを使用して、画像の自動最適化を提供します。

**注意**: このアプリでは、`unoptimized: true`を設定しているため、Next.js のサーバーサイド画像最適化は無効化されています。画像は既にクライアントサイドで圧縮・WebP 形式に変換されているため、追加の最適化は不要です。

### Image コンポーネントの特徴

- **遅延読み込み**: `loading="lazy"` により、必要な時だけ画像を読み込む（`unoptimized: true`でも機能します）
- **優先読み込み**: `priority` 属性により、重要な画像を優先的に読み込む（`unoptimized: true`でも機能します）
- **レスポンシブ画像**: `sizes` 属性を使用して、デバイスに応じた画像サイズを提供（ブラウザのネイティブ機能として機能します）
- **レイアウトシフトの防止**: `width`、`height`、`fill`属性により、画像読み込み時のレイアウトシフトを防止

**このアプリでの画像処理フロー**:

1. **アップロード時（クライアントサイド）**: 画像を最大 1920x1920px にリサイズし、WebP 形式に圧縮（品質 0.85）
2. **表示時**: `next/image`コンポーネントで表示（サーバーサイド最適化は無効化されているため、Edge Request は発生しません）

### このアプリでの使用箇所

1. **[`app/page.tsx`](../../app/(public)/page.tsx) (ヒーロー画像セクション)** - ヒーロー画像の最適化

```typescript
<Image
  src="/hero.webp"
  alt="白熊堂"
  fill
  priority
  className="object-cover"
  sizes="100vw"
/>
```

2. **[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx) (商品画像セクション)** - 商品画像の最適化

```typescript
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover transition-transform duration-500 group-hover:scale-110"
  sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
  loading="lazy"
/>
```

3. **[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx) (モーダル内の商品画像セクション)** - モーダル内の商品画像

```typescript
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 800px"
  priority
/>
```

### 画像最適化の設定

[`next.config.ts`](../../next.config.ts) で画像最適化の設定を行います：

[`next.config.ts`](../../next.config.ts) (`images`設定)

```typescript
  images: {
    // 画像最適化を無効化（Edge Requestを削減するため）
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
```

- `unoptimized: true`: 画像最適化を無効化
  - **理由**: 画像は既にクライアントサイドで圧縮・WebP 形式に変換されているため、Next.js のサーバーサイド最適化は不要です
  - **効果**: Vercel の Edge Request を大幅に削減できます
  - **注意**: 遅延読み込み（`loading="lazy"`）や`priority`属性などの機能は引き続き機能します
- `formats`: AVIF と WebP 形式を優先的に使用（設定は残していますが、`unoptimized: true`により実際には使用されません）
- `remotePatterns`: Vercel Blob Storage からの画像読み込みを許可

## フォント最適化

Next.js は、`next/font/google` を使用して、Google Fonts を最適化して読み込みます。

### フォント最適化の特徴

- **自動的な最適化**: フォントファイルを自動的に最適化し、パフォーマンスを向上
- **自己ホスト**: フォントを自己ホストし、外部リクエストを削減
- **CSS 変数**: フォントを CSS 変数として使用可能

### このアプリでの使用箇所

**[`app/layout.tsx`](../../app/layout.tsx)** - Noto Sans JP フォントの最適化

[`app/layout.tsx`](../../app/layout.tsx) (`notoSansJP`フォント設定)

```typescript
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});
```

[`app/layout.tsx`](../../app/layout.tsx) (`Analytics`コンポーネント)

**フォント最適化のメリット**:

- **パフォーマンス向上**: フォントファイルを最適化し、読み込み時間を短縮
- **レイアウトシフトの防止**: フォントの読み込みによるレイアウトシフトを防止
- **プライバシー**: 外部フォントサービスへのリクエストを削減

## メタデータと SEO

Next.js は、`layout.tsx` や `page.tsx` に `metadata` オブジェクトを export するだけで、HTML の `<head>` 内にメタタグを自動生成できます。

**このアプリでの使用箇所**: [`app/layout.tsx`](../../app/layout.tsx)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL!),
  title: {
    default: "白熊堂 | 本格かき氷のお店",
    template: "%s | 白熊堂",
  },
  description: "...",
  openGraph: { ... },
  twitter: { ... },
};
```

各フィールドの詳細（metadataBase、title.template、OGP、Twitter Card 等）や、JSON-LD、sitemap、robots については [SEO ガイド](./seo-guide.md) を参照してください。

**アイコン**: `app/icon.png` と `app/apple-icon.png` を配置すると、Next.js が自動検出するため `metadata.icons` での指定は不要です。詳細は[アイコンとファビコン](#アイコンとファビコン)を参照してください。

### アイコンとファビコン

ブラウザのタブやブックマーク、スマートフォンのホーム画面に表示されるアイコンです。デバイスやブラウザによって参照するファイルが異なるため、複数の形式・サイズを用意する必要があります。

#### ブラウザがアイコンを探す仕組み

ブラウザはページを読み込む際、以下の順序でアイコンを探します：

1. **HTMLの`<link>`タグ** — `<link rel="icon">` や `<link rel="apple-touch-icon">` を参照
2. **Web App Manifest** — `manifest.webmanifest` の `icons` 配列を参照
3. **`/favicon.ico`** — 上記がない場合、ルートの `favicon.ico` にフォールバック

デスクトップブラウザは主に `<link rel="icon">` を使いますが、**iOSのブラウザ（Safari、Edge、Chrome）は `<link rel="apple-touch-icon">` を優先的に探します**。このタグがない場合、ホスティングサービス（Vercelなど）のデフォルトアイコンが表示されることがあります。

#### Next.js での設定方法

Next.js の App Router では、`app/` ディレクトリに特定のファイル名で画像を配置すると、自動的に対応する `<link>` タグが生成されます。`metadata` での手動指定は不要です。

| ファイル | 生成されるタグ | 用途 |
|---|---|---|
| `app/icon.png` | `<link rel="icon">` | ブラウザタブのファビコン |
| `app/apple-icon.png` | `<link rel="apple-touch-icon">` | iOSホーム画面用アイコン |

#### このアプリでの構成

```
app/
├── icon.png              # ファビコン（32x32 PNG）
└── apple-icon.png        # iOSホーム画面用アイコン（180x180 PNG）

public/
├── icon-192x192.png      # PWA用アイコン（192x192）
├── icon-512x512.png      # PWA用アイコン（512x512）
└── manifest.webmanifest  # Web App Manifest
```

**各ファイルの役割**:

- **`app/icon.png`（32x32）**: PCブラウザのタブに表示されるファビコン。Next.js が自動検出して `<link rel="icon">` を生成
- **`app/apple-icon.png`（180x180）**: iOSでホーム画面に追加した際やブックマークに表示されるアイコン。Next.js が自動検出して `<link rel="apple-touch-icon">` を生成
- **`public/icon-192x192.png`、`icon-512x512.png`**: Web App Manifest から参照されるPWA用アイコン
- **`public/manifest.webmanifest`**: アプリ名やアイコン情報を定義するマニフェストファイル。`layout.tsx` の `metadata.manifest` で参照

#### アイコンのサイズと形式

| サイズ | 形式 | 用途 |
|---|---|---|
| 32x32 | PNG | ブラウザタブのファビコン |
| 180x180 | PNG | iOS（apple-touch-icon） |
| 192x192 | PNG | Android / PWA |
| 512x512 | PNG | PWA（スプラッシュ画面など） |

**注意点**:

- **ICO形式は不要**: Next.js の `app/icon.png` による自動検出を使用するため、`favicon.ico` は不要
- **PNG形式を使用**: すべてのモダンブラウザがPNGをサポートしており、ICOより軽量で管理しやすい
- **画像の生成元を統一**: すべてのサイズのアイコンは同じ元画像から生成し、一貫性を保つ

## ビルドとデプロイ

### ビルドプロセス

Next.js は、`npm run build` コマンドでプロダクションビルドを実行します。

**ビルドプロセスの流れ**:

1. **型チェック**: TypeScript の型チェックを実行
2. **コンパイル**: TypeScript を JavaScript にコンパイル
3. **コード分割**: ページごとにコードを分割
4. **最適化**: 画像、フォント、CSS を最適化
5. **静的生成**: 静的ページを生成（可能な場合）

**ビルドコマンド**:

```bash
npm run build
```

- `.next/`: ビルド成果物が保存されるディレクトリ
- `out/`: 静的エクスポートの場合、静的ファイルが保存されるディレクトリ

### デプロイメント

このアプリは、Vercel にデプロイされています。

**Vercel でのデプロイメントの特徴**:

- **自動デプロイ**: Git リポジトリと連携し、プッシュ時に自動的にデプロイ
- **プレビュー環境**: プルリクエストごとに自動的にプレビュー環境を生成
- **エッジネットワーク**: グローバル CDN により、世界中で高速な配信を実現
- **サーバーレス関数**: API Routes を自動的にサーバーレス関数としてデプロイ

**詳細は [デプロイメントガイド](../../deployment.md) を参照してください。**

## パフォーマンス最適化

Next.js は、様々な最適化機能を提供し、パフォーマンスを向上させます。

**詳細な最適化方法については、[Next.js 公式ドキュメント - パフォーマンス](https://nextjs.org/docs/app/building-your-application/optimizing) を参照してください。**

### 自動的な最適化

Next.js は、以下の最適化を自動的に実行します：

1. **コード分割**: ページごとに自動的にコードを分割し、バンドルサイズを削減
2. **画像最適化**: 画像を自動的に最適化し、WebP/AVIF 形式に変換
3. **フォント最適化**: フォントを自動的に最適化し、読み込み時間を短縮
4. **バンドル最適化**: 使用されていないコードを自動的に削除（ツリーシェイキング）

### Server Components

Server Components により、クライアントサイドの JavaScript を最小化し、パフォーマンスを向上させます。

**Server Components の詳細については、[App Router ガイド - Server Components](./app-router-guide.md#server-components-と-client-components) を参照してください。**

**このアプリでの使用例**:

- [`app/page.tsx`](../../app/(public)/page.tsx): ホームページ（Server Component）
- [`app/faq/page.tsx`](../../app/(public)/faq/page.tsx): FAQ ページ（Server Component）
- [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx): ダッシュボードページ（Server Component）

## このアプリでの Next.js の使用例まとめ

### ページ構成と API Routes

**App Router の詳細な実装については、[App Router ガイド](./app-router-guide.md) を参照してください。**

このアプリでは、以下のページと API を実装しています：

- **ページ**: [`app/page.tsx`](../../app/(public)/page.tsx)（ホームページ）、[`app/faq/page.tsx`](../../app/(public)/faq/page.tsx)（FAQ ページ）、[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)（ダッシュボード）
- **API Routes**: `app/api/products/`

### 設定ファイル

- **[`next.config.ts`](../../next.config.ts)**: 画像最適化、実験的な機能、TypeScript の設定
- **[`app/layout.tsx`](../../app/layout.tsx)**: メタデータ、フォント、グローバルスタイルの設定

### 最適化機能

- **画像最適化**: Next.js Image コンポーネントで画像を自動最適化
- **フォント最適化**: Google Fonts を最適化して読み込み
- **コード分割**: ページごとに自動的にコードを分割
- **Server Components**: クライアントサイドの JavaScript を最小化

## まとめ

このアプリケーションでは、**Next.js 16** を使用して以下を実装しています：

- **App Router**: ファイルベースのルーティング
- **Server Components**: デフォルトで使用し、必要な場合のみClient Components
- **画像最適化**: クライアントサイドで圧縮・WebP変換、`next/image`で表示
- **フォント最適化**: `next/font/google`でNoto Sans JPを最適化
- **メタデータ**: SEO用のタイトル・説明・OGPを設定

## 参考リンク

- [App Router ガイド](./app-router-guide.md)
- [React ガイド](./react-guide.md)
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
