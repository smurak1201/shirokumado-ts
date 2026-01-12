import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { db, safeDbOperation, products, categories } from '@/lib/db';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { NextRequest } from 'next/server';
import { calculatePublishedStatus } from '@/lib/product-utils';
import { deleteFile } from '@/lib/blob';
import { eq } from 'drizzle-orm';

/**
 * 商品を取得
 *
 * 注意: 現在このエンドポイントは未使用です。
 * 将来的に商品詳細ページや外部API連携が必要になった場合に使用する可能性があります。
 */
export const GET = withErrorHandling(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    throw new ValidationError('無効な商品IDです');
  }

  const product = await safeDbOperation(
    () =>
      db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          category: true,
        },
      }),
    `GET /api/products/${id}`
  );

  if (!product) {
    throw new NotFoundError('商品');
  }

  return apiSuccess({ product });
});

/**
 * 商品を更新
 */
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const productId = parseInt(id);
  const body = await request.json();

  if (isNaN(productId)) {
    throw new ValidationError('無効な商品IDです');
  }

  // 商品の存在確認
  const existingProduct = await safeDbOperation(
    () => db.query.products.findFirst({ where: eq(products.id, productId) }),
    `PUT /api/products/${id} - existence check`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // バリデーション
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

  // カテゴリーの存在確認（指定されている場合）
  if (body.categoryId !== undefined) {
    if (typeof body.categoryId !== 'number') {
      throw new ValidationError('カテゴリーIDは数値である必要があります');
    }

    const category = await safeDbOperation(
      () => db.query.categories.findFirst({ where: eq(categories.id, body.categoryId) }),
      `PUT /api/products/${id} - category check`
    );

    if (!category) {
      throw new ValidationError('指定されたカテゴリーが存在しません');
    }
  }

  // 公開日・終了日の処理
  const publishedAt = body.publishedAt !== undefined
    ? (body.publishedAt ? new Date(body.publishedAt) : null)
    : existingProduct.publishedAt;
  const endedAt = body.endedAt !== undefined
    ? (body.endedAt ? new Date(body.endedAt) : null)
    : existingProduct.endedAt;

  // 公開情報の自動判定
  // 公開日・終了日が設定されている場合は自動判定、そうでない場合は手動設定値を使用
  let published: boolean;
  if (publishedAt || endedAt) {
    // 公開日・終了日が設定されている場合は自動判定
    published = calculatePublishedStatus(publishedAt, endedAt);
  } else {
    // 公開日・終了日が設定されていない場合は手動設定値（変更がない場合は既存値）
    published = body.published !== undefined ? body.published : existingProduct.published;
  }

  // 画像が更新される場合、元の画像を削除
  const oldImageUrl = existingProduct.imageUrl;
  const newImageUrl = body.imageUrl !== undefined ? (body.imageUrl || null) : oldImageUrl;

  // 新しい画像URLが設定され、元の画像URLと異なる場合、元の画像を削除
  if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
    try {
      await deleteFile(oldImageUrl);
      console.log(`元の画像を削除しました: ${oldImageUrl}`);
    } catch (error) {
      // 画像削除に失敗しても商品更新は続行（エラーログのみ）
      console.error(`元の画像の削除に失敗しました: ${oldImageUrl}`, error);
    }
  }

  // 商品を更新
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.description !== undefined) updateData.description = body.description.trim();
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
  if (body.priceS !== undefined) updateData.priceS = body.priceS ? String(parseFloat(body.priceS)) : null;
  if (body.priceL !== undefined) updateData.priceL = body.priceL ? String(parseFloat(body.priceL)) : null;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
  updateData.published = published;
  if (body.publishedAt !== undefined) updateData.publishedAt = publishedAt;
  if (body.endedAt !== undefined) updateData.endedAt = endedAt;

  await safeDbOperation(
    () => db.update(products).set(updateData).where(eq(products.id, productId)),
    `PUT /api/products/${id}`
  );

  // 更新された商品にカテゴリー情報も含めて取得
  const product = await safeDbOperation(
    () =>
      db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          category: true,
        },
      }),
    `PUT /api/products/${id} - fetch with category`
  );

  if (!product) {
    throw new NotFoundError('商品');
  }

  return apiSuccess({ product });
});

/**
 * 商品を削除
 */
export const DELETE = withErrorHandling(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    throw new ValidationError('無効な商品IDです');
  }

  // 商品の存在確認
  const existingProduct = await safeDbOperation(
    () => db.query.products.findFirst({ where: eq(products.id, productId) }),
    `DELETE /api/products/${id} - existence check`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // 商品に画像が設定されている場合、画像を削除
  if (existingProduct.imageUrl) {
    try {
      await deleteFile(existingProduct.imageUrl);
      console.log(`商品削除時に画像を削除しました: ${existingProduct.imageUrl}`);
    } catch (error) {
      // 画像削除に失敗しても商品削除は続行（エラーログのみ）
      console.error(`商品削除時の画像削除に失敗しました: ${existingProduct.imageUrl}`, error);
    }
  }

  // 商品を削除
  await safeDbOperation(
    () => db.delete(products).where(eq(products.id, productId)),
    `DELETE /api/products/${id}`
  );

  return apiSuccess({ message: '商品を削除しました' });
});
