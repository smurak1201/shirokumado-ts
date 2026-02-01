/**
 * Vercel Blob Storageユーティリティ
 */

import { put, list, head, del } from '@vercel/blob';
import { BlobStorageError } from './errors';
import { config } from './config';
import { log } from './logger';

export async function uploadFile(
  filename: string,
  content: Buffer | ReadableStream | string,
  options?: {
    contentType?: string;
    addRandomSuffix?: boolean;
    cacheControlMaxAge?: number;
    access?: 'public' | 'private';
  }
) {
  try {
    if (!filename || filename.trim().length === 0) {
      throw new BlobStorageError('Filename is required');
    }

    // Vercel Blobの型定義ではaccessが必須だが、通常は'public'で良いためデフォルト値を提供
    const { access, ...restOptions } = options ?? {};
    const blob = await put(filename, content, {
      ...restOptions,
      access: (access ?? 'public') as 'public',
    });
    return blob;
  } catch (error) {
    log.error('ファイルのアップロードに失敗しました', {
      context: 'uploadFile',
      error,
    });
    if (error instanceof BlobStorageError) {
      throw error;
    }
    throw new BlobStorageError(
      `Failed to upload file: ${filename}`,
      error
    );
  }
}

/**
 * 画像をBlobストレージにアップロード
 *
 * 画像は公開設定で1年間キャッシュ（頻繁に変更されないためCDN効率を最大化）
 */
export async function uploadImage(
  filename: string,
  imageBuffer: Buffer,
  contentType: string = 'image/jpeg'
) {
  return uploadFile(filename, imageBuffer, {
    contentType,
    access: 'public',
    cacheControlMaxAge: config.blobConfig.CACHE_CONTROL_MAX_AGE,
  });
}

export async function listFiles(options?: {
  prefix?: string;
  limit?: number;
  cursor?: string;
}) {
  try {
    const { blobs, cursor } = await list(options);
    return { blobs, cursor };
  } catch (error) {
    log.error('ファイル一覧の取得に失敗しました', {
      context: 'listFiles',
      error,
    });
    throw new BlobStorageError('Failed to list files', error);
  }
}

export async function getBlobInfo(url: string) {
  try {
    if (!url || url.trim().length === 0) {
      throw new BlobStorageError('URL is required');
    }
    const blob = await head(url);
    return blob;
  } catch (error) {
    log.error('Blob情報の取得に失敗しました', {
      context: 'getBlobInfo',
      error,
      metadata: { url },
    });
    throw new BlobStorageError(`Failed to get blob info: ${url}`, error);
  }
}

export async function deleteFile(url: string) {
  try {
    if (!url || url.trim().length === 0) {
      throw new BlobStorageError('URL is required');
    }
    await del(url);
    return true;
  } catch (error) {
    log.error('ファイルの削除に失敗しました', {
      context: 'deleteFile',
      error,
      metadata: { url },
    });
    throw new BlobStorageError(`Failed to delete file: ${url}`, error);
  }
}

/**
 * 複数のBlobを並列削除
 */
export async function deleteFiles(urls: string[]) {
  try {
    if (!urls || urls.length === 0) {
      throw new BlobStorageError('URLs array is required');
    }
    await Promise.all(urls.map(url => del(url)));
    return true;
  } catch (error) {
    log.error('複数ファイルの削除に失敗しました', {
      context: 'deleteFiles',
      error,
    });
    throw new BlobStorageError('Failed to delete files', error);
  }
}
