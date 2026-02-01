/**
 * カテゴリー一覧取得 API エンドポイント
 *
 * 注意: 現在このエンドポイントは未使用。ダッシュボードではサーバーコンポーネントから
 * 直接Prismaで取得しているため、クライアント側からの呼び出しは不要。
 */

import { withErrorHandling } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { config } from '@/lib/config';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const categoriesList = await safePrismaOperation(
    () =>
      prisma.category.findMany({
        orderBy: {
          id: 'asc',
        },
      }),
    'GET /api/categories'
  );

  const response = NextResponse.json({ categories: categoriesList }, { status: 200 });

  response.headers.set('Content-Type', 'application/json; charset=utf-8');

  // stale-while-revalidate: キャッシュ期限切れ後もバックグラウンドで更新しつつ古いデータを返す
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.CATEGORY_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.CATEGORY_LIST_STALE_WHILE_REVALIDATE_SECONDS}`
  );

  return response;
});
