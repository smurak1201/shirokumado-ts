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

    // カテゴリーテーブルの構造を確認
    const categoriesSchema = await safeDbOperation(
      async () => {
        const result = await db.execute(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'categories'
          ORDER BY ordinal_position
        `);
        return result;
      },
      'test-db - categories schema'
    );

    // 商品テーブルの構造を確認
    const productsSchema = await safeDbOperation(
      async () => {
        const result = await db.execute(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'products'
          ORDER BY ordinal_position
        `);
        return result;
      },
      'test-db - products schema'
    );

    // カテゴリーテーブルの存在確認（生SQLで確認）
    const categoriesRaw = await safeDbOperation(
      async () => {
        const result = await db.execute('SELECT * FROM categories LIMIT 5');
        return result;
      },
      'test-db - categories raw query'
    );

    // 商品テーブルの存在確認（生SQLで確認）
    const productsRaw = await safeDbOperation(
      async () => {
        const result = await db.execute('SELECT * FROM products LIMIT 5');
        return result;
      },
      'test-db - products raw query'
    );

    // カテゴリーテーブルの存在確認（Drizzleクエリ）
    let categoriesTest: unknown[] = [];
    let categoriesError: unknown = null;
    try {
      categoriesTest = await safeDbOperation(
        () =>
          db.query.categories.findMany({
            limit: 1,
          }),
        'test-db - categories test'
      );
    } catch (error) {
      categoriesError = error;
      console.error('Categories query failed:', error);
    }

    // 商品テーブルの存在確認（Drizzleクエリ）
    let productsTest: unknown[] = [];
    let productsError: unknown = null;
    try {
      productsTest = await safeDbOperation(
        () =>
          db.query.products.findMany({
            limit: 1,
          }),
        'test-db - products test'
      );
    } catch (error) {
      productsError = error;
      console.error('Products query failed:', error);
    }

    return NextResponse.json({
      success: true,
      connection: 'OK',
      tables: tablesResult,
      categoriesSchema,
      productsSchema,
      categoriesRaw: categoriesRaw.rows || [],
      productsRaw: productsRaw.rows || [],
      categoriesCount: Array.isArray(categoriesTest) ? categoriesTest.length : 0,
      productsCount: Array.isArray(productsTest) ? productsTest.length : 0,
      categoriesError: categoriesError
        ? (categoriesError instanceof Error ? categoriesError.message : String(categoriesError))
        : null,
      productsError: productsError
        ? (productsError instanceof Error ? productsError.message : String(productsError))
        : null,
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
