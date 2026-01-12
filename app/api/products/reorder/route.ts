import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { db, safeDbOperation, products } from '@/lib/db';
import { ValidationError } from '@/lib/errors';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

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
  await safeDbOperation(
    async () => {
      await db.transaction(async (tx) => {
        await Promise.all(
          body.productOrders.map((item: { id: number; displayOrder: number }) =>
            tx.update(products)
              .set({ displayOrder: item.displayOrder })
              .where(eq(products.id, item.id))
          )
        );
      });
    },
    'POST /api/products/reorder'
  );

  return apiSuccess({ message: '商品の順序を更新しました' });
});
