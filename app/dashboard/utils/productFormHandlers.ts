import { log } from "@/lib/logger";
import type { Product } from "../types";
import type { ProductFormData } from "../hooks/useProductForm";

/**
 * 商品フォーム関連の処理をまとめたユーティリティ
 *
 * フォームデータのリセット、初期データの生成、送信処理などを提供します。
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

/**
 * 商品フォーム送信のエラーハンドリング
 */
export function handleProductSubmitError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "処理に失敗しました";
}

interface HandleProductCreateSubmitParams {
  formData: ProductFormData;
  uploadImage: () => Promise<string | null>;
  imagePreview: string | null;
  setSubmitting: (value: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  resetProductFormData: () => ProductFormData;
  onProductCreated?: () => Promise<void>;
  onClose?: () => void;
}

/**
 * 商品作成フォームの送信処理
 */
export async function handleProductCreateSubmit({
  formData,
  uploadImage,
  imagePreview,
  setSubmitting,
  setFormData,
  resetProductFormData,
  onProductCreated,
  onClose,
}: HandleProductCreateSubmitParams): Promise<void> {
  setSubmitting(true);

  try {
    const imageUrl = await uploadImage();

    const submitData = prepareProductSubmitData(formData, imageUrl);
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "登録に失敗しました");
    }

    await response.json();

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData(resetProductFormData());

    if (onProductCreated) {
      await onProductCreated();
    }

    if (onClose) {
      onClose();
    }
  } catch (error) {
    log.error("商品の登録に失敗しました", {
      context: "handleProductCreateSubmit",
      error,
    });
    alert(handleProductSubmitError(error));
  } finally {
    setSubmitting(false);
  }
}

interface HandleProductUpdateSubmitParams {
  productId: number;
  formData: ProductFormData;
  uploadImage: () => Promise<string | null>;
  imagePreview: string | null;
  originalImageUrl: string | null;
  setSubmitting: (value: boolean) => void;
  onUpdated: () => Promise<void>;
  onClose: () => void;
}

/**
 * 商品更新フォームの送信処理
 */
export async function handleProductUpdateSubmit({
  productId,
  formData,
  uploadImage,
  imagePreview,
  originalImageUrl,
  setSubmitting,
  onUpdated,
  onClose,
}: HandleProductUpdateSubmitParams): Promise<void> {
  setSubmitting(true);

  try {
    let imageUrl: string | null = formData.imageUrl || null;

    if (formData.imageFile) {
      try {
        imageUrl = await uploadImage();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "画像のアップロードに失敗しました"
        );
        setSubmitting(false);
        return;
      }
    }

    const submitData = prepareProductSubmitData(formData, imageUrl);
    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "更新に失敗しました");
    }

    await response.json();

    if (imagePreview && imagePreview !== originalImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }

    await onUpdated();
    onClose();
  } catch (error) {
    log.error("商品の更新に失敗しました", {
      context: "handleProductUpdateSubmit",
      error,
      metadata: { productId },
    });
    alert(handleProductSubmitError(error));
  } finally {
    setSubmitting(false);
  }
}
