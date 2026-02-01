/**
 * 商品管理 API エンドポイント
 *
 * ## 目的
 * 商品の一覧取得と新規登録を行うAPIエンドポイントです。
 * ダッシュボードでの商品管理やフロントエンドでの商品表示に使用されます。
 *
 * ## 主な機能
 * - 商品一覧の取得（カテゴリー情報を含む）
 * - 新規商品の登録（バリデーション、公開状態の自動判定を含む）
 * - レスポンスキャッシュの設定
 *
 * ## HTTPメソッド
 * - GET: 商品一覧を取得
 * - POST: 新規商品を登録
 *
 * ## 認証要件
 * - GET: なし（公開エンドポイント）
 * - POST: 必要（ダッシュボードからのみアクセス想定）
 *
 * ## エラーハンドリング
 * - withErrorHandling で統一的なエラーハンドリングを実施
 * - ValidationError でユーザーフレンドリーなエラーメッセージを返却
 * - データベース操作は safePrismaOperation でラップし、エラーログを自動記録
 *
 * ## セキュリティ考慮事項
 * - 入力値のバリデーション（必須項目、型チェック、trim処理）
 * - カテゴリーIDの存在確認（不正なカテゴリーIDの登録を防ぐ）
 *
 * @module app/api/products/route
 */

import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';
import { determinePublishedStatus } from '@/lib/product-utils';

/**
 * 動的レンダリングを強制
 *
 * データベースから最新のデータを取得する必要があるため、常にサーバー側でレンダリングします。
 * これにより、ビルド時の静的生成を回避し、リクエスト時に最新の商品情報を取得できます。
 */
export const dynamic = 'force-dynamic';

/**
 * 商品一覧を取得する GETハンドラー
 *
 * データベースからすべての商品をカテゴリー情報を含めて取得し、
 * 作成日時の降順でソートして返却します。
 *
 * @returns 商品一覧を含むJSONレスポンス
 * @throws DatabaseError データベース操作に失敗した場合
 *
 * ## レスポンス形式
 * ```json
 * {
 *   "products": [
 *     {
 *       "id": 1,
 *       "name": "商品名",
 *       "description": "説明",
 *       "imageUrl": "https://...",
 *       "priceS": 500,
 *       "priceL": 700,
 *       "categoryId": 1,
 *       "category": { "id": 1, "name": "カテゴリー名" },
 *       "published": true,
 *       "publishedAt": "2024-01-01T00:00:00Z",
 *       "endedAt": null,
 *       "createdAt": "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 * ```
 *
 * ## 実装の理由
 * - include: { category: true }: 商品表示時にカテゴリー名も必要なため、JOIN して取得
 * - orderBy: { createdAt: 'desc' }: 最新の商品を先頭に表示するため
 * - Cache-Control: 商品データは頻繁に変更されないため、キャッシュでパフォーマンス向上
 */
