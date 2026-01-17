import type { ProductFormData } from "../hooks/useProductForm";

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

/**
 * 商品フォーム送信のエラーハンドリング
 */
export function handleProductSubmitError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "処理に失敗しました";
}
