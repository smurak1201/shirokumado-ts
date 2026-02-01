/**
 * createImageBitmapを使用した画像読み込み処理
 *
 * createImageBitmap APIを使用して画像を効率的に読み込む機能を提供します。
 * 大きいファイル（5MB以上）でメモリ効率が良く、オフスクリーンでの処理が可能です。
 *
 * 主な機能:
 * - createImageBitmapによる高速な画像読み込み
 * - メモリ効率の良い処理
 * - エラー時のフォールバック（Blob URLに自動切り替え）
 *
 * 実装の理由:
 * - **メモリ効率**: HTMLImageElementより少ないメモリで大きい画像を処理
 * - **オフスクリーン処理**: メインスレッドをブロックせずに処理
 * - **高速**: ブラウザネイティブのAPIで最適化された処理
 *
 * createImageBitmapの利点:
 * - デコード処理がオフスレッドで実行される
 * - メモリ使用量が少ない（HTMLImageElementの約半分）
 * - Worker内でも使用可能
 *
 * 処理の流れ:
 * 1. **createImageBitmap**: ファイルから直接ImageBitmapを生成
 * 2. **サイズ検証**: 幅・高さが有効かチェック
 * 3. **リサイズ計算**: calculateResizedDimensions()で新しいサイズを計算
 * 4. **Canvas描画**: drawImageToCanvas()でImageBitmapをCanvasに描画
 * 5. **メモリ解放**: imageBitmap.close()でメモリを解放
 * 6. **圧縮**: compressCanvasToFile()でCanvas → Fileに変換
 *
 * フォールバック:
 * - createImageBitmap失敗時は自動的にBlob URLにフォールバック
 * - 古いブラウザや非対応形式でも動作を保証
 *
 * ブラウザサポート:
 * - Chrome 50+, Firefox 42+, Safari 15+
 * - IE11: 非対応（自動的にBlob URLにフォールバック）
 *
 * 注意点:
 * - 古いブラウザでは非対応のため、必ずフォールバックを実装
 * - ImageBitmapは明示的にclose()を呼ぶ必要がある（メモリリーク防止）
 * - SVGなど一部の形式では非対応の場合がある
 *
 * トレードオフ:
 * - **メモリ効率優先**: 大ファイルには最適だが、小ファイルでは Blob URL より遅い
 * - **互換性**: 最新ブラウザ専用だが、フォールバックで古いブラウザにも対応
 */

import { log } from '../logger';
import {
  calculateResizedDimensions,
  drawImageToCanvas,
  getFileSizeMB,
  createErrorMessage,
} from './utils';
import { compressCanvasToFile } from './canvas';
import { loadImageWithBlobURL } from './blob-loader';

/**
 * createImageBitmapを使用して画像を読み込むヘルパー関数
 *
 * createImageBitmap APIでファイルから直接ImageBitmapを生成し、
 * リサイズ・圧縮を行います。失敗時は自動的にBlob URLにフォールバックします。
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
 * 処理の流れ:
 * 1. **ImageBitmap生成**: window.createImageBitmap()でファイルから直接生成
 * 2. **サイズ検証**: 幅・高さが0でないことを確認
 * 3. **リサイズ計算**: アスペクト比を保ちながら新しいサイズを計算
 * 4. **Canvas描画**: ImageBitmapをCanvasに描画
 * 5. **メモリ解放**: imageBitmap.close()で即座にメモリを解放
 * 6. **圧縮**: Canvas → Fileに変換
 *
 * エラーハンドリング:
 * - createImageBitmap失敗時: Blob URLにフォールバック
 * - サイズ無効時: エラーをスロー
 * - その他のエラー: 詳細ログを出力してBlob URLにフォールバック
 *
 * 実装の理由:
 * - **自動フォールバック**: エラー時も確実に動作
 * - **メモリ解放**: close()でImageBitmapを即座に解放
 * - **詳細ログ**: エラー原因の特定を容易にする
 *
 * 注意点:
 * - ImageBitmapはclose()を呼ばないとメモリリークの原因になる
 * - catch句でBlob URLにフォールバックするため、ほぼ確実に成功する
 */
export function loadImageWithImageBitmap(
  file: File,
  maxWidth: number,
  maxHeight: number,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  outputExtension: string
): Promise<File> {
  return window
    .createImageBitmap(file)
    .then((imageBitmap) => {
      try {
        // サイズ検証: 幅・高さが0の場合はエラー
        // 理由: 無効な画像データの場合、後続の処理でエラーになる
        if (imageBitmap.width === 0 || imageBitmap.height === 0) {
          throw new Error('画像のサイズが無効です');
        }

        // アスペクト比を保ちながらリサイズ後のサイズを計算
        const { width, height } = calculateResizedDimensions(
          imageBitmap.width,
          imageBitmap.height,
          maxWidth,
          maxHeight
        );

        // ImageBitmapをCanvasに描画（リサイズ）
        const canvas = drawImageToCanvas(imageBitmap, width, height);

        // ImageBitmapを即座に解放（メモリリーク防止）
        // 理由: ImageBitmapはガベージコレクションされないため、明示的に解放が必要
        imageBitmap.close();

        // CanvasをFile形式に圧縮・変換
        return compressCanvasToFile(canvas, outputFormat, quality, maxSizeMB, file.name, outputExtension);
      } catch (error) {
        throw new Error(createErrorMessage('画像処理中にエラーが発生しました', error));
      }
    })
    .catch((error) => {
      // createImageBitmap失敗時: 詳細ログを出力してBlob URLにフォールバック
      // 理由: 古いブラウザや非対応形式でも動作を保証
      log.error('createImageBitmapエラー', {
        context: 'loadImageWithImageBitmap',
        error,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileSizeMB: getFileSizeMB(file.size).toFixed(2),
          fileType: file.type,
        },
      });
      // Blob URLによる読み込みにフォールバック（互換性を確保）
      return loadImageWithBlobURL(file, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension);
    });
}
