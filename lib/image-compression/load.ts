/**
 * 画像読み込み処理の統合
 *
 * ファイルサイズとブラウザのサポート状況に応じて、最適な画像読み込み方法を選択します。
 * 小さいファイルはBlob URLで、大きいファイルはImageBitmapで処理することで、
 * パフォーマンスとメモリ効率を最適化します。
 *
 * 主な機能:
 * - ファイルサイズに応じた読み込み方法の自動選択
 * - createImageBitmap APIのサポート確認
 * - 画像の圧縮・リサイズ処理の統合
 *
 * 読み込み方法の選択基準:
 * - **小さいファイル（5MB未満）**: Blob URL + HTMLImageElement
 *   - シンプルで互換性が高い
 *   - 古いブラウザでも動作する
 * - **大きいファイル（5MB以上）**: createImageBitmap
 *   - メモリ効率が良い
 *   - オフスクリーンでの処理が可能
 *   - ただし、古いブラウザでは非対応
 *
 * 実装の理由:
 * - **ファイルサイズで判定**: 大きいファイルほどImageBitmapのメリットが大きい
 * - **ブラウザサポートチェック**: createImageBitmap非対応の場合は自動的にBlob URLにフォールバック
 * - **閾値5MB**: 経験的にこのサイズ以上でImageBitmapの効果が顕著
 *
 * ブラウザサポート:
 * - **Blob URL**: すべてのモダンブラウザでサポート
 * - **createImageBitmap**: Chrome 50+, Firefox 42+, Safari 15+
 *
 * 注意点:
 * - サーバー側レンダリング（window未定義）では動作しない
 * - createImageBitmap非対応ブラウザは自動的にBlob URLにフォールバック
 */

import { loadImageWithBlobURL } from './blob-loader';
import { loadImageWithImageBitmap } from './bitmap-loader';
import { config } from '../config';

/**
 * ファイルサイズに応じて適切な読み込み方法を選択します
 *
 * ファイルサイズが5MB以上で、かつブラウザがcreateImageBitmapをサポートしている場合は
 * ImageBitmapを使用し、それ以外はBlob URLを使用します。
 *
 * @param file - 読み込む画像ファイル
 * @param maxWidth - 最大幅（ピクセル）
 * @param maxHeight - 最大高さ（ピクセル）
 * @param outputFormat - 出力形式（'image/webp' または 'image/jpeg'）
 * @param quality - 圧縮品質（0.0 - 1.0）
 * @param maxSizeMB - 目標ファイルサイズ（MB）
 * @param outputExtension - 出力ファイルの拡張子（'.webp' または '.jpg'）
 * @returns 圧縮・リサイズされた画像ファイル
 *
 * 選択ロジック:
 * 1. **ブラウザ環境チェック**: window が定義されているか
 * 2. **createImageBitmapサポートチェック**: window.createImageBitmap が存在するか
 * 3. **ファイルサイズチェック**: 5MB（5242880バイト）を超えるか
 *
 * 実装の理由:
 * - **閾値5MB**: 小さいファイルはBlob URLで十分、大きいファイルでImageBitmapの利点が顕著
 * - **3つの条件すべて**: 安全性と互換性を確保するため、すべての条件を満たす必要がある
 *
 * トレードオフ:
 * - **ImageBitmap（大ファイル用）**: メモリ効率は良いが、古いブラウザでは非対応
 * - **Blob URL（小ファイル用）**: 互換性は高いが、大きいファイルでメモリを多く消費
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
  // createImageBitmap を使用する条件:
  // 1. ブラウザ環境である（window が定義されている）
  // 2. createImageBitmap APIがサポートされている
  // 3. ファイルサイズが閾値（5MB）を超えている
  const useCreateImageBitmap =
    typeof window !== 'undefined' &&
    typeof window.createImageBitmap !== 'undefined' &&
    file.size > config.imageConfig.CREATE_IMAGE_BITMAP_THRESHOLD_BYTES;

  if (useCreateImageBitmap) {
    // 大きいファイル（5MB以上）: createImageBitmapで効率的に処理
    return loadImageWithImageBitmap(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
  } else {
    // 小さいファイル（5MB未満）: Blob URLでシンプルに処理
    // または createImageBitmap 非対応ブラウザ
    return loadImageWithBlobURL(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
  }
}
