/**
 * 商品並び替え API エンドポイント
 *
 * ## 目的
 * ダッシュボードでドラッグ&ドロップされた商品の表示順序を一括更新します。
 *
 * ## 主な機能
 * - 商品の表示順序（displayOrder）を一括更新
 * - トランザクションを使用したデータ整合性の保証
 * - すべての更新が成功するか、すべてがロールバックされることを保証
 *
 * ## HTTPメソッド
 * - POST: 商品の表示順序を更新
 *
 * ## リクエストボディ
 * ```json
 * {
 *   "productOrders": [
 *     { "id": 1, "displayOrder": 1 },
 *     { "id": 2, "displayOrder": 2 },
 *     { "id": 3, "displayOrder": 3 }
 *   ]
 * }
 * ```
 *
 * ## レスポンス
 * ```json
 * {
 *   "message": "商品の順序を更新しました"
 * }
 * ```
 *
 * ## 認証要件
 * 必要（ダッシュボードからのみアクセス想定）
 *
 * ## エラーハンドリング
 * - withErrorHandling で統一的なエラーハンドリングを実施
 * - ValidationError でユーザーフレンドリーなエラーメッセージを返却
 * - トランザクションを使用し、一部の更新が失敗した場合はすべてロールバック
 *
 * ## パフォーマンス最適化
 * - Promise.all ではなく prisma.$transaction を使用することで、データベース側でのアトミック性を保証
 *
 * ## 実装の理由
 * - トランザクション使用: 並び替え中にエラーが発生した場合、不整合な状態を防ぐため
 * - 一括更新: ネットワークラウンドトリップを削減し、パフォーマンスを向上
 *
 * @module app/api/products/reorder/route
 */

import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { NextRequest } from 'next/server';

/**
 * 動的レンダリングを強制
 *
 * データベースを更新するため、常にサーバー側で実行する必要があります。
 * これにより、ビルド時の静的生成を回避し、リクエスト時に最新のデータを更新できます。
 */
export const dynamic = 'force-dynamic';

/**
 * 商品の表示順序を更新する POSTハンドラー
 *
 * ダッシュボードでドラッグ&ドロップされた商品の表示順序を一括更新します。
 * トランザクションを使用することで、すべての更新が成功するか、
 * すべてがロールバックされることを保証します。
 *
 * @param request - リクエストオブジェクト（商品順序の配列を含む）
 * @returns 更新成功メッセージを含む JSON レスポンス
 * @throws ValidationError バリデーションエラーが発生した場合
 * @throws DatabaseError データベース操作に失敗した場合
 *
 * ## 実装の理由
 * - トランザクション: 並び替え中にエラーが発生した場合、不整合な状態を防ぐため
 * - map() で更新クエリを生成: すべての商品を一括で更新し、ネットワークラウンドトリップを削減
 *
 * ## 注意点
 * - productOrders 配列が大きすぎる場合、トランザクションがタイムアウトする可能性があります
 * - 現状では商品数が少ないため問題ありませんが、将来的には考慮が必要です
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // リクエストボディをJSONとしてパース
  const body = await request.json();

  // productOrders 配列のバリデーション
  // 理由: 必須項目であり、配列でない場合は処理を続行できないため
  if (!body.productOrders || !Array.isArray(body.productOrders)) {
    throw new ValidationError('商品順序の配列が必要です');
  }

  // トランザクションを使用して商品の表示順序を一括更新
  // 実装の理由:
  // - トランザクション: すべての更新が成功するか、すべてがロールバックされることを保証
  // - 一部の更新が失敗した場合でも、データベースの整合性を保つことができます
  // - 例: 100個の商品のうち50個目でエラーが発生した場合、すべての更新がロールバックされ、
  //   中途半端な並び順になることを防ぎます
  await safePrismaOperation(
    async () => {
      await prisma.$transaction(
        // productOrders 配列の各要素に対して更新クエリを生成
        // map() を使用することで、すべての更新クエリを一度に実行できます
        body.productOrders.map((item: { id: number; displayOrder: number }) =>
          prisma.product.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
        )
      );
    },
    'POST /api/products/reorder'
  );

  // 成功レスポンスを返却（ステータスコード200）
  return apiSuccess({ message: '商品の順序を更新しました' });
});
