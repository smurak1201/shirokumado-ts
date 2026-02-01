/**
 * Blob URLを使用した画像読み込み処理
 *
 * Blob URLを使用してHTMLImageElementで画像を読み込む機能を提供します。
 * 従来の方法で、すべてのブラウザで動作する高い互換性を持ちます。
 *
 * 主な機能:
 * - Blob URLの生成とクリーンアップ
 * - HTMLImageElementによる画像読み込み
 * - タイムアウト処理（60秒）
 * - エラーハンドリング
 *
 * 実装の理由:
 * - **互換性**: すべてのモダンブラウザでサポートされている
 * - **シンプル**: HTMLImageElementの使い慣れたAPIを使用
 * - **小ファイル向け**: 5MB未満の画像で効率的に動作
 *
 * 処理の流れ:
 * 1. **Blob URL生成**: URL.createObjectURL()でファイルから一時URLを作成
 * 2. **HTMLImageElement作成**: new Image()で画像要素を作成
 * 3. **タイムアウト設定**: 60秒で読み込みを中断
 * 4. **イベントハンドラー設定**: onload と onerror
 * 5. **画像読み込み開始**: img.src = blobUrl
 * 6. **クリーンアップ**: URL.revokeObjectURL()でメモリ解放
 *
 * メモリ管理:
 * - Blob URLは明示的に解放が必要（メモリリーク防止）
 * - 成功時・失敗時・タイムアウト時のすべてでrevokeを実行
 *
 * 注意点:
 * - Blob URLはメモリに残るため、必ずrevokeObjectURL()を呼ぶ
 * - タイムアウトは60秒（config.imageConfig.IMAGE_LOAD_TIMEOUT_MS）
 * - 大きいファイル（5MB以上）ではImageBitmapの使用を推奨
 *
 * トレードオフ:
 * - **互換性優先**: 古いブラウザでも動作するが、大ファイルでメモリ消費が多い
 * - **シンプル**: コードは理解しやすいが、ImageBitmapより効率は劣る
 */

import { getFileSizeMB, createErrorMessage } from './utils';
import { handleImageLoad, handleImageError } from './blob-handlers';
import { config } from '../config';

/**
 * Blob URLを使用して画像を読み込むヘルパー関数
 *
 * ファイルから一時的なBlob URLを生成し、HTMLImageElementで画像を読み込みます。
 * Promiseベースの非同期処理で、読み込み完了またはエラーを返します。
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
 * 1. **Blob URL生成**: URL.createObjectURL()でファイルから一時URLを作成
 * 2. **HTMLImageElement作成**: new Image()で画像要素を作成
 * 3. **タイムアウト設定**: 60秒後にタイムアウトエラー
 * 4. **onloadイベント**: 読み込み成功時にhandleImageLoad()を呼び出し
 * 5. **onerrorイベント**: 読み込み失敗時にhandleImageError()を呼び出し
 * 6. **読み込み開始**: img.src = blobUrl で読み込みを開始
 * 7. **クリーンアップ**: 完了後にURL.revokeObjectURL()でメモリ解放
 *
 * 実装の理由:
 * - **Promiseベース**: async/awaitで扱いやすい非同期処理
 * - **タイムアウト**: 無限待機を防ぎ、ユーザー体験を向上
 * - **確実なクリーンアップ**: 成功・失敗・タイムアウトのすべてでBlob URLを解放
 *
 * 注意点:
 * - Blob URLはメモリリークの原因になるため、必ず解放が必要
 * - タイムアウトは60秒（大きいファイルの場合は時間がかかる）
 * - エラー時も確実にrevokeObjectURL()を呼び出す
 */
export function loadImageWithBlobURL(
  file: File,
  maxWidth: number,
  maxHeight: number,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  outputExtension: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    let blobUrl: string | null = null;

    // Blob URLを生成
    // 理由: ファイルをHTMLImageElementで読み込むには、URLが必要
    try {
      blobUrl = URL.createObjectURL(file);
    } catch (error) {
      reject(new Error(createErrorMessage('Blob URLの作成に失敗しました', error)));
      return;
    }

    // HTMLImageElementを作成
    const img = new Image();

    // タイムアウト設定（60秒）
    // 理由: 大きいファイルや遅いネットワークで無限に待機することを防ぐ
    const timeoutId = setTimeout(() => {
      // Blob URLを解放（メモリリーク防止）
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      reject(
        new Error(
          `画像の読み込みがタイムアウトしました（${config.imageConfig.IMAGE_LOAD_TIMEOUT_MS / 1000}秒）。ファイルサイズが大きすぎる可能性があります（${getFileSizeMB(file.size).toFixed(2)}MB）。`
        )
      );
    }, config.imageConfig.IMAGE_LOAD_TIMEOUT_MS);

    // 画像読み込み成功時の処理
    // handleImageLoad()でリサイズ・圧縮を実行
    img.onload = () => {
      handleImageLoad(
        img,
        file,
        blobUrl,
        timeoutId,
        maxWidth,
        maxHeight,
        outputFormat,
        quality,
        maxSizeMB,
        outputExtension,
        resolve,
        reject
      );
    };

    // 画像読み込み失敗時の処理
    // handleImageError()でエラーログを出力し、エラーメッセージを生成
    img.onerror = (event: Event | string) => {
      handleImageError(file, blobUrl, typeof event === 'string' ? null : event, timeoutId, reject);
    };

    // 画像の読み込みを開始
    // img.src に Blob URL を設定すると、ブラウザが画像を読み込み始める
    try {
      img.src = blobUrl;
    } catch (error) {
      // 読み込み開始に失敗した場合、クリーンアップしてエラーを返す
      clearTimeout(timeoutId);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      reject(new Error(createErrorMessage('画像の読み込み開始に失敗しました', error)));
    }
  });
}
