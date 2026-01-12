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

  // 一括更新（Neon HTTPドライバーではトランザクションがサポートされていないため、個別に更新）
  // Promise.allを使用して並列実行することでパフォーマンスを向上
  // エラーが発生した場合は、最初のエラーを返す
  await safeDbOperation(
    async () => {
      // 各商品のdisplayOrderを更新
      const updatePromises = body.productOrders.map(
        async (item: { id: number; displayOrder: number }) => {
          await db
            .update(products)
            .set({ displayOrder: item.displayOrder })
            .where(eq(products.id, item.id));
        }
      );

      // すべての更新を並列実行
      await Promise.all(updatePromises);
    },
    'POST /api/products/reorder'
  );

  return apiSuccess({ message: '商品の順序を更新しました' });
});
