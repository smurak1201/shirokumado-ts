import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { NextRequest, NextResponse } from 'next/server';
import { calculatePublishedStatus } from '@/lib/product-utils';

/**
 * 商品一覧を取得
 * キャッシュ: 60秒
 */
export const dynamic = 'force-dynamic'; // 動的レンダリング（キャッシュはクライアント側で制御）

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

  const response = NextResponse.json({ products }, { status: 200 });
  // キャッシュヘッダーを設定（60秒）
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  return response;
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

  // 公開日・終了日の処理
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  const endedAt = body.endedAt ? new Date(body.endedAt) : null;

  // 公開情報の自動判定
  // 公開日・終了日が設定されている場合は自動判定、そうでない場合は手動設定値を使用
  let published: boolean;
  if (publishedAt || endedAt) {
    // 公開日・終了日が設定されている場合は自動判定
    published = calculatePublishedStatus(publishedAt, endedAt);
  } else {
    // 公開日・終了日が設定されていない場合は手動設定値（デフォルトはtrue）
    published = body.published !== undefined ? body.published : true;
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
          published,
          publishedAt,
          endedAt,
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
