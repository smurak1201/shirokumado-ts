import { put, list, head, del } from '@vercel/blob';

/**
 * Vercel Blob Storage ユーティリティ
 *
 * 画像やファイルのアップロード・管理に使用します
 * 環境変数 BLOB_READ_WRITE_TOKEN を使用します
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
    const { access, ...restOptions } = options ?? {};
    const blob = await put(filename, content, {
      ...restOptions,
      access: (access ?? 'public') as 'public',
    });
    return blob;
  } catch (error) {
    console.error('Blob upload error:', error);
    throw error;
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
    cacheControlMaxAge: 31536000, // 1年
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
    console.error('Blob list error:', error);
    throw error;
  }
}

/**
 * Blobのメタデータを取得します
 * @param url BlobのURL
 * @returns Blobのメタデータ
 */
export async function getBlobInfo(url: string) {
  try {
    const blob = await head(url);
    return blob;
  } catch (error) {
    console.error('Blob head error:', error);
    throw error;
  }
}

/**
 * Blobストレージからファイルを削除します
 * @param url 削除するBlobのURL
 * @returns 削除が成功したかどうか
 */
export async function deleteFile(url: string) {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error('Blob delete error:', error);
    throw error;
  }
}

/**
 * 複数のBlobを削除します
 * @param urls 削除するBlobのURLの配列
 * @returns 削除が成功したかどうか
 */
export async function deleteFiles(urls: string[]) {
  try {
    await Promise.all(urls.map(url => del(url)));
    return true;
  } catch (error) {
    console.error('Blob delete error:', error);
    throw error;
  }
}
