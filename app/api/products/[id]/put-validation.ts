/**
 * 商品更新バリデーション処理
 *
 * 部分更新をサポートするため、各フィールドが undefined でない場合のみバリデーション。
 * 未指定のフィールドは既存の値を維持。
 */

import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError, NotFoundError } from '@/lib/errors';
import type { ProductUpdateRequestBody } from './put';

export async function validateProductUpdate(
  productId: number,
  body: ProductUpdateRequestBody,
  id: string
): Promise<void> {
  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `PUT /api/products/${id} - existence check`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // 部分更新のため、各フィールドが undefined でない場合のみバリデーション
  if (body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new ValidationError('商品名は必須です');
    }
  }

  if (body.description !== undefined) {
    if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
      throw new ValidationError('商品説明は必須です');
    }
  }

  if (body.categoryId !== undefined) {
    if (typeof body.categoryId !== 'number') {
      throw new ValidationError('カテゴリーIDは数値である必要があります');
    }

    const category = await safePrismaOperation(
      () => prisma.category.findUnique({ where: { id: body.categoryId } }),
      `PUT /api/products/${id} - category check`
    );

    if (!category) {
      throw new ValidationError('指定されたカテゴリーが存在しません');
    }
  }
}
