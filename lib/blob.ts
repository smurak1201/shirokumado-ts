import { put, list, head, del } from '@vercel/blob';
import { BlobStorageError } from './errors';
import { config } from './config';
import { log } from './logger';

/**
 * Vercel Blob Storage ユーティリティ
 *
 * 画像やファイルのアップロード・管理に使用します
 * 環境変数 BLOB_READ_WRITE_TOKEN を使用します
 *
 * ベストプラクティス:
 * - すべての操作でエラーハンドリングを実装
 * - ファイルサイズの検証を推奨
 * - 適切なキャッシュ制御を設定
 */

/**
 * ファイルをBlobストレージにアップロードします
 * @param filename ファイル名
 * @param content ファイルの内容（Buffer、ReadableStream、または文字列）
 * @param options アップロードオプション
 * @returns アップロードされたBlobの情報
 */
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
    // ファイル名の検証
    if (!filename || filename.trim().length === 0) {
      throw new BlobStorageError('Filename is required');
    }

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
 * 画像をBlobストレージにアップロードします
 * @param filename ファイル名
 * @param imageBuffer 画像のBuffer
 * @param contentType MIMEタイプ（例: 'image/jpeg', 'image/png'）
 * @returns アップロードされたBlobの情報
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

/**
 * Blobストレージ内のファイル一覧を取得します
 * @param options リストオプション
 * @returns Blobのリスト
 */
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

/**
 * Blobのメタデータを取得します
 * @param url BlobのURL
 * @returns Blobのメタデータ
 */
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

/**
 * Blobストレージからファイルを削除します
 * @param url 削除するBlobのURL
 * @returns 削除が成功したかどうか
 */
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
 * 複数のBlobを削除します
 * @param urls 削除するBlobのURLの配列
 * @returns 削除が成功したかどうか
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
