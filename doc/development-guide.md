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

#### Server Components を優先し、直接データフェッチ

**推奨**: デフォルトで Server Components を使用し、データベースに直接アクセスしてデータを取得します。

```typescript
// 良い例: Server Componentで直接データフェッチ
export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // データベースに直接アクセス
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

**理由**:

- **パフォーマンス**: サーバーサイドでレンダリングされ、初期 HTML が生成されるため、SEO に有利。データベースに直接アクセスでき、API 経由のオーバーヘッドがない
- **バンドルサイズ**: クライアント側の JavaScript が不要なため、バンドルサイズが削減される
- **初期レンダリング**: データが含まれた HTML が最初から生成され、ローディング時間が短縮
- **シンプルなコード**: `useState`や`useEffect`が不要で、コードが簡潔になる
- **型安全性**: Prisma の型推論を直接活用でき、型安全性が向上
- **セキュリティ**: 機密情報をクライアントに送信せずに済む

**避ける**: 不要な Client Components とクライアントサイドでのデータフェッチ。

```typescript
// 悪い例: 不要なClient ComponentでAPI経由のフェッチ
"use client";
export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <Loading />;
  if (!product) return <NotFound />;

  return <ProductDetails product={product} />;
}
```

**理由**:

- **パフォーマンス**: クライアント側でデータフェッチが発生し、API 経由の追加リクエストによりレイテンシが増加
- **SEO**: 初期 HTML にコンテンツが含まれないため、検索エンジンでの評価が低下
- **バンドルサイズ**: 不要な JavaScript（`useState`、`useEffect`など）がクライアントに送信され、バンドルサイズが増加
- **ローディング状態**: 初期レンダリング時にデータがなく、ローディング状態の管理が必要
- **複雑なコード**: `useState`、`useEffect`、エラーハンドリングなどのコードが増加
- **型安全性**: API レスポンスの型定義が必要で、型安全性の確保が複雑になる

#### ルーティング

**推奨**: App Router の規約に従う。

```
app/
├── page.tsx              # / (ホーム)
├── faq/
│   └── page.tsx          # /faq
├── dashboard/
│   └── page.tsx          # /dashboard
└── api/                   # API Routes
    ├── products/
    │   ├── route.ts       # GET, POST /api/products
    │   ├── [id]/
    │   │   └── route.ts   # GET, PUT, DELETE /api/products/[id]（GETは未使用）
    │   ├── upload/
    │   │   └── route.ts   # POST /api/products/upload
    │   └── reorder/
    │       └── route.ts   # POST /api/products/reorder
    └── categories/
        └── route.ts       # GET /api/categories（未使用）
```

### Prisma

#### クエリの最適化と N+1 問題の回避

**詳細**: N+1 問題の詳細な説明と具体例については、[Prisma ガイド - N+1 問題の詳細解説](./guides/prisma-guide.md#n1-問題の詳細解説)を参照してください。

**推奨**: N+1 問題を回避するために`include`で関連データを一度に取得。

```typescript
// 良い例: includeで関連データを一度に取得
const products = await prisma.product.findMany({
  include: {
    category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
  },
});
```

**避ける**: ループ内でクエリを実行。

```typescript
// 悪い例: N+1問題
const products = await prisma.product.findMany();
for (const product of products) {
  product.category = await prisma.category.findUnique({
    where: { id: product.categoryId },
  });
}
```

**理由**:

- **パフォーマンス**: 1 回のクエリで必要なデータをすべて取得でき、データベースへの負荷が最小化される
- **レスポンスタイム**: クエリ回数が削減され、レスポンスタイムが大幅に短縮される
- **スケーラビリティ**: データ件数が増えてもクエリ回数が一定のため、パフォーマンスが安定する
- **コードの簡潔性**: ループ内でのクエリ実行が不要で、コードがシンプルになる
- **N+1 問題の回避**: データが N 件ある場合、悪い例では合計 N+1 回のクエリが実行されるが、`include`を使用することで 1 回のクエリで済む

**このアプリでの実装**:

このアプリでは、`select`オプションは使用していません。代わりに`include`を使用して関連データを取得しています。商品情報は比較的少ないデータ量のため、すべてのフィールドを取得してもパフォーマンスへの影響が小さく、コードがシンプルで保守しやすいためです。

**`select`について**:

`select`は必要なフィールドのみを取得できる便利な機能ですが、このアプリでは使用していません。詳細は [Prisma ガイド - select（このアプリでは未使用）](./guides/prisma-guide.md#selectこのアプリでは未使用) を参照してください。

#### エラーハンドリング

**推奨**: `safePrismaOperation` を使用。

[`lib/prisma.ts`](../lib/prisma.ts) (行 83-96)

```typescript
import { safePrismaOperation } from "@/lib/prisma";

