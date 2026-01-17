/**
 * 画像読み込み処理の統合
 *
 * ファイルサイズに応じて適切な読み込み方法を選択します。
 */

import { loadImageWithBlobURL } from './image-compression-blob-loader';
import { loadImageWithImageBitmap } from './image-compression-bitmap-loader';

const CREATE_IMAGE_BITMAP_THRESHOLD_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * ファイルサイズに応じて適切な読み込み方法を選択します
 */
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
    file.size > CREATE_IMAGE_BITMAP_THRESHOLD_BYTES;

  if (useCreateImageBitmap) {
    return loadImageWithImageBitmap(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
  } else {
    return loadImageWithBlobURL(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
  }
}
