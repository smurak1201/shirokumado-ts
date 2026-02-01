/**
 * Blob URL画像読み込みのイベントハンドラー
 */

import { log } from '../logger';
import {
  calculateResizedDimensions,
  drawImageToCanvas,
  getFileSizeMB,
  createErrorMessage,
} from './utils';
import { compressCanvasToFile } from './canvas';
import {
  createImageLoadErrorMessage,
  logImageLoadError,
} from './errors';

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

    log.debug('画像読み込み成功', {
      context: 'handleImageLoad',
      metadata: {
        dimensions: `${img.width}x${img.height}`,
        fileSizeMB: getFileSizeMB(file.size).toFixed(2),
      },
    });

    const { width, height } = calculateResizedDimensions(img.width, img.height, maxWidth, maxHeight);

    if (width !== img.width || height !== img.height) {
      log.debug('画像をリサイズ', {
        context: 'handleImageLoad',
        metadata: {
          originalDimensions: `${img.width}x${img.height}`,
          resizedDimensions: `${width}x${height}`,
        },
      });
    }

    const canvas = drawImageToCanvas(img, width, height);

    compressCanvasToFile(canvas, outputFormat, quality, maxSizeMB, file.name, outputExtension)
      .then(resolve)
      .catch(reject);
  } catch (error) {
    reject(new Error(createErrorMessage('画像処理中にエラーが発生しました', error)));
  }
}

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

  reject(new Error(createImageLoadErrorMessage(file)));
}
