import { PrismaClient } from '@prisma/client';
import { DatabaseError, logError } from './errors';

/**
 * Prisma Client シングルトンインスタンス
 *
 * Edge Runtime対応のため、Prisma Accelerateを使用します。
 *
 * Next.js App Routerでのベストプラクティス:
 * - 開発環境ではホットリロード時に新しいインスタンスが作成されないように、
 *   グローバル変数に保存します
 * - 本番環境では各リクエストで新しいインスタンスを使用しますが、
 *   Prisma Accelerateが効率的に接続を管理します
 *
 * Prisma Accelerateを使用することで、Edge Runtimeでも動作します。
 * 環境変数PRISMA_ACCELERATE_URLが設定されている場合はAccelerateを使用し、
 * 設定されていない場合は通常のPrisma Clientを使用します。
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = (): PrismaClient => {
  // Prisma Accelerate URLが設定されている場合はAccelerateを使用
  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;

  if (accelerateUrl) {
    // Prisma Accelerateを使用（Edge Runtime対応）
    return new PrismaClient({
      datasourceUrl: accelerateUrl,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  // 通常のPrisma Clientを使用
  return new PrismaClient({
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
    logError(error, context);
    throw new DatabaseError(
      `Failed to execute database operation${context ? ` in ${context}` : ''}`,
      error
    );
  }
}

/**
 * データベース接続を切断します
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    logError(error, 'disconnectPrisma');
    // 切断エラーは無視（既に切断されている可能性がある）
  }
}

/**
 * アプリケーション終了時にPrisma接続をクリーンアップします
 */
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectPrisma();
  });
}
