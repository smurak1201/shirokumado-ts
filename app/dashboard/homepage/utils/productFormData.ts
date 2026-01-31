import type { Product } from "../types";
import type { ProductFormData } from "../hooks/useProductForm";

/**
 * 商品フォームデータの変換ユーティリティ
 *
 * フォームデータのリセット、初期データの生成、送信データの準備を提供します。
 */

/**
 * フォームデータをリセットする
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
 * 商品データからフォームの初期データを生成する
 *
 * 商品編集時に既存の商品情報をフォームデータ形式に変換します。
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
 * 商品フォームの送信データを準備する
 *
 * フォームデータをAPIリクエスト用の形式に変換します。
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
