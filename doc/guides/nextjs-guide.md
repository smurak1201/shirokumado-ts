# Next.js ガイド

## 目次

- [概要](#概要)
- [Next.js とは](#nextjs-とは)
- [App Router](#app-router)
- [設定ファイル](#設定ファイル)
  - [next.config.ts](#nextconfigts)
- [画像最適化](#画像最適化)
  - [Image コンポーネントの特徴](#image-コンポーネントの特徴)
  - [このアプリでの使用箇所](#このアプリでの使用箇所)
  - [画像最適化の設定](#画像最適化の設定)
- [フォント最適化](#フォント最適化)
  - [フォント最適化の特徴](#フォント最適化の特徴)
  - [このアプリでの使用箇所](#このアプリでの使用箇所-1)
- [メタデータと SEO](#メタデータと-seo)
  - [メタデータの設定](#メタデータの設定)
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
- [Next.js のベストプラクティス](#nextjs-のベストプラクティス)
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
- **インクリメンタル静的再生成（ISR）**: 静的ページを段階的に再生成 - **このアプリでは未使用**
- **App Router**: ファイルベースのルーティングシステム（Next.js 13 以降） - **このアプリで使用中**
- **API Routes**: サーバーレス関数として API エンドポイントを実装 - **このアプリで使用中**
- **画像最適化**: 自動的な画像最適化と WebP/AVIF 変換 - **このアプリで使用中**
- **コード分割**: ページごとに自動的にコードを分割し、バンドルサイズを削減 - **このアプリで使用中**
- **フォント最適化**: Google Fonts などのフォントを最適化して読み込み - **このアプリで使用中**

**未使用機能の説明**:

**静的サイト生成（SSG）とインクリメンタル静的再生成（ISR）**

このアプリでは、`export const dynamic = "force-dynamic"`を使用して動的レンダリングを強制しているため、SSG と ISR は使用されていません。ただし、これらの機能は知っておくと便利です。

**ISR の使用例**:

```typescript
// 1時間ごとにページを再生成
export const revalidate = 3600;

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
```

- ビルド時にすべてのページを生成する必要がない
- 指定した間隔で自動的にページを再生成
- パフォーマンスと最新性のバランスが取れる
- データが頻繁に変更されないページに適している

**このアプリで使用しない理由**:

- 商品情報は頻繁に更新される可能性があるため、常に最新のデータを表示する必要がある
- 動的レンダリングにより、データベースから常に最新のデータを取得できる

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

- **ページ**: [`app/page.tsx`](../../app/page.tsx)（ホームページ）、[`app/faq/page.tsx`](../../app/faq/page.tsx)（FAQ ページ）、[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)（ダッシュボード）
- **API Routes**: `app/api/products/`、`app/api/categories/`

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
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },

  // 実験的な機能（必要に応じて）
  experimental: {
    // サーバーアクションの最適化
    serverActions: {
      bodySizeLimit: '2mb',
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

   - `formats: ['image/avif', 'image/webp']`: AVIF と WebP 形式を優先的に使用
     - AVIF は最新の画像形式で、JPEG よりも約 50% 小さなファイルサイズを実現
     - WebP は広くサポートされており、JPEG よりも約 25-35% 小さなファイルサイズを実現
     - ブラウザがサポートしていない場合は、元の形式にフォールバック
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

- **パフォーマンス**: 画像最適化により、ページの読み込み速度が向上
- **セキュリティ**: `remotePatterns` により、許可されたドメインからのみ画像を読み込む
- **型安全性**: TypeScript の設定により、型エラーを早期に検出

## 画像最適化

Next.js は、`next/image` コンポーネントを使用して、画像の自動最適化を提供します。

### Image コンポーネントの特徴

- **自動的な画像最適化**: 画像を自動的に最適化し、WebP や AVIF 形式に変換
- **レスポンシブ画像**: `sizes` 属性を使用して、デバイスに応じた画像サイズを提供
- **遅延読み込み**: `loading="lazy"` により、必要な時だけ画像を読み込む
- **優先読み込み**: `priority` 属性により、重要な画像を優先的に読み込む

### このアプリでの使用箇所

1. **[`app/page.tsx`](../../app/page.tsx) (ヒーロー画像セクション)** - ヒーロー画像の最適化

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
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
```

- `formats`: AVIF と WebP 形式を優先的に使用（ブラウザがサポートしている場合）
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

Next.js は、`metadata` オブジェクトを使用して、ページのメタデータを設定できます。

### メタデータの設定

**このアプリでの使用箇所**:

**[`app/layout.tsx`](../../app/layout.tsx)** - ルートレイアウトのメタデータ

[`app/layout.tsx`](../../app/layout.tsx) (`metadata`エクスポート)

```typescript
  title: "白熊堂 | 本格かき氷のお店",
  description:
    "白熊堂は本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
  openGraph: {
    title: "白熊堂 | 本格かき氷のお店",
    description:
      "白熊堂は本格かき氷のお店です。ふわふわの氷とこだわりのシロップでお待ちしています。",
    type: "website",
  },
};
```

**メタデータの種類**:

- **title**: ページのタイトル（ブラウザのタブに表示）
- **description**: ページの説明（検索エンジンの検索結果に表示）
- **openGraph**: OGP の設定（SNS でのシェア時に表示される情報）

**SEO のメリット**:

- **検索エンジン最適化**: 適切なメタデータにより、検索エンジンでの表示を最適化
- **SNS シェア**: OGP により、SNS でのシェア時に適切な情報を表示
- **アクセシビリティ**: 適切なタイトルと説明により、アクセシビリティを向上

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
- `.next/`: ビルド成果物が保存されるディレクトリ
- `out/`: 静的エクスポートの場合、静的ファイルが保存されるディレクトリ

### デプロイメント

このアプリは、Vercel にデプロイされています。

**Vercel でのデプロイメントの特徴**:

- **自動デプロイ**: Git リポジトリと連携し、プッシュ時に自動的にデプロイ
- **プレビュー環境**: プルリクエストごとに自動的にプレビュー環境を生成
- **エッジネットワーク**: グローバル CDN により、世界中で高速な配信を実現
- **サーバーレス関数**: API Routes を自動的にサーバーレス関数としてデプロイ

**詳細は [デプロイメントガイド](../deployment.md) を参照してください。**

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

- [`app/page.tsx`](../../app/page.tsx): ホームページ（Server Component）
- [`app/faq/page.tsx`](../../app/faq/page.tsx): FAQ ページ（Server Component）
- [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx): ダッシュボードページ（Server Component）

## このアプリでの Next.js の使用例まとめ

### ページ構成と API Routes

**App Router の詳細な実装については、[App Router ガイド](./app-router-guide.md) を参照してください。**

このアプリでは、以下のページと API を実装しています：

- **ページ**: [`app/page.tsx`](../../app/page.tsx)（ホームページ）、[`app/faq/page.tsx`](../../app/faq/page.tsx)（FAQ ページ）、[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx)（ダッシュボード）
- **API Routes**: `app/api/products/`、`app/api/categories/`

### 設定ファイル

- **[`next.config.ts`](../../next.config.ts)**: 画像最適化、実験的な機能、TypeScript の設定
- **[`app/layout.tsx`](../../app/layout.tsx)**: メタデータ、フォント、グローバルスタイルの設定

### 最適化機能

- **画像最適化**: Next.js Image コンポーネントで画像を自動最適化
- **フォント最適化**: Google Fonts を最適化して読み込み
- **コード分割**: ページごとに自動的にコードを分割
- **Server Components**: クライアントサイドの JavaScript を最小化

## Next.js のベストプラクティス

**詳細なベストプラクティスについては、[Next.js 公式ドキュメント - ベストプラクティス](https://nextjs.org/docs/app/building-your-application/routing) を参照してください。**

このアプリで実践している主なベストプラクティス：

1. **Server Components を優先**: デフォルトで Server Components を使用し、インタラクティブな機能が必要な場合のみ Client Components を使用
2. **画像最適化**: `next/image` コンポーネントを使用して画像を最適化
3. **フォント最適化**: `next/font/google` を使用してフォントを最適化
4. **メタデータの設定**: 適切なメタデータを設定して SEO を最適化
5. **型安全性**: TypeScript を使用して、型安全な開発を行う
6. **パフォーマンス最適化**: Next.js の自動最適化機能を活用し、パフォーマンスを向上

**App Router のベストプラクティスについては、[App Router ガイド - ベストプラクティス](./app-router-guide.md#ベストプラクティス) を参照してください。**

## まとめ

このアプリケーションでは、**Next.js 16.1.1** を使用して以下の機能を実装しています：

1. **App Router**: ファイルベースのルーティングシステムで、直感的なページ構造を実現
2. **画像最適化**: Next.js Image コンポーネントで画像を自動最適化
3. **フォント最適化**: Google Fonts を最適化して読み込み
4. **メタデータと SEO**: 適切なメタデータを設定して SEO を最適化
5. **パフォーマンス最適化**: 自動的な最適化機能を活用し、パフォーマンスを向上

すべての機能は TypeScript で型安全に実装され、Next.js のベストプラクティスに従っています。また、Vercel にデプロイされ、グローバル CDN により高速な配信を実現しています。

## 参考リンク

- **[App Router ガイド](./app-router-guide.md)**: App Router の詳細な使用方法（Server Components、Client Components、API Routes、データフェッチングなど）
- **[React ガイド](./react-guide.md)**: React の詳細な使用方法
- **[JSX ガイド](./jsx-guide.md)**: JSX の構文と使用方法
- **[ユーティリティ関数ガイド](./utilities-guide.md)**: 設定ファイル（`lib/config.ts`）の詳細
- **[デプロイメントガイド](../deployment.md)**: デプロイ手順
- **[Next.js 公式ドキュメント](https://nextjs.org/docs)**: Next.js の包括的なドキュメント
```
