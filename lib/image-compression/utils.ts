/**
 * 画像圧縮のユーティリティ関数
 *
 * 画像圧縮処理で使用する共通のユーティリティ関数を提供します。
 * 各関数は単一責任の原則に従い、再利用性と保守性を高めています。
 *
 * 主な機能:
 * - ファイルサイズの単位変換（バイト → MB）
 * - エラーメッセージの生成
 * - アスペクト比を保持したリサイズ計算
 * - Canvas への画像描画
 * - WebP形式のサポート判定
 *
 * 実装の理由:
 * - **単一責任**: 各関数は1つの処理に集中し、テストとデバッグを容易にする
 * - **再利用性**: 複数のファイルから呼び出される処理を集約
 * - **型安全性**: TypeScriptの型システムを活用し、実行時エラーを防止
 *
 * ベストプラクティス:
 * - 純粋関数として実装（副作用なし、同じ入力には同じ出力）
 * - わかりやすい関数名を使用（動詞 + 名詞）
 * - エラーハンドリングを適切に実装
 */

import { log } from '../logger';

/**
 * ファイルサイズをMB単位で取得します
 *
 * バイト単位のファイルサイズを、ユーザーに分かりやすいMB単位に変換します。
 *
 * @param sizeBytes - ファイルサイズ（バイト）
 * @returns ファイルサイズ（MB）、小数点以下も含む
 *
 * 実装の理由:
 * - **ユーザーフレンドリー**: バイトよりもMBの方が直感的に理解しやすい
 * - **再利用性**: ファイルサイズ表示が必要な複数の場所で使用
 *
 * 使用例:
 * ```typescript
 * const sizeMB = getFileSizeMB(5242880); // 5.0 MB
 * ```
 */
export function getFileSizeMB(sizeBytes: number): number {
  return sizeBytes / (1024 * 1024);
}

/**
 * エラーメッセージを生成します
 *
 * エラーオブジェクトを統一的なフォーマットのメッセージ文字列に変換します。
 * Errorインスタンスでもそれ以外の値でも適切に処理します。
 *
 * @param message - ベースとなるメッセージ（例: 「HEIC形式の変換に失敗しました」）
 * @param error - エラーオブジェクト（Error、string、または任意の値）
 * @returns フォーマットされたエラーメッセージ
 *
 * 実装の理由:
 * - **型安全性**: unknown型でエラーを受け取り、Errorかどうかを判定
 * - **統一性**: すべてのエラーを「メッセージ: 詳細」の形式で出力
 * - **防御的プログラミング**: 予期しない型のエラーでも文字列に変換して処理
 *
 * 使用例:
 * ```typescript
 * try {
 *   throw new Error('変換失敗');
 * } catch (error) {
 *   const msg = createErrorMessage('HEIC形式の変換に失敗しました', error);
 *   // => 'HEIC形式の変換に失敗しました: 変換失敗'
 * }
 * ```
 */
export function createErrorMessage(message: string, error: unknown): string {
  return `${message}: ${error instanceof Error ? error.message : String(error)}`;
}

/**
 * アスペクト比を保ちながらリサイズ後のサイズを計算します
 *
 * 画像を指定された最大サイズ内に収めつつ、元の縦横比を維持します。
 * 画像が歪まないように、縦横どちらかを基準にして比率を保持します。
 *
 * @param width - 元の画像の幅（ピクセル）
 * @param height - 元の画像の高さ（ピクセル）
 * @param maxWidth - 最大幅（ピクセル）、例: 1920
 * @param maxHeight - 最大高さ（ピクセル）、例: 1920
 * @returns リサイズ後のサイズ { width, height }（ピクセル）
 *
 * 計算ロジック:
 * 1. **リサイズ不要な場合**: 元のサイズが最大サイズ以下の場合、そのまま返す
 * 2. **横長画像の場合** (width > height): 幅を基準にリサイズ
 * 3. **縦長画像の場合** (height >= width): 高さを基準にリサイズ
 *
 * 実装の理由:
 * - **アスペクト比の維持**: 画像が歪まないようにする
 * - **最大サイズ内に収める**: ファイルサイズを削減しつつ、必要以上に小さくしない
 * - **横長・縦長の判定**: より大きい辺を基準にすることで、確実に最大サイズ内に収まる
 *
 * 使用例:
 * ```typescript
 * // 3000x2000の横長画像を1920x1920以内にリサイズ
 * const result = calculateResizedDimensions(3000, 2000, 1920, 1920);
 * // => { width: 1920, height: 1280 } (3:2の比率を維持)
 * ```
 */
