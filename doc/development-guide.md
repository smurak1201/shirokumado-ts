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

**理由**:

- **ファイルベースのルーティング**: ディレクトリ構造がそのまま URL ルートになり、ルーティングの設定が不要で直感的
- **自動的なルーティング**: Next.js が自動的にルーティングを生成し、手動での設定が不要
- **型安全性**: ファイルパスから型が推論され、型安全なルーティングが実現される
- **保守性**: ディレクトリ構造を見るだけでルーティングが理解でき、保守が容易

**避ける**: App Router の規約に反する構造。

```
app/
├── pages/                 # 悪い例: pagesディレクトリはPages Router用
│   └── index.tsx
├── routes/                # 悪い例: カスタムルーティング設定
│   └── custom-route.tsx
└── api/
    └── custom-api.ts      # 悪い例: route.ts以外のファイル名
```

**理由**:

- **Next.js の機能が使えない**: App Router の規約に従わないと、Next.js の自動ルーティング機能が機能しない
- **設定の複雑化**: カスタムルーティング設定が必要になり、設定が複雑になる
- **型安全性の欠如**: ファイルパスから型が推論されず、型安全性が損なわれる
- **保守性の低下**: ルーティングの構造が不明確になり、保守が困難になる

### Prisma

#### クエリの最適化と N+1 問題の回避

**推奨**: N+1 問題を回避するために`include`で関連データを一度に取得。

```typescript
// 良い例: includeで関連データを一度に取得
const products = await prisma.product.findMany({
  include: {
    category: true, // カテゴリー情報も一緒に取得（N+1問題を回避）
  },
});
```

**理由**:

