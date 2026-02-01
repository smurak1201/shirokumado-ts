/**
 * 個別商品操作 API エンドポイント（ルーター）
 *
 * GET/PUT/DELETE の各ハンドラーは別ファイルに分離し、可読性と保守性を向上。
 *
 * 関連ファイル:
 * - [get.ts](./get.ts): GET ハンドラー
 * - [put.ts](./put.ts): PUT ハンドラー
 * - [delete.ts](./delete.ts): DELETE ハンドラー
 * - [put-validation.ts](./put-validation.ts): PUT バリデーション処理
 */

import { withErrorHandling } from '@/lib/api-helpers';
import { NextRequest } from 'next/server';
import { getProduct } from './get';
import { putProduct } from './put';
import { deleteProduct } from './delete';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return getProduct(request, params);
});

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return putProduct(request, params);
});

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return deleteProduct(request, params);
});
