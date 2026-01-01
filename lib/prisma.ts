import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { DatabaseError, logError } from './errors';

/**
 * Prisma Client シングルトンインスタンス
 *
 * Next.js App Routerでのベストプラクティス:
 * - 開発環境ではホットリロード時に新しいインスタンスが作成されないように、
 *   グローバル変数に保存します
 * - 本番環境では各リクエストで新しいインスタンスを使用しますが、
 *   接続プールにより効率的に管理されます
 *
 * Prisma 7では、Neon（PostgreSQL）に接続するために@prisma/adapter-neonを使用します
 */

// WebSocketの設定（Node.js環境用）
if (typeof globalThis !== 'undefined' && !globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = (): PrismaClient => {
  // Prisma 7では、Neonに接続するためにアダプターを使用します
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
  }

  // 接続文字列が文字列であることを確認
  if (typeof connectionString !== 'string') {
    throw new Error('DATABASE_URL must be a string');
  }

  // Poolのコンストラクタに接続文字列を設定オブジェクトとして渡す
  const pool = new Pool({ connectionString: String(connectionString) });
  const adapter = new PrismaNeon(pool as any);

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
