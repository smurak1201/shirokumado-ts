/**
 * 商品削除ハンドラー
 *
 * ## 目的
 * 指定されたIDの商品をデータベースから削除し、関連する画像ファイルも
 * Blobストレージから削除します。
 *
 * ## 主な機能
 * - 商品の存在確認
 * - 商品に紐づく画像をBlobストレージから削除
 * - データベースから商品を削除
 * - 削除ログの記録
 *
 * ## レスポンス
 * ```json
 * {
 *   "message": "商品を削除しました"
 * }
 * ```
 *
 * ## 実装の理由
 * - 画像の事前削除: データベースから削除する前に画像を削除することで、
 *   削除失敗時にデータベースとストレージの不整合を防ぐ
 * - ログ記録: 画像削除の履歴を残すことで、トラブルシューティングを容易にする
 *
 * ## 注意点
 * - 画像削除に失敗してもエラーはスローされません（ログに記録されます）
 * - 商品削除に失敗した場合は例外がスローされ、トランザクションがロールバックされます
 *
 * @module app/api/products/[id]/delete
 */

import { apiSuccess, parseProductId } from '@/lib/api-helpers';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { log } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { deleteFile } from '@/lib/blob';

/**
 * 商品を削除する関数
 *
 * 商品の存在確認を行い、商品に紐づく画像をBlobストレージから削除してから、
 * データベースから商品を削除します。
 *
 * @param _request - リクエストオブジェクト（使用していないが、Next.jsのAPI仕様上必要）
 * @param params - URLパラメータ（id を含む）
 * @returns 削除成功メッセージを含むJSONレスポンス
 * @throws NotFoundError 商品が存在しない場合
 * @throws ValidationError 商品IDが不正な場合
 * @throws DatabaseError データベース操作に失敗した場合
 *
 * ## 実装の理由
 * - 画像の事前削除: データベースから削除する前に画像を削除することで、
 *   削除失敗時にデータベースとストレージの不整合を防ぐ
 * - ログ記録: 画像削除の履歴を残すことで、トラブルシューティングを容易にする
 */
export async function deleteProduct(
  _request: NextRequest,
  params: Promise<{ id: string }>
) {
  // URLパラメータから商品IDを取得
  const { id } = await params;

  // 商品IDをパース（文字列 → 数値変換 + バリデーション）
  const productId = parseProductId(id);

  // 商品の存在確認
  // 理由: 存在しない商品への削除を防ぐため、最初にチェック
  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `DELETE /api/products/${id} - existence check`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // 商品に画像が紐づいている場合、Blobストレージから削除
  // 実装の理由:
  // - ストレージコスト削減: 不要な画像ファイルを残さない
  // - データベース削除前に実行: 削除失敗時にデータベースとストレージの不整合を防ぐ
  if (existingProduct.imageUrl) {
    await deleteFile(existingProduct.imageUrl);

    // 画像削除のログを記録
    // 理由: トラブルシューティング時に削除履歴を確認できるようにするため
    log.info("商品削除時に画像を削除しました", {
      context: `DELETE /api/products/${id}`,
      metadata: { imageUrl: existingProduct.imageUrl },
    });
  }

  // データベースから商品を削除
  // safePrismaOperation でラップすることで、エラー時の自動ロギングを実現
  await safePrismaOperation(
    () => prisma.product.delete({ where: { id: productId } }),
    `DELETE /api/products/${id}`
  );

  // 成功レスポンスを返却（ステータスコード200）
  return apiSuccess({ message: '商品を削除しました' });
}
