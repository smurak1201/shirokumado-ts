import { apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { NextRequest } from 'next/server';

/**
 * 商品を取得する API エンドポイント
 * GET /api/products/[id]
 *
 * 指定されたIDの商品をカテゴリー情報を含めて取得します。
 */
export async function getProduct(
  _request: NextRequest,
  params: Promise<{ id: string }>
) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    throw new ValidationError('無効な商品IDです');
  }

  const product = await safePrismaOperation(
    () =>
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
        },
      }),
    `GET /api/products/${id}`
  );

  if (!product) {
    throw new NotFoundError('商品');
  }

  return apiSuccess({ product });
}
