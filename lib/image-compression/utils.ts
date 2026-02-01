/**
 * 画像圧縮のユーティリティ関数
 */

import { log } from '../logger';

export function getFileSizeMB(sizeBytes: number): number {
  return sizeBytes / (1024 * 1024);
}

export function createErrorMessage(message: string, error: unknown): string {
  return `${message}: ${error instanceof Error ? error.message : String(error)}`;
}

/**
 * アスペクト比を保ちながらリサイズ後のサイズを計算
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

  const { width: newWidth, height: newHeight } = width > height
    ? {
      width: Math.min(width, maxWidth),
      height: Math.min(width, maxWidth) / aspectRatio,
    }
    : {
      width: Math.min(height, maxHeight) * aspectRatio,
      height: Math.min(height, maxHeight),
    };

  return { width: newWidth, height: newHeight };
}

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
 * WebP形式のサポート判定
 *
 * 1x1ピクセルのCanvasでWebP Data URLを生成して判定
 */
export function supportsWebP(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    // 非対応ブラウザでは'data:image/png'などにフォールバック
    return dataUrl.startsWith('data:image/webp');
  } catch (error) {
    log.warn('WebP形式のサポート確認に失敗しました', {
      context: 'supportsWebP',
      error,
    });
    return false;
  }
}
