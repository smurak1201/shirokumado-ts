import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { uploadImage } from '@/lib/blob';
import { ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';
import { NextRequest } from 'next/server';

/**
 * 画像をアップロード
 *
 * 注意: Vercelの関数ペイロードサイズ制限（約4.5MB）に合わせて、
 * ファイルサイズは設定ファイルで制限されています。
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new ValidationError('ファイルが指定されていません');
  }

  // ファイルタイプの検証
  if (!file.type.startsWith('image/')) {
    throw new ValidationError('画像ファイルのみアップロード可能です');
  }

  // ファイルサイズの検証（設定ファイルから読み込み）
  const MAX_FILE_SIZE = config.imageConfig.MAX_FILE_SIZE_BYTES;
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `ファイルサイズは${config.imageConfig.MAX_FILE_SIZE_MB}MB以下である必要があります`
    );
  }

  // ファイル名を生成（タイムスタンプ + 元のファイル名）
  // タイムスタンプを付けることで、同じファイル名でも上書きされないようにします
  const timestamp = Date.now();
  // ファイル名から特殊文字を除去（セキュリティ対策）
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  // config からフォルダ名を取得
  const filename = `${config.blobConfig.PRODUCT_IMAGE_FOLDER}/${timestamp}_${sanitizedName}`;

  // 画像をアップロード
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await uploadImage(filename, buffer, file.type);

  return apiSuccess({ url: blob.url, filename: blob.pathname });
});
