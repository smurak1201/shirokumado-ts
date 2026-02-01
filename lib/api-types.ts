/**
 * API レスポンスの型定義
 */

import type { Product, Category } from '@/app/types';

export interface ApiSuccessResponse<T> {
  [key: string]: T;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}

export interface GetProductsResponse {
  products: Product[];
}

export interface PostProductResponse {
  product: Product;
}

export interface PutProductResponse {
  product: Product;
}

export interface DeleteProductResponse {
  message: string;
}

export interface GetProductResponse {
  product: Product;
}

export interface PostProductReorderResponse {
  message: string;
}

export interface PostProductUploadResponse {
  url: string;
  filename: string;
}

export interface GetCategoriesResponse {
  categories: Category[];
}
