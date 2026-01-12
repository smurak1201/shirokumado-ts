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
  // エラーが発生した場合にデータの不整合を防ぐため、順次実行します
  // エラーが発生した場合は、即座に停止してエラーを返します
  await safeDbOperation(
    async () => {
      // 各商品のdisplayOrderを順次更新
      // エラーが発生した場合は、それ以降の更新を実行せずにエラーを返します
      for (const item of body.productOrders) {
        await db
          .update(products)
          .set({ displayOrder: item.displayOrder })
          .where(eq(products.id, item.id));
      }
    },
    'POST /api/products/reorder'
  );

  return apiSuccess({ message: '商品の順序を更新しました' });
});
