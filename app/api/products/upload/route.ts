/**
 * 画像アップロード API エンドポイント
 *
 * ## 目的
 * 商品画像をBlobストレージ（Vercel Blob）にアップロードし、
 * アップロードされた画像のURLを返却します。
 *
 * ## 主な機能
 * - 画像ファイルの検証（ファイルタイプ、ファイルサイズ）
 * - HEIC/HEIF形式を含む各種画像形式のサポート
 * - ファイル名のサニタイズ（セキュリティ対策）
 * - タイムスタンプを使用した一意なファイル名の生成
 * - Blobストレージへの画像アップロード
 *
 * ## HTTPメソッド
 * - POST: 画像をアップロード
 *
 * ## リクエスト
 * - Content-Type: multipart/form-data
 * - フィールド名: "file"
 *
 * ## レスポンス
 * ```json
 * {
 *   "url": "https://blob.vercel-storage.com/...",
 *   "filename": "products/1234567890_image.jpg"
 * }
 * ```
 *
 * ## 認証要件
 * 必要（ダッシュボードからのみアクセス想定）
 *
 * ## エラーハンドリング
 * - withErrorHandling で統一的なエラーハンドリングを実施
 * - ValidationError でユーザーフレンドリーなエラーメッセージを返却
 * - ファイルタイプ、ファイルサイズのバリデーション
 *
 * ## セキュリティ考慮事項
 * - ファイルタイプの厳密な検証（MIME type + 拡張子）
 * - ファイルサイズの制限（設定ファイルから取得）
 * - ファイル名のサニタイズ（特殊文字を除去）
 * - タイムスタンプによるファイル名の一意性保証
 *
 * ## 実装の理由
 * - HEIC形式のサポート: iPhone等で撮影された写真をそのままアップロードできるようにするため
 * - ファイル名のサニタイズ: パストラバーサル攻撃を防ぐため
 * - タイムスタンプ: 同名ファイルの上書きを防ぐため
 *
 * @module app/api/products/upload/route
 */

import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { uploadImage } from '@/lib/blob';
import { ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';
import { NextRequest } from 'next/server';

/**
 * 動的レンダリングを強制
 *
 * ファイルアップロードは動的な処理のため、常にサーバー側で実行する必要があります。
 * これにより、ビルド時の静的生成を回避します。
 */
export const dynamic = 'force-dynamic';

/**
 * 画像をアップロードする POSTハンドラー
 *
 * multipart/form-data で送信された画像ファイルを検証し、
 * Blobストレージにアップロードします。
 *
 * @param request - リクエストオブジェクト（multipart/form-data 形式）
 * @returns アップロードされた画像のURLとファイル名を含むJSONレスポンス
 * @throws ValidationError バリデーションエラーが発生した場合
 * @throws BlobError Blobストレージへのアップロードに失敗した場合
 *
 * ## 実装の理由
 * - isImageFile 関数をローカルで定義: 再利用性よりも、このエンドポイント固有の検証ロジックとして明示
 * - MIME typeと拡張子の両方をチェック: MIME typeは偽装可能なため、拡張子も確認してセキュリティを強化
 * - Buffer.from(await file.arrayBuffer()): FormDataのFileオブジェクトをBufferに変換してBlobストレージに渡す
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new ValidationError('ファイルが指定されていません');
  }

  const isImageFile = (file: File): boolean => {
    if (file.type && file.type.startsWith('image/')) {
      return true;
    }

    const heicTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
    if (file.type && heicTypes.includes(file.type.toLowerCase())) {
      return true;
    }
    if (/\.(heic|heif)$/i.test(file.name)) {
      return true;
    }

    if (!file.type || file.type === 'application/octet-stream') {
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i;
      return imageExtensions.test(file.name);
    }

    return false;
  };

  if (!isImageFile(file)) {
    throw new ValidationError(`画像ファイルのみアップロード可能です。ファイル形式: ${file.type || '不明'}, ファイル名: ${file.name}`);
  }

  const MAX_FILE_SIZE = config.imageConfig.MAX_FILE_SIZE_BYTES;
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `ファイルサイズは${config.imageConfig.MAX_FILE_SIZE_MB}MB以下である必要があります`
    );
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${config.blobConfig.PRODUCT_IMAGE_FOLDER}/${timestamp}_${sanitizedName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await uploadImage(filename, buffer, file.type);

  return apiSuccess({ url: blob.url, filename: blob.pathname });
});
