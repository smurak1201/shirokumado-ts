import type { ProductFormData } from "../hooks/useProductForm";

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
