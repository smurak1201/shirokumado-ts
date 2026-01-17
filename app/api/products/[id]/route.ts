import { withErrorHandling } from '@/lib/api-helpers';
import { NextRequest } from 'next/server';
import { getProduct } from './get';
import { putProduct } from './put';
import { deleteProduct } from './delete';

export const dynamic = 'force-dynamic';

/**
 * 商品を取得する API エンドポイント
 * GET /api/products/[id]
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return getProduct(request, params);
});

/**
 * 商品を更新する API エンドポイント
 * PUT /api/products/[id]
 */
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return putProduct(request, params);
});

/**
 * 商品を削除する API エンドポイント
 * DELETE /api/products/[id]
 */
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return deleteProduct(request, params);
});
