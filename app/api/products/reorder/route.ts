/**
 * 商品並び替え API エンドポイント
 *
 * ドラッグ&ドロップされた商品の表示順序を一括更新。
 * トランザクションを使用し、一部の更新が失敗した場合はすべてロールバック。
 */

import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  if (!body.productOrders || !Array.isArray(body.productOrders)) {
    throw new ValidationError('商品順序の配列が必要です');
  }

  // トランザクション: すべての更新が成功するか、すべてがロールバックされることを保証
  // 一部の更新が失敗した場合でも、中途半端な並び順になることを防ぐ
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

  // トップページのISRキャッシュを無効化
  revalidatePath('/');

  return apiSuccess({ message: '商品の順序を更新しました' });
});
