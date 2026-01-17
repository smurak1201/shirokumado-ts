import type { Product } from "../types";
import type { ProductFormData } from "../hooks/useProductForm";

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
