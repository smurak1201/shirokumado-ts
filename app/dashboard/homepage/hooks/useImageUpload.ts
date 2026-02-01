/**
 * @fileoverview 画像アップロードカスタムフック - 圧縮とアップロードの統合処理
 *
 * ## 目的
 * - 画像の圧縮とアップロード処理を統合的に管理
 * - 商品作成・編集フォームでの画像選択時の処理を簡潔化
 * - プレビュー表示とアップロード状態管理を提供
 *
 * ## 主な機能
 * - 画像選択時の自動圧縮とプレビュー生成
 * - Cloudflare R2へのアップロード処理
 * - アップロード進行状態の管理
 * - エラーハンドリングとユーザーフレンドリーなエラーメッセージ
 *
 * ## 使用場所
 * - app/dashboard/homepage/hooks/useProductForm.ts
 * - 商品作成・編集フォームでの画像管理
 *
 * ## 実装の特性
 * - **Client Component専用**: useState、useCallbackに依存
 * - **依存フック**: useImageCompressionで画像圧縮を実行
 * - **非同期処理**: 圧縮とアップロードを順次実行
 *
 * ## 処理の流れ
 * 1. handleImageChange: 画像選択 → 圧縮 → プレビューURL生成
 * 2. uploadImage: 圧縮済み画像 → API送信 → CloudflareR2にアップロード
 *
 * ## エラーハンドリング
 * - アップロード失敗時: レスポンス形式を判定してエラーメッセージを抽出
 * - ロギング: lib/loggerでエラー内容を記録
 * - エラー再スロー: 呼び出し元でトースト表示などに使用
 */

import { useCallback, useState } from "react";
import { log } from "@/lib/logger";
import { useImageCompression } from "./useImageCompression";

/**
 * 画像アップロード処理を行うカスタムフック
 *
 * 画像の圧縮とアップロード機能を統合的に提供します。
 * useImageCompressionで圧縮し、/api/products/uploadでCloudflareR2にアップロードします。
 *
 * @returns アップロード状態、圧縮状態、画像変更ハンドラー、アップロード関数
 *
 * ## 使用例
 * ```tsx
 * const { uploading, compressing, handleImageChange, uploadImage } = useImageUpload();
 * // 画像選択時
 * const result = await handleImageChange(file, fallbackUrl);
 * // フォーム送信時
 * const uploadedUrl = await uploadImage(imageFile, existingImageUrl);
 * ```
 *
 * ## 実装の理由
 * - **圧縮とアップロードの分離**: 画像選択時は圧縮のみ、フォーム送信時にアップロード
 * - **プレビュー表示**: URL.createObjectURLで即座にプレビューを表示（UX向上）
 * - **状態管理の統合**: uploading、compressingを一元管理してローディング表示を簡潔化
 */
