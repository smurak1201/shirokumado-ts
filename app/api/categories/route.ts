import { withErrorHandling } from '@/lib/api-helpers';
import { db, safeDbOperation, categories } from '@/lib/db';
import { asc } from 'drizzle-orm';
import { config } from '@/lib/config';
import { NextResponse } from 'next/server';

/**
 * カテゴリー一覧を取得
 *
 * 注意: 現在このエンドポイントは未使用です。
 * ダッシュボードではサーバーコンポーネントから直接Drizzleで取得しているため、
 * クライアントコンポーネントからの呼び出しは不要です。
 * 将来的にクライアント側でカテゴリー一覧を動的に取得する必要が生じた場合に使用する可能性があります。
 *
 * キャッシュ時間は設定ファイルから読み込み
 */
export const dynamic = 'force-dynamic'; // 動的レンダリング（キャッシュはクライアント側で制御）

export const GET = withErrorHandling(async () => {
  const categoriesList = await safeDbOperation(
    () => db.select().from(categories).orderBy(asc(categories.id)),
    'GET /api/categories'
  );

  const response = NextResponse.json({ categories: categoriesList }, { status: 200 });
  // Content-Typeヘッダーを設定（日本語を含むJSONの文字化けを防ぐ）
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  // キャッシュヘッダーを設定（設定ファイルから読み込み）
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.CATEGORY_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.CATEGORY_LIST_STALE_WHILE_REVALIDATE_SECONDS}`
  );
  return response;
});
