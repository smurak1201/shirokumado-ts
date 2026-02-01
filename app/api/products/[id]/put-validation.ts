/**
 * 商品更新バリデーション処理
 *
 * ## 目的
 * 商品更新時のリクエストデータをバリデーションします。
 * バリデーション処理を別ファイルに分離することで、コードの可読性と保守性を向上させています。
 *
 * ## 主な機能
 * - 商品の存在確認
 * - 商品名のバリデーション（型チェック、空白チェック）
 * - 商品説明のバリデーション（型チェック、空白チェック）
 * - カテゴリーIDのバリデーション（型チェック、存在確認）
 *
 * ## バリデーションルール
 * - 商品名: 文字列、空白除去後に空でないこと（更新時のみチェック）
 * - 商品説明: 文字列、空白除去後に空でないこと（更新時のみチェック）
 * - カテゴリーID: 数値、存在するカテゴリーであること（更新時のみチェック）
 *
 * ## セキュリティ考慮事項
 * - 商品の存在確認: 存在しない商品への更新を防ぐ
 * - カテゴリーの存在確認: 存在しないカテゴリーIDの設定を防ぐ
 * - 型チェック: 不正な型の値を早期に検出
 *
 * ## 実装の理由
 * - ファイル分離: バリデーション処理を別ファイルに分離することで、put.ts の見通しを良くする
 * - 条件付きバリデーション: 各フィールドが undefined でない場合のみバリデーション
 *   （理由: 部分更新をサポートするため、未指定のフィールドは既存の値を維持）
 *
 * @module app/api/products/[id]/put-validation
 */

import { prisma, safePrismaOperation } from '@/lib/prisma';
import { ValidationError, NotFoundError } from '@/lib/errors';
import type { ProductUpdateRequestBody } from './put';

/**
 * 商品更新のバリデーション関数
 *
 * 商品ID、商品名、説明、カテゴリーIDのバリデーションを行います。
 * バリデーションエラーが発生した場合は ValidationError または NotFoundError をスローします。
 *
 * @param productId - 商品ID（数値）
 * @param body - リクエストボディ（商品更新データ）
 * @param id - 商品ID（文字列、ログ用）
 * @throws NotFoundError 商品が存在しない場合
 * @throws ValidationError バリデーションエラーが発生した場合
 * @throws DatabaseError データベース操作に失敗した場合
 *
 * ## 実装の理由
 * - 商品の存在確認を最初に実施: 存在しない商品への更新を早期に検出
 * - 条件付きバリデーション: 各フィールドが undefined でない場合のみバリデーション
 *   （部分更新をサポートするため）
 */
export async function validateProductUpdate(
  productId: number,
  body: ProductUpdateRequestBody,
  id: string
): Promise<void> {
  // 商品の存在確認
  // 理由: 存在しない商品への更新を防ぐため、最初にチェック
  const existingProduct = await safePrismaOperation(
    () => prisma.product.findUnique({ where: { id: productId } }),
    `PUT /api/products/${id} - existence check`
  );

  if (!existingProduct) {
    throw new NotFoundError('商品');
  }

  // 商品名のバリデーション（更新される場合のみ）
  // 理由: 部分更新をサポートするため、undefined の場合はスキップ
  if (body.name !== undefined) {
    // 型チェック、空文字列チェック、trim後の長さチェック
    // 理由: 空白のみの商品名を防ぐため
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new ValidationError('商品名は必須です');
    }
  }

  // 商品説明のバリデーション（更新される場合のみ）
  // 理由: 部分更新をサポートするため、undefined の場合はスキップ
  if (body.description !== undefined) {
    // 型チェック、空文字列チェック、trim後の長さチェック
    // 理由: 空白のみの説明を防ぐため
    if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
      throw new ValidationError('商品説明は必須です');
    }
  }

  // カテゴリーIDのバリデーション（更新される場合のみ）
  // 理由: 部分更新をサポートするため、undefined の場合はスキップ
  if (body.categoryId !== undefined) {
    // 型チェック
    // セキュリティ: 数値以外の値が渡されることを防ぐ
    if (typeof body.categoryId !== 'number') {
      throw new ValidationError('カテゴリーIDは数値である必要があります');
    }

    // カテゴリーの存在確認
    // セキュリティ: 存在しないカテゴリーIDの設定を防ぐ
    const category = await safePrismaOperation(
      () => prisma.category.findUnique({ where: { id: body.categoryId } }),
      `PUT /api/products/${id} - category check`
    );

    if (!category) {
      throw new ValidationError('指定されたカテゴリーが存在しません');
    }
  }
}
