/**
 * Canvas圧縮処理
 *
 * Canvasを圧縮してFileに変換する機能を提供します。
 */

import { getFileSizeMB } from './utils';

// 定数定義
const MIN_COMPRESSION_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

/**
 * Canvasを圧縮してFileに変換するヘルパー関数
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
