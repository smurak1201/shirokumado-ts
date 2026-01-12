/**
 * データベース接続テスト用のエンドポイント
 * 本番環境では削除するか、認証を追加してください
 */

import { db, safeDbOperation } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // データベース接続をテスト
    await safeDbOperation(
      async () => {
        // シンプルなクエリで接続をテスト
        await db.execute('SELECT 1 as test');
      },
      'test-db - connection test'
    );

    // テーブル一覧を確認
    const tablesResult = await safeDbOperation(
      async () => {
        const result = await db.execute(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `);
        return result;
      },
      'test-db - list tables'
    );

    // カテゴリーテーブルの存在確認
    let categoriesTest: unknown[] = [];
    try {
      categoriesTest = await safeDbOperation(
        () =>
          db.query.categories.findMany({
            limit: 1,
          }),
        'test-db - categories test'
      );
    } catch (categoriesError) {
      console.error('Categories query failed:', categoriesError);
    }

    // 商品テーブルの存在確認
    const productsTest = await safeDbOperation(
      () =>
        db.query.products.findMany({
          limit: 1,
        }),
      'test-db - products test'
    );

    return NextResponse.json({
      success: true,
      connection: 'OK',
      tables: tablesResult,
      categoriesCount: Array.isArray(categoriesTest) ? categoriesTest.length : 0,
      productsCount: productsTest?.length || 0,
      databaseUrl: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL.substring(0, 20)}...`
        : 'not set',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorCause = error instanceof Error && error.cause ? String(error.cause) : undefined;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: errorStack,
        cause: errorCause,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        databaseUrl: process.env.DATABASE_URL
          ? `${process.env.DATABASE_URL.substring(0, 20)}...`
          : 'not set',
      },
      { status: 500 }
    );
  }
}
