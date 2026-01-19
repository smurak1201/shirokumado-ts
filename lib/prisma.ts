import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { DatabaseError } from './errors';
import { log } from './logger';

/**
 * Prisma Client シングルトンインスタンス
 *
 * Next.js App Routerでのベストプラクティス:
 * - 開発環境ではホットリロード時に新しいインスタンスが作成されないように、
 *   グローバル変数に保存します
 * - 本番環境では各リクエストで新しいインスタンスを使用しますが、
 *   Prisma Clientが効率的に接続を管理します
 *
 * Prisma v7 + Neon (Vercel) での設定:
 * - engineType = "client" を使用するため、Neonアダプターが必要です
 * - @prisma/adapter-neon を使用し、接続文字列を直接渡します
 *
 * 環境変数の設定:
 * - DATABASE_URL: PostgreSQL接続文字列（必須）
 *   postgresql://user:password@host:port/database
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = (): PrismaClient => {
  // DATABASE_URLを取得
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
      'Please set DATABASE_URL to your PostgreSQL connection string.\n' +
      'Format: postgresql://user:password@host:port/database\n\n' +
      'For Vercel deployments, set DATABASE_URL in your project environment variables.'
    );
  }

  // Neonアダプターを使用してPrisma Clientを作成
  // Vercel + Neon環境では、engineType = "client" を使用するため、アダプターが必要です
  // Prisma v7.2では、接続文字列を直接PrismaNeonに渡します
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

/**
 * Prisma操作を安全に実行します
 * エラーを適切に処理し、DatabaseErrorに変換します
 */
export async function safePrismaOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    log.error('データベース操作に失敗しました', {
      context: context || 'safePrismaOperation',
      error,
    });
    throw new DatabaseError(
      `Failed to execute database operation${context ? ` in ${context}` : ''}`,
      error
    );
  }
}

/**
 * データベース接続を切断します
 *
 * この関数は、マイグレーション実行時や開発ツール（Prisma Studio など）で使用されます。
 * 通常のアプリケーション実行では、Prisma Client が自動的に接続を管理します。
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    log.error('データベース接続の切断に失敗しました', {
      context: 'disconnectPrisma',
      error,
    });
    // 切断エラーは無視（既に切断されている可能性がある）
  }
}
