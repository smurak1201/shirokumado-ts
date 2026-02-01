/**
 * Canvas圧縮処理
 *
 * 段階的に品質を下げて目標ファイルサイズを達成
 * 品質下限0.5（これ以上下げると画質が著しく劣化）
 */

import { getFileSizeMB } from './utils';

const MIN_COMPRESSION_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

/**
 * Canvasを圧縮してFileに変換
 *
 * 目標サイズを超える場合、品質を0.1ずつ下げて再圧縮
 */
export function compressCanvasToFile(
  canvas: HTMLCanvasElement,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  originalFileName: string,
  outputExtension: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    const compressWithQuality = (q: number): Promise<File> => {
      return new Promise((resolveCompress, rejectCompress) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              rejectCompress(new Error(`画像の圧縮に失敗しました（品質: ${q}）`));
              return;
            }

            const sizeMB = getFileSizeMB(blob.size);

            // サイズ超過 && 品質下げる余地あり → 再圧縮
            if (sizeMB > maxSizeMB && q > MIN_COMPRESSION_QUALITY) {
              resolveCompress(compressWithQuality(Math.max(q - QUALITY_STEP, MIN_COMPRESSION_QUALITY)));
            } else {
              const compressedFile = new File(
                [blob],
                originalFileName.replace(/\.[^/.]+$/, outputExtension),
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

    compressWithQuality(quality).then(resolve).catch(reject);
  });
}
