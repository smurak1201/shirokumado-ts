import { useCallback, useState } from "react";
import { log } from "@/lib/logger";
import { useImageCompression } from "./useImageCompression";

/**
 * 画像アップロード処理を行うカスタムフック
 *
 * 画像の圧縮とアップロード機能を提供します。
 */
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { compressing, compressImageFile } = useImageCompression();

  const handleImageChange = useCallback(
    async (
      file: File | null,
      fallbackImageUrl?: string | null
    ): Promise<{ file: File | null; previewUrl: string | null }> => {
      if (!file) {
        return { file: null, previewUrl: fallbackImageUrl || null };
      }

      const processedFile = await compressImageFile(file);
      if (!processedFile) {
        return { file: null, previewUrl: fallbackImageUrl || null };
      }

      const previewUrl = URL.createObjectURL(processedFile);
      return { file: processedFile, previewUrl };
    },
    [compressImageFile]
  );

  const uploadImage = useCallback(
    async (imageFile: File | null, existingImageUrl: string | null): Promise<string | null> => {
      if (!imageFile) {
        return existingImageUrl || null;
      }

      setUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

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
        log.error("画像のアップロードに失敗しました", {
          context: "useImageUpload.uploadImage",
          error,
        });
        throw error;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return {
    uploading,
    compressing,
    handleImageChange,
    uploadImage,
  };
}
