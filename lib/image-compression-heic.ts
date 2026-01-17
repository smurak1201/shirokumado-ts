/**
 * HEIC形式の画像変換ユーティリティ
 *
 * HEIC形式（iPhoneのデフォルト形式）をJPEGに変換する機能を提供します。
 */

// heic2anyを動的インポート（コード分割のため）
// @ts-ignore - heic2anyには型定義がないため
let heic2any: any = null;

/**
 * heic2anyライブラリを取得します
 */
async function _getHeic2Any() {
  if (!heic2any && typeof window !== 'undefined') {
    try {
      // @ts-ignore - heic2anyには型定義がないため
      const heic2anyModule = await import('heic2any');
      heic2any = heic2anyModule.default || heic2anyModule;
    } catch (error) {
      console.warn('heic2anyの読み込みに失敗しました:', error);
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
  const heic2anyLib = await _getHeic2Any();
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
