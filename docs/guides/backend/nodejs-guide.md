# Node.js ガイド

## このドキュメントの役割

このドキュメントは「**Node.js ランタイムの基礎と役割**」を説明します。Node.js がこのアプリケーションでどのように使われているか、環境変数の管理、npm スクリプト、バージョン管理など、Node.js に関する知識を理解したいときに参照してください。

**関連ドキュメント**:
- [技術スタック](../../tech-stack.md#ランタイム): Node.js の概要と選定理由
- [Async/Await ガイド](../basics/async-await-guide.md): Node.js の非同期処理の詳細
- [TypeScript ガイド](../basics/typescript-guide.md): TypeScript との連携

## 目次

- [概要](#概要)
- [Node.js とは](#nodejs-とは)
  - [JavaScript ランタイム](#javascript-ランタイム)
  - [イベントループ](#イベントループ)
  - [Java/PHP との比較](#javaphp-との比較)
- [バージョン管理](#バージョン管理)
  - [.nvmrc](#nvmrc)
  - [engines フィールド](#engines-フィールド)
  - [nvm の使い方](#nvm-の使い方)
- [npm（パッケージマネージャー）](#npm（パッケージマネージャー）)
  - [npm とは](#npm-とは)
  - [package.json](#packagejson)
  - [dependencies と devDependencies](#dependencies-と-devdependencies)
  - [npm スクリプト](#npm-スクリプト)
- [環境変数](#環境変数)
  - [process.env](#processenv)
  - [NODE_ENV](#nodeenv)
  - [このアプリでの環境変数管理](#このアプリでの環境変数管理)
  - [Next.js の環境変数の仕組み](#nextjs-の環境変数の仕組み)
- [グローバルオブジェクト](#グローバルオブジェクト)
  - [globalThis](#globalthis)
  - [process](#process)
  - [console](#console)
- [Node.js ランタイムと Edge ランタイム](#nodejs-ランタイムと-edge-ランタイム)
- [このアプリでの使用例](#このアプリでの使用例)
  - [環境変数の型安全な管理](#環境変数の型安全な管理)
  - [Prisma Client のシングルトンパターン](#prisma-client-のシングルトンパターン)
  - [シーダースクリプト](#シーダースクリプト)
  - [環境別のログ出力](#環境別のログ出力)
- [ベストプラクティス](#ベストプラクティス)
- [まとめ](#まとめ)
- [参考リンク](#参考リンク)

## 概要

Node.js は、Chrome の V8 JavaScript エンジン上で動作する JavaScript ランタイムです。サーバーサイドで JavaScript/TypeScript を実行でき、Web アプリケーションのバックエンド開発に広く使用されています。

このアプリケーションでは、**Node.js 24** を使用して以下の処理を実行しています：

- **API Routes**: 商品管理、認証などのバックエンド処理
- **Server Components**: データベースからのデータ取得とサーバーサイドレンダリング
- **Prisma**: データベーススキーマのマイグレーションとシーダー実行
- **ビルドプロセス**: TypeScript のコンパイルとバンドル生成

**Node.js の主な特徴**:

- **非同期 I/O**: イベントループベースのノンブロッキング処理
- **npm エコシステム**: 世界最大のパッケージレジストリ
- **TypeScript 対応**: `@types/node` による完全な型サポート
- **クロスプラットフォーム**: Windows、macOS、Linux で動作

## Node.js とは

### JavaScript ランタイム

Node.js は、ブラウザ外で JavaScript を実行するための環境（ランタイム）です。

**ブラウザと Node.js の違い**:

| 項目 | ブラウザ | Node.js |
|------|---------|---------|
| **実行環境** | ユーザーの端末 | サーバー |
| **DOM 操作** | 可能（`document`, `window`） | 不可 |
| **ファイルシステム** | アクセス不可 | アクセス可能（`fs` モジュール） |
| **データベース接続** | 直接不可 | 可能 |
| **環境変数** | 限定的 | `process.env` でアクセス |

このアプリでは、Next.js を通じて両方の環境を使い分けています：

- **Server Components / API Routes** → Node.js 環境で実行
- **Client Components**（`"use client"`） → ブラウザ環境で実行

### イベントループ

Node.js はシングルスレッドで動作しますが、**イベントループ**により効率的に非同期処理を実行します。

```
┌───────────────────────────┐
│     イベントループ          │
│                            │
│  1. リクエスト受付          │
│  2. 非同期処理を開始        │
│  3. 完了を待たずに次へ      │ ← ノンブロッキング
│  4. 完了通知でコールバック   │
│                            │
└───────────────────────────┘
```

**具体例**: API Routes でのデータベースアクセス

```typescript
// Node.js のイベントループにより、データベースの応答を待つ間も
// 他のリクエストを処理できる
export const GET = withErrorHandling(async () => {
  const products = await prisma.product.findMany(); // I/O待ち中は他の処理が進む
  return apiSuccess({ products });
});
```

**PHP/Java との違い**:

- **PHP**: リクエストごとにプロセスを生成（Apache + mod_php の場合）
- **Java**: スレッドプール方式（リクエストごとにスレッドを割り当て）
- **Node.js**: シングルスレッド + イベントループ（少ないリソースで多数の同時接続を処理）

### Java/PHP との比較

| 概念 | Java / PHP | Node.js |
|------|-----------|---------|
| **パッケージ管理** | Maven / Composer | npm |
| **設定ファイル** | `pom.xml` / `composer.json` | `package.json` |
| **ランタイム** | JVM / PHP-FPM | Node.js（V8 エンジン） |
| **非同期処理** | マルチスレッド | イベントループ + async/await |
| **型システム** | 静的型付け（Java） / 動的型付け（PHP） | TypeScript で静的型付けを追加 |
| **環境変数** | `System.getenv()` / `$_ENV` | `process.env` |
| **プロセス終了** | `System.exit()` | `process.exit()` |

## バージョン管理

### .nvmrc

`.nvmrc` ファイルで、プロジェクトで使用する Node.js のバージョンを固定しています。

**このアプリでの設定**:

[`.nvmrc`](../../.nvmrc)

```
24
```

**役割**:

- チーム全員が同じ Node.js バージョンを使用することを保証
- `nvm use` コマンドで自動的にバージョンを切り替え
- Vercel のデプロイ時にもこのバージョンが参照される

### engines フィールド

`package.json` の `engines` フィールドで、動作に必要な Node.js と npm のバージョンを明示しています。

**このアプリでの設定**:

[`package.json`](../../package.json)

```json
{
  "engines": {
    "node": "24.x",
    "npm": ">=11.0.0"
  }
}
```

**役割**:

- 互換性のないバージョンでの実行を防止
- CI/CD 環境でのバージョン指定
- 開発者が正しい環境をセットアップする際の参考

### nvm の使い方

nvm（Node Version Manager）は、複数の Node.js バージョンを管理するためのツールです。

**基本的なコマンド**:

```bash
# .nvmrc に記載されたバージョンを使用
nvm use

# 特定のバージョンをインストール
nvm install 24

# インストール済みのバージョンを一覧表示
nvm ls

# 現在のバージョンを確認
node -v
```

## npm（パッケージマネージャー）

### npm とは

npm（Node Package Manager）は、Node.js のパッケージマネージャーです。JavaScript/TypeScript のライブラリを簡単にインストール・管理できます。

**Java/PHP との比較**:

| 操作 | Java (Maven) | PHP (Composer) | Node.js (npm) |
|------|-------------|----------------|---------------|
| **依存関係の定義** | `pom.xml` | `composer.json` | `package.json` |
| **ロックファイル** | - | `composer.lock` | `package-lock.json` |
| **インストール** | `mvn install` | `composer install` | `npm install` |
| **パッケージ追加** | `pom.xml` に記述 | `composer require` | `npm install <package>` |
| **スクリプト実行** | `mvn exec` | `composer run` | `npm run <script>` |

### package.json

`package.json` は、Node.js プロジェクトの設定ファイルです。依存関係、スクリプト、メタデータを定義します。

**このアプリでの構成**:

[`package.json`](../../package.json)

```json
{
  "name": "shirokumado-ts",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": "24.x",
    "npm": ">=11.0.0"
  },
  "scripts": { ... },
  "dependencies": { ... },
  "devDependencies": { ... }
}
```

| フィールド | 説明 |
|-----------|------|
| `name` | プロジェクト名 |
| `version` | バージョン番号 |
| `private` | `true` にすると npm に公開されない |
| `engines` | 必要な Node.js / npm のバージョン |
| `scripts` | 実行可能なスクリプト（後述） |
| `dependencies` | 本番環境で必要な依存関係 |
| `devDependencies` | 開発時のみ必要な依存関係 |

### dependencies と devDependencies

| 種類 | 用途 | インストール |
|------|------|-------------|
| **dependencies** | 本番環境で動作に必要 | `npm install <package>` |
| **devDependencies** | 開発・ビルド時のみ必要 | `npm install -D <package>` |

**このアプリでの例**:

```json
{
  "dependencies": {
    "next": "16.1.1",        // フレームワーク（本番で必要）
    "react": "19.2.3",       // UI ライブラリ（本番で必要）
    "@vercel/blob": "^2.0.0" // Blob Storage SDK（本番で必要）
  },
  "devDependencies": {
    "@types/node": "^24.10.4", // Node.js の型定義（開発時のみ）
    "typescript": "^5",        // TypeScript コンパイラ（開発時のみ）
    "prisma": "^7.2.0",       // Prisma CLI（マイグレーション用）
    "eslint": "^9"            // リンター（開発時のみ）
  }
}
```

### npm スクリプト

`package.json` の `scripts` フィールドで定義されたコマンドを `npm run <script>` で実行できます。

**このアプリで定義されているスクリプト**:

[`package.json`](../../package.json) (`scripts` フィールド)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "eslint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | Prisma 生成 → マイグレーション → Next.js ビルド |
| `npm run start` | 本番サーバーを起動 |
| `npm run lint` | ESLint でコード品質をチェック |
| `npm run db:generate` | Prisma Client を生成 |
| `npm run db:push` | スキーマをデータベースに反映（マイグレーションなし） |
| `npm run db:migrate` | マイグレーションを作成・適用 |
| `npm run db:studio` | Prisma Studio（データベース GUI）を起動 |
| `npm run db:seed` | シーダースクリプトを実行（対話モード） |

**`build` スクリプトの流れ**:

```
npm run build
  ↓
prisma generate       ← Prisma Client を生成（型定義を含む）
  ↓
prisma migrate deploy ← マイグレーションを適用
  ↓
next build            ← Next.js のプロダクションビルド
```

## 環境変数

### process.env

`process.env` は、Node.js で環境変数にアクセスするためのオブジェクトです。

**基本的な使い方**:

```typescript
// 環境変数の読み取り
const databaseUrl = process.env.DATABASE_URL;

// 環境の判定
const isDev = process.env.NODE_ENV === 'development';
```

**特徴**:

- すべての値は `string | undefined` 型
- 存在しない環境変数にアクセスすると `undefined` を返す
- セキュリティ上、クライアントサイドのコードからはアクセスできない（Next.js の場合、`NEXT_PUBLIC_` プレフィックスが必要）

### NODE_ENV

`NODE_ENV` は、アプリケーションの実行環境を示す特別な環境変数です。

| 値 | 環境 | 説明 |
|---|------|------|
| `development` | 開発環境 | `npm run dev` 時に自動設定 |
| `production` | 本番環境 | `npm run build` / `npm run start` 時に自動設定 |
| `test` | テスト環境 | テスト実行時に設定 |

**このアプリでの使い分け**:

| ファイル | 用途 |
|---------|------|
| [`lib/prisma.ts`](../../lib/prisma.ts) | 開発環境でのみ詳細なクエリログを出力 |
| [`lib/logger.ts`](../../lib/logger.ts) | 本番環境は JSON 形式、開発環境はカラー出力 |
| [`lib/api-helpers.ts`](../../lib/api-helpers.ts) | 本番環境では予期しないエラーの詳細を隠す |
| [`lib/env.ts`](../../lib/env.ts) | `isDevelopment()` / `isProduction()` ヘルパー関数 |

### このアプリでの環境変数管理

このアプリでは、[`lib/env.ts`](../../lib/env.ts) で環境変数を型安全に管理しています。

**サーバー環境変数の型定義と取得**:

[`lib/env.ts`](../../lib/env.ts)

```typescript
export interface ServerEnv {
  DATABASE_URL: string;
  POSTGRES_URL_NON_POOLING?: string;
  DATABASE_URL_UNPOOLED?: string;
  BLOB_READ_WRITE_TOKEN: string;
  STACK_SECRET_SERVER_KEY?: string;
}

export function getServerEnv(): ServerEnv {
  const databaseUrl = process.env.DATABASE_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  if (!blobToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set.');
  }

  return {
    DATABASE_URL: databaseUrl,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    BLOB_READ_WRITE_TOKEN: blobToken,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
  };
}
```

**設計のポイント**:

- **型安全性**: `string | undefined` ではなく、明確な型で環境変数を扱える
- **バリデーション**: 必須の環境変数が未設定の場合、起動時にエラーを発生させる
- **一元管理**: 環境変数のアクセスを `lib/env.ts` に集約し、散在を防止

### Next.js の環境変数の仕組み

Next.js では、環境変数のプレフィックスによってアクセス範囲が制御されます。

| プレフィックス | アクセス範囲 | 例 |
|--------------|------------|---|
| `NEXT_PUBLIC_` あり | サーバー + クライアント | `NEXT_PUBLIC_STACK_PROJECT_ID` |
| `NEXT_PUBLIC_` なし | サーバーのみ | `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` |

**セキュリティ上の注意**:

- データベース接続文字列や API キーなど、機密情報は `NEXT_PUBLIC_` を**付けない**
- クライアントサイドで必要な値のみ `NEXT_PUBLIC_` プレフィックスを付ける

**このアプリでの使い分け**:

[`lib/env.ts`](../../lib/env.ts)

```typescript
// サーバーのみ（機密情報）
export function getServerEnv(): ServerEnv {
  return {
    DATABASE_URL: process.env.DATABASE_URL,           // サーバーのみ
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN, // サーバーのみ
  };
}

// クライアントでも利用可能（公開情報）
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  };
}
```

## グローバルオブジェクト

### globalThis

`globalThis` は、JavaScript のグローバルオブジェクトへの標準的なアクセス方法です。Node.js では `global`、ブラウザでは `window` に対応します。

**このアプリでの使用箇所**:

[`lib/prisma.ts`](../../lib/prisma.ts)

```typescript
// 開発環境でのホットリロード対応（接続プール枯渇防止）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

// 開発環境でのみグローバル変数に保存（ホットリロード時の再利用）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**なぜ globalThis を使うのか**:

Next.js の開発サーバーはホットリロード時にモジュールを再読み込みするため、何もしないとモジュールが読み込まれるたびに新しい Prisma Client が作成され、データベース接続が枯渇します。`globalThis` に保存することで、ホットリロード時も同じインスタンスを再利用できます。

### process

`process` は、Node.js のグローバルオブジェクトで、現在のプロセスに関する情報と制御を提供します。

**主な用途**:

| プロパティ/メソッド | 説明 | このアプリでの使用箇所 |
|-------------------|------|---------------------|
| `process.env` | 環境変数 | [`lib/env.ts`](../../lib/env.ts) |
| `process.exit()` | プロセスの終了 | [`prisma/seed.ts`](../../prisma/seed.ts) |

**使用例**:

[`prisma/seed.ts`](../../prisma/seed.ts)

```typescript
main()
  .catch((e) => {
    console.error('シードデータの投入中にエラーが発生しました:', e);
    process.exit(1); // エラーコード 1 でプロセスを終了
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### console

`console` オブジェクトは、Node.js とブラウザの両方で利用可能な標準出力ツールです。

**主なメソッド**:

| メソッド | 説明 |
|---------|------|
| `console.log()` | 標準出力 |
| `console.error()` | エラー出力 |
| `console.warn()` | 警告出力 |
| `console.debug()` | デバッグ出力 |

**このアプリでの使い方**:

このアプリでは、`console` を直接使用する代わりに、[`lib/logger.ts`](../../lib/logger.ts) のログユーティリティを使用しています。

```typescript
import { log } from '@/lib/logger';

// 開発環境: カラー出力、本番環境: JSON 形式
log.info('商品を作成しました', { context: 'POST /api/products' });
log.error('データベース操作に失敗しました', { context: 'API', error });
```

## Node.js ランタイムと Edge ランタイム

Next.js では、API Routes や Server Components の実行環境として **Node.js ランタイム**と **Edge ランタイム**を選択できます。

| 項目 | Node.js ランタイム | Edge ランタイム |
|------|------------------|---------------|
| **実行環境** | 完全な Node.js 環境 | 軽量な V8 環境 |
| **利用可能な API** | すべての Node.js API | Web API のサブセット |
| **起動時間** | やや遅い | 高速 |
| **データベース接続** | 可能（TCP 接続） | 制限あり（HTTP ベースのみ） |
| **ファイルシステム** | アクセス可能 | アクセス不可 |

**このアプリでの選択**:

このアプリでは **Node.js ランタイム**（デフォルト）を使用しています。

- **理由**: Prisma + Neon アダプター経由でデータベースに接続するため、完全な Node.js 環境が必要
- Edge ランタイムを使用する場合は、ファイルに `export const runtime = 'edge'` を記述しますが、このアプリでは不要

## このアプリでの使用例

### 環境変数の型安全な管理

[`lib/env.ts`](../../lib/env.ts) で環境変数を型安全に管理し、バリデーションを行っています。

```typescript
// 環境判定ヘルパー
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
```

**使用例**:

```typescript
// lib/logger.ts - 環境に応じたログ出力の切り替え
if (process.env.NODE_ENV === 'production') {
  // 本番環境: JSON 形式で出力（ログ収集ツールで解析しやすい）
  console.log(JSON.stringify(entry));
} else {
  // 開発環境: カラー出力（開発者が読みやすい）
  logMethod(`${levelColor}${level}${resetColor} ${message}`);
}
```

### Prisma Client のシングルトンパターン

[`lib/prisma.ts`](../../lib/prisma.ts) で、Node.js の `globalThis` を活用したシングルトンパターンを実装しています。

```typescript
// 開発環境でのホットリロード対応
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  const adapter = new PrismaNeon({ connectionString: databaseUrl });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### シーダースクリプト

[`prisma/seed.ts`](../../prisma/seed.ts) は、Node.js で直接実行されるスクリプトです。`tsx`（TypeScript 実行ツール）を使用して実行します。

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config'; // .env ファイルから環境変数を読み込み

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const adapter = new PrismaNeon({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('シードデータの投入を開始します...');

  // カテゴリー、商品などの初期データを投入
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });
  }

  console.log('シードデータの投入が完了しました！');
}

main()
  .catch((e) => {
    console.error('シードデータの投入中にエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**ポイント**:

- `dotenv/config` で `.env` ファイルから環境変数を読み込む（Next.js 外で実行するため、明示的なインポートが必要）
- `process.exit(1)` でエラー時にプロセスを異常終了させる
- `prisma.$disconnect()` で確実にデータベース接続を切断する

### 環境別のログ出力

[`lib/logger.ts`](../../lib/logger.ts) で、`NODE_ENV` に応じてログの出力形式を切り替えています。

```typescript
function logInternal(level: LogLevel, message: string, options?: {
  context?: string;
  error?: Error | unknown;
}): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (options?.error instanceof Error) {
    entry.error = {
      name: options.error.name,
      message: options.error.message,
      // スタックトレースは開発環境のみ（セキュリティ考慮）
      stack: process.env.NODE_ENV === 'development'
        ? options.error.stack
        : undefined,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry)); // 本番: JSON 形式
  } else {
    // 開発: ANSI カラーコードでカラフルに出力
    const levelColor = {
      debug: '\x1b[36m',  // シアン
      info: '\x1b[32m',   // 緑
      warn: '\x1b[33m',   // 黄
      error: '\x1b[31m',  // 赤
    }[level];
    logMethod(`${levelColor}${level}${resetColor} ${message}`);
  }
}
```

## ベストプラクティス

### 1. 環境変数は一元管理

**推奨**: `lib/env.ts` を通じて環境変数にアクセスします。

```typescript
// 良い例: env.ts を使用
import { getServerEnv, isDevelopment } from '@/lib/env';
const env = getServerEnv();
const dbUrl = env.DATABASE_URL;

// 避ける: 各ファイルで直接アクセス
const dbUrl = process.env.DATABASE_URL;
```

**理由**:

- **型安全性**: `string | undefined` ではなく、明確な型で扱える
- **バリデーション**: 必須の環境変数が未設定の場合、早期にエラーを検出
- **保守性**: 環境変数の変更が一箇所で済む

### 2. Node.js バージョンを固定

**推奨**: `.nvmrc` と `package.json` の `engines` の両方でバージョンを指定します。

```bash
# .nvmrc
24
```

```json
{
  "engines": {
    "node": "24.x",
    "npm": ">=11.0.0"
  }
}
```

**理由**:

- **再現性**: 開発者全員が同じ環境で開発できる
- **互換性**: ランタイムバージョンの不一致によるバグを防止
- **デプロイ**: Vercel が正しいバージョンでビルドできる

### 3. 開発環境と本番環境を適切に分離

**推奨**: `NODE_ENV` に基づいて動作を切り替えます。

```typescript
// 良い例: 環境別の処理
if (process.env.NODE_ENV === 'production') {
  // 本番: セキュリティを優先（エラー詳細を隠す）
  return { error: 'An unexpected error occurred' };
} else {
  // 開発: デバッグ情報を表示
  return { error: detailedErrorMessage };
}
```

**理由**:

- **セキュリティ**: 本番環境でスタックトレースや内部エラーを公開しない
- **開発効率**: 開発環境では詳細な情報を表示してデバッグを効率化
- **パフォーマンス**: 本番環境では不要なログ出力を抑制

### 4. シーダーやスクリプトでは接続を確実に切断

**推奨**: `finally` ブロックでデータベース接続を切断します。

```typescript
main()
  .catch((e) => {
    console.error('エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**理由**:

- **リソースリーク防止**: 接続が残るとデータベースの接続数上限に達する可能性がある
- **エラー時の安全性**: エラーが発生しても `finally` で確実に切断される

## まとめ

このアプリケーションでは、Node.js を以下の用途で使用しています：

1. **ランタイム環境**: API Routes と Server Components の実行基盤
2. **環境変数管理**: `process.env` と `lib/env.ts` による型安全な環境変数アクセス
3. **パッケージ管理**: npm による依存関係の管理と npm スクリプトの実行
4. **バージョン管理**: `.nvmrc` と `engines` フィールドによる Node.js バージョンの固定
5. **スクリプト実行**: シーダーやマイグレーションなどの CLI ツール

**このアプリでの Node.js の使用方針**:

- **Node.js ランタイム**をデフォルトで使用（Edge ランタイムは未使用）
- 環境変数は `lib/env.ts` で一元管理し、型安全性とバリデーションを確保
- `globalThis` を活用したシングルトンパターンで開発環境の安定性を確保
- `NODE_ENV` による環境別の動作切り替えでセキュリティと開発効率を両立

## 参考リンク

- **[TypeScript ガイド](../basics/typescript-guide.md)**: Node.js との型統合
- **[Async/Await ガイド](../basics/async-await-guide.md)**: Node.js の非同期処理パターン
- **[Prisma ガイド](./prisma-guide.md)**: データベース操作と Node.js ランタイム
- **[App Router ガイド](../frontend/app-router-guide.md)**: Server Components と API Routes
- **[開発ガイド](../development-guide.md)**: 開発環境のセットアップ
- **[Node.js 公式ドキュメント](https://nodejs.org/docs/latest/api/)**: API リファレンス
- **[npm 公式ドキュメント](https://docs.npmjs.com/)**: パッケージ管理の詳細
- **[nvm GitHub](https://github.com/nvm-sh/nvm)**: Node Version Manager