const user = await safePrismaOperation(
  () => prisma.user.findUnique({ where: { id } }),
  "getUser"
);
```

**理由**:

- **統一されたエラーハンドリング**: すべての Prisma 操作で一貫したエラーハンドリングが実現される
- **エラーログ**: 操作名を含む構造化されたエラーログが自動的に記録される
- **コードの簡潔性**: 各操作で try-catch を書く必要がなく、コードが簡潔になる
- **保守性**: エラーハンドリングのロジックを一箇所で管理でき、変更が容易

**避ける**: 直接 try-catch で処理。

```typescript
// 悪い例: 直接try-catch
try {
  const user = await prisma.user.findUnique({ where: { id } });
} catch (error) {
  console.error(error); // 統一されていないエラーハンドリング
}
```

**理由**:

- **一貫性の欠如**: 各開発者が異なるエラーハンドリングを実装し、コードの一貫性が損なわれる
- **エラーログ**: 操作名やコンテキスト情報が不足し、デバッグが困難になる
- **コードの重複**: 各操作で try-catch を書く必要があり、コードが冗長になる
- **保守性**: エラーハンドリングのロジックが分散し、変更が困難になる

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

**理由**:

- **型安全性**: コンパイル時に型エラーを検出でき、実行時エラーを防止
- **IDE 支援**: 自動補完や型チェックが機能し、開発効率が向上
- **ドキュメント**: 型定義が実質的なドキュメントとして機能し、コードの理解が容易
- **リファクタリング**: 型定義により、安全にリファクタリングが可能

**避ける**: `any` の使用。

```typescript
// 悪い例: anyの使用
function getUser(id: any) {
  return prisma.user.findUnique({ where: { id } });
}
```

**理由**:

- **型安全性の喪失**: TypeScript の型チェックが機能せず、実行時エラーのリスクが増加
- **IDE 支援の欠如**: 自動補完や型チェックが機能せず、開発効率が低下
- **バグの発生**: 不正な値が渡されても検出できず、バグの原因となる
- **保守性**: コードの意図が不明確になり、保守が困難になる

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

**推奨**: [`lib/errors.ts`](../lib/errors.ts) のエラークラスを使用。

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

**理由**:

- **統一されたエラーハンドリング**: エラーの種類に応じた適切な HTTP ステータスコードが自動的に設定される
- **エラーの分類**: エラーの種類を明確に識別でき、適切な処理が可能
- **API レスポンス**: 統一された形式でエラーレスポンスを返せ、フロントエンドでの処理が容易
- **保守性**: エラーハンドリングのロジックを一箇所で管理でき、変更が容易

**避ける**: 汎用的な Error。

```typescript
// 悪い例: 汎用的なError
if (!email) {
  throw new Error("Email is required"); // 統一されていない
}
```

**理由**:

- **エラー分類の欠如**: エラーの種類を識別できず、適切な HTTP ステータスコードを設定できない
- **一貫性の欠如**: 各開発者が異なるエラーメッセージ形式を使用し、API レスポンスが不統一
- **エラーハンドリング**: エラーの種類に応じた処理が困難で、すべてのエラーを同じように扱う必要がある
- **保守性**: エラーハンドリングのロジックが分散し、変更が困難になる

#### API Routes でのエラーハンドリング

**推奨**: `withErrorHandling` を使用。

[`lib/api-helpers.ts`](../lib/api-helpers.ts) (行 66-76)

```typescript
import { withErrorHandling, apiSuccess } from "@/lib/api-helpers";

