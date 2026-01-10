# 開発ガイドライン

白熊堂プロジェクトの開発ガイドラインです。コードの書き方から開発プロセスまで、プロジェクトで使用するベストプラクティスをまとめています。

## 目次

- [コーディング規約](#コーディング規約)
  - [Next.js App Router](#nextjs-app-router)
  - [Prisma](#prisma)
  - [TypeScript](#typescript)
  - [エラーハンドリング](#エラーハンドリング)
  - [API Routes](#api-routes)
  - [コンポーネント設計](#コンポーネント設計)
- [命名規則](#命名規則)
- [ファイル構造](#ファイル構造)
- [Git ワークフロー](#git-ワークフロー)
- [コミットメッセージ](#コミットメッセージ)
- [コードレビュー](#コードレビュー)
- [テスト](#テスト)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [セキュリティ](#セキュリティ)
- [コード生成時のチェックリスト](#コード生成時のチェックリスト)

## コーディング規約

### Next.js App Router

#### Server Components を優先

**推奨**: デフォルトで Server Components を使用します。

```typescript
// 良い例: Server Component
export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
```

**避ける**: 不要な Client Components。

```typescript
// 悪い例: 不要なClient Component
"use client";
export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [params.id]);

  return product ? <ProductDetails product={product} /> : <Loading />;
}
```

#### データフェッチング

**推奨**: Server Components で直接データフェッチ。

```typescript
// 良い例: Server Componentで直接フェッチ
export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return <ProductList products={products} />;
}
```

**避ける**: クライアントサイドでの不要なフェッチ。

```typescript
// 悪い例: クライアントサイドでフェッチ
"use client";
export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return <ProductList products={products} />;
}
```

#### ルーティング

**推奨**: App Router の規約に従う。

```
app/
├── page.tsx              # / (ホーム)
├── about/
│   └── page.tsx          # /about
├── products/
│   ├── page.tsx          # /products
│   └── [id]/
│       └── page.tsx      # /products/[id]
└── (admin)/              # ルートグループ（URLに影響しない）
    └── dashboard/
        └── page.tsx      # /dashboard
```

### Prisma

#### クエリの最適化

**推奨**: N+1 問題を回避するために`include`で関連データを一度に取得。

```typescript
// 良い例: includeで関連データを一度に取得
const products = await prisma.product.findMany({
  include: {
    category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
  },
});
```

**このアプリでの実装**:

このアプリでは、`select`オプションは使用していません。代わりに`include`を使用して関連データを取得しています。商品情報は比較的少ないデータ量のため、すべてのフィールドを取得してもパフォーマンスへの影響が小さく、コードがシンプルで保守しやすいためです。

**`select`について**:

`select`は必要なフィールドのみを取得できる便利な機能ですが、このアプリでは使用していません。詳細は [Prisma ガイド - select（このアプリでは未使用）](./guides/prisma-guide.md#selectこのアプリでは未使用) を参照してください。

#### N+1 問題の回避

**推奨**: include で関連データを一度に取得。

```typescript
// 良い例: includeで関連データを取得
const orders = await prisma.order.findMany({
  include: {
    items: {
      include: {
        product: true,
      },
    },
  },
});
```

**避ける**: ループ内でクエリを実行。

```typescript
// 悪い例: N+1問題
const orders = await prisma.order.findMany();
for (const order of orders) {
  order.items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });
}
```

#### エラーハンドリング

**推奨**: `safePrismaOperation` を使用。

```typescript
import { safePrismaOperation } from "@/lib/prisma";

const user = await safePrismaOperation(
  () => prisma.user.findUnique({ where: { id } }),
  "getUser"
);
```

**避ける**: 直接 try-catch で処理。

```typescript
// 悪い例: 直接try-catch
try {
  const user = await prisma.user.findUnique({ where: { id } });
} catch (error) {
  console.error(error); // 統一されていないエラーハンドリング
}
```

#### トランザクション

**推奨**: Prisma のトランザクションを使用。

```typescript
// 良い例: トランザクション
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.order.create({ data: { userId: user.id, ...orderData } });
});
```

### TypeScript

#### 型安全性

**推奨**: 明示的な型定義。

```typescript
// 良い例: 明示的な型
interface UserProfileProps {
  userId: number;
  showEmail?: boolean;
}

export function UserProfile({ userId, showEmail = false }: UserProfileProps) {
  // ...
}
```

**避ける**: `any` の使用。

```typescript
// 悪い例: anyの使用
function getUser(id: any) {
  return prisma.user.findUnique({ where: { id } });
}
```

#### 型推論の活用

**推奨**: 適切な型推論を活用。

```typescript
// 良い例: 型推論を活用
const users = await prisma.user.findMany(); // User[]型が推論される
const user = await prisma.user.findUnique({ where: { id: 1 } }); // User | null型が推論される
```

#### 型ガード

**推奨**: 型ガードを使用。

```typescript
// 良い例: 型ガード
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}

if (isUser(data)) {
  // dataはUser型として扱える
  console.log(data.email);
}
```

### エラーハンドリング

#### 統一されたエラークラス

**推奨**: `lib/errors.ts` のエラークラスを使用。

```typescript
import { ValidationError, NotFoundError, DatabaseError } from "@/lib/errors";

// 良い例: 統一されたエラークラス
if (!email) {
  throw new ValidationError("Email is required");
}

const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new NotFoundError("User");
}
```

**避ける**: 汎用的な Error。

```typescript
// 悪い例: 汎用的なError
if (!email) {
  throw new Error("Email is required"); // 統一されていない
}
```

#### API Routes でのエラーハンドリング

**推奨**: `withErrorHandling` を使用。

```typescript
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data });
});
```

**避ける**: 手動でのエラーハンドリング。

```typescript
// 悪い例: 手動でのエラーハンドリング
export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### API Routes

#### レスポンス形式

**推奨**: 統一されたレスポンス形式。

```typescript
// 良い例: 統一されたレスポンス
import { apiSuccess, apiError } from "@/lib/api-helpers";

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data }); // { data: ... }
});

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  if (!body.name) {
    return apiError("Name is required", 400);
  }
  // ...
});
```

#### リクエストバリデーション

**推奨**: 入力検証を実装。

```typescript
// 良い例: バリデーション
import { ValidationError } from "@/lib/errors";

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();

  if (!body.email || !isValidEmail(body.email)) {
    throw new ValidationError("Invalid email address");
  }

  // ...
});
```

#### HTTP メソッド

**推奨**: 適切な HTTP メソッドを使用。

```typescript
// 良い例: 適切なHTTPメソッド
export const GET = withErrorHandling(async () => {
  /* ... */
});
export const POST = withErrorHandling(async (request: Request) => {
  /* ... */
});
export const PUT = withErrorHandling(async (request: Request) => {
  /* ... */
});
export const DELETE = withErrorHandling(async () => {
  /* ... */
});
```

### コンポーネント設計

#### Server Components 優先

**推奨**: デフォルトで Server Component。

```typescript
// 良い例: Server Component
export default async function ProductList() {
  const products = await prisma.product.findMany();
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### Client Components の使用

**推奨**: 必要な場合のみ Client Component。

```typescript
// 良い例: インタラクティブな場合のみ
"use client";

import { useState } from "react";

export function SearchForm() {
  const [query, setQuery] = useState("");

  return (
    <form>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </form>
  );
}
```

#### コンポーネントの分割

**推奨**: 単一責任の原則。

```typescript
// 良い例: 小さなコンポーネントに分割
export function ProductCard({ product }: { product: Product }) {
  return (
    <div>
      <ProductImage product={product} />
      <ProductInfo product={product} />
      <ProductActions product={product} />
    </div>
  );
}
```

## 命名規則

### ファイル名

- **コンポーネント**: PascalCase（例: `UserProfile.tsx`）
- **ユーティリティ**: camelCase（例: `formatDate.ts`）
- **API Routes**: `route.ts`（Next.js App Router の規約）
- **型定義**: PascalCase（例: `User.ts`）

### 変数・関数名

- **変数**: camelCase（例: `userName`, `isLoading`）
- **関数**: camelCase（例: `getUser`, `handleSubmit`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_FILE_SIZE`, `API_BASE_URL`）
- **型・インターフェース**: PascalCase（例: `User`, `ApiResponse`）

### コンポーネント

- **コンポーネント名**: PascalCase（例: `UserProfile`, `ProductCard`）
- **Props 型**: `ComponentNameProps`（例: `UserProfileProps`）

```typescript
// ✅ 良い例
interface UserProfileProps {
  userId: number;
  showEmail?: boolean;
}

export function UserProfile({ userId, showEmail = false }: UserProfileProps) {
  // ...
}
```

## ファイル構造

### コンポーネント

```
app/
├── components/        # フロントエンド共通コンポーネント
│   ├── Header.tsx     # ヘッダー
│   ├── Footer.tsx     # フッター
│   ├── ProductGrid.tsx # 商品グリッド
│   ├── ProductTile.tsx # 商品タイル
│   └── ProductModal.tsx # 商品モーダル
├── dashboard/         # ダッシュボード機能
│   ├── components/    # ダッシュボード専用コンポーネント
│   ├── hooks/         # カスタムフック
│   ├── utils/         # ユーティリティ関数
│   └── types.ts       # 共通型定義
├── faq/               # FAQページ
│   └── page.tsx
└── api/               # API Routes
    └── [resource]/
        └── route.ts
```

**コンポーネント設計の原則**:

- **単一責任の原則**: 各コンポーネントは 1 つの責務を持つ
- **再利用性**: 汎用的なコンポーネントは分離
- **型安全性**: 共通型定義を使用して一貫性を保つ
- **カスタムフック**: 状態管理ロジックはフックに分離

### ユーティリティ

```
lib/
├── prisma.ts          # Prisma Client
├── blob.ts            # Blob Storage
├── errors.ts          # エラーハンドリング
├── api-helpers.ts     # API Routesヘルパー
├── config.ts          # アプリケーション設定
├── image-compression.ts # 画像圧縮
└── product-utils.ts   # 商品関連ユーティリティ
```

**機能別ディレクトリのユーティリティ**:

```
app/dashboard/utils/
└── productUtils.ts    # ダッシュボード専用の商品操作関数
```

## Git ワークフロー

### ブランチ戦略

- **main**: 本番環境用ブランチ（保護）
- **develop**: 開発用ブランチ
- **feature/**: 機能追加用ブランチ（例: `feature/user-authentication`）
- **fix/**: バグ修正用ブランチ（例: `fix/login-error`）
- **hotfix/**: 緊急修正用ブランチ（例: `hotfix/security-patch`）

### ブランチの命名規則

```
feature/[機能名]
fix/[修正内容]
hotfix/[緊急修正内容]
refactor/[リファクタリング内容]
docs/[ドキュメント内容]
```

### プルリクエスト

1. **タイトル**: 変更内容を明確に記述
2. **説明**: 変更の背景、実装内容、テスト方法を記述
3. **レビュー**: 最低 1 名の承認が必要
4. **CI/CD**: すべてのチェックが成功する必要がある

## コミットメッセージ

### フォーマット

```
[種類]: [簡潔な説明]

[詳細な説明（オプション）]

[関連Issue（オプション）]
```

### 種類

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル（フォーマットなど）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスやツールの変更

### 例

```
feat: ユーザー認証機能を追加

- ログイン・ログアウト機能を実装
- JWT認証を導入
- 認証ミドルウェアを追加

Closes #123
```

## コードレビュー

### レビューのポイント

1. **機能性**: 要件を満たしているか
2. **コード品質**: 読みやすく、保守しやすいか
3. **パフォーマンス**: パフォーマンスに問題がないか
4. **セキュリティ**: セキュリティ上の問題がないか
5. **テスト**: 適切にテストされているか

### レビュー時のコメント

- **必須修正**: マージ前に修正が必要
- **提案**: 改善の提案（任意）
- **質問**: 理解を深めるための質問

## テスト

### テストの種類

- **ユニットテスト**: 個別の関数・コンポーネントのテスト
- **統合テスト**: API Routes やデータベース操作のテスト
- **E2E テスト**: ユーザーフローのテスト

### テストファイルの配置

```
__tests__/
├── unit/
│   └── lib/
├── integration/
│   └── api/
└── e2e/
    └── flows/
```

### テストの書き方

```typescript
import { describe, it, expect } from "vitest";
import { formatDate } from "@/lib/utils/format";

describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = new Date("2024-01-01");
    expect(formatDate(date)).toBe("2024年1月1日");
  });
});
```

## パフォーマンス最適化

### 画像最適化

**推奨**: Next.js Image コンポーネントを使用。

```typescript
import Image from "next/image";

// 良い例: Next.js Image
<Image
  src="/images/product.jpg"
  alt="Product"
  width={500}
  height={300}
  priority={false}
  loading="lazy"
/>;
```

**避ける**: 通常の img タグ。

```typescript
// 悪い例: 通常のimgタグ
<img src="/images/product.jpg" alt="Product" />
```

### コード分割

**推奨**: 動的インポートを使用。

```typescript
// 良い例: 動的インポート
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Loading />,
  ssr: false,
});
```

### データベースクエリの最適化

**推奨**: インデックスの活用、必要なデータのみ取得。

```typescript
// 良い例: インデックスを活用したクエリ
const products = await prisma.product.findMany({
  where: {
    category: "ice-cream",
    published: true,
  },
  orderBy: { createdAt: "desc" },
  take: 10, // ページネーション
});
```

### React コンポーネントの最適化

**推奨**: パフォーマンス最適化のためのメモ化を適切に使用。

#### React.memo

**推奨**: props が変更されない限り再レンダリングされないコンポーネントをメモ化。

```typescript
// 良い例: React.memoでメモ化
import { memo } from "react";

function ProductTile({ product, onClick }: ProductTileProps) {
  // ...
}

export default memo(ProductTile);
```

#### useCallback

**推奨**: コールバック関数をメモ化して、子コンポーネントの不要な再レンダリングを防止。

```typescript
// 良い例: useCallbackでメモ化
const handleClick = useCallback(() => {
  // 処理
}, [dependencies]);
```

#### useMemo

**推奨**: 計算コストの高い値をメモ化。

```typescript
// 良い例: useMemoでメモ化
const filteredProducts = useMemo(
  () => products.filter(/* ... */),
  [products, filter]
);
```

### エラーハンドリング

**推奨**: エラーバウンダリーを実装して、予期しないエラーからアプリケーションを保護。

```typescript
// 良い例: エラーバウンダリーでコンポーネントを囲む
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 最適化のポイント

1. **画像最適化**: Next.js Image コンポーネントを使用
2. **コード分割**: 動的インポートを使用
3. **データフェッチ**: 適切なキャッシュ戦略を使用
4. **データベース**: 必要なデータのみ取得（N+1 問題の回避）
5. **React コンポーネント**: `React.memo`、`useCallback`、`useMemo` を適切に使用
6. **エラーハンドリング**: エラーバウンダリーを実装

## セキュリティ

### 環境変数

**推奨**: 機密情報は環境変数で管理。

```typescript
// 良い例: 環境変数を使用
const databaseUrl = process.env.DATABASE_URL;
```

**避ける**: ハードコード。

```typescript
// 悪い例: ハードコード
const databaseUrl = "postgresql://user:password@localhost/db";
```

### 入力検証

**推奨**: すべてのユーザー入力を検証。

```typescript
// 良い例: 入力検証
import { z } from "zod"; // 必要に応じて

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const validatedData = schema.parse(requestBody);
```

### SQL インジェクション対策

**推奨**: Prisma を使用（自動的に対策される）。

```typescript
// 良い例: Prismaを使用（安全）
const user = await prisma.user.findUnique({
  where: { email: userEmail }, // 自動的にエスケープされる
});
```

**避ける**: 生の SQL（必要な場合を除く）。

```typescript
// 悪い例: 生のSQL（危険）
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`;
```

### ベストプラクティス

1. **環境変数**: 機密情報は環境変数で管理
2. **入力検証**: すべてのユーザー入力を検証
3. **SQL インジェクション**: Prisma を使用して回避
4. **XSS 対策**: React の自動エスケープを活用
5. **CSRF 対策**: Next.js の CSRF 保護を活用

## コード生成時のチェックリスト

コードを生成する際は、以下の点を確認してください：

- [ ] Server Components を優先しているか
- [ ] 適切なエラーハンドリングを実装しているか
- [ ] 型安全性を確保しているか（`any` を使用していないか）
- [ ] Prisma のクエリが最適化されているか（N+1 問題がないか）
- [ ] 統一されたエラークラスを使用しているか
- [ ] API Routes で `withErrorHandling` を使用しているか
- [ ] 入力検証を実装しているか
- [ ] パフォーマンスを考慮しているか
- [ ] セキュリティベストプラクティスに従っているか

## 参考リンク

- **[React ガイド](./guides/react-guide.md)**: React の包括的なガイド
- **[JSX ガイド](./guides/jsx-guide.md)**: JSX の構文とベストプラクティス
- **[TypeScript ガイド](./guides/typescript-guide.md)**: TypeScript の使用方法
- **[Next.js ガイド](./guides/nextjs-guide.md)**: Next.js の使用方法
- **[App Router ガイド](./guides/app-router-guide.md)**: App Router の使用方法
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router Best Practices](https://nextjs.org/docs/app/building-your-application/routing)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Best Practices](https://react.dev/learn)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
