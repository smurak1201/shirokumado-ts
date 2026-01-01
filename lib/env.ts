/**
 * 環境変数の型定義とバリデーション
 */

/**
 * 環境変数の型定義
 */
export interface Env {
  // データベース
  DATABASE_URL: string;
  POSTGRES_URL?: string;
  POSTGRES_URL_NON_POOLING?: string;

  // Blob Storage
  BLOB_READ_WRITE_TOKEN: string;

  // Neon Auth (Next.js)
  NEXT_PUBLIC_STACK_PROJECT_ID?: string;
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?: string;
  STACK_SECRET_SERVER_KEY?: string;
}

/**
 * 環境変数を取得します（型安全）
 */
export function getEnv(): Env {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL is not set');
  }

  if (!blobToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set');
  }

  return {
    DATABASE_URL: databaseUrl,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    BLOB_READ_WRITE_TOKEN: blobToken,
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
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
