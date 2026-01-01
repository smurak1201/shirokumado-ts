# コーディング標準とベストプラクティス

このドキュメントは、コード生成時や開発時に参照すべき技術スタックのベストプラクティスをまとめています。

## 📋 目次

- [Next.js App Router](#nextjs-app-router)
- [Prisma](#prisma)
- [TypeScript](#typescript)
- [エラーハンドリング](#エラーハンドリング)
- [API Routes](#api-routes)
- [コンポーネント設計](#コンポーネント設計)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [セキュリティ](#セキュリティ)

## Next.js App Router

### Server Componentsを優先

**✅ 推奨**: デフォルトでServer Componentsを使用します。

```typescript
// ✅ 良い例: Server Component
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
```

**❌ 避ける**: 不要なClient Components。

```typescript
// ❌ 悪い例: 不要なClient Component
'use client';
export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(setProduct);
  }, [params.id]);

  return product ? <ProductDetails product={product} /> : <Loading />;
}
```

### データフェッチング

**✅ 推奨**: Server Componentsで直接データフェッチ。

```typescript
// ✅ 良い例: Server Componentで直接フェッチ
export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return <ProductList products={products} />;
}
```

**❌ 避ける**: クライアントサイドでの不要なフェッチ。

```typescript
// ❌ 悪い例: クライアントサイドでフェッチ
'use client';
export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  return <ProductList products={products} />;
}
```

### ルーティング

**✅ 推奨**: App Routerの規約に従う。

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

## Prisma

### クエリの最適化

**✅ 推奨**: 必要なフィールドのみ取得。

```typescript
// ✅ 良い例: selectで必要なフィールドのみ
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

**❌ 避ける**: すべてのフィールドを取得。

```typescript
// ❌ 悪い例: すべてのフィールドを取得
const users = await prisma.user.findMany(); // 不要なデータも取得
```

### N+1問題の回避

**✅ 推奨**: includeで関連データを一度に取得。

```typescript
// ✅ 良い例: includeで関連データを取得
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

**❌ 避ける**: ループ内でクエリを実行。

```typescript
// ❌ 悪い例: N+1問題
const orders = await prisma.order.findMany();
for (const order of orders) {
  order.items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });
}
```

### エラーハンドリング

**✅ 推奨**: `safePrismaOperation`を使用。

```typescript
import { safePrismaOperation } from '@/lib/prisma';

const user = await safePrismaOperation(
  () => prisma.user.findUnique({ where: { id } }),
  'getUser'
);
```

**❌ 避ける**: 直接try-catchで処理。

```typescript
// ❌ 悪い例: 直接try-catch
try {
  const user = await prisma.user.findUnique({ where: { id } });
} catch (error) {
  console.error(error); // 統一されていないエラーハンドリング
}
```

### トランザクション

**✅ 推奨**: Prismaのトランザクションを使用。

```typescript
// ✅ 良い例: トランザクション
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.order.create({ data: { userId: user.id, ...orderData } });
});
```

## TypeScript

### 型安全性

**✅ 推奨**: 明示的な型定義。

```typescript
// ✅ 良い例: 明示的な型
interface UserProfileProps {
  userId: number;
  showEmail?: boolean;
}

export function UserProfile({ userId, showEmail = false }: UserProfileProps) {
  // ...
}
```

**❌ 避ける**: `any`の使用。

```typescript
// ❌ 悪い例: anyの使用
function getUser(id: any) {
  return prisma.user.findUnique({ where: { id } });
}
```

### 型推論の活用

**✅ 推奨**: 適切な型推論を活用。

```typescript
// ✅ 良い例: 型推論を活用
const users = await prisma.user.findMany(); // User[]型が推論される
const user = await prisma.user.findUnique({ where: { id: 1 } }); // User | null型が推論される
```

### 型ガード

**✅ 推奨**: 型ガードを使用。

```typescript
// ✅ 良い例: 型ガード
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

if (isUser(data)) {
  // dataはUser型として扱える
  console.log(data.email);
}
```

## エラーハンドリング

### 統一されたエラークラス

**✅ 推奨**: `lib/errors.ts`のエラークラスを使用。

```typescript
import { ValidationError, NotFoundError, DatabaseError } from '@/lib/errors';

// ✅ 良い例: 統一されたエラークラス
if (!email) {
  throw new ValidationError('Email is required');
}

const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new NotFoundError('User');
}
```

**❌ 避ける**: 汎用的なError。

```typescript
// ❌ 悪い例: 汎用的なError
if (!email) {
  throw new Error('Email is required'); // 統一されていない
}
```

### API Routesでのエラーハンドリング

**✅ 推奨**: `withErrorHandling`を使用。

```typescript
import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data });
});
```

**❌ 避ける**: 手動でのエラーハンドリング。

```typescript
// ❌ 悪い例: 手動でのエラーハンドリング
export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## API Routes

### レスポンス形式

**✅ 推奨**: 統一されたレスポンス形式。

```typescript
// ✅ 良い例: 統一されたレスポンス
import { apiSuccess, apiError } from '@/lib/api-helpers';

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data }); // { data: ... }
});

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  if (!body.name) {
    return apiError('Name is required', 400);
  }
  // ...
});
```

### リクエストバリデーション

**✅ 推奨**: 入力検証を実装。

```typescript
// ✅ 良い例: バリデーション
import { ValidationError } from '@/lib/errors';

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();

  if (!body.email || !isValidEmail(body.email)) {
    throw new ValidationError('Invalid email address');
  }

  // ...
});
```

### HTTPメソッド

**✅ 推奨**: 適切なHTTPメソッドを使用。

```typescript
// ✅ 良い例: 適切なHTTPメソッド
export const GET = withErrorHandling(async () => { /* ... */ });
export const POST = withErrorHandling(async (request: Request) => { /* ... */ });
export const PUT = withErrorHandling(async (request: Request) => { /* ... */ });
export const DELETE = withErrorHandling(async () => { /* ... */ });
```

## コンポーネント設計

### Server Components優先

**✅ 推奨**: デフォルトでServer Component。

```typescript
// ✅ 良い例: Server Component
export default async function ProductList() {
  const products = await prisma.product.findMany();
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Client Componentsの使用

**✅ 推奨**: 必要な場合のみClient Component。

```typescript
// ✅ 良い例: インタラクティブな場合のみ
'use client';

import { useState } from 'react';

export function SearchForm() {
  const [query, setQuery] = useState('');

  return (
    <form>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </form>
  );
}
```

### コンポーネントの分割

**✅ 推奨**: 単一責任の原則。

```typescript
// ✅ 良い例: 小さなコンポーネントに分割
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

## パフォーマンス最適化

### 画像最適化

**✅ 推奨**: Next.js Imageコンポーネントを使用。

```typescript
import Image from 'next/image';

// ✅ 良い例: Next.js Image
<Image
  src="/images/product.jpg"
  alt="Product"
  width={500}
  height={300}
  priority={false}
  loading="lazy"
/>
```

**❌ 避ける**: 通常のimgタグ。

```typescript
// ❌ 悪い例: 通常のimgタグ
<img src="/images/product.jpg" alt="Product" />
```

### コード分割

**✅ 推奨**: 動的インポートを使用。

```typescript
// ✅ 良い例: 動的インポート
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false,
});
```

### データベースクエリの最適化

**✅ 推奨**: インデックスの活用、必要なデータのみ取得。

```typescript
// ✅ 良い例: インデックスを活用したクエリ
const products = await prisma.product.findMany({
  where: {
    category: 'ice-cream',
    published: true,
  },
  orderBy: { createdAt: 'desc' },
  take: 10, // ページネーション
});
```

## セキュリティ

### 環境変数

**✅ 推奨**: 機密情報は環境変数で管理。

```typescript
// ✅ 良い例: 環境変数を使用
const databaseUrl = process.env.DATABASE_URL;
```

**❌ 避ける**: ハードコード。

```typescript
// ❌ 悪い例: ハードコード
const databaseUrl = 'postgresql://user:password@localhost/db';
```

### 入力検証

**✅ 推奨**: すべてのユーザー入力を検証。

```typescript
// ✅ 良い例: 入力検証
import { z } from 'zod'; // 必要に応じて

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const validatedData = schema.parse(requestBody);
```

### SQLインジェクション対策

**✅ 推奨**: Prismaを使用（自動的に対策される）。

```typescript
// ✅ 良い例: Prismaを使用（安全）
const user = await prisma.user.findUnique({
  where: { email: userEmail }, // 自動的にエスケープされる
});
```

**❌ 避ける**: 生のSQL（必要な場合を除く）。

```typescript
// ❌ 悪い例: 生のSQL（危険）
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`;
```

## コード生成時のチェックリスト

コードを生成する際は、以下の点を確認してください：

- [ ] Server Componentsを優先しているか
- [ ] 適切なエラーハンドリングを実装しているか
- [ ] 型安全性を確保しているか（`any`を使用していないか）
- [ ] Prismaのクエリが最適化されているか（N+1問題がないか）
- [ ] 統一されたエラークラスを使用しているか
- [ ] API Routesで`withErrorHandling`を使用しているか
- [ ] 入力検証を実装しているか
- [ ] パフォーマンスを考慮しているか
- [ ] セキュリティベストプラクティスに従っているか

## 参考リンク

- [Next.js App Router Best Practices](https://nextjs.org/docs/app/building-your-application/routing)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
