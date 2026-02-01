/**
 * createImageBitmapを使用した画像読み込み処理
 *
 * 大ファイル（5MB以上）でメモリ効率が良い方法
 * 失敗時は自動的にBlob URLにフォールバック
 */

import { log } from '../logger';
import {
  calculateResizedDimensions,
  drawImageToCanvas,
  getFileSizeMB,
  createErrorMessage,
} from './utils';
import { compressCanvasToFile } from './canvas';
import { loadImageWithBlobURL } from './blob-loader';

export function loadImageWithImageBitmap(
  file: File,
  maxWidth: number,
  maxHeight: number,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  outputExtension: string
): Promise<File> {
  return window
    .createImageBitmap(file)
    .then((imageBitmap) => {
      try {
        if (imageBitmap.width === 0 || imageBitmap.height === 0) {
          throw new Error('画像のサイズが無効です');
        }

        const { width, height } = calculateResizedDimensions(
          imageBitmap.width,
          imageBitmap.height,
          maxWidth,
          maxHeight
        );

        const canvas = drawImageToCanvas(imageBitmap, width, height);

        // メモリリーク防止（ImageBitmapはGCされないため明示的に解放）
        imageBitmap.close();

        return compressCanvasToFile(canvas, outputFormat, quality, maxSizeMB, file.name, outputExtension);
      } catch (error) {
        throw new Error(createErrorMessage('画像処理中にエラーが発生しました', error));
      }
    })
    .catch((error) => {
      log.error('createImageBitmapエラー', {
        context: 'loadImageWithImageBitmap',
        error,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileSizeMB: getFileSizeMB(file.size).toFixed(2),
          fileType: file.type,
        },
      });
      // Blob URLにフォールバック
      return loadImageWithBlobURL(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
    });
}
