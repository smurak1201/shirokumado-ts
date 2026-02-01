/**
 * HEIC形式の画像変換ユーティリティ
 *
 * HEIC形式（iPhoneのデフォルト形式）をJPEG形式に変換
 * heic2anyライブラリを動的インポート（HEIC使用時のみ読み込み）
 */

import { log } from '../logger';

// heic2anyを動的インポート（コード分割）
let heic2any: ((options: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]>) | null = null;

async function getHeic2Any() {
  if (!heic2any && typeof window !== 'undefined') {
    try {
      const heic2anyModule = await import('heic2any');
      heic2any = heic2anyModule.default || heic2anyModule;
    } catch (error) {
      log.warn('heic2anyの読み込みに失敗しました', {
        context: 'getHeic2Any',
        error,
      });
    }
  }
  return heic2any;
}

export function isHeicFile(file: File): boolean {
  const heicTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
  // 環境によってMIMEタイプが空の場合があるため拡張子でも判定
  return heicTypes.includes(file.type.toLowerCase()) ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);
}

/**
 * HEIC → JPEG変換
 *
 * 品質0.92で変換（次のWebP変換でさらに圧縮されるため高品質を維持）
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
  const heic2anyLib = await getHeic2Any();
  if (!heic2anyLib) {
    throw new Error('HEIC形式の変換ライブラリが読み込めませんでした');
  }

  try {
    const result = await heic2anyLib({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92, // 2段階変換の画質劣化を最小化
    });

    // heic2anyは配列を返すことがある（Live Photosなど）
    const blob = Array.isArray(result) ? result[0] : result;
    if (!(blob instanceof Blob)) {
      throw new Error('HEIC変換の結果が無効です');
    }

    return blob;
  } catch (error) {
    throw new Error(`HEIC形式の変換に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}
