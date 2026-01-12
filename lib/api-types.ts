import type { Product, Category } from '@/app/types';

/**
 * API レスポンスの型定義
 * クライアント側での型安全性を確保するために使用します
 */

/**
 * 成功レスポンスの基本型
 */
export interface ApiSuccessResponse<T> {
  [key: string]: T;
}

/**
 * エラーレスポンスの型
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
}

/**
 * 商品一覧取得 API のレスポンス
 * GET /api/products
 */
export interface GetProductsResponse {
  products: Product[];
}

/**
 * 商品作成 API のレスポンス
 * POST /api/products
 */
export interface PostProductResponse {
  product: Product;
}

/**
 * 商品更新 API のレスポンス
 * PUT /api/products/[id]
 */
export interface PutProductResponse {
  product: Product;
}

/**
 * 商品削除 API のレスポンス
 * DELETE /api/products/[id]
 */
export interface DeleteProductResponse {
  message: string;
}

/**
 * 商品取得 API のレスポンス
 * GET /api/products/[id]
 */
export interface GetProductResponse {
  product: Product;
}

/**
 * 商品順序更新 API のレスポンス
 * POST /api/products/reorder
 */
export interface PostProductReorderResponse {
  message: string;
}

/**
 * 画像アップロード API のレスポンス
 * POST /api/products/upload
 */
export interface PostProductUploadResponse {
  url: string;
  filename: string;
}

/**
 * カテゴリー一覧取得 API のレスポンス
 * GET /api/categories
 */
export interface GetCategoriesResponse {
  categories: Category[];
}