export function calculateResizedDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // リサイズが不要な場合は元のサイズをそのまま返す
  // 理由: 不必要な処理を避け、画質劣化を防ぐ
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // アスペクト比（縦横比）を計算
  // 例: 1920x1080 の場合 aspectRatio = 1.78 (16:9)
  const aspectRatio = width / height;

  // 横長画像（width > height）と縦長画像（height >= width）で処理を分岐
  // 理由: より大きい辺を基準にリサイズすることで、確実に最大サイズ内に収まる
  const { width: newWidth, height: newHeight } = width > height
    ? {
      // 横長画像: 幅を基準にリサイズ
      width: Math.min(width, maxWidth),
      height: Math.min(width, maxWidth) / aspectRatio,
    }
    : {
      // 縦長画像: 高さを基準にリサイズ
      width: Math.min(height, maxHeight) * aspectRatio,
      height: Math.min(height, maxHeight),
    };

  return { width: newWidth, height: newHeight };
}

/**
 * Canvasに画像を描画します
 *
 * ImageBitmapまたはHTMLImageElementをCanvasに描画し、指定されたサイズにリサイズします。
 * 描画後のCanvasはtoBlob()で画像データに変換できます。
 *
 * @param imageSource - 画像ソース（ImageBitmap または HTMLImageElement）
 * @param width - 描画する幅（ピクセル）
 * @param height - 描画する高さ（ピクセル）
 * @returns 画像が描画されたCanvas要素
 * @throws {Error} Canvas contextの作成に失敗した場合
 *
 * 実装の理由:
 * - **Canvas API使用**: ブラウザ側で画像をリサイズ・圧縮できる
 * - **ImageBitmapとHTMLImageElementの両対応**: 読み込み方法に応じて柔軟に対応
 * - **2Dコンテキスト**: 画像処理には2Dコンテキストを使用
 *
 * 処理の流れ:
 * 1. 新しいCanvas要素を作成
 * 2. 指定されたサイズにCanvas要素を設定
 * 3. 2Dコンテキストを取得
 * 4. drawImage()で画像を描画（自動的にリサイズ）
 *
 * 注意点:
 * - Canvas contextの取得に失敗する可能性は極めて低いが、念のためチェック
 * - drawImage()は元の画像を指定されたサイズに自動的にリサイズして描画
 */
export function drawImageToCanvas(
  imageSource: ImageBitmap | HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas contextの作成に失敗しました');
  }
  // 画像をCanvasに描画（自動的にリサイズ）
  // drawImage(image, dx, dy, dWidth, dHeight)
  ctx.drawImage(imageSource, 0, 0, width, height);
  return canvas;
}

/**
 * WebP形式がサポートされているかどうかを判定します
 *
 * ブラウザがWebP形式の画像をサポートしているかを動的に判定します。
 * IE11などの古いブラウザではWebPが非対応のため、フォールバックに使用します。
 *
 * @returns WebPがサポートされている場合 true、それ以外は false
 *
 * 判定方法:
 * 1. 1x1ピクセルの小さなCanvasを作成
 * 2. toDataURL('image/webp')でWebP形式のData URLを生成
 * 3. Data URLが 'data:image/webp' で始まるかチェック
 *
 * 実装の理由:
 * - **動的判定**: ブラウザのバージョンやプラットフォームに依存せず確実に判定
 * - **軽量チェック**: 1x1ピクセルの画像で高速に判定
 * - **フォールバック対応**: サポート外の場合はJPEGにフォールバック
 *
 * トレードオフ:
 * - **動的判定**: User Agent文字列での判定より確実だが、わずかに処理時間がかかる
 * - **1回のみ実行**: 結果をキャッシュするなどの最適化も可能だが、処理が軽いため不要
 *
 * ブラウザサポート:
 * - Chrome 23+, Edge 18+, Firefox 65+, Safari 14+: サポート
 * - IE11, Safari 13以前: 非サポート（自動的にJPEGにフォールバック）
 */
export function supportsWebP(): boolean {
  try {
    // 1x1ピクセルの小さなCanvasを作成（判定用）
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    // WebP形式のData URLを生成
    const dataUrl = canvas.toDataURL('image/webp');
    // Data URLが 'data:image/webp' で始まる場合、WebPがサポートされている
    // 非対応ブラウザでは 'data:image/png' などにフォールバックする
    return dataUrl.startsWith('data:image/webp');
  } catch (error) {
    // エラーが発生した場合は非サポートとみなす
    // 理由: 予期しないエラーの場合、安全のためJPEGにフォールバック
    log.warn('WebP形式のサポート確認に失敗しました', {
      context: 'supportsWebP',
      error,
    });
    return false;
  }
}