export const GET = withErrorHandling(async () => {
  // データベースから商品一覧を取得
  // safePrismaOperation でラップすることで、エラー時の自動ロギングと統一的なエラーハンドリングを実現
  const products = await safePrismaOperation(
    () =>
      prisma.product.findMany({
        // カテゴリー情報を含める（商品表示時にカテゴリー名も必要なため）
        include: {
          category: true,
        },
        // 作成日時の降順でソート（最新の商品を先頭に表示するため）
        orderBy: {
          createdAt: 'desc',
        },
      }),
    'GET /api/products'
  );

  // JSONレスポンスを作成（ステータスコード200）
  const response = NextResponse.json({ products }, { status: 200 });

  // Content-Typeヘッダーを明示的に設定（日本語商品名の文字化けを防ぐため）
  response.headers.set('Content-Type', 'application/json; charset=utf-8');

  // キャッシュヘッダーを設定
  // public: CDNやプロキシでキャッシュ可能
  // s-maxage: 共有キャッシュの有効期限（設定ファイルから取得）
  // stale-while-revalidate: キャッシュ期限切れ後もバックグラウンドで更新しつつ古いデータを返す
  // トレードオフ: パフォーマンス向上と引き換えに、最新データの反映に若干の遅延が生じる可能性
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${config.apiConfig.PRODUCT_LIST_CACHE_SECONDS}, stale-while-revalidate=${config.apiConfig.PRODUCT_LIST_STALE_WHILE_REVALIDATE_SECONDS}`
  );

  return response;
});

/**
 * 新規商品を登録する POSTハンドラー
 *
 * 商品情報のバリデーション、カテゴリーの存在確認、公開日・終了日に基づく
 * 公開状態の自動判定を行い、商品を作成します。
 *
 * @param request - リクエストオブジェクト（商品情報を含む）
 * @returns 作成された商品を含むJSONレスポンス（ステータスコード201）
 * @throws ValidationError バリデーションエラーが発生した場合
 * @throws DatabaseError データベース操作に失敗した場合
 *
 * ## リクエストボディ
 * ```json
 * {
 *   "name": "商品名（必須）",
 *   "description": "商品説明（必須）",
 *   "imageUrl": "https://...", // 任意
 *   "priceS": 500, // 任意（Sサイズの価格）
 *   "priceL": 700, // 任意（Lサイズの価格）
 *   "categoryId": 1, // 必須
 *   "published": true, // 任意（デフォルト: true）
 *   "publishedAt": "2024-01-01T00:00:00Z", // 任意
 *   "endedAt": null // 任意
 * }
 * ```
 *
 * ## バリデーションルール
 * - 商品名: 必須、文字列、空白除去後に空でないこと
 * - 商品説明: 必須、文字列、空白除去後に空でないこと
 * - カテゴリーID: 必須、数値、存在するカテゴリーであること
 *
 * ## 実装の理由
 * - trim() 処理: 意図しない空白を防ぐため
 * - determinePublishedStatus: 公開日・終了日に基づいて自動的に公開状態を判定
 * - include: { category: true }: 作成後すぐに商品情報を表示できるよう、カテゴリー情報も含めて返却
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // リクエストボディをJSONとしてパース
  const body = await request.json();

  // 商品名のバリデーション
  // 理由: 空白のみの商品名を防ぐため、trim後の長さもチェック
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new ValidationError('商品名は必須です');
  }

  // 商品説明のバリデーション
  // 理由: 空白のみの説明を防ぐため、trim後の長さもチェック
  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    throw new ValidationError('商品説明は必須です');
  }

  // カテゴリーIDのバリデーション（型チェック）
  // 理由: 数値以外の値が渡されることを防ぐ
  if (!body.categoryId || typeof body.categoryId !== 'number') {
    throw new ValidationError('カテゴリーは必須です');
  }

  // カテゴリーの存在確認
  // セキュリティ: 存在しないカテゴリーIDの登録を防ぐ
  const category = await safePrismaOperation(
    () => prisma.category.findUnique({ where: { id: body.categoryId } }),
    'POST /api/products - category check'
  );

  if (!category) {
    throw new ValidationError('指定されたカテゴリーが存在しません');
  }

  // 日付文字列をDateオブジェクトに変換（nullの場合はnullのまま）
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  const endedAt = body.endedAt ? new Date(body.endedAt) : null;

  // 公開状態を自動判定
  // 公開日・終了日に基づいて、実際の公開状態を決定します
  // デフォルトは公開（true）
  const published = determinePublishedStatus(
    publishedAt,
    endedAt,
    body.published,
    true // デフォルトは公開
  );

  // データベースに商品を作成
  // safePrismaOperation でラップすることで、エラー時の自動ロギングを実現
  const product = await safePrismaOperation(
    () =>
      prisma.product.create({
        data: {
          // trim() で前後の空白を除去
          name: body.name.trim(),
          description: body.description.trim(),
          // imageUrl は任意項目のため、未指定の場合は null
          imageUrl: body.imageUrl || null,
          // 価格は文字列で渡される可能性があるため parseFloat で変換
          // 未指定の場合は null
          priceS: body.priceS ? parseFloat(body.priceS) : null,
          priceL: body.priceL ? parseFloat(body.priceL) : null,
          categoryId: body.categoryId,
          // 自動判定された公開状態
          published,
          publishedAt,
          endedAt,
        },
        // カテゴリー情報を含めて返却（レスポンスで使用するため）
        include: {
          category: true,
        },
      }),
    'POST /api/products'
  );

  // 商品作成の失敗チェック（念のための防御的プログラミング）
  // 通常は safePrismaOperation 内でエラーがスローされるため、ここには到達しない
  if (!product) {
    throw new ValidationError('商品の作成に失敗しました');
  }

  // 成功レスポンスを返却（ステータスコード201: Created）
  return apiSuccess({ product }, 201);
});
