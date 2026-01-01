import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client シングルトンインスタンス
 *
 * 開発環境ではホットリロード時に新しいインスタンスが作成されないように、
 * グローバル変数に保存します
 *
 * Prisma 7では、prisma.config.tsで設定された接続情報を使用します
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * データベース接続を切断します
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
