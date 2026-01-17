import { useState, useEffect, useCallback } from "react";
import { calculatePublishedStatus, hasDateRange } from "@/lib/product-utils";
import { compressImage, isImageFile } from "@/lib/image-compression";

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
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl);

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

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, fallbackImageUrl?: string | null) => {
      const file = e.target.files?.[0];
      if (!file) {
        setFormData((prev) => ({ ...prev, imageFile: null }));
        setImagePreview(fallbackImageUrl || null);
        return;
      }

      if (!isImageFile(file)) {
        alert("画像ファイルのみ選択可能です");
        return;
      }

      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > 10) {
        const proceed = confirm(
          `選択された画像は${fileSizeMB.toFixed(2)}MBです。\n` +
          `推奨サイズは10MB以下です。\n` +
          `処理に時間がかかるか、失敗する可能性があります。\n\n` +
          `続行しますか？`
        );
        if (!proceed) {
          e.target.value = "";
          return;
        }
      }

      let processedFile = file;
      setCompressing(true);
      try {
        const { config } = await import("@/lib/config");
        processedFile = await compressImage(file, {
          maxSizeMB: config.imageConfig.COMPRESSION_TARGET_SIZE_MB,
        });
        const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
        const compressedSizeMB = (processedFile.size / 1024 / 1024).toFixed(2);
        console.log(
          `画像を圧縮しました: ${originalSizeMB}MB → ${compressedSizeMB}MB`
        );

        if (processedFile.size > config.imageConfig.MAX_FILE_SIZE_BYTES) {
          alert(
            `画像が大きすぎます（${compressedSizeMB}MB）。別の画像を選択するか、画像を小さくしてから再度お試しください。`
          );
          setCompressing(false);
          return;
        }
      } catch (error) {
        console.error("画像の圧縮に失敗しました:", error);
        const errorMessage =
          error instanceof Error ? error.message : "不明なエラー";
        alert(
          `画像の圧縮に失敗しました: ${errorMessage}\n別の画像を選択してください。`
        );
        setCompressing(false);
        return;
      } finally {
        setCompressing(false);
      }

      setFormData((prev) => ({ ...prev, imageFile: processedFile }));
      const previewUrl = URL.createObjectURL(processedFile);
      setImagePreview(previewUrl);
    },
    []
  );

  const uploadImage = useCallback(async (): Promise<string | null> => {
    if (!formData.imageFile) {
      return formData.imageUrl || null;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.imageFile);

      const uploadResponse = await fetch("/api/products/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        let errorMessage = "画像のアップロードに失敗しました";
        try {
          const contentType = uploadResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await uploadResponse.json();
            errorMessage = error.error || errorMessage;
          } else {
            const text = await uploadResponse.text();
            errorMessage = text || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `画像のアップロードに失敗しました (${uploadResponse.status})`;
        }
        throw new Error(errorMessage);
      }

      const uploadData = await uploadResponse.json();
      return uploadData.url;
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [formData.imageFile, formData.imageUrl]);

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
  }, [formData.publishedAt, formData.endedAt]);

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
