/**
 * 個別商品操作 API エンドポイント（ルーター）
 *
 * ## 目的
 * 特定の商品に対するCRUD操作（取得、更新、削除）を提供します。
 * 各HTTPメソッドのハンドラーは別ファイルに分離されており、
 * このファイルはルーターとして機能します。
 *
 * ## 主な機能
 * - GET: 商品の詳細情報を取得
 * - PUT: 商品情報を更新
 * - DELETE: 商品を削除
 *
 * ## HTTPメソッド
 * - GET: 商品を取得
 * - PUT: 商品を更新
 * - DELETE: 商品を削除
 *
 * ## URLパラメータ
 * - id: 商品ID（数値）
 *
 * ## 認証要件
 * - GET: なし（公開エンドポイント）
 * - PUT: 必要（ダッシュボードからのみアクセス想定）
 * - DELETE: 必要（ダッシュボードからのみアクセス想定）
 *
 * ## 実装の理由
 * - ファイル分割: 各HTTPメソッドのハンドラーを別ファイルに分離することで、
 *   コードの可読性と保守性を向上させています
 * - 単一責任の原則: 各ファイルが1つの操作のみを担当することで、理解しやすくなります
 *
 * ## 関連ファイル
 * - [get.ts](./get.ts): GET ハンドラー（商品取得）
 * - [put.ts](./put.ts): PUT ハンドラー（商品更新）
 * - [delete.ts](./delete.ts): DELETE ハンドラー（商品削除）
 * - [put-validation.ts](./put-validation.ts): PUT バリデーション処理
 *
 * @module app/api/products/[id]/route
 */

import { withErrorHandling } from '@/lib/api-helpers';
import { NextRequest } from 'next/server';
import { getProduct } from './get';
import { putProduct } from './put';
import { deleteProduct } from './delete';

/**
 * 動的レンダリングを強制
 *
 * データベースから最新のデータを取得・更新・削除する必要があるため、
 * 常にサーバー側でレンダリングします。
 */
export const dynamic = 'force-dynamic';

/**
 * 商品を取得する GETハンドラー
 *
 * 指定されたIDの商品を取得します。
 * 実際の処理は [get.ts](./get.ts) で実装されています。
 *
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（id を含む）
 * @returns 商品情報を含むJSONレスポンス
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return getProduct(request, params);
});

/**
 * 商品を更新する PUTハンドラー
 *
 * 指定されたIDの商品を更新します。
 * 実際の処理は [put.ts](./put.ts) で実装されています。
 *
 * @param request - リクエストオブジェクト（商品情報を含む）
 * @param params - URLパラメータ（id を含む）
 * @returns 更新された商品情報を含むJSONレスポンス
 */
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return putProduct(request, params);
});

/**
 * 商品を削除する DELETEハンドラー
 *
 * 指定されたIDの商品を削除します。
 * 実際の処理は [delete.ts](./delete.ts) で実装されています。
 *
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（id を含む）
 * @returns 削除成功メッセージを含むJSONレスポンス
 */
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return deleteProduct(request, params);
});
