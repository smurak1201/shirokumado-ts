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
 *
 * @param filename ファイル名（例: 'products/image-123.jpg'）
 * @param content ファイルの内容（Buffer、ReadableStream、または文字列）
 * @param options アップロードオプション
 * @param options.contentType MIMEタイプ（例: 'image/jpeg', 'image/png'）
 * @param options.addRandomSuffix ファイル名にランダムな接尾辞を追加するか
 * @param options.cacheControlMaxAge キャッシュ期間（秒）
 * @param options.access アクセス権限（'public' または 'private'、デフォルト: 'public'）
 * @returns アップロードされたBlobの情報（URL、サイズなど）
 * @throws {BlobStorageError} ファイル名が空の場合、またはアップロードに失敗した場合
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
    // 理由: 空のファイル名はストレージで問題を引き起こす可能性がある
    if (!filename || filename.trim().length === 0) {
      throw new BlobStorageError('Filename is required');
    }

    // access オプションを分離してデフォルト値を設定
    // 理由: Vercel Blob の型定義では access が必須だが、通常は 'public' で良いためデフォルト値を提供
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
    // BlobStorageError は再スローし、他のエラーはラップする
    // 理由: 既にカスタムエラーの場合は追加の情報を付与しない
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
 *
 * uploadFile のラッパー関数で、画像用の適切なデフォルト設定を提供します。
 *
 * @param filename ファイル名（例: 'products/image-123.jpg'）
 * @param imageBuffer 画像のBuffer（圧縮済みの画像データ）
 * @param contentType MIMEタイプ（例: 'image/jpeg', 'image/png'）、デフォルト: 'image/jpeg'
 * @returns アップロードされたBlobの情報（URL、サイズなど）
 * @throws {BlobStorageError} アップロードに失敗した場合
 *
 * 注意点:
 * - access は常に 'public'（商品画像は公開する必要がある）
 * - キャッシュ期間は config.blobConfig.CACHE_CONTROL_MAX_AGE（1年）に設定
 * - 理由: 画像は頻繁に変更されないため、長期キャッシュで CDN 効率を最大化
 */
export async function uploadImage(
  filename: string,
  imageBuffer: Buffer,
  contentType: string = 'image/jpeg'
) {
  return uploadFile(filename, imageBuffer, {
    contentType,
    access: 'public', // 商品画像は公開（誰でもアクセス可能）
    cacheControlMaxAge: config.blobConfig.CACHE_CONTROL_MAX_AGE, // 1年間キャッシュ
  });
}

/**
 * Blobストレージ内のファイル一覧を取得します
 *
 * @param options リストオプション
 * @param options.prefix フィルタリング用のプレフィックス（例: 'products/'）
 * @param options.limit 取得する最大件数（ページネーション用）
 * @param options.cursor ページネーションのカーソル（次のページを取得する際に使用）
 * @returns Blobのリストとカーソル（次のページがある場合）
 * @throws {BlobStorageError} 取得に失敗した場合
 *
 * 使用例:
 * - 全ての商品画像を取得: `listFiles({ prefix: 'products/' })`
 * - ページネーション: `listFiles({ limit: 10, cursor: previousCursor })`
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
 *
 * ファイルの存在確認やサイズの取得などに使用します。
 *
 * @param url BlobのURL（例: 'https://xxx.public.blob.vercel-storage.com/...'）
 * @returns Blobのメタデータ（サイズ、Content-Type、アップロード日時など）
 * @throws {BlobStorageError} URLが空の場合、または取得に失敗した場合
 *
 * 使用例:
 * - ファイルの存在確認
 * - ファイルサイズの取得（アップロード前の容量チェック用）
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
 *
 * @param url 削除するBlobのURL（例: 'https://xxx.public.blob.vercel-storage.com/...'）
 * @returns 削除が成功したかどうか（常に true、失敗時は例外をスロー）
 * @throws {BlobStorageError} URLが空の場合、または削除に失敗した場合
 *
 * 注意点:
 * - 削除は元に戻せない操作のため、実行前に確認を推奨
 * - 存在しないファイルを削除しようとした場合もエラーになる可能性がある
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
 *
 * Promise.all で並列実行するため、大量のファイルを効率的に削除できます。
 *
 * @param urls 削除するBlobのURLの配列
 * @returns 削除が成功したかどうか（常に true、失敗時は例外をスロー）
 * @throws {BlobStorageError} URLsが空の場合、または削除に失敗した場合
 *
 * 注意点:
 * - 一つでも削除に失敗すると全体がエラーになる（トランザクションではない）
 * - 並列実行のため、大量のファイル削除時はレート制限に注意
 *
 * トレードオフ:
 * - 並列実行: 高速だが、一部失敗時のリトライが難しい
 * - 代替案: 順次実行すれば部分的な成功/失敗を追跡できるが、遅い
 */
export async function deleteFiles(urls: string[]) {
  try {
    if (!urls || urls.length === 0) {
      throw new BlobStorageError('URLs array is required');
    }
    // Promise.all で並列削除（パフォーマンス最適化）
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
