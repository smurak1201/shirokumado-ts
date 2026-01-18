# Next.js App Router ガイド

## 目次

- [概要](#概要)
- [App Router とは](#app-router-とは)
- [App Router のディレクトリ構造](#app-router-のディレクトリ構造)
- [Server Components と Client Components](#server-components-と-client-components)
  - [Server Components](#server-components)
  - [Client Components](#client-components)
- [データフェッチング](#データフェッチング)
  - [Server Components でのデータフェッチング](#server-components-でのデータフェッチング)
  - [Client Components でのデータフェッチング（fetch API）](#client-components-でのデータフェッチングfetch-api)
  - [動的レンダリングの設定](#動的レンダリングの設定)
- [動的ルーティング](#動的ルーティング)
- [API Routes](#api-routes)
  - [Server Actions（このアプリでは未使用）](#server-actionsこのアプリでは未使用)
- [画像最適化](#画像最適化)
- [レイアウトとテンプレート](#レイアウトとテンプレート)
  - [ルートレイアウト](#ルートレイアウト)
  - [メタデータ](#メタデータ)
  - [フォント最適化](#フォント最適化)
- [このアプリでの App Router の使用例まとめ](#このアプリでの-app-router-の使用例まとめ)
  - [ページ構成](#ページ構成)
  - [API Routes 構成](#api-routes-構成)
  - [ベストプラクティス](#ベストプラクティス)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

Next.js App Router は、Next.js 13 以降で導入された新しいルーティングシステムです。ファイルベースのルーティングと、React Server Components を活用したサーバーサイドレンダリングを提供します。

このアプリケーションでは、Next.js 16.1.1 の App Router を使用して、ホームページ、FAQ ページ、ダッシュボード、API Routes を実装しています。

## App Router とは

**Next.js 全体の説明については、[Next.js ガイド](doc/guides/nextjs-guide.md) を参照してください。**

**App Router の主な特徴**:

- **ファイルベースのルーティング**: `app/` ディレクトリ内のファイル構造がそのまま URL ルートになる
- **Server Components**: デフォルトでサーバーサイドでレンダリングされ、クライアントサイドの JavaScript を最小化
- **レイアウトシステム**: ネストされたレイアウトにより、ページ間で共通の UI を共有
- **API Routes**: `route.ts` ファイルで API エンドポイントを実装
- **データフェッチング**: Server Components で直接データベースにアクセス可能
- **動的ルーティング**: `[id]` などの動的セグメントを使用した柔軟なルーティング

## App Router のディレクトリ構造

App Router では、`app/` ディレクトリ内のファイル構造がそのまま URL ルートになります。

**注意**: プロジェクト全体のディレクトリ構造の詳細については、[プロジェクト構造ドキュメント](doc/project-structure.md)を参照してください。設計思想については、[アーキテクチャドキュメント](doc/architecture.md#ディレクトリ構造の設計思想)を参照してください。

**このアプリでの App Router のディレクトリ構造**:

```
├── layout.tsx          # ルートレイアウト（全ページ共通）
├── page.tsx           # ホームページ（/）
├── globals.css        # グローバルスタイル
├── faq/
│   └── page.tsx       # FAQページ（/faq）
├── dashboard/
│   └── page.tsx       # ダッシュボード（/dashboard）
├── api/               # API Routes
│   ├── products/
│   │   ├── route.ts   # GET, POST /api/products
│   │   ├── [id]/
│   │   │   └── route.ts # GET, PUT, DELETE /api/products/[id]
│   │   ├── upload/
│   │   │   └── route.ts # POST /api/products/upload
│   │   └── reorder/
│   │       └── route.ts # POST /api/products/reorder
│   └── categories/
│       └── route.ts   # GET /api/categories
├── components/        # 共通コンポーネント
├── hooks/            # カスタムフック
├── utils/             # ユーティリティ関数
└── types.ts          # 型定義
```

- `page.tsx`: ページコンポーネント（ルートとして機能） - **このアプリで使用中**
- `layout.tsx`: レイアウトコンポーネント（ネストされたレイアウト） - **このアプリで使用中**
- `route.ts`: API エンドポイント（API Routes） - **このアプリで使用中**
- `error.tsx`: エラー UI - **このアプリで使用中**（[`app/error.tsx`](../../app/error.tsx)）
- `loading.tsx`: ローディング UI - **このアプリでは未使用**
- `not-found.tsx`: 404 ページ - **このアプリでは未使用**
- `template.tsx`: テンプレートコンポーネント - **このアプリでは未使用**

**使用中のファイル**:

**`error.tsx`** - Next.js App Router のエラーハンドリング

このアプリでは [`app/error.tsx`](../../app/error.tsx) でエラーハンドリングを実装しています。Server Componentsでエラーが発生した場合に表示されるエラーページです。

**注意**: `error.tsx`はNext.js App Routerのエラーハンドリング用ファイルです。Reactのエラーバウンダリーコンポーネント（[`app/components/ErrorBoundary.tsx`](../../app/components/ErrorBoundary.tsx)）とは異なります。詳細は [React ガイド - エラーバウンダリー](./react-guide.md#9-エラーバウンダリー) を参照してください。

**未使用ファイルの説明**:

このアプリでは、以下のファイルは使用されていませんが、知っておくと便利な機能です：

**`loading.tsx`** - ローディング UI

ページやセグメントの読み込み中に表示される UI を定義します。データフェッチ中にローディングスピナーなどを表示できます。

**使用例**:

```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">読み込み中...</span>
    </div>
  );
}
```

**注意**: このアプリでは `loading.tsx` は使用されていません。上記は参考例です。


**`not-found.tsx`** - 404 ページ

404 ページをカスタマイズします。`notFound()`関数を呼び出した時や、存在しないルートにアクセスした時に表示されます。

**使用例**:

```typescript
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold mb-4">商品が見つかりません</h2>
      <p className="text-gray-600 mb-4">
        お探しの商品は存在しないか、削除された可能性があります。
      </p>
      <Link href="/" className="text-blue-500 hover:underline">
        ホームに戻る
      </Link>
    </div>
  );
}
```

**注意**: このアプリでは `not-found.tsx` は使用されていません。上記は参考例です。

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

- エラーハンドリング: `error.tsx` で Server Components のエラーを処理し、API Routes では `withErrorHandling` で統一して実装している
- ローディング状態は各コンポーネント内で管理している
- 404 ページは Next.js のデフォルトを使用している
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

1. **[`app/page.tsx`](../../app/page.tsx) (`Home`コンポーネント)** - ホームページ（Server Component）

```typescript
  // カテゴリーごとにグループ化された公開商品を取得
  const categoriesWithProducts = await getPublishedProductsByCategory();

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <Header />

      {/* ヒーローバナー */}
      <section className="relative h-[30vh] min-h-[200px] w-full overflow-hidden md:h-[50vh] md:min-h-[400px] lg:h-[60vh] lg:min-h-[500px]">
        <Image
          src="/hero.webp"
          alt="白熊堂"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/8 to-white/25" />
      </section>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:py-20">
        {/* カテゴリーごとの商品セクション */}
        {categoriesWithProducts.map(({ category, products }) => (
          <ProductGrid
            key={category.id}
            category={category}
            products={products}
          />
        ))}
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
```

2. **[`app/faq/page.tsx`](../../app/faq/page.tsx) (`FAQPage`コンポーネント)** - FAQ ページ（Server Component）

```typescript
  /**
   * FAQデータ
   * 質問と回答のペアを配列で定義
   */
  const faqs = [
    {
      question: "かき氷の販売は夏だけですか？",
      answer:
        "通年で営業しており、季節ごとに異なるメニューもご用意しています。",
    },
    // ... 他のFAQデータ
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
          よくある質問
        </h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <h2 className="mb-3 text-lg font-semibold text-gray-900 md:text-xl">
                {faq.question}
              </h2>
              <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
```

3. **[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (`DashboardPage`コンポーネント)** - ダッシュボード（Server Component）

```typescript
  const { categories, products } = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>

        <DashboardContent categories={categories} initialProducts={products} />
      </div>
    </div>
  );
}
```

### Client Components

**説明**: Client Components は、`'use client'` ディレクティブを使用してクライアントサイドでレンダリングされるコンポーネントです。インタラクティブな機能（状態管理、イベントハンドラーなど）を実装するために使用します。

**特徴**:

- クライアントサイドで実行される（ブラウザで JavaScript が実行される）
- `useState`、`useEffect` などの React Hooks が使用可能
- イベントハンドラー（`onClick`、`onChange` など）が使用可能
- ブラウザ API（`localStorage`、`window` など）にアクセス可能

**このアプリでの使用箇所**:

- [`app/components/ProductGrid.tsx`](../../app/components/ProductGrid.tsx): 商品グリッド（モーダル表示などのインタラクティブ機能）
- [`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx): 商品詳細モーダル（開閉状態の管理）
- [`app/dashboard/components/DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx): ダッシュボードコンテンツ（フォーム送信、状態管理）

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

**詳細は [Async/Await ガイド - Server Components でのデータフェッチング](./async-await-guide.md#server-components-でのデータフェッチング) を参照してください。**

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

2. **[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (`getDashboardData`関数)** - ダッシュボードデータを取得

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

**async/await と Promise.all の詳細な使用方法は [Async/Await ガイド](doc/guides/async-await-guide.md) を参照してください。**

### Client Components でのデータフェッチング（fetch API）

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

1. **[`app/dashboard/components/DashboardContent.tsx`](../../app/dashboard/components/DashboardContent.tsx) (`refreshProducts`関数)** - 商品一覧の更新

```typescript
    try {
      // キャッシュを完全に無効化するためにタイムスタンプをクエリパラメータに追加
      // これにより、常に最新のデータを取得できます
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        cache: "no-store", // Next.js のキャッシュを無効化
        headers: {
          "Cache-Control": "no-cache", // ブラウザのキャッシュを無効化
        },
      });
      const data = await response.json();
      // 取得した商品一覧で状態を更新
      setProducts(data.products || []);
    } catch (error) {
      console.error("商品一覧の更新に失敗しました:", error);
    }
  };
```


2. **[`app/dashboard/components/ProductList.tsx`](../../app/dashboard/components/ProductList.tsx) (`handleDelete`関数)** - 商品の削除

```typescript
    // 削除前に確認ダイアログを表示
    if (!confirm("本当にこの商品を削除しますか？")) {
      return;
    }

    try {
      // DELETE リクエストを送信
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "削除に失敗しました");
      }

      alert("商品を削除しました");
      // 削除後に商品一覧を更新
      await refreshProducts();
    } catch (error) {
      console.error("削除エラー:", error);
      alert(
        error instanceof Error ? error.message : "商品の削除に失敗しました"
      );
    }
  };
```

3. **[`app/dashboard/hooks/useProductReorder.ts`](../../app/dashboard/hooks/useProductReorder.ts) (`reorderProducts`関数)** - 商品順序の変更

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

4. **`app/dashboard/components/DashboardForm.tsx`** - 商品の作成と画像アップロード

**画像アップロード（FormData を使用）**:

このアプリでは、画像アップロード処理は`useProductForm`カスタムフック内で実装されています。

[`app/dashboard/hooks/useProductForm.ts`](../../app/dashboard/hooks/useProductForm.ts) (`uploadImage`関数)

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

[`app/dashboard/components/DashboardForm.tsx`](../../app/dashboard/components/DashboardForm.tsx) (商品登録処理)

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

### 動的レンダリングの設定

**説明**: `export const dynamic = "force-dynamic"` を使用して、ページを常に動的にレンダリングするように設定できます。

**このアプリで動的レンダリングを強制している理由**:

1. **公開状態の自動判定**: `calculatePublishedStatus()` 関数が現在時刻を使用して、公開日・終了日に基づいて公開状態を自動判定しています。静的生成（SSG）や ISR を使用すると、ビルド時や再生成時の時刻で公開状態が固定されてしまい、公開日・終了日に基づく自動判定が正しく動作しません。

2. **商品情報の頻繁な更新**: 商品情報は頻繁に更新される可能性があり、常に最新のデータを表示する必要があります。

3. **データベースから最新のデータを取得**: データベースから常に最新のデータを取得する必要があります。

**公開状態の自動判定の例**:

```typescript
// lib/product-utils.ts
export function calculatePublishedStatus(
  publishedAt: Date | null,
  endedAt: Date | null
): boolean {
  const now = getJapanTime(); // 現在時刻を使用（リクエストごとに異なる）

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

**このアプリでの使用箇所**:

1. **[`app/page.tsx`](../../app/page.tsx) (`dynamic`エクスポート)** - 動的レンダリングを強制

```typescript
/**
 * 動的レンダリングを強制
 *
 * 理由:
 * 1. 公開状態の自動判定: calculatePublishedStatus() が現在時刻を使用するため
 * 2. 商品情報の頻繁な更新: 常に最新のデータを表示する必要がある
 * 3. データベースから最新のデータを取得: 常に最新のデータを取得する必要がある
 */
export const dynamic = "force-dynamic";
```

2. **[`app/dashboard/page.tsx`](../../app/dashboard/page.tsx) (`dynamic`エクスポート)** - 動的レンダリングを強制

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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    throw new ValidationError('無効な商品IDです');
  }

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const productId = parseInt(id);
  const body = await request.json();

  if (isNaN(productId)) {
    throw new ValidationError('無効な商品IDです');
  }

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

### Server Actions（このアプリでは未使用）

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

- **[`app/page.tsx`](../../app/page.tsx)**: ヒーロー画像の最適化
- **[`app/components/ProductTile.tsx`](../../app/components/ProductTile.tsx)**: 商品画像の最適化
- **[`app/components/ProductModal.tsx`](../../app/components/ProductModal.tsx)**: モーダル内の商品画像

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
        <Analytics />
      </body>
    </html>
  );
}
```

### メタデータ

**説明**: `metadata` オブジェクトをエクスポートすることで、ページのメタデータ（タイトル、説明、OGP など）を設定できます。

**このアプリでの使用箇所**:

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

### フォント最適化

**説明**: Next.js の `next/font/google` を使用すると、Google Fonts を最適化して読み込めます。

**このアプリでの使用箇所**:

[`app/layout.tsx`](../../app/layout.tsx) (`notoSansJP`フォント設定)

```typescript
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});
```

## このアプリでの App Router の使用例まとめ

### ページ構成

1. **ホームページ** (`app/page.tsx`)

   - Server Component
   - データベースから公開商品を取得
   - カテゴリーごとにグループ化して表示

2. **FAQ ページ** (`app/faq/page.tsx`)

   - Server Component
   - 静的なコンテンツを表示

3. **ダッシュボード** ([`app/dashboard/page.tsx`](../../app/dashboard/page.tsx))
   - Server Component
   - データベースから商品とカテゴリーを取得
   - Client Component にデータを渡す

### API Routes 構成

1. **商品 API** (`app/api/products/`)

   - `GET /api/products`: 商品一覧取得
   - `POST /api/products`: 商品作成
   - `GET /api/products/[id]`: 個別商品取得（**未使用** - 将来的に商品詳細ページや外部 API 連携が必要になった場合に使用する可能性があります）
   - `PUT /api/products/[id]`: 商品更新
   - `DELETE /api/products/[id]`: 商品削除
   - `POST /api/products/upload`: 画像アップロード
   - `POST /api/products/reorder`: 商品順序変更

2. **カテゴリー API** (`app/api/categories/`)
   - `GET /api/categories`: カテゴリー一覧取得（**未使用** - ダッシュボードではサーバーコンポーネントから直接 Prisma で取得しているため、クライアントコンポーネントからの呼び出しは不要です。将来的にクライアント側でカテゴリー一覧を動的に取得する必要が生じた場合に使用する可能性があります）

### ベストプラクティス

1. **Server Components を優先**: データフェッチングや静的なコンテンツは Server Components で実装
2. **Client Components は必要最小限**: インタラクティブな機能が必要な場合のみ Client Components を使用
3. **データフェッチングの使い分け**:
   - **Server Components**: 初期データの取得は Prisma で直接データベースにアクセス
   - **Client Components**: ユーザーの操作に応じた動的なデータ取得は `fetch` API で API Routes を呼び出し
4. **並列データフェッチング**: `Promise.all` を使用して複数のデータを並列で取得（詳細は [Async/Await ガイド - Promise.all](./async-await-guide.md#promiseall---このアプリで使用中) を参照）
5. **動的レンダリングの適切な使用**: 最新のデータが必要な場合や、時刻に依存する処理（公開状態の自動判定など）がある場合は `export const dynamic = "force-dynamic"` を設定
6. **キャッシュの制御**: Client Components で最新データを取得する場合は、タイムスタンプと `cache: "no-store"` を使用
7. **画像最適化**: `Image` コンポーネントを使用して画像を最適化
8. **エラーハンドリング**: API Routes では `withErrorHandling` を使用して統一されたエラーハンドリングを実装
9. **ファイルアップロード**: `FormData` を使用してファイルをアップロードする際は、`Content-Type` ヘッダーを設定しない

## まとめ

Next.js App Router を使用することで、以下のメリットが得られます:

- **パフォーマンス**: Server Components により、クライアントサイドの JavaScript を最小化
- **開発効率**: ファイルベースのルーティングにより、直感的なページ構造を実現
- **型安全性**: TypeScript との統合により、型安全な開発が可能
- **最適化**: 画像最適化、コード分割、バンドル最適化が自動で行われる
- **スケーラビリティ**: API Routes により、フロントエンドとバックエンドを同じプロジェクトで管理可能

このアプリケーションでは、App Router の機能を最大限に活用し、パフォーマンスと開発効率を両立した実装を行っています。

## 参考リンク

- **[Next.js ガイド](doc/guides/nextjs-guide.md)**: Next.js 全体の説明（画像最適化、フォント最適化、メタデータ、ビルドとデプロイなど）
- **[React ガイド](doc/guides/react-guide.md)**: React の詳細な使用方法
- **[JSX ガイド](doc/guides/jsx-guide.md)**: JSX の構文と使用方法
- **[Async/Await ガイド](doc/guides/async-await-guide.md)**: async/await と Promise の使用方法
- **[Next.js 公式ドキュメント - App Router](https://nextjs.org/docs/app)**: App Router の包括的なドキュメント
