/**
 * 画像圧縮ユーティリティ
 *
 * ブラウザ側で画像を圧縮・リサイズし、サーバー負荷を軽減
 * WebP形式を優先使用（JPEGより約25-35%小さい）
 */

import { config } from '../config';
import { isHeicFile, convertHeicToJpeg } from './heic';
import { supportsWebP, getFileSizeMB, createErrorMessage } from './utils';
import { loadImage } from './load';

export { getFileSizeMB } from './utils';

export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }

  if (isHeicFile(file)) {
    return true;
  }

  // 環境によってMIMEタイプが空の場合があるため拡張子でも判定
  if (!file.type || file.type === 'application/octet-stream') {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i;
    return imageExtensions.test(file.name);
  }

  return false;
}

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
  format?: 'webp' | 'jpeg';
}

/**
 * 画像を圧縮・リサイズ
 *
 * HEIC形式の場合は HEIC → JPEG → WebP と2段階変換
 * (heic2anyはWebPへの直接変換非対応のため)
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
    format = 'webp',
  } = options;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('画像圧縮はブラウザ環境でのみ実行できます');
  }

  if (!file.type.startsWith('image/') && !isHeicFile(file)) {
    throw new Error(`サポートされていないファイル形式です: ${file.type || '不明'}`);
  }

  if (file.size > config.imageConfig.MAX_INPUT_SIZE_BYTES) {
    throw new Error(`ファイルサイズが大きすぎます: ${getFileSizeMB(file.size).toFixed(2)}MB`);
  }

  // HEIC → JPEG変換（高品質0.92で2段階変換の画質劣化を最小化）
  let processedFile = file;
  if (isHeicFile(file)) {
    try {
      const jpegBlob = await convertHeicToJpeg(file);
      const jpegFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      processedFile = new File([jpegBlob], jpegFileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    } catch (error) {
      throw new Error(createErrorMessage('HEIC形式の変換に失敗しました', error));
    }
  }

  // WebP非対応ブラウザ（IE11など）はJPEGにフォールバック
  const useWebP = format === 'webp' && supportsWebP();
  const outputFormat = useWebP ? 'image/webp' : 'image/jpeg';
  const outputExtension = useWebP ? '.webp' : '.jpg';

  return loadImage(
    processedFile,
    maxWidth,
    maxHeight,
    outputFormat,
    quality,
    maxSizeMB,
    outputExtension
  );
}

export function needsCompression(
  file: File,
  maxSizeMB: number = config.imageConfig.COMPRESSION_TARGET_SIZE_MB
): boolean {
  return getFileSizeMB(file.size) > maxSizeMB;
}

export function isTooLarge(
  file: File,
  maxSizeMB: number = config.imageConfig.MAX_FILE_SIZE_MB
): boolean {
  return getFileSizeMB(file.size) > maxSizeMB;
}
