# Edge Runtime ガイド

## 目次

- [概要](#概要)
- [Edge Runtime とは](#edge-runtime-とは)
- [Edge Runtime と Node.js Runtime の比較](#edge-runtime-と-nodejs-runtime-の比較)
  - [機能比較表](#機能比較表)
  - [パフォーマンス比較](#パフォーマンス比較)
  - [使用可能な API](#使用可能な-api)
- [このアプリでの Edge Runtime の使用](#このアプリでの-edge-runtime-の使用)
  - [API Routes での使用](#api-routes-での使用)
  - [Server Components での使用](#server-components-での使用)
- [Prisma Accelerate との組み合わせ](#prisma-accelerate-との組み合わせ)
- [Edge Runtime の制限事項](#edge-runtime-の制限事項)
- [Node.js Runtime が必要な場合](#nodejs-runtime-が必要な場合)
- [ベストプラクティス](#ベストプラクティス)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

Next.js App Router では、API Routes と Server Components で使用する Runtime を選択できます。このアプリケーションでは、**Edge Runtime** を使用して、高速な起動時間とグローバル配信を実現しています。

**このアプリでの使用箇所**:

- すべての API Routes: Edge Runtime を明示的に指定（`export const runtime = 'edge'`）
- すべての Server Components: Edge Runtime（デフォルト、Prisma Accelerate により動作可能）

**Edge Runtime の主な特徴**:

- **高速な起動**: コールドスタートが速く、レスポンス時間が短縮される
- **グローバル配信**: エッジネットワーク経由で配信され、ユーザーに近い場所から実行される
- **自動スケーリング**: トラフィックの増加に自動的に対応
- **コスト効率**: リクエスト単位で課金され、使用量に応じたコストが発生

## Edge Runtime とは

**説明**: Edge Runtime は、Next.js が提供する軽量な JavaScript ランタイムです。Vercel Edge Network や Cloudflare Workers などのエッジ環境で実行されます。Node.js Runtime よりも軽量で、起動時間が短く、グローバルに配信できます。

**Edge Runtime の技術的詳細**:

- **ベース**: Web API 標準（Fetch API、Request、Response など）に基づく
- **実行環境**: V8 エンジン（Chrome の JavaScript エンジン）を使用
- **配信**: エッジネットワーク経由でグローバルに配信
- **起動時間**: 数ミリ秒単位で起動（Node.js Runtime は数百ミリ秒）

**Edge Runtime の利点**:

- **低レイテンシー**: ユーザーに近いエッジサーバーから実行されるため、レイテンシーが低い
- **高速な起動**: コールドスタートが速く、レスポンス時間が短縮される
- **グローバル配信**: 世界中のエッジサーバーから配信され、地理的な距離による影響が少ない
- **自動スケーリング**: トラフィックの増加に自動的に対応
- **コスト効率**: リクエスト単位で課金され、使用量に応じたコストが発生

## Edge Runtime と Node.js Runtime の比較

### 機能比較表

| 項目                     | Edge Runtime                         | Node.js Runtime                    |
| ------------------------ | ------------------------------------ | ---------------------------------- |
| **起動速度**             | 非常に高速（コールドスタートが速い） | やや遅い（コールドスタートが遅い） |
| **Prisma Accelerate**    | サポート（推奨）                     | サポート                           |
| **通常の Prisma Client** | サポートされない                     | サポート                           |
| **トランザクション**     | サポート（Prisma Accelerate 使用時） | サポート                           |
| **Node.js API**          | 制限あり（一部の API が使用不可）    | すべて使用可能                     |
| **ファイルシステム**     | アクセス不可                         | アクセス可能                       |
| **パフォーマンス**       | 高い（低レイテンシー）               | 中程度                             |
| **グローバル配信**       | 可能（エッジネットワーク）           | リージョン単位                     |
| **メモリ制限**           | 約 128MB                             | 約 1GB（Vercel の場合）            |
| **実行時間制限**         | 約 30 秒（Vercel の場合）            | 約 60 秒（Vercel の場合）          |
| **WebSocket**            | サポートされない                     | サポート                           |
| **Streaming**            | サポート（ReadableStream）           | サポート                           |

### パフォーマンス比較

**起動時間**:

- **Edge Runtime**: 数ミリ秒単位で起動（コールドスタートが速い）
- **Node.js Runtime**: 数百ミリ秒単位で起動（コールドスタートが遅い）

**レイテンシー**:

- **Edge Runtime**: エッジネットワーク経由で配信されるため、ユーザーに近い場所から実行され、レイテンシーが低い
- **Node.js Runtime**: リージョン単位で実行されるため、地理的な距離による影響がある

**スケーラビリティ**:

- **Edge Runtime**: 自動的にスケールし、トラフィックの増加に対応できる
- **Node.js Runtime**: Edge Runtime ほど自動的にスケールしない

### 使用可能な API

**Edge Runtime で使用可能な API**:

- **Web API 標準**: `fetch`、`Request`、`Response`、`Headers`、`URL`、`URLSearchParams` など
- **Streaming**: `ReadableStream`、`WritableStream`、`TransformStream` など
- **Crypto**: `crypto.subtle`（Web Crypto API）
- **Text Encoding**: `TextEncoder`、`TextDecoder`
- **JSON**: `JSON.parse`、`JSON.stringify`

**Edge Runtime で使用できない API**:

- **Node.js API**: `fs`、`path`、`os`、`crypto`（Node.js 版）、`buffer` など
- **イベントハンドラー**: `process.on`、`process.emit` などの Node.js イベント API
- **ファイルシステム**: ファイルの読み書きができない
- **WebSocket**: WebSocket 接続ができない
- **子プロセス**: `child_process` が使用できない

**Node.js Runtime で使用可能な API**:

- **すべての Node.js API**: `fs`、`path`、`os`、`crypto`、`buffer`、`stream` など
- **ファイルシステム**: ファイルの読み書きが可能
- **WebSocket**: WebSocket 接続が可能
- **子プロセス**: `child_process` が使用可能

## このアプリでの Edge Runtime の使用

### API Routes での使用

**説明**: このアプリでは、すべての API Routes で Edge Runtime を明示的に指定しています。`export const runtime = 'edge'` を追加することで、意図が明確になり、将来的なデフォルト変更の影響を受けません。Prisma Accelerate により、Edge Runtime でも Prisma Client が正常に動作します。

**このアプリでの使用箇所**:

- [`app/api/products/route.ts`](../../app/api/products/route.ts): 商品一覧の取得・作成
- [`app/api/products/[id]/route.ts`](../../app/api/products/[id]/route.ts): 個別商品の取得・更新・削除
- [`app/api/products/reorder/route.ts`](../../app/api/products/reorder/route.ts): 商品の並び替え
- [`app/api/products/upload/route.ts`](../../app/api/products/upload/route.ts): 画像アップロード
- [`app/api/categories/route.ts`](../../app/api/categories/route.ts): カテゴリー一覧の取得

**実装例**:

```typescript
// Edge Runtime を明示的に指定
export const runtime = "edge";
export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Prisma Accelerateを使用してデータベースにアクセス
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
  });
  return apiSuccess({ products });
});
```

**明示的に指定する理由**:

- **意図の明確化**: Edge Runtime を使用することが明確になる
- **将来の変更への対応**: Next.js のデフォルトが変更されても影響を受けない
- **チーム内の理解**: コードを読む人が Edge Runtime を使用していることを理解しやすい

**注意**: Edge Runtime を使用すると、そのページの静的生成（SSG）が無効になります。このアプリでは `export const dynamic = 'force-dynamic'` を使用して動的レンダリングを強制しているため、これは期待通りの動作です。

**Edge Runtime の利点**:

- **高速な起動**: コールドスタートが速く、レスポンス時間が短縮される
- **グローバル配信**: エッジネットワーク経由で配信され、ユーザーに近い場所から実行される
- **スケーラビリティ**: 自動的にスケールし、トラフィックの増加に対応できる
- **コスト効率**: リクエスト単位で課金され、使用量に応じたコストが発生

### Server Components での使用

**説明**: このアプリでは、すべての Server Components で Edge Runtime（デフォルト）を使用しています。Prisma Accelerate により、Edge Runtime でも Prisma Client が正常に動作します。

**このアプリでの使用箇所**:

- [`app/page.tsx`](../../app/page.tsx): ホームページ（商品一覧の表示）
- [`app/dashboard/page.tsx`](../../app/dashboard/page.tsx): ダッシュボードページ（商品管理）
- [`app/faq/page.tsx`](../../app/faq/page.tsx): FAQ ページ（静的なコンテンツ）

**実装例**:

```typescript
// Edge Runtime（デフォルト、明示的な指定は不要）
export default async function Home() {
  // Prisma Accelerateを使用してデータベースにアクセス
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
  });

  return <div>{/* 商品一覧の表示 */}</div>;
}
```

**Edge Runtime の利点**:

- **パフォーマンス**: サーバーサイドでレンダリングされ、クライアントサイドの JavaScript を最小化
- **グローバル配信**: エッジネットワーク経由で配信され、世界中のユーザーに高速にアクセスを提供
- **SEO**: サーバーサイドでレンダリングされるため、SEO に最適

## Prisma Accelerate との組み合わせ

**説明**: Edge Runtime では、通常の Prisma Client（TCP 接続）は使用できません。Prisma Accelerate を使用することで、Edge Runtime でも Prisma Client を使用できます。

**Prisma Accelerate の利点**:

- **Edge Runtime 対応**: HTTP ベースの接続により、Edge Runtime でも動作
- **グローバル接続プーリング**: 効率的な接続管理により、パフォーマンスが向上
- **キャッシング**: クエリ結果のキャッシングにより、レイテンシーが削減
- **トランザクションサポート**: 配列形式とインタラクティブトランザクションの両方をサポート

**このアプリでの実装**:

[`lib/prisma.ts`](../../lib/prisma.ts) で、Prisma Accelerate を使用した Prisma Client を作成しています：

```typescript
const createPrismaClient = (): PrismaClient => {
  const accelerateUrl = process.env.DATABASE_URL_ACCELERATE;

  if (!accelerateUrl) {
    throw new Error("DATABASE_URL_ACCELERATE environment variable is not set.");
  }

  return new PrismaClient({
    accelerateUrl,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};
```

**詳細な情報**:

- [Prisma ガイド - Prisma Accelerate](./prisma-guide.md#prisma-accelerate): Prisma Accelerate の詳細な説明

## Edge Runtime の制限事項

**説明**: Edge Runtime には、いくつかの制限事項があります。これらの制限を理解し、適切に対応することが重要です。

**主な制限事項**:

1. **Node.js API の制限**: Node.js 専用の API（`fs`、`path`、`os`、`process.on` など）が使用できない
2. **イベントハンドラー**: `process.on('beforeExit', ...)` などの Node.js イベント API が使用できない
3. **ファイルシステムへのアクセス**: ファイルの読み書きができない
4. **WebSocket**: WebSocket 接続ができない
5. **メモリ制限**: 約 128MB のメモリ制限がある（Vercel の場合）
6. **実行時間制限**: 約 30 秒の実行時間制限がある（Vercel の場合）
7. **通常の Prisma Client**: TCP 接続を使用する通常の Prisma Client は使用できない（Prisma Accelerate が必要）

**制限事項への対応**:

- **Node.js API**: Edge Runtime で使用できない API を使用する場合は、条件付きで実行するか、Node.js Runtime を使用
  - 例: `process.on` を使用する場合は `typeof process.on === 'function'` でチェック
- **ファイルシステム**: Vercel Blob Storage などの外部ストレージサービスを使用
- **WebSocket**: Server-Sent Events（SSE）や HTTP ポーリングを使用
- **メモリ制限**: 大きなデータの処理は避け、必要に応じて Node.js Runtime を使用
- **実行時間制限**: 長時間実行される処理は避け、必要に応じて Node.js Runtime を使用
- **Prisma Client**: Prisma Accelerate を使用して Edge Runtime でも Prisma Client を使用可能
  - Prisma Accelerate が接続を管理するため、明示的なクリーンアップ（`process.on('beforeExit', ...)` など）は不要

## Node.js Runtime が必要な場合

**説明**: 以下の場合は、Node.js Runtime が必要です。`export const runtime = "nodejs"` を指定することで、Node.js Runtime を使用できます。

**Node.js Runtime が必要な場合**:

1. **ファイルシステムへのアクセス**: ファイルの読み書きが必要な場合
2. **Node.js 専用の API**: `fs`、`path`、`os` などの Node.js 専用の API を使用する場合
3. **通常の Prisma Client**: Prisma Accelerate を使用せず、通常の Prisma Client を使用する場合
4. **WebSocket**: WebSocket 接続が必要な場合
5. **長時間実行される処理**: 実行時間が 30 秒を超える処理が必要な場合
6. **大きなメモリ使用**: 128MB を超えるメモリが必要な場合

**Node.js Runtime の指定方法**:

```typescript
// Node.js Runtimeを明示的に指定
export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  // Node.js APIを使用
  const fs = await import("fs/promises");
  const data = await fs.readFile("file.txt", "utf-8");
  return Response.json({ data });
};
```

**注意事項**:

- Node.js Runtime を使用すると、起動時間が遅くなり、グローバル配信の利点が失われます
- 可能な限り Edge Runtime を使用し、必要な場合のみ Node.js Runtime を使用することを推奨します

## ベストプラクティス

**推奨**: Edge Runtime を使用（Prisma Accelerate と組み合わせ）。

```typescript
// Edge Runtime（デフォルト、明示的な指定は不要）
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Prisma Accelerateを使用してデータベースにアクセス
  const products = await prisma.product.findMany();
  return apiSuccess({ products });
});
```

**理由**:

- **高速な起動**: コールドスタートが速く、レスポンス時間が短縮される
- **グローバル配信**: エッジネットワーク経由で配信され、ユーザーに近い場所から実行される
- **スケーラビリティ**: 自動的にスケールし、トラフィックの増加に対応できる
- **コスト効率**: リクエスト単位で課金され、使用量に応じたコストが発生

**避ける**: 不要な場合に Node.js Runtime を明示的に指定。

```typescript
// 避ける: 不要な場合にNode.js Runtimeを指定
export const runtime = "nodejs"; // 通常は不要

export const GET = async (request: NextRequest) => {
  // ...
};
```

**理由**:

- **起動速度**: コールドスタートが遅く、レスポンス時間が長くなる可能性がある
- **スケーラビリティ**: Edge Runtime ほど自動的にスケールしない
- **コスト**: より多くのリソースを消費する可能性がある

**このアプリでの実装**:

このアプリでは、すべての API Routes と Server Components で Edge Runtime（デフォルト）を使用しています。Prisma Accelerate により、Edge Runtime でも Prisma Client が正常に動作します。

**環境変数の設定**:

- `DATABASE_URL_ACCELERATE`: Prisma Accelerate の URL（Edge Runtime で使用）
- `POSTGRES_URL`: 通常のデータベース接続文字列（マイグレーション用、Node.js Runtime で使用）

## まとめ

このアプリケーションでは、**Edge Runtime** を使用して以下の利点を実現しています：

1. **高速な起動**: コールドスタートが速く、レスポンス時間が短縮される
2. **グローバル配信**: エッジネットワーク経由で配信され、ユーザーに近い場所から実行される
3. **スケーラビリティ**: 自動的にスケールし、トラフィックの増加に対応できる
4. **コスト効率**: リクエスト単位で課金され、使用量に応じたコストが発生

**Prisma Accelerate との組み合わせ**:

- Prisma Accelerate により、Edge Runtime でも Prisma Client を使用可能
- グローバル接続プーリングとキャッシングにより、パフォーマンスが向上
- トランザクションもサポートされ、すべての Prisma 機能が使用可能

**推奨事項**:

- 可能な限り Edge Runtime を使用し、必要な場合のみ Node.js Runtime を使用することを推奨します
- Prisma Accelerate と組み合わせることで、Edge Runtime でも Prisma Client をフルに活用できます

## 参考リンク

- **[Prisma ガイド](./prisma-guide.md)**: Prisma Accelerate の詳細な説明
- **[App Router ガイド](./app-router-guide.md)**: Server Components と API Routes の詳細な使用方法
- **[Next.js 公式ドキュメント - Edge Runtime](https://nextjs.org/docs/app/api-reference/route-segment-config#runtime)**: Next.js の Edge Runtime の詳細なドキュメント
- **[Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)**: Vercel Edge Functions の詳細なドキュメント
- **[Prisma Accelerate ドキュメント](https://www.prisma.io/docs/accelerate)**: Prisma Accelerate の詳細なドキュメント
