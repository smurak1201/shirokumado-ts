import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { NextRequest } from 'next/server';
import { calculatePublishedStatus } from '@/lib/product-utils';
import { deleteFile } from '@/lib/blob';

/**
 * Edge Runtime を使用
 * Prisma Accelerate を使用しているため、Edge Runtime で動作します
 */
export const runtime = 'edge';

/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします
 */
export const dynamic = 'force-dynamic';

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
  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
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

    const category = await safePrismaOperation(
      () => prisma.category.findUnique({ where: { id: body.categoryId } }),
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
  // 画像削除を先に実行し、成功した場合のみDB更新を実行することで整合性を保ちます
  if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
    // 画像削除を先に実行（失敗した場合はエラーを投げてDB更新を実行しない）
    await deleteFile(oldImageUrl);
    console.log(`元の画像を削除しました: ${oldImageUrl}`);
  }

  // 商品を更新（トランザクションで保護）
  // 画像削除が成功した場合のみ実行されるため、整合性が保たれます
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.description !== undefined) updateData.description = body.description.trim();
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
  if (body.priceS !== undefined) updateData.priceS = body.priceS ? parseFloat(body.priceS) : null;
  if (body.priceL !== undefined) updateData.priceL = body.priceL ? parseFloat(body.priceL) : null;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
  updateData.published = published;
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
  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `DELETE /api/products/${id} - existence check`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // 商品に画像が設定されている場合、画像を削除
  // 画像削除を先に実行し、成功した場合のみDB削除を実行することで整合性を保ちます
  if (existingProduct.imageUrl) {
    // 画像削除を先に実行（失敗した場合はエラーを投げてDB削除を実行しない）
    await deleteFile(existingProduct.imageUrl);
    console.log(`商品削除時に画像を削除しました: ${existingProduct.imageUrl}`);
  }

  // 商品を削除（トランザクションで保護）
  // 画像削除が成功した場合のみ実行されるため、整合性が保たれます
  await safePrismaOperation(
    () => prisma.product.delete({ where: { id: productId } }),
    `DELETE /api/products/${id}`
  );

  return apiSuccess({ message: '商品を削除しました' });
});
