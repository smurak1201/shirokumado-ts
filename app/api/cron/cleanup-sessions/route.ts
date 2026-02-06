/**
 * 期限切れセッションのクリーンアップAPI
 *
 * Vercel Cronから毎月1日 UTC 15:00（日本時間 0:00）に呼び出され、
 * 期限切れのセッションを削除する
 *
 * 環境変数:
 * - CRON_SECRET: Vercelダッシュボードで設定（Production環境のみ）
 */
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { withErrorHandling, apiSuccess, apiError } from '@/lib/api-helpers';
import { log } from '@/lib/logger';

export const GET = withErrorHandling(async (request: Request) => {
  // Vercel Cronからのリクエストを検証
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    log.error('CRON_SECRET is not configured', { context: 'cleanup-sessions' });
    return apiError('Server configuration error', 500);
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return apiError('Unauthorized', 401);
  }

  const result = await safePrismaOperation(async () => {
    const deleted = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
    return deleted;
  }, 'cleanup-sessions');

  log.info(`Cleanup completed: ${result.count} expired sessions deleted`, {
    context: 'cleanup-sessions',
    metadata: { deletedCount: result.count },
  });

  return apiSuccess({
    deletedCount: result.count,
    timestamp: new Date().toISOString(),
  });
});
