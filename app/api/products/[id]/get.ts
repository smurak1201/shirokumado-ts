/**
 * 商品取得ハンドラー
 *
 * ## 目的
 * 指定されたIDの商品をデータベースから取得し、カテゴリー情報を含めて返却します。
 *
 * ## 主な機能
 * - URLパラメータからの商品ID取得
 * - 商品IDのパースとバリデーション
 * - データベースから商品情報を取得（カテゴリー情報を含む）
 * - 商品が存在しない場合のエラーハンドリング
 *
 * ## レスポンス
 * ```json
 * {
 *   "product": {
 *     "id": 1,
 *     "name": "商品名",
 *     "description": "説明",
 *     "imageUrl": "https://...",
 *     "priceS": 500,
 *     "priceL": 700,
 *     "categoryId": 1,
 *     "category": { "id": 1, "name": "カテゴリー名" },
 *     "published": true,
 *     "publishedAt": "2024-01-01T00:00:00Z",
 *     "endedAt": null,
 *     "createdAt": "2024-01-01T00:00:00Z"
 *   }
 * }
 * ```
 *
 * ## 実装の理由
 * - parseProductId: URLパラメータの文字列を数値に変換し、不正な値を早期に検出
 * - include: { category: true }: 商品表示時にカテゴリー名も必要なため、JOIN して取得
 * - NotFoundError: 存在しない商品へのアクセスを明確にエラーとして返却
 *
 * @module app/api/products/[id]/get
 */

import { apiSuccess, parseProductId } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { NextRequest } from 'next/server';

/**
 * 商品を取得する関数
 *
 * 指定されたIDの商品をカテゴリー情報を含めて取得します。
 * 商品が存在しない場合はNotFoundErrorをスローします。
 *
 * @param _request - リクエストオブジェクト（使用していないが、Next.jsのAPI仕様上必要）
 * @param params - URLパラメータ（id を含む）
 * @returns 商品情報を含むJSONレスポンス
 * @throws NotFoundError 商品が存在しない場合
 * @throws ValidationError 商品IDが不正な場合
 * @throws DatabaseError データベース操作に失敗した場合
 *
 * ## 実装の理由
 * - _request: Next.jsのハンドラーシグネチャに合わせるため必須だが、使用していないため _ プレフィックス
 * - parseProductId: URLパラメータの文字列を数値に変換し、不正な値（非数値、負数など）を早期に検出
 */
export async function getProduct(
  _request: NextRequest,
  params: Promise<{ id: string }>
) {
  // URLパラメータから商品IDを取得
  // Next.js 15+ では params が Promise になっているため、await で解決
  const { id } = await params;

  // 商品IDをパース（文字列 → 数値変換 + バリデーション）
  // parseProductId は不正な値の場合に ValidationError をスローします
  const productId = parseProductId(id);

  // データベースから商品を取得
  // safePrismaOperation でラップすることで、エラー時の自動ロギングと統一的なエラーハンドリングを実現
  const product = await safePrismaOperation(
    () =>
      prisma.product.findUnique({
        where: { id: productId },
        // カテゴリー情報を含める（商品表示時にカテゴリー名も必要なため）
        include: {
          category: true,
        },
      }),
    `GET /api/products/${id}`
  );

  // 商品が存在しない場合はエラー
  // 理由: 存在しない商品へのアクセスを明確にエラーとして返却し、クライアント側で適切に処理できるようにする
  if (!product) {
    throw new NotFoundError('商品');
  }

  // 成功レスポンスを返却（ステータスコード200）
  return apiSuccess({ product });
}
