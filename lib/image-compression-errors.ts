/**
 * 画像読み込みエラーハンドリング
 *
 * 画像読み込み時のエラーメッセージ生成を提供します。
 */

import { getFileSizeMB } from './image-compression-utils';

const RECOMMENDED_FILE_SIZE_MB = 10;

/**
 * 画像読み込みエラーメッセージを生成します
 */
export function createImageLoadErrorMessage(
  file: File,
  event: Event | null
): string {
  const fileSizeMB = getFileSizeMB(file.size);

  if (fileSizeMB > RECOMMENDED_FILE_SIZE_MB) {
    return `画像の読み込みに失敗しました。ファイルサイズが大きすぎる可能性があります（${fileSizeMB.toFixed(2)}MB）。推奨サイズは${RECOMMENDED_FILE_SIZE_MB}MB以下です。別の画像を選択するか、画像を小さくしてから再度お試しください。`;
  } else {
    return `画像の読み込みに失敗しました。ファイル形式（${file.type || '不明'}）がサポートされていない可能性があります。`;
  }
}

/**
 * 画像読み込みエラーの詳細ログを出力します
 */
export function logImageLoadError(
  file: File,
  blobUrl: string | null,
  event: Event | null
): void {
  const fileSizeMB = getFileSizeMB(file.size);
  console.error('画像読み込みエラー:', {
    fileType: file.type,
    fileName: file.name,
    fileSize: file.size,
    fileSizeMB: fileSizeMB.toFixed(2),
    blobUrl: blobUrl ? '作成済み' : '作成失敗',
    event: event,
    error: event instanceof ErrorEvent ? event.error : null,
  });
}