- **パフォーマンス**: 1 回のクエリで必要なデータをすべて取得でき、データベースへの負荷が最小化される
- **レスポンスタイム**: クエリ回数が削減され、レスポンスタイムが大幅に短縮される
- **スケーラビリティ**: データ件数が増えてもクエリ回数が一定のため、パフォーマンスが安定する
- **コードの簡潔性**: ループ内でのクエリ実行が不要で、コードがシンプルになる
- **N+1 問題の回避**: データが N 件ある場合、`include`を使用することで 1 回のクエリで済む（[Prisma ガイド - N+1 問題の詳細解説](./guides/prisma-guide.md#n1-問題の詳細解説)）

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

- **パフォーマンスの悪化**: データが N 件ある場合、合計 N+1 回のクエリが実行され、データベースへの負荷が大幅に増加する
- **レスポンスタイムの悪化**: クエリ回数が増加し、各クエリの実行時間が累積されるため、レスポンスタイムが大幅に悪化する
- **スケーラビリティの問題**: データ件数が増えるほどクエリ回数が増加し、パフォーマンスが悪化する
- **コードの複雑性**: ループ内でクエリを実行する必要があり、コードが複雑になる
- **N+1 問題の発生**: データが N 件ある場合、合計 N+1 回のクエリが実行される（[Prisma ガイド - N+1 問題の詳細解説](./guides/prisma-guide.md#n1-問題の詳細解説)）

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

**理由**:

- **原子性の保証**: すべての操作が成功するか、すべてがロールバックされ、データの整合性が保たれる
- **エラー時の一貫性**: 途中でエラーが発生した場合、部分的な更新が残らず、データベースの状態が一貫性を保つ
- **データの整合性**: 複数のテーブルを更新する場合、すべての更新が成功することを保証できる
- **パフォーマンス**: 複数の操作を一度に実行することで、データベースへの往復回数が削減される

**避ける**: 個別に操作を実行。

```typescript
// 悪い例: トランザクションなし
const user = await prisma.user.create({ data: userData });
await prisma.order.create({ data: { userId: user.id, ...orderData } });
// もし order の作成に失敗した場合、user は残ってしまう
```

**理由**:

- **データの不整合**: 途中でエラーが発生した場合、部分的な更新が残り、データベースの状態が不整合になる
- **ロールバック不可**: エラーが発生しても、既に実行された操作を元に戻すことができない
- **デバッグの困難**: どの操作が成功し、どの操作が失敗したかを追跡するのが困難
- **データの整合性の欠如**: 複数のテーブルを更新する場合、一部の更新だけが成功し、データの整合性が損なわれる

**このアプリでの実装**:

このアプリでは、商品の表示順序を一括更新する際にトランザクションを使用しています。詳細は [Prisma ガイド - $transaction](./guides/prisma-guide.md#transaction) を参照してください。

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

**理由**:

- **コードの簡潔性**: 明示的な型定義が不要で、コードが簡潔になる
- **保守性**: 型定義が自動的に更新され、保守が容易
- **型安全性**: TypeScript が型を推論し、型安全性が保たれる
- **開発効率**: 型を書く手間が省け、開発効率が向上

**避ける**: 不要な明示的な型定義。

```typescript
// 悪い例: 不要な明示的な型定義
const users: User[] = await prisma.user.findMany(); // 型推論で十分
const user: User | null = await prisma.user.findUnique({ where: { id: 1 } }); // 型推論で十分
```

**理由**:

- **コードの冗長性**: 型推論で十分な場合に明示的な型定義を書くと、コードが冗長になる
- **保守性の低下**: 型定義が重複し、変更時に複数箇所を修正する必要がある
- **可読性の低下**: 不要な型定義により、コードの可読性が低下する

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

**理由**:

- **型安全性**: 実行時に型をチェックし、型安全にコードを記述できる
- **型の絞り込み**: TypeScript が型を自動的に絞り込み、その後のコードで型安全にアクセスできる
- **エラーの早期発見**: 不正なデータを早期に検出し、エラーを防止できる
- **コードの可読性**: 型チェックの意図が明確になり、コードの可読性が向上

**避ける**: 型アサーション（`as`）の使用。

```typescript
// 悪い例: 型アサーション
const user = data as User; // 実行時に型チェックされない
console.log(user.email); // 型が正しくない場合、実行時エラーが発生する可能性
```

**理由**:

- **型安全性の欠如**: 実行時に型チェックが行われず、型が正しくない場合でもエラーが検出されない
- **実行時エラーのリスク**: 不正なデータがそのまま処理され、実行時エラーが発生する可能性がある
- **デバッグの困難**: エラーが発生した際に、原因の特定が困難になる

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

**避ける**: 各エンドポイントで異なるレスポンス形式を使用。

```typescript
// 悪い例: 統一されていないレスポンス形式
export const GET = async () => {
  const data = await fetchData();
  return Response.json(data); // 形式が統一されていない
};

export const POST = async (request: Request) => {
  const body = await request.json();
  if (!body.name) {
    return Response.json({ error: "Name is required" }, { status: 400 }); // 形式が統一されていない
  }
  // ...
};
```

**理由**:

- **一貫性の欠如**: 各エンドポイントで異なるレスポンス形式が使用され、フロントエンドでの処理が複雑になる
- **予測不可能性**: レスポンス形式が予測できず、フロントエンドのコードが複雑になる
- **エラーハンドリングの分散**: エラーレスポンスの形式が統一されず、フロントエンドでのエラー処理が分散する
- **保守性の低下**: レスポンス形式の変更を各エンドポイントで個別に管理する必要があり、変更が困難

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

**避ける**: 入力検証なしでデータを処理。

```typescript
// 悪い例: 入力検証なし
export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  // 検証なしでデータベースに保存
  await prisma.user.create({ data: body });
});
```

**理由**:

- **セキュリティリスク**: 不正なデータがそのまま処理され、セキュリティリスクが発生する
- **データの不整合**: 不正なデータがデータベースに保存され、データの整合性が損なわれる
- **エラーの発生**: 実行時にエラーが発生し、ユーザー体験が悪化する
- **デバッグの困難**: エラーが発生した際に、原因の特定が困難になる

#### HTTP メソッド

**推奨**: 適切な HTTP メソッドを使用。

```typescript
// 良い例: 適切なHTTPメソッド
export const GET = withErrorHandling(async () => {
  /* データ取得 */
});
export const POST = withErrorHandling(async (request: Request) => {
  /* データ作成 */
});
export const PUT = withErrorHandling(async (request: Request) => {
  /* データ更新 */
});
export const DELETE = withErrorHandling(async () => {
  /* データ削除 */
});
```

**理由**:

- **RESTful API**: RESTful API の原則に従い、適切な HTTP メソッドを使用することで、API の意図が明確になる
- **セマンティクス**: HTTP メソッドの意味に従って使用することで、API の動作が予測可能になる
- **キャッシュ**: GET リクエストはキャッシュ可能で、パフォーマンスが向上する
- **冪等性**: PUT や DELETE は冪等性を持ち、同じリクエストを複数回実行しても結果が同じになる

**避ける**: 不適切な HTTP メソッドの使用。

```typescript
// 悪い例: 不適切なHTTPメソッド
export const GET = withErrorHandling(async (request: Request) => {
  // GET でデータを削除（不適切）
  await prisma.user.delete({ where: { id: request.body.id } });
});
export const POST = withErrorHandling(async () => {
  // POST でデータを取得（不適切）
  const users = await prisma.user.findMany();
  return Response.json({ users });
});
```

**理由**:

- **RESTful API の原則違反**: HTTP メソッドの意味に反する使用により、API の意図が不明確になる
- **キャッシュの問題**: GET でデータを変更すると、キャッシュが無効化され、パフォーマンスが悪化する
- **セキュリティリスク**: GET でデータを削除すると、URL だけで削除が実行され、セキュリティリスクが発生する
- **予測不可能性**: HTTP メソッドの意味に反する使用により、API の動作が予測できなくなる

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

**避ける**: 不要な Client Component の使用。

```typescript
// 悪い例: 不要なClient Component
"use client";

export function StaticContent() {
  // インタラクティブな機能がないのにClient Componentを使用
  return <div>静的なコンテンツ</div>;
}
```

**理由**:

- **パフォーマンスの悪化**: 不要な JavaScript がクライアントに送信され、バンドルサイズが増加する
- **初期ロード時間**: 不要なコードが読み込まれ、初期ロード時間が増加する
- **SEO**: サーバーサイドレンダリングの利点が失われ、SEO に不利になる
- **コードの複雑性**: 不要な `"use client"`ディレクティブにより、コードの意図が不明確になる

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

**避ける**: 巨大なコンポーネント。

```typescript
// 悪い例: 巨大なコンポーネント
export function ProductPage({ product }: { product: Product }) {
  // 画像表示、情報表示、アクション、レビュー、関連商品などすべてが1つのコンポーネントに
  return (
    <div>
      {/* 100行以上のJSX */}
      <div>画像</div>
      <div>情報</div>
      <div>アクション</div>
      <div>レビュー</div>
      <div>関連商品</div>
      {/* ... */}
    </div>
  );
}
```

**理由**:

- **保守性の低下**: 巨大なコンポーネントは変更の影響範囲が広く、保守が困難になる
- **再利用性の欠如**: 巨大なコンポーネントは他の場所で再利用しにくい
- **テストの困難**: 巨大なコンポーネントは個別にテストしにくく、テストの品質が低下する
- **可読性の低下**: コードが読みにくく、理解しにくくなる

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

**理由**:

- **初期バンドルサイズの削減**: 重いコンポーネントを動的にインポートすることで、初期バンドルサイズが削減され、初期ロード時間が短縮される
- **コード分割**: 必要な時だけコンポーネントを読み込むことで、コード分割が実現され、パフォーマンスが向上
- **ローディング状態の管理**: `loading` オプションにより、読み込み中の状態を適切に表示できる
- **SSR の制御**: `ssr: false` により、サーバーサイドレンダリングを無効にし、クライアントサイドのみでレンダリングできる

**避ける**: すべてのコンポーネントを静的にインポート。

```typescript
// 悪い例: すべてを静的にインポート
import HeavyComponent from "./HeavyComponent";

export default function Page() {
  return <HeavyComponent />; // 初期バンドルに含まれる
}
```

**理由**:

- **初期バンドルサイズの増加**: すべてのコンポーネントが初期バンドルに含まれ、初期ロード時間が増加する
- **不要なコードの読み込み**: 使用されないコンポーネントも読み込まれ、リソースが無駄に消費される
- **パフォーマンスの悪化**: 初期ロード時にすべてのコードが読み込まれ、パフォーマンスが悪化する

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

**避ける**: すべてのコンポーネントをメモ化。

```typescript
// 悪い例: すべてのコンポーネントをメモ化
import { memo } from "react";

function SimpleComponent({ text }: { text: string }) {
  return <div>{text}</div>; // シンプルなコンポーネントをメモ化する必要はない
}

export default memo(SimpleComponent);
```

**理由**:

- **オーバーヘッド**: メモ化自体にもコストがかかり、シンプルなコンポーネントではオーバーヘッドの方が大きい
- **メモリ使用量**: メモ化によりメモリ使用量が増加する
- **不要な最適化**: レンダリングコストが低いコンポーネントでは、メモ化の効果がほとんどない

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

**避ける**: すべての関数をメモ化。

```typescript
// 悪い例: すべての関数をメモ化
const handleClick = useCallback(() => {
  console.log("clicked"); // シンプルな関数をメモ化する必要はない
}, []);

const handleSubmit = useCallback(() => {
  // 依存配列が空で、子コンポーネントに渡されない関数をメモ化する必要はない
}, []);
```

**理由**:

- **オーバーヘッド**: メモ化自体にもコストがかかり、シンプルな関数ではオーバーヘッドの方が大きい
- **メモリ使用量**: メモ化によりメモリ使用量が増加する
- **不要な最適化**: 子コンポーネントに渡されない関数や、依存配列が頻繁に変わる関数では、メモ化の効果がほとんどない

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

**避ける**: すべての計算をメモ化。

```typescript
// 悪い例: すべての計算をメモ化
const sum = useMemo(() => a + b, [a, b]); // シンプルな計算をメモ化する必要はない
const message = useMemo(() => `Hello, ${name}`, [name]); // 文字列結合をメモ化する必要はない
```

**理由**:

- **オーバーヘッド**: メモ化自体にもコストがかかり、シンプルな計算ではオーバーヘッドの方が大きい
- **メモリ使用量**: メモ化によりメモリ使用量が増加する
- **不要な最適化**: 計算コストが低い処理では、メモ化の効果がほとんどない

### エラーバウンダリー

**推奨**: エラーバウンダリーを実装して、予期しないエラーからアプリケーションを保護。

```typescript
// 良い例: エラーバウンダリーでコンポーネントを囲む
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**理由**:

- **アプリケーションの保護**: 予期しないエラーが発生しても、アプリケーション全体がクラッシュしない
- **ユーザー体験**: エラーが発生した場合でも、適切なエラーメッセージを表示できる
- **デバッグ**: エラーが発生した箇所を特定しやすく、デバッグが容易になる
- **エラーの局所化**: エラーが発生したコンポーネントのみが影響を受け、他の部分は正常に動作する

**避ける**: エラーバウンダリーなしでコンポーネントを配置。

```typescript
// 悪い例: エラーバウンダリーなし
export default function Page() {
  return (
    <div>
      <YourComponent />{" "}
      {/* エラーが発生するとアプリケーション全体がクラッシュ */}
    </div>
  );
}
```

**理由**:

- **アプリケーションのクラッシュ**: 予期しないエラーが発生すると、アプリケーション全体がクラッシュする
- **ユーザー体験の悪化**: エラーが発生した場合、ユーザーに適切なフィードバックを提供できない
- **デバッグの困難**: エラーが発生した箇所を特定しにくく、デバッグが困難になる
- **エラーの拡散**: エラーが発生したコンポーネントだけでなく、アプリケーション全体に影響が及ぶ

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

**理由**:

- **セキュリティ**: 不正な入力データを検出し、セキュリティリスクを防止
- **データの整合性**: データベースに保存されるデータの整合性が保たれる
- **エラーメッセージ**: 適切なエラーメッセージを返すことで、ユーザー体験が向上
- **型安全性**: 検証後のデータが型安全になり、その後の処理が安全に実行できる

**避ける**: 入力検証なしでデータを処理。

```typescript
// 悪い例: 入力検証なし
export const POST = async (request: Request) => {
  const body = await request.json();
  // 検証なしでデータベースに保存
  await prisma.user.create({ data: body });
};
```

**理由**:

- **セキュリティリスク**: 不正な入力データがそのまま処理され、セキュリティリスクが発生する
- **データの不整合**: 不正なデータがデータベースに保存され、データの整合性が損なわれる
- **エラーの発生**: 実行時にエラーが発生し、ユーザー体験が悪化する
- **デバッグの困難**: エラーが発生した際に、原因の特定が困難になる

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

- **SQL インジェクションのリスク**: パラメータが適切にエスケープされない場合、SQL インジェクション攻撃のリスクがある
- **型安全性の欠如**: TypeScript の型チェックが機能せず、不正なクエリをコンパイル時に検出できない
- **保守性の低下**: SQL クエリがコードに直接記述され、読みにくく保守しにくいコードになる
- **データベース依存**: データベース固有の構文が使用され、データベースを変更する際にコードの変更が必要

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
```
