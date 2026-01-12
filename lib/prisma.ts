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
 * 注意: このPrisma ClientはPrisma Accelerate専用です。
 * マイグレーションやPrisma Studioを使用する場合は、通常のデータベース接続文字列が必要です。
 *
 * 環境変数の設定:
 * - DATABASE_URL_ACCELERATE: Prisma AccelerateのURL（必須）
 *   prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
 * - POSTGRES_URL: 通常のデータベース接続文字列（マイグレーション用、必須）
 *
 * Prisma Accelerate Consoleから取得できます:
 * https://console.prisma.io/accelerate
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = (): PrismaClient => {
  // Prisma AccelerateのURLを取得
  const accelerateUrl = process.env.DATABASE_URL_ACCELERATE;

  if (!accelerateUrl) {
    throw new Error(
      'DATABASE_URL_ACCELERATE environment variable is not set.\n' +
      'Please set DATABASE_URL_ACCELERATE to your Prisma Accelerate URL in Vercel environment variables.\n' +
      'Format: prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY\n' +
      'Get your Accelerate URL from: https://console.prisma.io/accelerate\n\n' +
      'Note: POSTGRES_URL should be set separately for migrations (prisma migrate deploy).'
    );
  }

  // Prisma AccelerateのURL形式を確認
  if (!accelerateUrl.startsWith('prisma://')) {
    throw new Error(
      'DATABASE_URL_ACCELERATE must be a Prisma Accelerate URL (starting with prisma://).\n' +
      `Current value starts with: ${accelerateUrl.substring(0, 20)}...\n\n` +
      'Please set DATABASE_URL_ACCELERATE to your Prisma Accelerate URL in Vercel:\n' +
      '1. Go to your Vercel project settings\n' +
      '2. Navigate to Environment Variables\n' +
      '3. Set DATABASE_URL_ACCELERATE to: prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY\n' +
      '4. Get your Accelerate URL from: https://console.prisma.io/accelerate\n\n' +
      'Note: POSTGRES_URL should be set separately for migrations (normal PostgreSQL connection string).'
    );
  }

  // Prisma Clientを作成（Prisma Accelerateを使用）
  return new PrismaClient({
    accelerateUrl,
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
