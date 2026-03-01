/**
 * 商品更新ハンドラー
 *
 * 部分更新をサポート（送信されたフィールドのみ更新）。
 * 公開日・終了日に基づいて公開状態を自動判定。
 * 画像更新時は古い画像をストレージから削除。
 */

import { apiSuccess, parseProductId } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { determinePublishedStatus, resolveDateValue } from '@/lib/product-utils';
import { deleteFile } from '@/lib/blob';
import { validateProductUpdate } from './put-validation';
import { revalidatePath } from 'next/cache';

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

export async function putProduct(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  const { id } = await params;
  const productId = parseProductId(id);
  const body = await request.json() as ProductUpdateRequestBody;

  await validateProductUpdate(productId, body, id);

  // バリデーションと更新の間に商品が削除される可能性があるため再取得
  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `PUT /api/products/${id} - get existing`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  const publishedAt = resolveDateValue(body.publishedAt, existingProduct.publishedAt);
  const endedAt = resolveDateValue(body.endedAt, existingProduct.endedAt);

  // 公開日・終了日に基づいて公開状態を自動判定
  const published = determinePublishedStatus(
    publishedAt,
    endedAt,
    body.published,
    existingProduct.published
  );

  const oldImageUrl = existingProduct.imageUrl;
  const newImageUrl = body.imageUrl !== undefined ? (body.imageUrl || null) : oldImageUrl;

  // 画像が更新される場合、古い画像を削除（ストレージコスト削減）
  if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
    await deleteFile(oldImageUrl);
    log.info("元の画像を削除しました", {
      context: `PUT /api/products/${id}`,
      metadata: { oldImageUrl },
    });
  }

  // 部分更新: リクエストボディに含まれるフィールドのみを更新
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

  // トップページのISRキャッシュを無効化
  revalidatePath('/');
  revalidatePath(`/menu/${productId}`);

  return apiSuccess({ product });
}
