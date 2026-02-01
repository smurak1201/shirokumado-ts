/**
 * Canvas圧縮処理
 *
 * Canvasを指定された形式（WebP、JPEG）に圧縮してFileに変換する機能を提供します。
 * 段階的に品質を下げることで、目標ファイルサイズを確実に達成します。
 *
 * 主な機能:
 * - Canvas → Blob → File への変換
 * - 段階的な品質調整（0.1ずつ品質を下げる）
 * - 目標ファイルサイズの達成
 *
 * 実装の理由:
 * - **段階的な品質調整**: 一度で最適な品質を見つけるのは困難なため、繰り返し調整
 * - **最低品質0.5**: これ以上下げると画質が著しく劣化するため、下限を設定
 * - **再帰的処理**: 目標サイズに達するまで品質を下げ続ける
 *
 * 圧縮アルゴリズム:
 * 1. **初回圧縮**: 指定された品質（デフォルト0.85）で圧縮
 * 2. **サイズチェック**: 目標サイズ以下なら完了
 * 3. **品質調整**: 目標サイズを超えていれば品質を0.1下げて再圧縮
 * 4. **下限チェック**: 品質が0.5以下になったら、それ以上下げずに終了
 *
 * 注意点:
 * - 品質0.5未満では画質が著しく劣化するため、下限を設定
 * - 再帰的処理のため、スタックオーバーフローに注意（通常は4-5回で完了）
 * - 目標サイズを達成できない場合もある（最低品質でも大きい場合）
 *
 * トレードオフ:
 * - **段階的調整**: 確実に目標サイズを達成するが、処理時間が増える
 * - **品質下限0.5**: 画質を維持するが、一部のファイルで目標サイズを超える可能性
 */

import { getFileSizeMB } from './utils';

// 圧縮品質の下限（これ以上下げると画質が著しく劣化）
const MIN_COMPRESSION_QUALITY = 0.5;

// 品質調整のステップ幅（0.1ずつ下げる）
const QUALITY_STEP = 0.1;

/**
 * Canvasを圧縮してFileに変換するヘルパー関数
 *
 * Canvas要素を指定された形式（WebP、JPEG）に圧縮し、Fileオブジェクトに変換します。
 * 目標ファイルサイズを超える場合、段階的に品質を下げて再圧縮します。
 *
 * @param canvas - 圧縮するCanvas要素
 * @param outputFormat - 出力形式（'image/webp' または 'image/jpeg'）
 * @param quality - 初期圧縮品質（0.0 - 1.0）、デフォルト: 0.85
 * @param maxSizeMB - 目標ファイルサイズ（MB）、デフォルト: 3.5
 * @param originalFileName - 元のファイル名（拡張子は自動的に変更）
 * @param outputExtension - 出力ファイルの拡張子（'.webp' または '.jpg'）
 * @returns 圧縮されたFileオブジェクト
 * @throws {Error} 圧縮に失敗した場合
 *
 * 処理の流れ:
 * 1. **初回圧縮**: 指定された品質（例: 0.85）で canvas.toBlob() を実行
 * 2. **サイズチェック**: 生成されたBlobのサイズを確認
 * 3. **品質調整**: サイズが目標を超える場合、品質を0.1下げて再圧縮
 * 4. **下限チェック**: 品質が0.5以下になったら、それ以上下げずに終了
 * 5. **File変換**: Blobをファイル名とメタデータを付けてFileに変換
 *
 * 圧縮アルゴリズム（再帰的処理）:
 * - 目標サイズ以下 → 完了
 * - 目標サイズ超過 && 品質 > 0.5 → 品質を0.1下げて再圧縮
 * - 目標サイズ超過 && 品質 <= 0.5 → 完了（目標未達成だが最低品質）
 *
 * 実装の理由:
 * - **段階的調整**: 一度で最適な品質を見つけるのは困難なため
 * - **再帰的処理**: シンプルで理解しやすいコード
 * - **ファイル名の拡張子置換**: 元のファイル名を保持しつつ、拡張子のみ変更
 *
 * 注意点:
 * - 再帰的処理のため、品質が0.5に達するまで最大4-5回繰り返す可能性
 * - 最低品質（0.5）でも目標サイズを超える場合がある
 * - canvas.toBlob()は非同期のため、Promiseを使用
 *
 * トレードオフ:
 * - **段階的調整**: 確実に目標サイズに近づくが、処理時間が増える
 *   - 代替案: バイナリサーチで品質を探索すれば回数は減るが、実装が複雑
 * - **品質下限0.5**: 画質を維持するが、目標サイズを達成できない可能性
 *   - 代替案: 下限なしにすれば確実に達成できるが、画質が著しく劣化
 */
export function compressCanvasToFile(
  canvas: HTMLCanvasElement,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  originalFileName: string,
  outputExtension: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    // 内部関数: 指定された品質で圧縮を試みる（再帰的に呼び出される）
    const compressWithQuality = (q: number): Promise<File> => {
      return new Promise((resolveCompress, rejectCompress) => {
        // Canvas → Blob に変換（非同期処理）
        // toBlob(callback, mimeType, quality)
        canvas.toBlob(
          (blob) => {
            // Blobの生成に失敗した場合（稀なケース）
            if (!blob) {
              rejectCompress(new Error(`画像の圧縮に失敗しました（品質: ${q}）`));
              return;
            }

            // 生成されたBlobのサイズをMB単位で取得
            const sizeMB = getFileSizeMB(blob.size);

            // サイズが目標を超えており、かつ品質を下げる余地がある場合
            if (sizeMB > maxSizeMB && q > MIN_COMPRESSION_QUALITY) {
              // 品質を0.1下げて再帰的に圧縮
              // Math.max()で品質が0.5未満にならないよう保証
              resolveCompress(compressWithQuality(Math.max(q - QUALITY_STEP, MIN_COMPRESSION_QUALITY)));
            } else {
              // 目標サイズ以下、または最低品質に達した場合、Blob → File に変換
              const compressedFile = new File(
                [blob],
                // 元のファイル名の拡張子を新しい拡張子に置換
                // 例: "photo.jpg" → "photo.webp"
                originalFileName.replace(/\.[^/.]+$/, outputExtension),
                {
                  type: outputFormat,
                  lastModified: Date.now(), // タイムスタンプを現在時刻に設定
                }
              );
              resolveCompress(compressedFile);
            }
          },
          outputFormat, // 出力形式（'image/webp' または 'image/jpeg'）
          q // 圧縮品質（0.0 - 1.0）
        );
      });
    };

    // 初回圧縮を開始（指定された品質で）
    compressWithQuality(quality).then(resolve).catch(reject);
  });
}
