/**
 * HEIC形式の画像変換ユーティリティ
 *
 * HEIC形式（iPhoneのデフォルト形式）をJPEG/PNG形式に変換する機能を提供します。
 * ブラウザはHEIC形式を直接処理できないため、heic2anyライブラリを使用して変換します。
 *
 * 主な機能:
 * - HEIC形式のファイル判定（拡張子とMIMEタイプの両方で判定）
 * - HEIC → JPEG 変換（高品質0.92で変換）
 * - 動的インポートによるコード分割（HEIC使用時のみライブラリを読み込み）
 *
 * 実装の理由:
 * - **iPhoneユーザー対応**: iPhoneで撮影した写真はデフォルトでHEIC形式
 * - **ブラウザ非対応**: ブラウザのCanvas APIではHEICを直接処理できない
 * - **動的インポート**: heic2anyは約200KBのライブラリのため、必要時のみ読み込み
 * - **高品質変換（0.92）**: 2段階変換（HEIC → JPEG → WebP）の画質劣化を最小限に抑える
 *
 * 使用ライブラリ:
 * - heic2any: HEIC → JPEG/PNG 変換ライブラリ
 *   - GitHub: https://github.com/alexcorvi/heic2any
 *   - ブラウザ側で動作（WebAssembly使用）
 *
 * 注意点:
 * - HEIC形式の変換は時間がかかる（1-3秒程度）
 * - heic2anyライブラリはWebPへの直接変換をサポートしていない
 * - 変換結果は配列で返される場合があるため、最初の要素を取得
 *
 * パフォーマンス最適化:
 * - 動的インポート: HEIC使用時のみheic2anyを読み込み、初期バンドルサイズを削減
 * - 遅延インポート: import()を使用してコード分割を実現
 *
 * トレードオフ:
 * - **変換品質0.92**: 高品質を維持するが、ファイルサイズは大きめ
 *   - 代替案: 0.85など低品質にすればファイルサイズは小さいが、2段階変換で画質劣化が目立つ
 */

import { log } from '../logger';

// heic2anyを動的インポート（コード分割のため）
// 理由: heic2anyは約200KBのライブラリで、HEIC形式のファイルを扱う時のみ必要
// 初期バンドルサイズを削減し、ページ読み込みを高速化
let heic2any: ((options: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]>) | null = null;

/**
 * heic2anyライブラリを取得します
 */
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

/**
 * HEIC形式のファイルかどうかを判定します
 * @param file 画像ファイル
 * @returns HEIC形式の場合true
 */
export function isHeicFile(file: File): boolean {
  const heicTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
  return heicTypes.includes(file.type.toLowerCase()) ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);
}

/**
 * HEIC形式のファイルをJPEGに変換します
 * @param file HEIC形式のファイル
 * @returns JPEG形式のBlob
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
      quality: 0.92, // 高品質を維持
    });

    // heic2anyは配列を返すことがあるので、最初の要素を取得
    const blob = Array.isArray(result) ? result[0] : result;
    if (!(blob instanceof Blob)) {
      throw new Error('HEIC変換の結果が無効です');
    }

    return blob;
  } catch (error) {
    throw new Error(`HEIC形式の変換に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}