export const GET = withErrorHandling(async () => {
  const data = await fetchData();
  return apiSuccess({ data });
});
```

**理由**:

- **統一されたエラーハンドリング**: すべての API Routes で一貫したエラーハンドリングが実現される
- **エラーログ**: エラーが自動的にログに記録され、デバッグが容易
- **適切な HTTP ステータス**: エラーの種類に応じた適切な HTTP ステータスコードが自動的に設定される
- **コードの簡潔性**: try-catch を書く必要がなく、コードが簡潔で読みやすくなる

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

**理由**:

- **一貫性の欠如**: 各 API Route で異なるエラーハンドリングが実装され、レスポンス形式が不統一
- **エラーログ**: エラーログが記録されず、デバッグが困難
- **HTTP ステータス**: すべてのエラーが 500 として返され、適切なエラー分類ができない
- **コードの重複**: 各 API Route で try-catch を書く必要があり、コードが冗長になる

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

**理由**:

- **一貫性**: すべての API レスポンスが統一された形式になり、フロントエンドでの処理が容易
- **予測可能性**: レスポンス形式が予測可能で、フロントエンドのコードが簡潔になる
- **エラーハンドリング**: エラーレスポンスも統一された形式で、フロントエンドでのエラー処理が統一される
- **保守性**: レスポンス形式の変更を一箇所で管理でき、変更が容易

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

**理由**:

- **セキュリティ**: 不正なデータの入力を防ぎ、セキュリティリスクを軽減
- **データ整合性**: データベースに保存されるデータの整合性を保証
- **ユーザー体験**: 早期にエラーを検出し、適切なエラーメッセージを返せる
- **デバッグ**: 問題の原因を特定しやすく、デバッグが容易

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

**注意**: Server Components と Client Components の使い分けについては、[Next.js App Router セクション](#nextjs-app-router)の「Server Components を優先し、直接データフェッチ」を参照してください。

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

**理由**:

- **適切な使用**: インタラクティブな機能（状態管理、イベントハンドラー）が必要な場合のみ使用
- **パフォーマンス**: 必要な部分だけがクライアント側で実行され、不要な JavaScript の送信を回避
- **明確な意図**: `"use client"`ディレクティブにより、クライアントコンポーネントであることが明確

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

**理由**:

- **保守性**: 各コンポーネントが単一の責任を持ち、変更の影響範囲が明確
- **再利用性**: 小さなコンポーネントは他の場所でも再利用しやすい
- **テスト**: 小さなコンポーネントは個別にテストしやすく、テストの品質が向上
- **可読性**: コードが読みやすく、理解しやすくなる

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

**詳細**: ユーティリティ関数の詳細については、[ユーティリティ関数ガイド](./guides/utilities-guide.md)を参照してください。

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

**理由**:

- **画像最適化**: 自動的に画像が最適化され、パフォーマンスが向上
- **遅延読み込み**: `loading="lazy"`により、必要な時だけ画像を読み込み、初期ロード時間が短縮
- **レスポンシブ**: デバイスに応じた適切なサイズの画像が自動的に配信される
- **パフォーマンス**: WebP 形式への自動変換などにより、ファイルサイズが削減される

**避ける**: 通常の img タグ。

```typescript
// 悪い例: 通常のimgタグ
<img src="/images/product.jpg" alt="Product" />
```

**理由**:

- **最適化なし**: 画像が最適化されず、ファイルサイズが大きいまま
- **パフォーマンス**: すべての画像が初期ロード時に読み込まれ、初期ロード時間が増加
- **レスポンシブ**: デバイスに応じた画像サイズの調整が手動で必要
- **SEO**: 画像の最適化が行われず、SEO の評価が低下する可能性がある

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

**注意**: データベースクエリの最適化と N+1 問題の回避については、[Prisma セクション](#prisma)の「クエリの最適化と N+1 問題の回避」を参照してください。

**その他の最適化ポイント**:

- **インデックスの活用**: よく使用されるフィールドにインデックスを設定
- **ページネーション**: `take` と `skip` を使用して大量データを分割取得
- **必要なデータのみ取得**: `select` を使用して必要なフィールドのみ取得（このアプリでは未使用）

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

**理由**:

- **パフォーマンス**: props が変更されない限り再レンダリングをスキップし、パフォーマンスが向上
- **子コンポーネント**: 親コンポーネントが再レンダリングされても、メモ化された子コンポーネントは再レンダリングされない
- **レンダリングコスト**: レンダリングコストが高いコンポーネントで特に効果的

#### useCallback

**推奨**: コールバック関数をメモ化して、子コンポーネントの不要な再レンダリングを防止。

```typescript
// 良い例: useCallbackでメモ化
const handleClick = useCallback(() => {
  // 処理
}, [dependencies]);
```

**理由**:

- **参照の安定性**: 関数の参照が安定し、子コンポーネントの不要な再レンダリングを防止
- **React.memo との組み合わせ**: `React.memo`でメモ化された子コンポーネントと組み合わせて使用すると効果的
- **パフォーマンス**: コールバック関数が props として渡される場合、子コンポーネントの再レンダリングを抑制

#### useMemo

**推奨**: 計算コストの高い値をメモ化。

```typescript
// 良い例: useMemoでメモ化
const filteredProducts = useMemo(
  () => products.filter(/* ... */),
  [products, filter]
);
```

**理由**:

- **計算コストの削減**: 依存配列の値が変更されない限り、前回計算した値を再利用し、計算コストを削減
- **パフォーマンス**: 計算コストが高い処理（フィルタリング、ソート、変換など）で特に効果的
- **参照の安定性**: オブジェクトや配列の参照が安定し、子コンポーネントの不要な再レンダリングを防止

### エラーバウンダリー

**推奨**: エラーバウンダリーを実装して、予期しないエラーからアプリケーションを保護。

```typescript
// 良い例: エラーバウンダリーでコンポーネントを囲む
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**注意**: 一般的なエラーハンドリング（エラークラス、API Routes でのエラーハンドリング）については、[エラーハンドリングセクション](#エラーハンドリング)を参照してください。Prisma 操作でのエラーハンドリングについては、[Prisma セクション](#prisma)の「エラーハンドリング」を参照してください。

### 最適化のポイント

1. **画像最適化**: Next.js Image コンポーネントを使用
2. **コード分割**: 動的インポートを使用
3. **データフェッチ**: 適切なキャッシュ戦略を使用
4. **データベース**: [Prisma セクション](#prisma)の「クエリの最適化と N+1 問題の回避」を参照
5. **React コンポーネント**: `React.memo`、`useCallback`、`useMemo` を適切に使用
6. **エラーバウンダリー**: エラーバウンダリーを実装（上記参照）

## セキュリティ

### 環境変数

**推奨**: 機密情報は環境変数で管理。

```typescript
// 良い例: 環境変数を使用
const databaseUrl = process.env.DATABASE_URL;
```

**理由**:

- **セキュリティ**: 機密情報がコードに含まれず、Git リポジトリにコミットされない
- **環境別設定**: 開発、ステージング、本番環境で異なる設定を簡単に切り替えられる
- **保守性**: 設定の変更がコードの変更を伴わず、デプロイが不要
- **ベストプラクティス**: 12 Factor App の原則に従い、設定を環境変数で管理

**避ける**: ハードコード。

```typescript
// 悪い例: ハードコード
const databaseUrl = "postgresql://user:password@localhost/db";
```

**理由**:

- **セキュリティリスク**: 機密情報がコードに含まれ、Git リポジトリにコミットされる危険性がある
- **環境の固定**: 環境ごとに異なる設定を使用できず、柔軟性が欠如
- **保守性**: 設定の変更にコードの変更とデプロイが必要で、運用が煩雑
- **情報漏洩**: コードレビューや Git 履歴から機密情報が漏洩するリスクがある

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

**理由**:

- **SQL インジェクション対策**: Prisma が自動的にパラメータをエスケープし、SQL インジェクション攻撃を防止
- **型安全性**: TypeScript の型チェックにより、不正なクエリをコンパイル時に検出
- **保守性**: クエリビルダーにより、読みやすく保守しやすいコードになる
- **データベース非依存**: データベースを変更しても、コードの変更が最小限で済む

**避ける**: 生の SQL（必要な場合を除く）。

```typescript
// 悪い例: 生のSQL（危険）
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`;
```

**理由**:

- **SQL インジェクションリスク**: パラメータのエスケープを手動で行う必要があり、ミスが発生しやすい
- **型安全性の欠如**: TypeScript の型チェックが機能せず、実行時エラーのリスクが増加
- **保守性**: SQL がコードに直接記述され、読みにくく保守が困難
- **データベース依存**: データベース固有の SQL 構文に依存し、移植性が低下

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
