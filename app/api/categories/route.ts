import { withErrorHandling } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import { config } from '@/lib/config';
import { NextResponse } from 'next/server';

/**
 * カテゴリー一覧を取得
 * キャッシュ時間は設定ファイルから読み込み
 */
export const dynamic = 'force-dynamic'; // 動的レンダリング（キャッシュはクライアント側で制御）

export const GET = withErrorHandling(async () => {
  const categories = await safePrismaOperation(
    () =>
      prisma.category.findMany({
        orderBy: {
          id: 'asc',
        },
      }),
    'GET /api/categories'
  );

  const response = NextResponse.json({ categories }, { status: 200 });
  // キャッシュヘッダーを設定（設定ファイルから読み込み）
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.CATEGORY_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.CATEGORY_LIST_STALE_WHILE_REVALIDATE_SECONDS}`
  );
  return response;
});
