/**
 * 画像圧縮ユーティリティ
 *
 * スマホで撮影した大きな画像を、アップロード前に自動的に圧縮・リサイズします。
 * Canvas APIを使用してブラウザ側で処理を行います。
 * WebP形式で圧縮することで、JPEGよりも約25-35%小さなファイルサイズを実現します。
 */

import { config } from './config';

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
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    return dataUrl.indexOf('data:image/webp') === 0;
  } catch (error) {
    console.warn('WebP形式のサポート確認に失敗しました:', error);
    return false;
  }
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
    maxWidth = config.imageConfig.MAX_IMAGE_WIDTH,
    maxHeight = config.imageConfig.MAX_IMAGE_HEIGHT,
    quality = config.imageConfig.COMPRESSION_QUALITY,
    maxSizeMB = config.imageConfig.COMPRESSION_TARGET_SIZE_MB,
    format = 'webp', // デフォルトでWebP形式を使用
  } = options;

  // WebP形式が指定されているが、ブラウザがサポートしていない場合はJPEGにフォールバック
  const useWebP = format === 'webp' && supportsWebP();
  const outputFormat = useWebP ? 'image/webp' : 'image/jpeg';
  const outputExtension = useWebP ? '.webp' : '.jpg';

  return new Promise((resolve, reject) => {
    // ブラウザ環境のチェック
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('画像圧縮はブラウザ環境でのみ実行できます'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('ファイルの読み込みに失敗しました'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          // 画像のサイズを計算
          let width = img.width;
          let height = img.height;

          // 画像サイズが0の場合はエラー
          if (width === 0 || height === 0) {
            reject(new Error('画像のサイズが無効です'));
            return;
          }

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

          // 画像を描画
          ctx.drawImage(img, 0, 0, width, height);

          // WebP形式（またはJPEG形式）で圧縮（品質を段階的に下げながら目標サイズに近づける）
          const compressWithQuality = (q: number): Promise<File> => {
            return new Promise((resolveCompress, rejectCompress) => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    rejectCompress(new Error(`画像の圧縮に失敗しました（品質: ${q}）`));
                    return;
                  }

                  const sizeMB = blob.size / (1024 * 1024);
                  // 目標サイズより大きい場合、品質を下げて再試行
                  // 最小品質は 0.5 に設定（それ以下だと画質が著しく低下するため）
                  const MIN_QUALITY = 0.5;
                  const QUALITY_STEP = 0.1; // 品質を下げる際のステップ
                  if (sizeMB > maxSizeMB && q > MIN_QUALITY) {
                    resolveCompress(
                      compressWithQuality(
                        Math.max(q - QUALITY_STEP, MIN_QUALITY)
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
        } catch (error) {
          reject(new Error(`画像処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`));
        }
      };
      img.onerror = (error) => {
        reject(new Error(`画像の読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`));
      };
      img.src = e.target.result as string;
    };
    reader.onerror = (error) => {
      reject(new Error(`ファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`));
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
/**
 * 画像ファイルが圧縮が必要かどうかを判定する関数
 *
 * ファイルサイズが目標サイズを超えている場合、圧縮が必要と判断します。
 *
 * @param file - 判定対象の画像ファイル
 * @param maxSizeMB - 最大ファイルサイズ（MB、デフォルト: config.imageConfig.COMPRESSION_TARGET_SIZE_MB）
 * @returns 圧縮が必要な場合 true
 */
export function needsCompression(
  file: File,
  maxSizeMB: number = config.imageConfig.COMPRESSION_TARGET_SIZE_MB
): boolean {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > maxSizeMB;
}

/**
 * 画像ファイルが大きすぎるかどうかを判定する関数（圧縮を強制する閾値）
 *
 * ファイルサイズが最大許容サイズを超えている場合、大きすぎると判断します。
 * この関数は、圧縮後でもサイズ制限を超える可能性があるファイルを検出するために使用します。
 *
 * @param file - 判定対象の画像ファイル
 * @param maxSizeMB - 最大ファイルサイズ（MB、デフォルト: config.imageConfig.MAX_FILE_SIZE_MB）
 * @returns 大きすぎる場合 true
 */
export function isTooLarge(
  file: File,
  maxSizeMB: number = config.imageConfig.MAX_FILE_SIZE_MB
): boolean {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > maxSizeMB;
}
