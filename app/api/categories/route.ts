import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';

/**
 * カテゴリー一覧を取得
 */
export const GET = withErrorHandling(async () => {
  const categories = await safePrismaOperation(
    () =>
      prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    'GET /api/categories'
  );

  return apiSuccess({ categories });
});
