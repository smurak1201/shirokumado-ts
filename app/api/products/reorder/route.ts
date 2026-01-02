import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { NextRequest } from 'next/server';

/**
 * 商品の表示順序を更新
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // バリデーション
  if (!body.productOrders || !Array.isArray(body.productOrders)) {
    throw new ValidationError('商品順序の配列が必要です');
  }

  // トランザクションで一括更新
  await safePrismaOperation(
    async () => {
      await prisma.$transaction(
        body.productOrders.map((item: { id: number; displayOrder: number }) =>
          prisma.product.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
        )
      );
    },
    'POST /api/products/reorder'
  );

  return apiSuccess({ message: '商品の順序を更新しました' });
});
