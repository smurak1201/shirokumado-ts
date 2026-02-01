/**
 * 画像読み込み処理の統合
 *
 * ファイルサイズに応じて最適な読み込み方法を選択:
 * - 小ファイル（5MB未満）: Blob URL（互換性高い）
 * - 大ファイル（5MB以上）: createImageBitmap（メモリ効率良い）
 */

import { loadImageWithBlobURL } from './blob-loader';
import { loadImageWithImageBitmap } from './bitmap-loader';
import { config } from '../config';

export function loadImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  outputExtension: string
): Promise<File> {
  const useCreateImageBitmap =
    typeof window !== 'undefined' &&
    typeof window.createImageBitmap !== 'undefined' &&
    file.size > config.imageConfig.CREATE_IMAGE_BITMAP_THRESHOLD_BYTES;

  if (useCreateImageBitmap) {
    return loadImageWithImageBitmap(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
  } else {
    return loadImageWithBlobURL(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
  }
}
