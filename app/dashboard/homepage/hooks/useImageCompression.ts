/**
 * @fileoverview 画像圧縮カスタムフック - ファイルサイズ最適化とバリデーション
 *
 * ## 目的
 * - 画像ファイルのサイズ最適化（Cloudflare R2へのアップロード前）
 * - ファイル形式とサイズのバリデーション
 * - ユーザーへの警告とエラーハンドリング
 *
 * ## 主な機能
 * - 画像ファイル形式のバリデーション（JPEG、PNG、WebPなど）
 * - ファイルサイズの警告（推奨サイズ超過時）
 * - browser-image-compressionを使用した画像圧縮
 * - 最大ファイルサイズの検証（圧縮後）
 *
 * ## 使用場所
 * - app/dashboard/homepage/hooks/useImageUpload.ts
 * - 商品画像選択時の前処理
 *
 * ## 実装の特性
 * - **Client Component専用**: browser-image-compression（ブラウザ専用ライブラリ）に依存
 * - **設定値の一元管理**: lib/configから圧縮設定を取得
 * - **ユーザーフィードバック**: alert、confirmでユーザーに状況を通知
 *
 * ## 圧縮設定（lib/config）
 * - RECOMMENDED_FILE_SIZE_MB: 推奨ファイルサイズ（警告表示の閾値）
 * - COMPRESSION_TARGET_SIZE_MB: 圧縮目標サイズ（browser-image-compressionの設定）
 * - MAX_FILE_SIZE_BYTES: 最大ファイルサイズ（圧縮後の検証）
 *
 * ## パフォーマンス最適化
 * - 圧縮前にバリデーション: 不正なファイルは圧縮処理をスキップ
 * - ユーザー確認: 大きなファイルは警告して処理をキャンセル可能
 * - ロギング: 圧縮前後のサイズを記録してパフォーマンスを追跡
 *
 * ## エラーハンドリング
 * - バリデーションエラー: nullを返して呼び出し元で処理
 * - 圧縮エラー: ロギング → ユーザーフレンドリーなエラーメッセージ表示 → null返却
 * - ファイルサイズ超過: 圧縮後も大きすぎる場合は警告してnull返却
 *
 * @see https://github.com/Donaldcwl/browser-image-compression
 */

import { useState, useCallback } from "react";
import { log } from "@/lib/logger";
import { getUserFriendlyMessageJa } from "@/lib/errors";
import { compressImage, isImageFile, getFileSizeMB } from "@/lib/image-compression";
import { config } from "@/lib/config";

/**
 * 画像圧縮処理を行うカスタムフック
 *
 * 画像ファイルの検証と圧縮機能を提供します。
 * browser-image-compressionを使用して、画像サイズを最適化します。
 *
 * @returns 圧縮進行状態と圧縮関数
 *
 * ## 使用例
 * ```tsx
 * const { compressing, compressImageFile } = useImageCompression();
 * const processedFile = await compressImageFile(file);
 * if (!processedFile) {
 *   // バリデーションエラーまたは圧縮失敗
 * }
 * ```
 *
 * ## 実装の理由
 * - **ファイルサイズ削減**: Cloudflare R2へのアップロード時間を短縮
 * - **帯域幅削減**: ユーザーのネットワーク負荷を軽減
 * - **ストレージコスト削減**: 圧縮によりストレージ使用量を削減
 * - **UX向上**: 圧縮進行状態をユーザーに通知
 */
