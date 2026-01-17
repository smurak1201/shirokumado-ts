/**
 * Blob URL画像読み込みのイベントハンドラー
 *
 * Blob URLを使用した画像読み込み時のイベント処理を提供します。
 */

import {
  calculateResizedDimensions,
  drawImageToCanvas,
  getFileSizeMB,
  createErrorMessage,
} from './image-compression-utils';
import { compressCanvasToFile } from './image-compression-canvas';
import {
  createImageLoadErrorMessage,
  logImageLoadError,
} from './image-compression-errors';

/**
 * 画像読み込み成功時の処理
 */
export function handleImageLoad(
  img: HTMLImageElement,
  file: File,
  blobUrl: string | null,
  timeoutId: NodeJS.Timeout,
  maxWidth: number,
  maxHeight: number,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  outputExtension: string,
  resolve: (file: File) => void,
  reject: (error: Error) => void
): void {
  clearTimeout(timeoutId);
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }

  try {
    if (img.width === 0 || img.height === 0) {
      reject(new Error('画像のサイズが無効です'));
      return;
    }

    console.log(`画像読み込み成功: ${img.width}x${img.height}, ファイルサイズ: ${getFileSizeMB(file.size).toFixed(2)}MB`);

    const { width, height } = calculateResizedDimensions(img.width, img.height, maxWidth, maxHeight);
    if (width !== img.width || height !== img.height) {
      console.log(`リサイズ: ${width}x${height}`);
    }

    const canvas = drawImageToCanvas(img, width, height);
    compressCanvasToFile(canvas, outputFormat, quality, maxSizeMB, file.name, outputExtension)
      .then(resolve)
      .catch(reject);
  } catch (error) {
    reject(new Error(createErrorMessage('画像処理中にエラーが発生しました', error)));
  }
}

/**
 * 画像読み込みエラー時の処理
 */
export function handleImageError(
  file: File,
  blobUrl: string | null,
  event: Event | null,
  timeoutId: NodeJS.Timeout,
  reject: (error: Error) => void
): void {
  clearTimeout(timeoutId);
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
  logImageLoadError(file, blobUrl, event);
  reject(new Error(createImageLoadErrorMessage(file, event)));
}
