/**
 * 環境変数の型定義とバリデーション
 *
 * Next.js 16のベストプラクティスに従い、
 * サーバーサイドとクライアントサイドの環境変数を適切に管理します
 */

/**
 * サーバーサイド環境変数の型定義
 */
export interface ServerEnv {
  // データベース
  DATABASE_URL_ACCELERATE: string; // Prisma AccelerateのURL（アプリケーション用）
  POSTGRES_URL?: string; // 通常のデータベース接続文字列（マイグレーション用）
  POSTGRES_URL_NON_POOLING?: string; // プールされていない接続（マイグレーション用、オプション）
  DATABASE_URL_UNPOOLED?: string; // プールされていない接続（マイグレーション用、オプション）

  // Blob Storage
  BLOB_READ_WRITE_TOKEN: string;

  // Neon Auth (Next.js)
  STACK_SECRET_SERVER_KEY?: string;
}

/**
 * クライアントサイド環境変数の型定義
 */
export interface ClientEnv {
  NEXT_PUBLIC_STACK_PROJECT_ID?: string;
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?: string;
}

/**
 * サーバーサイド環境変数を取得します（型安全）
 * サーバーコンポーネントやAPI Routesでのみ使用してください
 */
export function getServerEnv(): ServerEnv {
  // アプリケーション用: Prisma AccelerateのURL
  const accelerateUrl = process.env.DATABASE_URL_ACCELERATE;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!accelerateUrl) {
    throw new Error(
      'DATABASE_URL_ACCELERATE is not set. ' +
      'Please set it to your Prisma Accelerate URL (prisma://accelerate.prisma-data.net/?api_key=...). ' +
      'Get your Accelerate URL from https://console.prisma.io/accelerate'
    );
  }

  // Prisma AccelerateのURL形式を確認
  if (!accelerateUrl.startsWith('prisma://')) {
    throw new Error(
      'DATABASE_URL_ACCELERATE must be a Prisma Accelerate URL (starting with prisma://). ' +
      'Get your Accelerate URL from https://console.prisma.io/accelerate'
    );
  }

  if (!blobToken) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. ' +
      'Please set it in your .env file or environment variables.'
    );
  }

  return {
    DATABASE_URL_ACCELERATE: accelerateUrl,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    BLOB_READ_WRITE_TOKEN: blobToken,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
  };
}

/**
 * クライアントサイド環境変数を取得します（型安全）
 * クライアントコンポーネントでのみ使用してください
 */
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:
      process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  };
}

/**
 * @deprecated 代わりに getServerEnv() または getClientEnv() を使用してください
 */
export function getEnv(): ServerEnv & ClientEnv {
  return {
    ...getServerEnv(),
    ...getClientEnv(),
  };
}

/**
 * 開発環境かどうかを判定します
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 本番環境かどうかを判定します
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
