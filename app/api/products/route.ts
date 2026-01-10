import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';
import { calculatePublishedStatus } from '@/lib/product-utils';

/**
 * 動的レンダリングを強制
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします
 */
export const dynamic = 'force-dynamic';

/**
 * 商品一覧を取得する API エンドポイント
 * GET /api/products
 *
 * 機能:
 * - すべての商品をカテゴリー情報を含めて取得
 * - 作成日時の降順でソート
 * - キャッシュヘッダーを設定してパフォーマンスを最適化
 *
 * @returns 商品一覧を含む JSON レスポンス
 */
export const GET = withErrorHandling(async () => {
  // データベースから商品を取得
  // include でカテゴリー情報も一緒に取得することで、N+1問題を回避します
  const products = await safePrismaOperation(
    () =>
      prisma.product.findMany({
        include: {
          category: true, // 関連するカテゴリー情報も取得
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順でソート（新しい順）
        },
      }),
    'GET /api/products'
  );

  const response = NextResponse.json({ products }, { status: 200 });
  // キャッシュヘッダーを設定
  // s-maxage: CDNでのキャッシュ期間
  // stale-while-revalidate: キャッシュが古くなっても、再検証中は古いデータを返す
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
 * 機能:
 * - 商品情報のバリデーション
 * - カテゴリーの存在確認
 * - 公開日・終了日に基づく公開状態の自動判定
 * - 商品の作成
 *
 * @param request - リクエストオブジェクト（商品情報を含む）
 * @returns 作成された商品を含む JSON レスポンス
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // ===== バリデーション =====
  // 商品名の検証
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new ValidationError('商品名は必須です');
  }

  // 商品説明の検証
  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    throw new ValidationError('商品説明は必須です');
  }

  // カテゴリーIDの検証
  if (!body.categoryId || typeof body.categoryId !== 'number') {
    throw new ValidationError('カテゴリーは必須です');
  }

  // ===== カテゴリーの存在確認 =====
  // 指定されたカテゴリーがデータベースに存在するか確認
  const category = await safePrismaOperation(
    () => prisma.category.findUnique({ where: { id: body.categoryId } }),
    'POST /api/products - category check'
  );

  if (!category) {
    throw new ValidationError('指定されたカテゴリーが存在しません');
  }

  // ===== 公開日・終了日の処理 =====
  // 文字列形式の日時を Date オブジェクトに変換
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  const endedAt = body.endedAt ? new Date(body.endedAt) : null;

  // ===== 公開状態の自動判定 =====
  // 公開日・終了日が設定されている場合は自動判定
  // 設定されていない場合は手動設定値（デフォルトは true）を使用
  let published: boolean;
  if (publishedAt || endedAt) {
    // 公開日・終了日に基づいて公開状態を自動判定
    published = calculatePublishedStatus(publishedAt, endedAt);
  } else {
    // 公開日・終了日が設定されていない場合は手動設定値を使用
    // body.published が undefined の場合はデフォルトで true（公開）にする
    published = body.published !== undefined ? body.published : true;
  }

  // ===== 商品の作成 =====
  const product = await safePrismaOperation(
    () =>
      prisma.product.create({
        data: {
          name: body.name.trim(), // 前後の空白を削除
          description: body.description.trim(), // 前後の空白を削除
          imageUrl: body.imageUrl || null, // 画像URLが指定されていない場合は null
          priceS: body.priceS ? parseFloat(body.priceS) : null, // 文字列を数値に変換
          priceL: body.priceL ? parseFloat(body.priceL) : null, // 文字列を数値に変換
          categoryId: body.categoryId,
          published, // 自動判定または手動設定された公開状態
          publishedAt,
          endedAt,
        },
        include: {
          category: true, // 作成された商品にカテゴリー情報も含める
        },
      }),
    'POST /api/products'
  );

  // 201 Created ステータスでレスポンスを返す
  return apiSuccess({ product }, 201);
});
