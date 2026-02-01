/**
 * 商品取得ハンドラー
 *
 * 指定されたIDの商品をカテゴリー情報を含めて取得。
 */

import { apiSuccess, parseProductId } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { NextRequest } from 'next/server';

export async function getProduct(
  _request: NextRequest,
  params: Promise<{ id: string }>
) {
  const { id } = await params;
  const productId = parseProductId(id);

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
