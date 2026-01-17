/**
 * 画像圧縮ユーティリティ
 *
 * スマホで撮影した大きな画像を、アップロード前に自動的に圧縮・リサイズします。
 * Canvas APIを使用してブラウザ側で処理を行います。
 * WebP形式で圧縮することで、JPEGよりも約25-35%小さなファイルサイズを実現します。
 * HEIC形式（iPhoneのデフォルト形式）にも対応しています。
 */

import { config } from './config';
import { isHeicFile, convertHeicToJpeg } from './image-compression-heic';
import { supportsWebP, getFileSizeMB, createErrorMessage } from './image-compression-utils';
import { loadImage } from './image-compression-load';

// 定数定義
const MAX_INPUT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * 画像ファイルかどうかを判定します（HEIC形式も含む）
 * iPhoneの写真など、file.typeが空の場合でもファイル拡張子で判定します
 * @param file ファイル
 * @returns 画像ファイルの場合true
 */
export function isImageFile(file: File): boolean {
  // ファイルタイプがimage/で始まる場合
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }

  // HEIC形式の場合
  if (isHeicFile(file)) {
    return true;
  }

  // ファイルタイプが空の場合、拡張子で判定
  if (!file.type || file.type === 'application/octet-stream') {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i;
    return imageExtensions.test(file.name);
  }

  return false;
}

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  maxSizeMB?: number; // 目標ファイルサイズ（MB）
  format?: 'webp' | 'jpeg'; // 出力形式
}

/**
 * 画像ファイルを圧縮・リサイズします
 * @param file 元の画像ファイル
 * @param options 圧縮オプション
 * @returns 圧縮された画像ファイル（WebP形式、サポートされていない場合はJPEG形式）
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
    format = 'webp', // デフォルトでWebP形式を使用
  } = options;

  // ブラウザ環境のチェック
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('画像圧縮はブラウザ環境でのみ実行できます');
  }

  // ファイル形式の検証
  if (!file.type.startsWith('image/') && !isHeicFile(file)) {
    throw new Error(`サポートされていないファイル形式です: ${file.type || '不明'}`);
  }

  // ファイルサイズの検証（大きすぎるファイルは処理を避ける）
  if (file.size > MAX_INPUT_SIZE_BYTES) {
    throw new Error(`ファイルサイズが大きすぎます: ${getFileSizeMB(file.size).toFixed(2)}MB`);
  }

  // HEIC形式の場合は、まずJPEGに変換
  // 注意: HEIC形式はブラウザで直接処理できないため、一度JPEGに変換する必要があります
  // heic2anyライブラリはHEIC → JPEG/PNGの変換のみサポートしており、
  // 直接WebPに変換することはできません
  // そのため、HEIC → JPEG（高品質）→ WebP（圧縮）という2段階の変換になります
  let processedFile = file;
  if (isHeicFile(file)) {
    try {
      // HEIC → JPEG変換（高品質0.92で変換して画質劣化を最小限に）
      const jpegBlob = await convertHeicToJpeg(file);
      // BlobをFileに変換（元のファイル名の拡張子を.jpgに変更）
      const jpegFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      processedFile = new File([jpegBlob], jpegFileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    } catch (error) {
      throw new Error(createErrorMessage('HEIC形式の変換に失敗しました', error));
    }
  }

  // WebP形式が指定されているが、ブラウザがサポートしていない場合はJPEGにフォールバック
  // HEIC形式の場合は、既にJPEGに変換されているので、そのままWebPに変換されます
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

/**
 * 画像ファイルが圧縮が必要かどうかを判定する関数
 *
 * ファイルサイズが目標サイズを超えている場合、圧縮が必要と判断します。
 *
 * @param file - 判定対象の画像ファイル
 * @param maxSizeMB - 最大ファイルサイズ（MB、デフォルト: config.imageConfig.COMPRESSION_TARGET_SIZE_MB）
 * @returns 圧縮が必要な場合 true
 */
export function needsCompression(
  file: File,
  maxSizeMB: number = config.imageConfig.COMPRESSION_TARGET_SIZE_MB
): boolean {
  return getFileSizeMB(file.size) > maxSizeMB;
}

/**
 * 画像ファイルが大きすぎるかどうかを判定する関数（圧縮を強制する閾値）
 *
 * ファイルサイズが最大許容サイズを超えている場合、大きすぎると判断します。
 * この関数は、圧縮後でもサイズ制限を超える可能性があるファイルを検出するために使用します。
 *
 * @param file - 判定対象の画像ファイル
 * @param maxSizeMB - 最大ファイルサイズ（MB、デフォルト: config.imageConfig.MAX_FILE_SIZE_MB）
 * @returns 大きすぎる場合 true
 */
export function isTooLarge(
  file: File,
  maxSizeMB: number = config.imageConfig.MAX_FILE_SIZE_MB
): boolean {
  return getFileSizeMB(file.size) > maxSizeMB;
}