export function useImageCompression() {
  // 圧縮進行状態
  // true: compressImage実行中（ローディング表示用）
  const [compressing, setCompressing] = useState(false);

  /**
   * 画像ファイルを圧縮する関数
   *
   * ファイル形式とサイズを検証し、browser-image-compressionで圧縮します。
   * バリデーションエラーや圧縮失敗時はnullを返します。
   *
   * @param file - 圧縮対象の画像ファイル
   * @returns 圧縮済みファイル、またはnull（エラー時）
   *
   * ## 処理の流れ
   * 1. ファイル形式のバリデーション（isImageFile）
   * 2. ファイルサイズの警告（推奨サイズ超過時）
   * 3. 画像圧縮（compressImage）
   * 4. 圧縮後のサイズ検証（最大サイズ超過時はエラー）
   * 5. 圧縮済みファイルを返す
   *
   * ## バリデーション
   * - **ファイル形式**: isImageFileでMIMEタイプをチェック
   * - **推奨サイズ**: 超過時はconfirmで続行確認
   * - **最大サイズ**: 圧縮後もサイズ超過の場合はエラー
   *
   * ## ロギング
   * - debug: 圧縮成功時に圧縮前後のサイズを記録
   * - error: 圧縮失敗時にエラー内容を記録
   *
   * ## エラーハンドリング
   * - バリデーションエラー: alertで通知 → null返却
   * - ユーザーキャンセル: null返却（呼び出し元でフォールバック処理）
   * - 圧縮エラー: alertで通知 → null返却
   * - サイズ超過: alertで通知 → null返却
   *
   * ## useCallbackの理由
   * - 依存配列が空なので、一度だけ生成される
   * - useImageUploadなどで安定した参照を提供
   */
  const compressImageFile = useCallback(
    async (file: File): Promise<File | null> => {
      // ステップ1: ファイル形式のバリデーション
      // MIMEタイプをチェックして画像ファイルかどうかを判定
      if (!isImageFile(file)) {
        alert("画像ファイルのみ選択可能です");
        return null;
      }

      // ステップ2: ファイルサイズの警告
      // 推奨サイズを超える場合、ユーザーに確認を求める
      const fileSizeMB = getFileSizeMB(file.size);
      if (fileSizeMB > config.imageConfig.RECOMMENDED_FILE_SIZE_MB) {
        // 大きなファイルは圧縮に時間がかかるため、ユーザーに警告
        const proceed = confirm(
          `選択された画像は${fileSizeMB.toFixed(2)}MBです。\n` +
          `推奨サイズは${config.imageConfig.RECOMMENDED_FILE_SIZE_MB}MB以下です。\n` +
          `処理に時間がかかるか、失敗する可能性があります。\n\n` +
          `続行しますか？`
        );
        // ユーザーがキャンセルした場合はnullを返す
        if (!proceed) {
          return null;
        }
      }

      // ステップ3: 画像圧縮
      setCompressing(true);
      try {
        // browser-image-compressionで画像を圧縮
        // maxSizeMBは圧縮目標サイズ（lib/configで一元管理）
        const processedFile = await compressImage(file, {
          maxSizeMB: config.imageConfig.COMPRESSION_TARGET_SIZE_MB,
        });

        // 圧縮前後のサイズをログに記録（パフォーマンス追跡用）
        const originalSizeMB = getFileSizeMB(file.size).toFixed(2);
        const compressedSizeMB = getFileSizeMB(processedFile.size).toFixed(2);
        log.debug("画像を圧縮しました", {
          context: "useImageCompression.compressImageFile",
          metadata: {
            originalSizeMB,
            compressedSizeMB,
          },
        });

        // ステップ4: 圧縮後のサイズ検証
        // 圧縮しても最大サイズを超える場合はエラー
        if (processedFile.size > config.imageConfig.MAX_FILE_SIZE_BYTES) {
          alert(
            `画像が大きすぎます（${compressedSizeMB}MB）。別の画像を選択するか、画像を小さくしてから再度お試しください。`
          );
          return null;
        }

        // 圧縮成功: 圧縮済みファイルを返す
        return processedFile;
      } catch (error) {
        // 圧縮エラー: ロギング → ユーザーフレンドリーなエラーメッセージ表示
        log.error("画像の圧縮に失敗しました", {
          context: "useImageCompression.compressImageFile",
          error,
        });

        // lib/errorsでエラーメッセージを日本語に変換
        const errorMessage = getUserFriendlyMessageJa(error);
        alert(
          `画像の圧縮に失敗しました: ${errorMessage}\n別の画像を選択してください。`
        );
        return null;
      } finally {
        // エラー発生時も確実に圧縮状態をリセット
        setCompressing(false);
      }
    },
    []
  );

  return {
    compressing, // 圧縮進行状態（ローディング表示用）
    compressImageFile, // 画像圧縮関数（バリデーションと圧縮を実行）
  };
}
