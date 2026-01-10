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
- [関連ドキュメント](#関連ドキュメント)

## 概要

Next.js App Router は、Next.js 13 以降で導入された新しいルーティングシステムです。ファイルベースのルーティングと、React Server Components を活用したサーバーサイドレンダリングを提供します。

このアプリケーションでは、Next.js 16.1.1 の App Router を使用して、ホームページ、FAQ ページ、ダッシュボード、API Routes を実装しています。

## App Router とは

App Router は、Next.js 13 以降で導入された新しいルーティングシステムです。ファイルベースのルーティングと、React Server Components を活用したサーバーサイドレンダリングを提供します。

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

**このアプリでのディレクトリ構造**:

```
app/
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

**ルーティングの規則**:

- `page.tsx`: ページコンポーネント（ルートとして機能） - **このアプリで使用中**
- `layout.tsx`: レイアウトコンポーネント（ネストされたレイアウト） - **このアプリで使用中**
- `route.ts`: API エンドポイント（API Routes） - **このアプリで使用中**
- `loading.tsx`: ローディング UI - **このアプリでは未使用**
- `error.tsx`: エラー UI - **このアプリでは未使用**
- `not-found.tsx`: 404 ページ - **このアプリでは未使用**
- `template.tsx`: テンプレートコンポーネント - **このアプリでは未使用**

**未使用ファイルの説明**:

このアプリでは、以下のファイルは使用されていませんが、知っておくと便利な機能です：

**`loading.tsx`** - ローディング UI

ページやセグメントの読み込み中に表示される UI を定義します。データフェッチ中にローディングスピナーなどを表示できます。

**使用例**:

```typescript
// app/products/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">読み込み中...</span>
    </div>
  );
}
```

**`error.tsx`** - エラーバウンダリー

エラーバウンダリーとして機能し、エラー発生時に表示される UI を定義します。Client Component として実装する必要があります。

**使用例**:

```typescript
// app/products/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        再試行
      </button>
    </div>
  );
}
```

**`not-found.tsx`** - 404 ページ

404 ページをカスタマイズします。`notFound()`関数を呼び出した時や、存在しないルートにアクセスした時に表示されます。

**使用例**:

```typescript
// app/products/not-found.tsx
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

**`template.tsx`** - テンプレートコンポーネント

`layout.tsx`と似ていますが、ナビゲーション時に毎回新しいインスタンスが作成されます。アニメーションや状態のリセットが必要な場合に使用します。

**使用例**:

```typescript
// app/products/template.tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in transition-opacity duration-300">
      {children}
    </div>
  );
}
```

**このアプリで使用しない理由**:

- エラーハンドリングは API Routes で統一して実装している
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

1. **`app/page.tsx`** - ホームページ（Server Component）

