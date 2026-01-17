/**
 * createImageBitmapを使用した画像読み込み処理
 *
 * createImageBitmapを使用して画像を読み込む機能を提供します。
 */

import {
  calculateResizedDimensions,
  drawImageToCanvas,
  getFileSizeMB,
  createErrorMessage,
} from './image-compression-utils';
import { compressCanvasToFile } from './image-compression-canvas';
import { loadImageWithBlobURL } from './image-compression-blob-loader';

/**
 * createImageBitmapを使用して画像を読み込むヘルパー関数
 */
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
        imageBitmap.close();

        return compressCanvasToFile(canvas, outputFormat, quality, maxSizeMB, file.name, outputExtension);
      } catch (error) {
        throw new Error(createErrorMessage('画像処理中にエラーが発生しました', error));
      }
    })
    .catch((error) => {
      console.error('createImageBitmapエラー:', {
        error,
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: getFileSizeMB(file.size).toFixed(2),
        fileType: file.type,
      });
      return loadImageWithBlobURL(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
    });
}
