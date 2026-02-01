/**
 * 画像アップロード API エンドポイント
 *
 * 商品画像をBlobストレージにアップロード。
 * HEIC形式サポート（iPhoneで撮影された写真対応）。
 * ファイル名のサニタイズでパストラバーサル攻撃を防ぐ。
 */

import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { uploadImage } from '@/lib/blob';
import { ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new ValidationError('ファイルが指定されていません');
  }

  // HEIC形式サポート: iPhoneで撮影された写真をそのままアップロード可能に
  // MIME type偽装対策: 拡張子でもチェック
  const isImageFile = (file: File): boolean => {
    if (file.type && file.type.startsWith('image/')) {
      return true;
    }

    // HEIC形式は一部のブラウザで正しくMIME typeが設定されないため、個別にチェック
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

  // ファイル名のサニタイズ: パストラバーサル攻撃を防ぐ
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

  const filename = `${config.blobConfig.PRODUCT_IMAGE_FOLDER}/${timestamp}_${sanitizedName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const blob = await uploadImage(filename, buffer, file.type);

  return apiSuccess({ url: blob.url, filename: blob.pathname });
});
