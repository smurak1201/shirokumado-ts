/**
 * 商品管理 API エンドポイント
 *
 * GET: 商品一覧を取得（カテゴリー情報を含む）
 * POST: 新規商品を登録（公開日・終了日に基づいて公開状態を自動判定）
 */

import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';
import { determinePublishedStatus } from '@/lib/product-utils';

export const dynamic = 'force-dynamic';

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

  // stale-while-revalidate: キャッシュ期限切れ後もバックグラウンドで更新しつつ古いデータを返す
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.PRODUCT_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.PRODUCT_LIST_STALE_WHILE_REVALIDATE_SECONDS}`
  );

  return response;
});

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

  // 公開日・終了日に基づいて、実際の公開状態を自動判定
  const published = determinePublishedStatus(
    publishedAt,
    endedAt,
    body.published,
    true
  );

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
