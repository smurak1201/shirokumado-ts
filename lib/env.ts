/**
 * 環境変数の型定義とバリデーション
 */

export interface ServerEnv {
  DATABASE_URL: string;
  POSTGRES_URL_NON_POOLING?: string;
  DATABASE_URL_UNPOOLED?: string;
  BLOB_READ_WRITE_TOKEN: string;
  STACK_SECRET_SERVER_KEY?: string;
}

export interface ClientEnv {
  NEXT_PUBLIC_STACK_PROJECT_ID?: string;
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?: string;
}

export function getServerEnv(): ServerEnv {
  const databaseUrl = process.env.DATABASE_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. ' +
      'Please set it to your PostgreSQL connection string (postgresql://user:password@host:port/database).'
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
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    BLOB_READ_WRITE_TOKEN: blobToken,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
  };
}

export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:
      process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  };
}

/**
 * @deprecated Use getServerEnv() or getClientEnv() instead
 */
export function getEnv(): ServerEnv & ClientEnv {
  return {
    ...getServerEnv(),
    ...getClientEnv(),
  };
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
