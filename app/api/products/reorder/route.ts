import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { NextRequest } from 'next/server';

/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします
 */
export const dynamic = 'force-dynamic';

/**
 * 商品の表示順序を更新する API エンドポイント
 * POST /api/products/reorder
 *
 * 機能:
 * - 商品の表示順序（displayOrder）を一括更新
 * - トランザクションを使用して、すべての更新が成功するか、すべてがロールバックされることを保証
 *
 * リクエストボディ:
 * ```json
 * {
 *   "productOrders": [
 *     { "id": 1, "displayOrder": 1 },
 *     { "id": 2, "displayOrder": 2 },
 *     ...
 *   ]
 * }
 * ```
 *
 * @param request - リクエストオブジェクト（商品順序の配列を含む）
 * @returns 更新成功メッセージを含む JSON レスポンス
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // バリデーション
  if (!body.productOrders || !Array.isArray(body.productOrders)) {
    throw new ValidationError('商品順序の配列が必要です');
  }

  // トランザクションを使用して一括更新
  // すべての更新が成功するか、すべてがロールバックされることを保証します
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
