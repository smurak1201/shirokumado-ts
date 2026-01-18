import { apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { determinePublishedStatus, resolveDateValue } from '@/lib/product-utils';
import { deleteFile } from '@/lib/blob';
import { validateProductUpdate } from './put-validation';

export interface ProductUpdateRequestBody {
  name?: string;
  description?: string;
  imageUrl?: string | null;
  categoryId?: number;
  priceS?: number | string | null;
  priceL?: number | string | null;
  published?: boolean;
  publishedAt?: string | null;
  endedAt?: string | null;
}

interface ProductUpdateData {
  name?: string;
  description?: string;
  imageUrl?: string | null;
  categoryId?: number;
  priceS?: number | null;
  priceL?: number | null;
  published: boolean;
  publishedAt?: Date | null;
  endedAt?: Date | null;
}

/**
 * 商品を更新する API エンドポイント
 * PUT /api/products/[id]
 *
 * 商品情報のバリデーション、カテゴリーの存在確認、公開日・終了日に基づく公開状態の自動判定を行い、
 * 画像更新時は古い画像を削除してから商品情報を更新します。
 */
export async function putProduct(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  const { id } = await params;
  const productId = parseInt(id);
  const body = await request.json() as ProductUpdateRequestBody;

  await validateProductUpdate(productId, body, id);

  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `PUT /api/products/${id} - get existing`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  const publishedAt = resolveDateValue(body.publishedAt, existingProduct.publishedAt);
  const endedAt = resolveDateValue(body.endedAt, existingProduct.endedAt);

  const published = determinePublishedStatus(
    publishedAt,
    endedAt,
    body.published,
    existingProduct.published // デフォルトは既存商品の公開状態
  );

  const oldImageUrl = existingProduct.imageUrl;
  const newImageUrl = body.imageUrl !== undefined ? (body.imageUrl || null) : oldImageUrl;

  if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
    await deleteFile(oldImageUrl);
    log.info("元の画像を削除しました", {
      context: `PUT /api/products/${id}`,
      metadata: { oldImageUrl },
    });
  }

  const updateData: ProductUpdateData = {
    published,
  };
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.description !== undefined) updateData.description = body.description.trim();
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
  if (body.priceS !== undefined) updateData.priceS = body.priceS ? parseFloat(String(body.priceS)) : null;
  if (body.priceL !== undefined) updateData.priceL = body.priceL ? parseFloat(String(body.priceL)) : null;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
  if (body.publishedAt !== undefined) updateData.publishedAt = publishedAt;
  if (body.endedAt !== undefined) updateData.endedAt = endedAt;

  const product = await safePrismaOperation(
    () =>
      prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          category: true,
        },
      }),
    `PUT /api/products/${id}`
  );

  if (!product) {
    throw new NotFoundError('商品');
  }

  return apiSuccess({ product });
}
