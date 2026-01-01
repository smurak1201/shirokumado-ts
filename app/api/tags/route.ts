import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

/**
 * タグ一覧を取得
 */
export const GET = withErrorHandling(async () => {
  const tags = await safePrismaOperation(
    () =>
      prisma.tag.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    'GET /api/tags'
  );

  return apiSuccess({ tags });
});
