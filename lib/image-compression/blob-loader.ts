/**
 * Blob URLを使用した画像読み込み処理
 *
 * 全ブラウザで動作する高い互換性を持つ方法
 */

import { getFileSizeMB, createErrorMessage } from './utils';
import { handleImageLoad, handleImageError } from './blob-handlers';
import { config } from '../config';

export function loadImageWithBlobURL(
  file: File,
  maxWidth: number,
  maxHeight: number,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  outputExtension: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    let blobUrl: string | null = null;

    try {
      blobUrl = URL.createObjectURL(file);
    } catch (error) {
      reject(new Error(createErrorMessage('Blob URLの作成に失敗しました', error)));
      return;
    }

    const img = new Image();

    const timeoutId = setTimeout(() => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      reject(
        new Error(
          `画像の読み込みがタイムアウトしました（${config.imageConfig.IMAGE_LOAD_TIMEOUT_MS / 1000}秒）。ファイルサイズが大きすぎる可能性があります（${getFileSizeMB(file.size).toFixed(2)}MB）。`
        )
      );
    }, config.imageConfig.IMAGE_LOAD_TIMEOUT_MS);

    img.onload = () => {
      handleImageLoad(
        img,
        file,
        blobUrl,
        timeoutId,
        maxWidth,
        maxHeight,
        outputFormat,
        quality,
        maxSizeMB,
        outputExtension,
        resolve,
        reject
      );
    };

    img.onerror = (event: Event | string) => {
      handleImageError(file, blobUrl, typeof event === 'string' ? null : event, timeoutId, reject);
    };

    try {
      img.src = blobUrl;
    } catch (error) {
      clearTimeout(timeoutId);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      reject(new Error(createErrorMessage('画像の読み込み開始に失敗しました', error)));
    }
  });
}
