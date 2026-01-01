import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { NextRequest } from 'next/server';

/**
 * 商品一覧を取得
 */
export const GET = withErrorHandling(async () => {
  const products = await safePrismaOperation(
    () =>
      prisma.product.findMany({
        include: {
          category: true,
          tags: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    'GET /api/products'
  );

  return apiSuccess({ products });
});

/**
 * 商品を登録
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // バリデーション
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new ValidationError('商品名は必須です');
  }

  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    throw new ValidationError('商品説明は必須です');
  }

  if (!body.categoryId || typeof body.categoryId !== 'number') {
    throw new ValidationError('カテゴリーは必須です');
  }

  // カテゴリーの存在確認
  const category = await safePrismaOperation(
    () => prisma.category.findUnique({ where: { id: body.categoryId } }),
    'POST /api/products - category check'
  );

  if (!category) {
    throw new ValidationError('指定されたカテゴリーが存在しません');
  }

  // タグの存在確認（指定されている場合）
  if (body.tagIds && Array.isArray(body.tagIds) && body.tagIds.length > 0) {
    const tags = await safePrismaOperation(
      () =>
        prisma.tag.findMany({
          where: {
            id: {
              in: body.tagIds,
            },
          },
        }),
      'POST /api/products - tags check'
    );

    if (tags.length !== body.tagIds.length) {
      throw new ValidationError('指定されたタグの一部が存在しません');
    }
  }

  // 商品を作成
  const product = await safePrismaOperation(
    () =>
      prisma.product.create({
        data: {
          name: body.name.trim(),
          description: body.description.trim(),
          imageUrl: body.imageUrl || null,
          priceS: body.priceS ? parseFloat(body.priceS) : null,
          priceL: body.priceL ? parseFloat(body.priceL) : null,
          categoryId: body.categoryId,
          publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
          endedAt: body.endedAt ? new Date(body.endedAt) : null,
          tags: body.tagIds
            ? {
              connect: body.tagIds.map((id: number) => ({ id })),
            }
            : undefined,
        },
        include: {
          category: true,
          tags: true,
        },
      }),
    'POST /api/products'
  );

  return apiSuccess({ product }, 201);
});
