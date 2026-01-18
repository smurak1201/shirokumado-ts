import { log } from "@/lib/logger";
import type { ProductFormData } from "../hooks/useProductForm";
import { prepareProductSubmitData, handleProductSubmitError } from "./productFormSubmit";

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
