import { useState, useEffect } from "react";
import { calculatePublishedStatus, hasDateRange } from "@/lib/product-utils";
import { useImageUpload } from "./useImageUpload";

export interface ProductFormData {
  name: string;
  description: string;
  imageFile: File | null;
  imageUrl: string;
  priceS: string;
  priceL: string;
  categoryId: string;
  published: boolean;
  publishedAt: string;
  endedAt: string;
}

interface UseProductFormOptions {
  initialImageUrl?: string | null;
  initialFormData?: Partial<ProductFormData>;
}

/**
 * 商品フォームの状態管理を行うカスタムフック
 *
 * 商品作成・編集フォームで使用する共通ロジックを提供します。
 * 以下の機能を提供します：
 * - フォームデータの状態管理
 * - 画像の圧縮とアップロード
 * - 公開日・終了日に基づく公開状態の自動計算
 */
export function useProductForm(options: UseProductFormOptions = {}) {
  const { initialImageUrl = null, initialFormData = {} } = options;

  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl);
  const { uploading, compressing, handleImageChange: handleImageChangeInternal, uploadImage: uploadImageInternal } = useImageUpload();

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialFormData.name || "",
    description: initialFormData.description || "",
    imageFile: null,
    imageUrl: initialFormData.imageUrl || "",
    priceS: initialFormData.priceS || "",
    priceL: initialFormData.priceL || "",
    categoryId: initialFormData.categoryId || "",
    published: initialFormData.published ?? true,
    publishedAt: initialFormData.publishedAt || "",
    endedAt: initialFormData.endedAt || "",
  });

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fallbackImageUrl?: string | null
  ) => {
    const file = e.target.files?.[0] || null;
    const result = await handleImageChangeInternal(file, fallbackImageUrl);

    if (result.file) {
      setFormData((prev) => ({ ...prev, imageFile: result.file }));
      setImagePreview(result.previewUrl);
    } else {
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(result.previewUrl);
      e.target.value = "";
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    return uploadImageInternal(formData.imageFile, formData.imageUrl);
  };

  useEffect(() => {
    if (formData.publishedAt || formData.endedAt) {
      const publishedAt = formData.publishedAt
        ? new Date(formData.publishedAt)
        : null;
      const endedAt = formData.endedAt ? new Date(formData.endedAt) : null;
      const calculatedPublished = calculatePublishedStatus(
        publishedAt,
        endedAt
      );
      setFormData((prev) => ({ ...prev, published: calculatedPublished }));
    }
  }, [formData.publishedAt, formData.endedAt, setFormData]);

  const hasDateRangeValue = hasDateRange(
    formData.publishedAt ? new Date(formData.publishedAt) : null,
    formData.endedAt ? new Date(formData.endedAt) : null
  );

  return {
    formData,
    setFormData,
    submitting,
    setSubmitting,
    uploading,
    compressing,
    imagePreview,
    handleImageChange,
    uploadImage,
    hasDateRangeValue,
  };
}
