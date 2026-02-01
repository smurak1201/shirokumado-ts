/**
 * 商品フォームデータ変換ユーティリティ
 */

import type { Product } from "../types";
import type { ProductFormData } from "../hooks/useProductForm";

/**
 * フォームデータを初期状態にリセット
 *
 * 設計判断: published のデフォルトは true（新規商品は通常公開するため）
 */
export function resetProductFormData(): ProductFormData {
  return {
    name: "",
    description: "",
    imageFile: null,
    imageUrl: "",
    priceS: "",
    priceL: "",
    categoryId: "",
    published: true,
    publishedAt: "",
    endedAt: "",
  };
}

/**
 * 商品データからフォームの初期データを生成（編集時）
 *
 * input要素での編集のため number を string に変換
 * datetime-local 用に ISO 8601 の最初の16文字を使用（秒とタイムゾーンを除外）
 */
export function createInitialFormDataFromProduct(
  product: Product
): Partial<ProductFormData> {
  return {
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl || "",
    priceS: product.priceS?.toString() || "",
    priceL: product.priceL?.toString() || "",
    categoryId: product.category.id.toString(),
    published: product.published ?? true,
    publishedAt: product.publishedAt
      ? new Date(product.publishedAt).toISOString().slice(0, 16)
      : "",
    endedAt: product.endedAt
      ? new Date(product.endedAt).toISOString().slice(0, 16)
      : "",
  };
}

/**
 * フォームデータをAPI送信用に変換
 *
 * string → number 変換（parseFloat: 小数点対応、parseInt: カテゴリーIDは整数のみ）
 */
export function prepareProductSubmitData(
  formData: ProductFormData,
  imageUrl: string | null
): {
  name: string;
  description: string;
  imageUrl: string | null;
  categoryId: number;
  priceS: number | null;
  priceL: number | null;
  published: boolean;
  publishedAt: string | null;
  endedAt: string | null;
} {
  return {
    name: formData.name,
    description: formData.description,
    imageUrl,
    categoryId: parseInt(formData.categoryId),
    priceS: formData.priceS ? parseFloat(formData.priceS) : null,
    priceL: formData.priceL ? parseFloat(formData.priceL) : null,
    published: formData.published,
    publishedAt: formData.publishedAt || null,
    endedAt: formData.endedAt || null,
  };
}
