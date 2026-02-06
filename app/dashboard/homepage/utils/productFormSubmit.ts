/**
 * 商品フォーム送信処理ユーティリティ
 */

import { toast } from "sonner";
import { log } from "@/lib/logger";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import { fetchJson } from "@/lib/client-fetch";
import type { ProductFormData } from "../hooks/useProductForm";
import {
  resetProductFormData,
  prepareProductSubmitData,
} from "./productFormData";

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
 *
 * 設計判断: 画像アップロードを先に実行（商品データに画像URLが必要なため並列実行不可）
 * URL.revokeObjectURL でメモリリーク防止（ブラウザは自動解放しない）
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

    await fetchJson("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });

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
    toast.error(getUserFriendlyMessageJa(error));
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
 *
 * 設計判断: 新しい画像が選択された場合のみアップロード（パフォーマンス最適化）
 * アップロード失敗時は処理を中断（データ整合性を優先）
 * 元の画像URL（HTTP URL）は Object URL でないため解放不要
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
        toast.error(getUserFriendlyMessageJa(error));
        setSubmitting(false);
        return;
      }
    }

    const submitData = prepareProductSubmitData(formData, imageUrl);

    await fetchJson(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });

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
    toast.error(getUserFriendlyMessageJa(error));
  } finally {
    setSubmitting(false);
  }
}
