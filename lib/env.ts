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
  DATABASE_URL: string;
  POSTGRES_URL?: string;
  POSTGRES_URL_NON_POOLING?: string;
  DATABASE_URL_UNPOOLED?: string;

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
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL or POSTGRES_URL is not set. ' +
      'Please set it in your .env file or environment variables.'
    );
  }

  if (!blobToken) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. ' +
      'Please set it in your .env file or environment variables.'
    );
  }

  return {
    DATABASE_URL: databaseUrl,
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