export function useImageUpload() {
  // アップロード進行状態
  // true: /api/products/uploadへのリクエスト中
  const [uploading, setUploading] = useState(false);

  // 画像圧縮フックから圧縮状態と圧縮関数を取得
  const { compressing, compressImageFile } = useImageCompression();

  /**
   * 画像ファイル選択時の処理
   *
   * ファイルを圧縮してプレビューURLを生成します。
   * アップロードは行わず、プレビュー表示のための準備のみを行います。
   *
   * @param file - 選択された画像ファイル（null の場合はクリア処理）
   * @param fallbackImageUrl - 圧縮失敗時や未選択時のフォールバック画像URL
   * @returns 圧縮済みファイルとプレビューURLのオブジェクト
   *
   * ## 処理の流れ
   * 1. fileがnull: フォールバックURLを返す（画像クリア時）
   * 2. 圧縮実行: compressImageFileで画像を圧縮
   * 3. 圧縮失敗: フォールバックURLを返す
   * 4. 圧縮成功: URL.createObjectURLでプレビューURLを生成
   *
   * ## URL.createObjectURLの理由
   * - **即座にプレビュー**: アップロード前にブラウザ上で画像を表示
   * - **パフォーマンス**: サーバーアップロードを待たずにプレビュー可能
   * - **メモリ管理**: コンポーネントのクリーンアップでURL.revokeObjectURLが必要
   *
   * ## フォールバックの使用例
   * - 編集モード: 既存の画像URLをフォールバックとして渡す
   * - 新規作成: null を渡して未選択状態を表現
   *
   * ## useCallbackの理由
   * - compressImageFileに依存するため、依存配列に含める
   * - compressImageFileは useImageCompression でメモ化済み
   * - 不要な再レンダリングを防止
   */
  const handleImageChange = useCallback(
    async (
      file: File | null,
      fallbackImageUrl?: string | null
    ): Promise<{ file: File | null; previewUrl: string | null }> => {
      // ファイルが選択されていない場合
      // フォールバック画像を返す（編集時は既存画像、新規作成時はnull）
      if (!file) {
        return { file: null, previewUrl: fallbackImageUrl || null };
      }

      // 画像を圧縮（バリデーションとサイズ最適化）
      const processedFile = await compressImageFile(file);
      // 圧縮失敗時（バリデーションエラー、ユーザーキャンセルなど）
      if (!processedFile) {
        return { file: null, previewUrl: fallbackImageUrl || null };
      }

      // プレビュー用のローカルURLを生成
      // アップロード前にブラウザ上で画像を表示するため
      const previewUrl = URL.createObjectURL(processedFile);
      return { file: processedFile, previewUrl };
    },
    [compressImageFile]
  );

  /**
   * 画像をCloudflare R2にアップロードする関数
   *
   * 圧縮済みの画像ファイルをサーバーにアップロードし、
   * 公開URLを取得します。フォーム送信時に呼び出されます。
   *
   * @param imageFile - アップロードする画像ファイル（handleImageChangeで圧縮済み）
   * @param existingImageUrl - 既存の画像URL（編集時、画像未変更の場合に使用）
   * @returns アップロードされた画像のURL、または既存URL
   * @throws アップロードに失敗した場合、エラーを再スロー
   *
   * ## 処理の流れ
   * 1. imageFileがnull: 既存URLを返す（画像未変更時）
   * 2. FormData作成: multipart/form-dataでファイルを送信
   * 3. API呼び出し: POST /api/products/upload
   * 4. エラーハンドリング: レスポンス形式を判定してメッセージを抽出
   * 5. 成功: アップロードされた画像のURLを返す
   *
   * ## エラーメッセージの抽出ロジック
   * - JSONレスポンス: error.error フィールドを使用
   * - テキストレスポンス: レスポンスボディをそのまま使用
   * - パース失敗: ステータスコードを含むデフォルトメッセージ
   *
   * ## ロギングの理由
   * - デバッグ: アップロード失敗の原因を調査
   * - モニタリング: エラー頻度を追跡
   * - contextフィールド: どのフックで発生したかを明示
   *
   * ## finally句の理由
   * - エラー発生時もuploading状態を確実にリセット
   * - ローディング表示が残り続けるのを防ぐ
   *
   * ## useCallbackの理由
   * - 依存配列が空なので、一度だけ生成される
   * - useProductFormなどで安定した参照を提供
   */
  const uploadImage = useCallback(
    async (imageFile: File | null, existingImageUrl: string | null): Promise<string | null> => {
      // 画像ファイルが選択されていない場合
      // 既存の画像URLをそのまま使用（編集時に画像を変更しない場合）
      if (!imageFile) {
        return existingImageUrl || null;
      }

      // アップロード開始
      setUploading(true);
      try {
        // FormDataを作成してファイルを追加
        // multipart/form-dataとして送信するため
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        // Cloudflare R2にアップロード
        const uploadResponse = await fetch("/api/products/upload", {
          method: "POST",
          body: uploadFormData,
        });

        // エラーレスポンスの処理
        if (!uploadResponse.ok) {
          let errorMessage = "画像のアップロードに失敗しました";
          try {
            // レスポンス形式を判定してエラーメッセージを抽出
            const contentType = uploadResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              // JSONレスポンス: error.error フィールドを使用
              const error = await uploadResponse.json();
              errorMessage = error.error || errorMessage;
            } else {
              // テキストレスポンス: そのまま使用
              const text = await uploadResponse.text();
              errorMessage = text || errorMessage;
            }
          } catch {
            // JSONパース失敗: ステータスコードを含むデフォルトメッセージ
            errorMessage = `画像のアップロードに失敗しました (${uploadResponse.status})`;
          }
          throw new Error(errorMessage);
        }

        // 成功レスポンス: アップロードされた画像のURLを取得
        const uploadData = await uploadResponse.json();
        return uploadData.url;
      } catch (error) {
        // エラーをログに記録（デバッグとモニタリング用）
        log.error("画像のアップロードに失敗しました", {
          context: "useImageUpload.uploadImage",
          error,
        });
        // エラーを再スロー（呼び出し元でトースト表示などに使用）
        throw error;
      } finally {
        // エラー発生時も確実にアップロード状態をリセット
        setUploading(false);
      }
    },
    []
  );

  return {
    uploading, // アップロード進行状態
    compressing, // 圧縮進行状態（useImageCompressionから）
    handleImageChange, // 画像選択時の処理（圧縮とプレビュー生成）
    uploadImage, // アップロード処理（フォーム送信時）
  };
}
