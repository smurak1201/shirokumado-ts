import { withErrorHandling } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * カテゴリー一覧を取得
 * キャッシュ: 300秒（5分）
 */
export const dynamic = 'force-dynamic'; // 動的レンダリング（キャッシュはクライアント側で制御）

export const GET = withErrorHandling(async () => {
  const categories = await safePrismaOperation(
    () =>
      prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    'GET /api/categories'
  );

  const response = NextResponse.json({ categories }, { status: 200 });
  // キャッシュヘッダーを設定（300秒）
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return response;
});
