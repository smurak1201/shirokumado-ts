/**
 * 画像読み込みエラーハンドリング
 */

import { log } from '../logger';
import { getFileSizeMB } from './utils';
import { config } from '../config';

export function createImageLoadErrorMessage(file: File): string {
  const fileSizeMB = getFileSizeMB(file.size);

  if (fileSizeMB > config.imageConfig.RECOMMENDED_FILE_SIZE_MB) {
    return `画像の読み込みに失敗しました。ファイルサイズが大きすぎる可能性があります（${fileSizeMB.toFixed(2)}MB）。推奨サイズは${config.imageConfig.RECOMMENDED_FILE_SIZE_MB}MB以下です。別の画像を選択するか、画像を小さくしてから再度お試しください。`;
  } else {
    return `画像の読み込みに失敗しました。ファイル形式（${file.type || '不明'}）がサポートされていない可能性があります。`;
  }
}

export function logImageLoadError(
  file: File,
  blobUrl: string | null,
  event: Event | null
): void {
  const fileSizeMB = getFileSizeMB(file.size);
  log.error('画像読み込みエラー', {
    context: 'logImageLoadError',
    error: event instanceof ErrorEvent ? event.error : new Error('画像読み込みに失敗しました'),
    metadata: {
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size,
      fileSizeMB: fileSizeMB.toFixed(2),
      blobUrl: blobUrl ? '作成済み' : '作成失敗',
    },
  });
}
