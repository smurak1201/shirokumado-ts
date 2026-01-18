/**
 * 画像圧縮のユーティリティ関数
 *
 * 画像圧縮処理で使用する共通のユーティリティ関数を提供します。
 */

import { log } from './logger';

/**
 * ファイルサイズをMB単位で取得します
 */
export function getFileSizeMB(sizeBytes: number): number {
  return sizeBytes / (1024 * 1024);
}

/**
 * エラーメッセージを生成します
 */
export function createErrorMessage(message: string, error: unknown): string {
  return `${message}: ${error instanceof Error ? error.message : String(error)}`;
}

/**
 * アスペクト比を保ちながらリサイズ後のサイズを計算します
 */
export function calculateResizedDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const aspectRatio = width / height;
  let newWidth = width;
  let newHeight = height;

  if (width > height) {
    newWidth = Math.min(width, maxWidth);
    newHeight = newWidth / aspectRatio;
  } else {
    newHeight = Math.min(height, maxHeight);
    newWidth = newHeight * aspectRatio;
  }

  return { width: newWidth, height: newHeight };
}

/**
 * Canvasに画像を描画します
 */
export function drawImageToCanvas(
  imageSource: ImageBitmap | HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas contextの作成に失敗しました');
  }
  ctx.drawImage(imageSource, 0, 0, width, height);
  return canvas;
}

/**
 * WebP形式がサポートされているかどうかを判定します
 * @returns WebPがサポートされている場合true
 */
export function supportsWebP(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    return dataUrl.startsWith('data:image/webp');
  } catch (error) {
    log.warn('WebP形式のサポート確認に失敗しました', {
      context: 'supportsWebP',
      error,
    });
    return false;
  }
}
