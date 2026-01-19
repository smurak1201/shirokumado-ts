import { apiSuccess, parseProductId } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { deleteFile } from '@/lib/blob';

/**
 * 商品を削除する API エンドポイント
 * DELETE /api/products/[id]
 *
 * 商品の存在確認を行い、商品に紐づく画像をBlobストレージから削除してから、
 * データベースから商品を削除します。
 */
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

  return apiSuccess({ message: '商品を削除しました' });
}