```102:141:app/page.tsx
export default async function Home() {
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

**説明**: ホームページは Server Component として実装されており、サーバーサイドでデータベースから直接データを取得してレンダリングします。

2. **`app/faq/page.tsx`** - FAQ ページ（Server Component）

```17:117:app/faq/page.tsx
export default function FAQPage() {
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

**説明**: FAQ ページも Server Component として実装されており、静的なコンテンツを表示します。

3. **`app/dashboard/page.tsx`** - ダッシュボード（Server Component）

```58:70:app/dashboard/page.tsx
export default async function DashboardPage() {
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

**説明**: ダッシュボードページも Server Component として実装されており、サーバーサイドでデータを取得してから Client Component に渡します。

### Client Components

**説明**: Client Components は、`'use client'` ディレクティブを使用してクライアントサイドでレンダリングされるコンポーネントです。インタラクティブな機能（状態管理、イベントハンドラーなど）を実装するために使用します。

**特徴**:

- クライアントサイドで実行される（ブラウザで JavaScript が実行される）
- `useState`、`useEffect` などの React Hooks が使用可能
- イベントハンドラー（`onClick`、`onChange` など）が使用可能
- ブラウザ API（`localStorage`、`window` など）にアクセス可能

**このアプリでの使用箇所**:

- `app/components/ProductGrid.tsx`: 商品グリッド（モーダル表示などのインタラクティブ機能）
- `app/components/ProductModal.tsx`: 商品詳細モーダル（開閉状態の管理）
- `app/dashboard/components/DashboardContent.tsx`: ダッシュボードコンテンツ（フォーム送信、状態管理）

**Server Components と Client Components の使い分け**:

- **Server Components**: データフェッチング、静的なコンテンツ表示
- **Client Components**: インタラクティブな機能、状態管理、ブラウザ API の使用

## データフェッチング

### Server Components でのデータフェッチング

**説明**: Server Components では、`async/await` を使用してデータベースから直接データを取得できます。`fetch` API を使用する必要はありません。

**このアプリでの使用箇所**:

1. **`app/page.tsx`** - 公開商品をカテゴリーごとに取得

```26:86:app/page.tsx
async function getPublishedProductsByCategory() {
  // カテゴリーと商品を並列で取得（パフォーマンス向上）
  const [categories, products] = await Promise.all([
    // カテゴリーをID順で取得
    prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    }),
    // 商品をカテゴリー情報を含めて取得
    prisma.product.findMany({
      include: {
        category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
      },
      orderBy: {
        displayOrder: {
          sort: "asc",
          nulls: "last", // displayOrderがnullの商品は最後に
        },
      },
    }),
  ]);

  // 公開商品のみをフィルタリング
  const publishedProducts = products.filter((product) => {
    // 公開日・終了日が設定されている場合は自動判定
    if (product.publishedAt || product.endedAt) {
      return calculatePublishedStatus(
        product.publishedAt, // Prismaから取得したDateオブジェクトをそのまま渡す
        product.endedAt // Prismaから取得したDateオブジェクトをそのまま渡す
      );
    }
    // 公開日・終了日が設定されていない場合は手動設定値を使用
    return product.published;
  });

  // カテゴリーごとにグループ化
  const categoryOrder = categories.map((c) => c.name);
  const grouped: Record<string, typeof publishedProducts> = {};

  publishedProducts.forEach((product) => {
    const categoryName = product.category.name;
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(product);
  });

  // カテゴリーの順序に従って返す（Decimal型をNumber型に変換、商品があるカテゴリーのみ）
  return categoryOrder
    .map((categoryName) => ({
      category: categories.find((c) => c.name === categoryName)!,
      products: (grouped[categoryName] || []).map((product) => ({
        ...product,
        // Decimal型をNumber型に変換（PrismaのDecimal型は文字列として扱われるため）
        priceS: product.priceS ? Number(product.priceS) : null,
        priceL: product.priceL ? Number(product.priceL) : null,
      })),
    }))
    .filter(({ products }) => products.length > 0); // 商品があるカテゴリーのみを返す
}
```

**説明**: `Promise.all` を使用してカテゴリーと商品を並列で取得し、パフォーマンスを向上させています。

2. **`app/dashboard/page.tsx`** - ダッシュボードデータを取得

```17:52:app/dashboard/page.tsx
async function getDashboardData() {
  // カテゴリーと商品を並列で取得（パフォーマンス向上）
  const [categories, products] = await Promise.all([
    // カテゴリーをID順で取得
    prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    }),
    // 商品をカテゴリー情報を含めて取得（N+1問題を回避）
    prisma.product.findMany({
      include: {
        category: true, // 関連するカテゴリー情報も一緒に取得
      },
      orderBy: {
        createdAt: "desc", // 作成日時の降順でソート
      },
    }),
  ]);

  return {
    categories,
    // 商品データをクライアント側で使いやすい形式に変換
    products: products.map((product) => ({
      ...product,
      // Decimal型をNumber型に変換（PrismaのDecimal型は文字列として扱われるため）
      priceS: product.priceS ? Number(product.priceS) : null,
      priceL: product.priceL ? Number(product.priceL) : null,
      // Date型をISO文字列に変換（JSONシリアライズのため）
      publishedAt: product.publishedAt?.toISOString() || null,
      endedAt: product.endedAt?.toISOString() || null,
      published: product.published,
      displayOrder: product.displayOrder,
    })),
  };
}
```

**説明**: ダッシュボードページでも、サーバーサイドでデータを取得し、クライアント側で使いやすい形式に変換しています。

### Client Components でのデータフェッチング（fetch API）

**説明**: Client Components では、ユーザーの操作（商品の追加・更新・削除など）に応じて動的にデータを取得する必要があります。この場合、`fetch` API を使用して API Routes を呼び出します。

**なぜ Server Components で直接データベースにアクセスしないのか**:

- Server Components は初期レンダリング時にのみ実行される
- ユーザーの操作（ボタンクリック、フォーム送信など）に応じて動的にデータを取得する必要がある
- Client Components では `useState`、`useEffect` などの Hooks を使用して状態管理を行う

**このアプリでの使用箇所**:

1. **`app/dashboard/components/DashboardContent.tsx`** - 商品一覧の更新

```40:56:app/dashboard/components/DashboardContent.tsx
  const refreshProducts = async () => {
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

**説明**: 商品の追加・更新・削除後に、最新の商品一覧を取得するために `fetch` を使用しています。キャッシュを無効化するために、タイムスタンプをクエリパラメータに追加し、`cache: "no-store"` と `Cache-Control: "no-cache"` ヘッダーを設定しています。

2. **`app/dashboard/components/ProductList.tsx`** - 商品の削除

```95:120:app/dashboard/components/ProductList.tsx
  const handleDelete = async (productId: number) => {
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

**説明**: 商品を削除するために `fetch` を使用して DELETE リクエストを送信しています。エラーハンドリングも実装されています。

3. **`app/dashboard/hooks/useProductReorder.ts`** - 商品順序の変更

```79:94:app/dashboard/hooks/useProductReorder.ts
    try {
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

**説明**: ドラッグ&ドロップで商品の順序を変更した後、サーバーに保存するために `fetch` を使用しています。楽観的 UI 更新を実装しており、API 呼び出し前に UI を更新しています。

4. **`app/dashboard/components/DashboardForm.tsx`** - 商品の作成と画像アップロード

**画像アップロード（FormData を使用）**:

```107:134:app/dashboard/components/DashboardForm.tsx
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
              // JSONパースエラーの場合はデフォルトメッセージを使用
              errorMessage = `画像のアップロードに失敗しました (${uploadResponse.status})`;
            }
            throw new Error(errorMessage);
          }

          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
```

**商品作成（JSON データを送信）**:

```150:172:app/dashboard/components/DashboardForm.tsx
      // 商品を登録
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

**説明**: 商品作成フォームでは、まず画像をアップロードしてから商品データを送信します。`FormData` を使用したファイルアップロードと、JSON データの送信の両方のパターンが実装されています。

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
try {
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

**キャッシュの制御**:

- **常に最新データを取得**: `cache: "no-store"` とタイムスタンプを使用
- **Next.js のキャッシュを無効化**: `cache: "no-store"` オプション
- **ブラウザのキャッシュを無効化**: `Cache-Control: "no-cache"` ヘッダー

**Server Components と Client Components の使い分け**:

- **Server Components**: 初期データの取得（Prisma で直接データベースにアクセス）
- **Client Components**: ユーザーの操作に応じた動的なデータ取得（fetch API で API Routes を呼び出し）

### 動的レンダリングの設定

**説明**: `export const dynamic = "force-dynamic"` を使用して、ページを常に動的にレンダリングするように設定できます。

**このアプリでの使用箇所**:

1. **`app/page.tsx`** - 動的レンダリングを強制

```8:12:app/page.tsx
/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします
 */
export const dynamic = "force-dynamic";
```

**説明**: ホームページでは、データベースから最新の公開商品を取得する必要があるため、動的レンダリングを強制しています。

2. **`app/dashboard/page.tsx`** - 動的レンダリングを強制

```4:9:app/dashboard/page.tsx
/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、
 * このページは常にサーバー側でレンダリングされます
 */
export const dynamic = "force-dynamic";
```

**説明**: ダッシュボードページでも、最新のデータを表示するために動的レンダリングを強制しています。

3. **`app/api/products/route.ts`** - API Route での動的レンダリング

```9:13:app/api/products/route.ts
/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします
 */
export const dynamic = 'force-dynamic';
```

**説明**: API Routes でも、最新のデータを返すために動的レンダリングを強制しています。

## 動的ルーティング

**説明**: 動的ルーティングを使用すると、URL パラメータに基づいて動的にページを生成できます。

**このアプリでの使用箇所**:

- **`app/api/products/[id]/route.ts`**: 商品 ID に基づく動的ルーティング

```12:39:app/api/products/[id]/route.ts
export const GET = withErrorHandling(async (
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

**説明**: `[id]` というディレクトリ名により、`/api/products/1`、`/api/products/2` などの動的ルートが生成されます。`params` は Promise として提供されるため、`await` を使用して取得します。

**動的ルートの規則**:

- `[id]`: 単一の動的セグメント
- `[...slug]`: キャッチオールルート（複数のセグメントをキャッチ）
- `[[...slug]]`: オプショナルキャッチオールルート

## API Routes

**説明**: API Routes を使用すると、Next.js アプリケーション内で RESTful API を実装できます。`app/api/` ディレクトリ内に `route.ts` ファイルを配置することで、HTTP メソッド（GET、POST、PUT、DELETE など）をエクスポートできます。

**このアプリでの使用箇所**:

1. **`app/api/products/route.ts`** - 商品一覧の取得と作成

```26:51:app/api/products/route.ts
export const GET = withErrorHandling(async () => {
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
  // キャッシュヘッダーを設定
  // s-maxage: CDNでのキャッシュ期間
  // stale-while-revalidate: キャッシュが古くなっても、再検証中は古いデータを返す
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.PRODUCT_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.PRODUCT_LIST_CACHE_SECONDS * 2}`
  );
  return response;
});
```

**説明**: `GET` 関数をエクスポートすることで、`GET /api/products` エンドポイントが実装されます。キャッシュヘッダーを設定してパフォーマンスを最適化しています。

```66:138:app/api/products/route.ts
export const POST = withErrorHandling(async (request: NextRequest) => {
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
  let published: boolean;
  if (publishedAt || endedAt) {
    // 公開日・終了日に基づいて公開状態を自動判定
    published = calculatePublishedStatus(publishedAt, endedAt);
  } else {
    // 公開日・終了日が設定されていない場合は手動設定値を使用
    // body.published が undefined の場合はデフォルトで true（公開）にする
    published = body.published !== undefined ? body.published : true;
  }

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

**説明**: `POST` 関数をエクスポートすることで、`POST /api/products` エンドポイントが実装されます。バリデーション、カテゴリーの存在確認、公開状態の自動判定などを行っています。

2. **`app/api/products/[id]/route.ts`** - 個別商品の操作

```44:154:app/api/products/[id]/route.ts
export const PUT = withErrorHandling(async (
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
  let published: boolean;
  if (publishedAt || endedAt) {
    // 公開日・終了日が設定されている場合は自動判定
    published = calculatePublishedStatus(publishedAt, endedAt);
  } else {
    // 公開日・終了日が設定されていない場合は手動設定値（変更がない場合は既存値）
    published = body.published !== undefined ? body.published : existingProduct.published;
  }

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

**説明**: `PUT` 関数をエクスポートすることで、`PUT /api/products/[id]` エンドポイントが実装されます。商品の更新、バリデーション、画像の削除などを行っています。

**API Routes の特徴**:

- Server Component として実行される（`'use client'` は不要）
- データベースに直接アクセス可能
- 統一されたエラーハンドリング（`withErrorHandling` を使用）
- 型安全なリクエスト・レスポンス処理

### Server Actions（このアプリでは未使用）

**説明**: Server Actions は、Client Component から直接サーバー側の関数を呼び出すことができる機能です。`'use server'`ディレクティブを使用してサーバー側の関数を定義し、フォーム送信やボタンクリックなどから直接呼び出せます。

**このアプリでの使用箇所**: 現在は使用されていません。

**使用例**:

```typescript
// app/actions.ts
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

// app/components/ProductForm.tsx
("use client");

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

**Server Actions のメリット**:

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

**説明**: Next.js の `Image` コンポーネントを使用すると、画像の自動最適化、WebP 変換、レスポンシブ画像の生成などが自動で行われます。

**このアプリでの使用箇所**:

1. **`app/page.tsx`** - ヒーロー画像の最適化

```112:123:app/page.tsx
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
```

**説明**: `Image` コンポーネントの `fill` プロパティを使用して、親要素のサイズに合わせて画像を表示します。`priority` プロパティにより、画像の優先読み込みが行われます。

**Image コンポーネントの主なプロパティ**:

- `src`: 画像のパス（`/` から始まるパスは `public/` ディレクトリを参照）
- `alt`: 代替テキスト（アクセシビリティのため必須）
- `width` / `height`: 画像のサイズ（`fill` を使用する場合は不要）
- `fill`: 親要素のサイズに合わせて画像を表示
- `priority`: 優先読み込み（LCP 画像などに使用）
- `sizes`: レスポンシブ画像のサイズヒント
- `quality`: 画像品質（1-100、デフォルトは 75）

## レイアウトとテンプレート

### ルートレイアウト

**説明**: `app/layout.tsx` は、すべてのページに適用されるルートレイアウトです。メタデータ、フォント、グローバルスタイルなどを設定します。

**このアプリでの使用箇所**:

```24:37:app/layout.tsx
export default function RootLayout({
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

**説明**: ルートレイアウトでは、HTML の `lang` 属性、フォント変数、Analytics コンポーネントなどを設定しています。

### メタデータ

**説明**: `metadata` オブジェクトをエクスポートすることで、ページのメタデータ（タイトル、説明、OGP など）を設定できます。

**このアプリでの使用箇所**:

```12:22:app/layout.tsx
export const metadata: Metadata = {
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

**説明**: メタデータにより、SEO と OGP（Open Graph Protocol）の設定が行われます。

### フォント最適化

**説明**: Next.js の `next/font/google` を使用すると、Google Fonts を最適化して読み込めます。

**このアプリでの使用箇所**:

```6:10:app/layout.tsx
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});
```

**説明**: Noto Sans JP フォントを Google Fonts から読み込み、CSS 変数として設定しています。これにより、フォントの読み込みが最適化され、パフォーマンスが向上します。

## このアプリでの App Router の使用例まとめ

### ページ構成

1. **ホームページ** (`app/page.tsx`)

   - Server Component
   - データベースから公開商品を取得
   - カテゴリーごとにグループ化して表示

2. **FAQ ページ** (`app/faq/page.tsx`)

   - Server Component
   - 静的なコンテンツを表示

3. **ダッシュボード** (`app/dashboard/page.tsx`)
   - Server Component
   - データベースから商品とカテゴリーを取得
   - Client Component にデータを渡す

### API Routes 構成

1. **商品 API** (`app/api/products/`)

   - `GET /api/products`: 商品一覧取得
   - `POST /api/products`: 商品作成
   - `GET /api/products/[id]`: 個別商品取得
   - `PUT /api/products/[id]`: 商品更新
   - `DELETE /api/products/[id]`: 商品削除
   - `POST /api/products/upload`: 画像アップロード
   - `POST /api/products/reorder`: 商品順序変更

2. **カテゴリー API** (`app/api/categories/`)
   - `GET /api/categories`: カテゴリー一覧取得

### ベストプラクティス

1. **Server Components を優先**: データフェッチングや静的なコンテンツは Server Components で実装
2. **Client Components は必要最小限**: インタラクティブな機能が必要な場合のみ Client Components を使用
3. **データフェッチングの使い分け**:
   - **Server Components**: 初期データの取得は Prisma で直接データベースにアクセス
   - **Client Components**: ユーザーの操作に応じた動的なデータ取得は `fetch` API で API Routes を呼び出し
4. **並列データフェッチング**: `Promise.all` を使用して複数のデータを並列で取得
5. **動的レンダリングの適切な使用**: 最新のデータが必要な場合は `export const dynamic = "force-dynamic"` を設定
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

**関連ドキュメント**:

- **[Next.js ガイド](./nextjs-guide.md)**: Next.js 全体の説明（画像最適化、フォント最適化、メタデータ、ビルドとデプロイなど）
- **[React ガイド](./react-guide.md)**: React の詳細な使用方法
- **[Next.js 公式ドキュメント - App Router](https://nextjs.org/docs/app)**: App Router の包括的なドキュメント
