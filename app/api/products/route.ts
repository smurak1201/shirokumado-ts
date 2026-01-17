import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';
import { calculatePublishedStatus } from '@/lib/product-utils';

export const dynamic = 'force-dynamic';

/**
 * 商品一覧を取得する API エンドポイント
 * GET /api/products
 *
 * すべての商品をカテゴリー情報を含めて取得し、作成日時の降順でソートします。
 */
export const GET = withErrorHandling(async () => {
  const products = await safePrismaOperation(
    () =>
      prisma.product.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    'GET /api/products'
  );

  const response = NextResponse.json({ products }, { status: 200 });
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.PRODUCT_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.PRODUCT_LIST_STALE_WHILE_REVALIDATE_SECONDS}`
  );
  return response;
});

/**
 * 新規商品を登録する API エンドポイント
 * POST /api/products
 *
 * 商品情報のバリデーション、カテゴリーの存在確認、公開日・終了日に基づく公開状態の自動判定を行い、商品を作成します。
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new ValidationError('商品名は必須です');
  }

  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    throw new ValidationError('商品説明は必須です');
  }

  if (!body.categoryId || typeof body.categoryId !== 'number') {
    throw new ValidationError('カテゴリーは必須です');
  }

  const category = await safePrismaOperation(
    () => prisma.category.findUnique({ where: { id: body.categoryId } }),
    'POST /api/products - category check'
  );

  if (!category) {
    throw new ValidationError('指定されたカテゴリーが存在しません');
  }

  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  const endedAt = body.endedAt ? new Date(body.endedAt) : null;

  let published: boolean;
  if (publishedAt || endedAt) {
    published = calculatePublishedStatus(publishedAt, endedAt);
  } else {
    published = body.published !== undefined ? body.published : true;
  }

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
        },
        include: {
          category: true,
        },
      }),
    'POST /api/products'
  );

  if (!product) {
    throw new ValidationError('商品の作成に失敗しました');
  }

  return apiSuccess({ product }, 201);
});
