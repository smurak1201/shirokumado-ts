import { useState, useCallback } from "react";
import { log } from "@/lib/logger";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import { compressImage, isImageFile } from "@/lib/image-compression";
import { getFileSizeMB } from "@/lib/image-compression-utils";
import { config } from "@/lib/config";

/**
 * 画像圧縮処理を行うカスタムフック
 *
 * 画像ファイルの検証と圧縮機能を提供します。
 */
export function useImageCompression() {
  const [compressing, setCompressing] = useState(false);

  const compressImageFile = useCallback(
    async (file: File): Promise<File | null> => {
      if (!isImageFile(file)) {
        alert("画像ファイルのみ選択可能です");
        return null;
      }

      const fileSizeMB = getFileSizeMB(file.size);
      if (fileSizeMB > config.imageConfig.RECOMMENDED_FILE_SIZE_MB) {
        const proceed = confirm(
          `選択された画像は${fileSizeMB.toFixed(2)}MBです。\n` +
          `推奨サイズは${config.imageConfig.RECOMMENDED_FILE_SIZE_MB}MB以下です。\n` +
          `処理に時間がかかるか、失敗する可能性があります。\n\n` +
          `続行しますか？`
        );
        if (!proceed) {
          return null;
        }
      }

      setCompressing(true);
      try {
        const processedFile = await compressImage(file, {
          maxSizeMB: config.imageConfig.COMPRESSION_TARGET_SIZE_MB,
        });
        const originalSizeMB = getFileSizeMB(file.size).toFixed(2);
        const compressedSizeMB = getFileSizeMB(processedFile.size).toFixed(2);
        log.debug("画像を圧縮しました", {
          context: "useImageCompression.compressImageFile",
          metadata: {
            originalSizeMB,
            compressedSizeMB,
          },
        });

        if (processedFile.size > config.imageConfig.MAX_FILE_SIZE_BYTES) {
          alert(
            `画像が大きすぎます（${compressedSizeMB}MB）。別の画像を選択するか、画像を小さくしてから再度お試しください。`
          );
          return null;
        }

        return processedFile;
      } catch (error) {
        log.error("画像の圧縮に失敗しました", {
          context: "useImageCompression.compressImageFile",
          error,
        });
        const errorMessage = getUserFriendlyMessageJa(error);
        alert(
          `画像の圧縮に失敗しました: ${errorMessage}\n別の画像を選択してください。`
        );
        return null;
      } finally {
        setCompressing(false);
      }
    },
    []
  );

  return {
    compressing,
    compressImageFile,
  };
}
