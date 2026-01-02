/**
 * 画像圧縮ユーティリティ
 *
 * スマホで撮影した大きな画像を、アップロード前に自動的に圧縮・リサイズします。
 * Canvas APIを使用してブラウザ側で処理を行います。
 * WebP形式で圧縮することで、JPEGよりも約25-35%小さなファイルサイズを実現します。
 */

import { imageConfig } from './config';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  maxSizeMB?: number; // 目標ファイルサイズ（MB）
  format?: 'webp' | 'jpeg'; // 出力形式
}

/**
 * WebP形式がサポートされているかどうかを判定します
 * @returns WebPがサポートされている場合true
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * 画像ファイルを圧縮・リサイズします
 * @param file 元の画像ファイル
 * @param options 圧縮オプション
 * @returns 圧縮された画像ファイル（WebP形式、サポートされていない場合はJPEG形式）
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = imageConfig.maxWidth,
    maxHeight = imageConfig.maxHeight,
    quality = imageConfig.compressionQuality,
    maxSizeMB = imageConfig.compressionTargetSizeMB,
    format = 'webp', // デフォルトでWebP形式を使用
  } = options;

  // WebP形式が指定されているが、ブラウザがサポートしていない場合はJPEGにフォールバック
  const useWebP = format === 'webp' && supportsWebP();
  const outputFormat = useWebP ? 'image/webp' : 'image/jpeg';
  const outputExtension = useWebP ? '.webp' : '.jpg';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 画像のサイズを計算
        let width = img.width;
        let height = img.height;

        // アスペクト比を保ちながらリサイズ
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }

        // Canvasを作成して画像を描画
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context could not be created"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // WebP形式（またはJPEG形式）で圧縮（品質を段階的に下げながら目標サイズに近づける）
        const compressWithQuality = (q: number): Promise<File> => {
          return new Promise((resolveCompress) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to compress image"));
                  return;
                }

                const sizeMB = blob.size / (1024 * 1024);
                // 目標サイズより大きい場合、品質を下げて再試行
                if (
                  sizeMB > maxSizeMB &&
                  q > imageConfig.minCompressionQuality
                ) {
                  resolveCompress(
                    compressWithQuality(
                      Math.max(
                        q - imageConfig.compressionQualityStep,
                        imageConfig.minCompressionQuality
                      )
                    )
                  );
                } else {
                  const compressedFile = new File(
                    [blob],
                    file.name.replace(/\.[^/.]+$/, outputExtension),
                    {
                      type: outputFormat,
                      lastModified: Date.now(),
                    }
                  );
                  resolveCompress(compressedFile);
                }
              },
              outputFormat,
              q
            );
          });
        };

        compressWithQuality(quality)
          .then((compressedFile) => {
            resolve(compressedFile);
          })
          .catch(reject);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 画像ファイルが圧縮が必要かどうかを判定します
 * @param file 画像ファイル
 * @param maxSizeMB 最大ファイルサイズ（MB）
 * @returns 圧縮が必要な場合true
 */
export function needsCompression(
  file: File,
  maxSizeMB: number = imageConfig.compressionTargetSizeMB
): boolean {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > maxSizeMB;
}

/**
 * 画像ファイルが大きすぎるかどうかを判定します（圧縮を強制する閾値）
 * @param file 画像ファイル
 * @param maxSizeMB 最大ファイルサイズ（MB）
 * @returns 大きすぎる場合true
 */
export function isTooLarge(
  file: File,
  maxSizeMB: number = imageConfig.maxFileSizeMB
): boolean {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > maxSizeMB;
}
