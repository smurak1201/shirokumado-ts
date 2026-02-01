/**
 * Blob URL画像読み込みのイベントハンドラー
 *
 * Blob URLを使用した画像読み込み時のonloadとonerrorイベント処理を提供します。
 * 読み込み成功時はリサイズ・圧縮を実行し、失敗時はエラーログと適切なエラーメッセージを返します。
 *
 * 主な機能:
 * - onloadイベント: リサイズ・圧縮処理の実行
 * - onerrorイベント: エラーログとユーザー向けエラーメッセージの生成
 * - クリーンアップ: Blob URLの解放とタイムアウトのクリア
 *
 * 実装の理由:
 * - **責任の分離**: イベント処理を独立した関数に分離し、再利用性を向上
 * - **確実なクリーンアップ**: 成功・失敗のどちらでもBlob URLを解放
 * - **デバッグ支援**: 詳細なログでエラー原因を特定しやすくする
 *
 * 注意点:
 * - Blob URLは必ず解放する（メモリリーク防止）
 * - タイムアウトは必ずクリアする（メモリリーク防止）
 * - エラーメッセージはユーザーに分かりやすい日本語で記述
 */

import { log } from '../logger';
import {
  calculateResizedDimensions,
  drawImageToCanvas,
  getFileSizeMB,
  createErrorMessage,
} from './utils';
import { compressCanvasToFile } from './canvas';
import {
  createImageLoadErrorMessage,
  logImageLoadError,
} from './errors';

/**
 * 画像読み込み成功時の処理（onloadイベント）
 *
 * HTMLImageElementの読み込みが成功した際に呼び出されます。
 * リサイズ計算、Canvas描画、圧縮処理を実行し、最終的なFileを返します。
 *
 * @param img - 読み込まれたHTMLImageElement
 * @param file - 元のファイル（ファイル名取得用）
 * @param blobUrl - 生成されたBlob URL（解放が必要）
 * @param timeoutId - タイムアウトID（クリアが必要）
 * @param maxWidth - 最大幅（ピクセル）
 * @param maxHeight - 最大高さ（ピクセル）
 * @param outputFormat - 出力形式（'image/webp' または 'image/jpeg'）
 * @param quality - 圧縮品質（0.0 - 1.0）
 * @param maxSizeMB - 目標ファイルサイズ（MB）
 * @param outputExtension - 出力ファイルの拡張子（'.webp' または '.jpg'）
 * @param resolve - Promise成功時のコールバック
 * @param reject - Promiseエラー時のコールバック
 *
 * 処理の流れ:
 * 1. **クリーンアップ**: タイムアウトクリア、Blob URL解放
 * 2. **サイズ検証**: 幅・高さが0でないことを確認
 * 3. **デバッグログ**: 元のサイズとファイルサイズを記録
 * 4. **リサイズ計算**: アスペクト比を保ちながら新しいサイズを計算
 * 5. **Canvas描画**: HTMLImageElementをCanvasに描画
 * 6. **圧縮**: Canvas → Fileに変換
 *
 * 実装の理由:
 * - **確実なクリーンアップ**: タイムアウトとBlob URLを必ず解放
 * - **デバッグログ**: 開発時に処理状況を確認しやすくする
 * - **サイズ検証**: 無効な画像データの早期検出
 */
export function handleImageLoad(
  img: HTMLImageElement,
  file: File,
  blobUrl: string | null,
  timeoutId: NodeJS.Timeout,
  maxWidth: number,
  maxHeight: number,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  outputExtension: string,
  resolve: (file: File) => void,
  reject: (error: Error) => void
): void {
  // タイムアウトをクリア（読み込み成功したため）
  clearTimeout(timeoutId);

  // Blob URLを解放（メモリリーク防止）
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }

  try {
    // サイズ検証: 幅・高さが0の場合はエラー
    // 理由: 無効な画像データの場合、後続の処理でエラーになる
    if (img.width === 0 || img.height === 0) {
      reject(new Error('画像のサイズが無効です'));
      return;
    }

    // デバッグログ: 元の画像サイズとファイルサイズを記録
    log.debug('画像読み込み成功', {
      context: 'handleImageLoad',
      metadata: {
        dimensions: `${img.width}x${img.height}`,
        fileSizeMB: getFileSizeMB(file.size).toFixed(2),
      },
    });

    // アスペクト比を保ちながらリサイズ後のサイズを計算
    const { width, height } = calculateResizedDimensions(img.width, img.height, maxWidth, maxHeight);

    // リサイズが発生する場合、デバッグログを出力
    if (width !== img.width || height !== img.height) {
      log.debug('画像をリサイズ', {
        context: 'handleImageLoad',
        metadata: {
          originalDimensions: `${img.width}x${img.height}`,
          resizedDimensions: `${width}x${height}`,
        },
      });
    }

    // HTMLImageElementをCanvasに描画（リサイズ）
    const canvas = drawImageToCanvas(img, width, height);

    // CanvasをFile形式に圧縮・変換
    compressCanvasToFile(canvas, outputFormat, quality, maxSizeMB, file.name, outputExtension)
      .then(resolve) // 成功時: Promiseをresolve
      .catch(reject); // 失敗時: Promiseをreject
  } catch (error) {
    // 予期しないエラー時: エラーメッセージを生成してreject
    reject(new Error(createErrorMessage('画像処理中にエラーが発生しました', error)));
  }
}

/**
 * 画像読み込みエラー時の処理（onerrorイベント）
 *
 * HTMLImageElementの読み込みが失敗した際に呼び出されます。
 * エラーログを出力し、ユーザー向けのエラーメッセージを生成します。
 *
 * @param file - 元のファイル（ファイル名とサイズ取得用）
 * @param blobUrl - 生成されたBlob URL（解放が必要）
 * @param event - エラーイベント（nullの場合もある）
 * @param timeoutId - タイムアウトID（クリアが必要）
 * @param reject - Promiseエラー時のコールバック
 *
 * 処理の流れ:
 * 1. **クリーンアップ**: タイムアウトクリア、Blob URL解放
 * 2. **エラーログ**: 詳細な情報をログに記録
 * 3. **エラーメッセージ生成**: ユーザー向けのエラーメッセージを作成
 * 4. **Promiseをreject**: エラーを呼び出し元に返す
 *
 * 実装の理由:
 * - **確実なクリーンアップ**: エラー時も必ずリソースを解放
 * - **詳細ログ**: デバッグ時にエラー原因を特定しやすくする
 * - **ユーザーフレンドリー**: 技術的な詳細を隠し、解決策を提示
 *
 * 注意点:
 * - Blob URLは成功・失敗に関わらず必ず解放
 * - エラーメッセージはファイルサイズに応じて変化
 */
export function handleImageError(
  file: File,
  blobUrl: string | null,
  event: Event | null,
  timeoutId: NodeJS.Timeout,
  reject: (error: Error) => void
): void {
  // タイムアウトをクリア（エラーで処理終了のため）
  clearTimeout(timeoutId);

  // Blob URLを解放（メモリリーク防止）
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }

  // 詳細なエラーログを出力（デバッグ用）
  logImageLoadError(file, blobUrl, event);

  // ユーザー向けのエラーメッセージを生成してPromiseをreject
  reject(new Error(createImageLoadErrorMessage(file)));
}
