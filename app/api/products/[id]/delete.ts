/**
 * 商品削除ハンドラー
 *
 * 商品削除時に関連画像もBlobストレージから削除。
 * 画像は事前削除することで、削除失敗時のデータベースとストレージの不整合を防ぐ。
 */

import { apiSuccess, parseProductId } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { deleteFile } from '@/lib/blob';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(
  _request: NextRequest,
  params: Promise<{ id: string }>
) {
  const { id } = await params;
  const productId = parseProductId(id);

  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `DELETE /api/products/${id} - existence check`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // 画像をデータベース削除前に削除（削除失敗時の不整合を防ぐため）
  if (existingProduct.imageUrl) {
    await deleteFile(existingProduct.imageUrl);

    log.info("商品削除時に画像を削除しました", {
      context: `DELETE /api/products/${id}`,
      metadata: { imageUrl: existingProduct.imageUrl },
    });
  }

  await safePrismaOperation(
    () => prisma.product.delete({ where: { id: productId } }),
    `DELETE /api/products/${id}`
  );

  // トップページのISRキャッシュを無効化
  revalidatePath('/');
  revalidatePath(`/menu/${productId}`);

  return apiSuccess({ message: '商品を削除しました' });
}
