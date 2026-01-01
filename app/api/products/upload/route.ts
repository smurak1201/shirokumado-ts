import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { uploadImage } from '@/lib/blob';
import { ValidationError } from '@/lib/errors';
import { NextRequest } from 'next/server';

/**
 * 画像をアップロード
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

  // ファイルサイズの検証（5MB制限）
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError('ファイルサイズは5MB以下である必要があります');
  }

  // ファイル名を生成（タイムスタンプ + 元のファイル名）
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `products/${timestamp}_${sanitizedName}`;

  // 画像をアップロード
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await uploadImage(filename, buffer, file.type);

  return apiSuccess({ url: blob.url, filename: blob.pathname });
});
