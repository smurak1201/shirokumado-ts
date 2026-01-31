import { log } from "@/lib/logger";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import type { ProductFormData } from "../hooks/useProductForm";
import {
  resetProductFormData,
  prepareProductSubmitData,
} from "./productFormData";

/**
 * 商品フォーム送信処理ユーティリティ
 *
 * 商品作成・更新フォームの送信処理を提供します。
 */

interface HandleProductCreateSubmitParams {
  formData: ProductFormData;
  uploadImage: () => Promise<string | null>;
  imagePreview: string | null;
  setSubmitting: (value: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
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
    alert(getUserFriendlyMessageJa(error));
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
        alert(getUserFriendlyMessageJa(error));
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
    alert(getUserFriendlyMessageJa(error));
  } finally {
    setSubmitting(false);
  }
}
