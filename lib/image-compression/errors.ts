/**
 * 画像読み込みエラーハンドリング
 *
 * 画像読み込み時のエラーメッセージ生成とログ出力を提供します。
 * ユーザーに分かりやすいエラーメッセージを表示し、開発者にはデバッグ用の詳細情報を記録します。
 *
 * 主な機能:
 * - ファイルサイズに応じたエラーメッセージの生成
 * - ファイル形式に応じたエラーメッセージの生成
 * - デバッグ用の詳細ログ出力
 *
 * 実装の理由:
 * - **ユーザーフレンドリーなメッセージ**: 技術的な詳細を隠し、解決策を提示
 * - **詳細なログ**: 開発者がエラーの原因を特定しやすくする
 * - **ファイルサイズの閾値チェック**: 推奨サイズ（10MB）を超える場合は警告
 *
 * 注意点:
 * - エラーメッセージはユーザーに直接表示されるため、日本語で分かりやすく記述
 * - ログは開発環境でのみ詳細情報を出力（本番環境では最小限）
 */

import { log } from '../logger';
import { getFileSizeMB } from './utils';
import { config } from '../config';

/**
 * 画像読み込みエラーメッセージを生成します
 *
 * ファイルサイズと形式に応じて、ユーザーに分かりやすいエラーメッセージを生成します。
 * 技術的な詳細を隠し、具体的な解決策を提示することでユーザー体験を向上します。
 *
 * @param file - エラーが発生したファイル
 * @returns ユーザー向けのエラーメッセージ（日本語）
 *
 * メッセージ生成ロジック:
 * - **ファイルサイズが大きい場合**（推奨10MB超）: サイズを明示し、別の画像を選ぶよう促す
 * - **それ以外の場合**: ファイル形式がサポートされていない可能性を示唆
 *
 * 実装の理由:
 * - **具体的なサイズを表示**: ユーザーが問題を理解しやすくする
 * - **解決策を提示**: 「別の画像を選択するか、画像を小さくして」と具体的に指示
 * - **技術用語を避ける**: 「MIME type」などの専門用語は使わない
 *
 * 注意点:
 * - ファイルサイズの閾値（10MB）は config.imageConfig.RECOMMENDED_FILE_SIZE_MB で管理
 * - エラーメッセージはユーザーに直接表示されるため、分かりやすい日本語で記述
 */
export function createImageLoadErrorMessage(file: File): string {
  const fileSizeMB = getFileSizeMB(file.size);

  // ファイルサイズが推奨サイズ（10MB）を超える場合
  // 理由: 大きすぎる画像はブラウザのメモリ不足やタイムアウトの原因になる
  if (fileSizeMB > config.imageConfig.RECOMMENDED_FILE_SIZE_MB) {
    return `画像の読み込みに失敗しました。ファイルサイズが大きすぎる可能性があります（${fileSizeMB.toFixed(2)}MB）。推奨サイズは${config.imageConfig.RECOMMENDED_FILE_SIZE_MB}MB以下です。別の画像を選択するか、画像を小さくしてから再度お試しください。`;
  } else {
    // ファイル形式がサポートされていない可能性を示唆
    // 理由: サイズが適切な場合は、形式の問題が考えられる
    return `画像の読み込みに失敗しました。ファイル形式（${file.type || '不明'}）がサポートされていない可能性があります。`;
  }
}

/**
 * 画像読み込みエラーの詳細ログを出力します
 *
 * デバッグ用に詳細な情報をログに記録します。
 * ユーザーには表示されず、開発者がエラーの原因を特定するために使用します。
 *
 * @param file - エラーが発生したファイル
 * @param blobUrl - 生成されたBlob URL（nullの場合は作成失敗）
 * @param event - エラーイベント（nullの場合は一般的なエラー）
 *
 * ログに記録する情報:
 * - **ファイル名**: デバッグ時にどのファイルでエラーが起きたか特定
 * - **ファイルサイズ**: メモリ不足の原因を調査
 * - **ファイル形式**: サポートされていない形式かチェック
 * - **Blob URL作成状態**: URL生成の成否を確認
 * - **エラーイベント**: ブラウザが提供するエラー詳細
 *
 * 実装の理由:
 * - **詳細な情報を記録**: ユーザーからの報告だけでは原因を特定しにくいため
 * - **本番環境でも記録**: クライアント側のエラーはサーバーログに残らないため
 * - **メタデータの構造化**: ログ検索やフィルタリングを容易にする
 *
 * 注意点:
 * - 個人情報（ファイル名）を含むため、ログの扱いに注意
 * - ログレベルはerror（log.error）を使用し、重要な問題として記録
 */
export function logImageLoadError(
  file: File,
  blobUrl: string | null,
  event: Event | null
): void {
  const fileSizeMB = getFileSizeMB(file.size);
  log.error('画像読み込みエラー', {
    context: 'logImageLoadError',
    // ErrorEventの場合はerrorプロパティを使用、それ以外は一般的なエラーメッセージ
    error: event instanceof ErrorEvent ? event.error : new Error('画像読み込みに失敗しました'),
    metadata: {
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size,
      fileSizeMB: fileSizeMB.toFixed(2),
      // Blob URLの作成状態を記録（URL生成失敗が原因の可能性を調査）
      blobUrl: blobUrl ? '作成済み' : '作成失敗',
    },
  });
}
