/**
 * Prisma Client設定とユーティリティ
 *
 * Neonアダプター経由でデータベース接続を管理
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { DatabaseError } from './errors';
import { log } from './logger';

// 開発環境でのホットリロード対応（接続プール枯渇防止）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
      'Please set DATABASE_URL to your PostgreSQL connection string.\n' +
      'Format: postgresql://user:password@host:port/database\n\n' +
      'For Vercel deployments, set DATABASE_URL in your project environment variables.'
    );
  }

  // Neonアダプターを使用（Vercel + Neon環境での動作に必要）
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

// 開発環境でのみグローバル変数に保存（ホットリロード時の再利用）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

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

export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    log.error('データベース接続の切断に失敗しました', {
      context: 'disconnectPrisma',
      error,
    });
  }
}
