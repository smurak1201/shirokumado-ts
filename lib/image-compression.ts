/**
 * 画像圧縮ユーティリティ
 *
 * スマホで撮影した大きな画像を、アップロード前に自動的に圧縮・リサイズします。
 * Canvas APIを使用してブラウザ側で処理を行います。
 * WebP形式で圧縮することで、JPEGよりも約25-35%小さなファイルサイズを実現します。
 * HEIC形式（iPhoneのデフォルト形式）にも対応しています。
 */

import { config } from './config';

// heic2anyを動的インポート（コード分割のため）
// @ts-ignore - heic2anyには型定義がないため
let heic2any: any = null;
async function getHeic2Any() {
  if (!heic2any && typeof window !== 'undefined') {
    try {
      // @ts-ignore - heic2anyには型定義がないため
      const heic2anyModule = await import('heic2any');
      heic2any = heic2anyModule.default || heic2anyModule;
    } catch (error) {
      console.warn('heic2anyの読み込みに失敗しました:', error);
    }
  }
  return heic2any;
}

/**
 * HEIC形式のファイルかどうかを判定します
 * @param file 画像ファイル
 * @returns HEIC形式の場合true
 */
export function isHeicFile(file: File): boolean {
  const heicTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
  return heicTypes.includes(file.type.toLowerCase()) ||
         /\.heic$/i.test(file.name) ||
         /\.heif$/i.test(file.name);
}

/**
 * 画像ファイルかどうかを判定します（HEIC形式も含む）
 * iPhoneの写真など、file.typeが空の場合でもファイル拡張子で判定します
 * @param file ファイル
 * @returns 画像ファイルの場合true
 */
export function isImageFile(file: File): boolean {
  // ファイルタイプがimage/で始まる場合
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }

  // HEIC形式の場合
  if (isHeicFile(file)) {
    return true;
  }

  // ファイルタイプが空の場合、拡張子で判定
  if (!file.type || file.type === 'application/octet-stream') {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i;
    return imageExtensions.test(file.name);
  }

  return false;
}

/**
 * HEIC形式のファイルをJPEGに変換します
 * @param file HEIC形式のファイル
 * @returns JPEG形式のBlob
 */
async function convertHeicToJpeg(file: File): Promise<Blob> {
  const heic2anyLib = await getHeic2Any();
  if (!heic2anyLib) {
    throw new Error('HEIC形式の変換ライブラリが読み込めませんでした');
  }

  try {
    const result = await heic2anyLib({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92, // 高品質を維持
    });

    // heic2anyは配列を返すことがあるので、最初の要素を取得
    const blob = Array.isArray(result) ? result[0] : result;
    if (!(blob instanceof Blob)) {
      throw new Error('HEIC変換の結果が無効です');
    }

    return blob;
  } catch (error) {
    throw new Error(`HEIC形式の変換に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  maxSizeMB?: number; // 目標ファイルサイズ（MB）
  format?: 'webp' | 'jpeg'; // 出力形式
}

/**
 * WebP形式がサポートされているかどうかを判定します
 * @returns WebPがサポートされている場合true
 */
function supportsWebP(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    return dataUrl.indexOf('data:image/webp') === 0;
  } catch (error) {
    console.warn('WebP形式のサポート確認に失敗しました:', error);
    return false;
  }
}

/**
 * 画像ファイルを圧縮・リサイズします
 * @param file 元の画像ファイル
 * @param options 圧縮オプション
 * @returns 圧縮された画像ファイル（WebP形式、サポートされていない場合はJPEG形式）
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = config.imageConfig.MAX_IMAGE_WIDTH,
    maxHeight = config.imageConfig.MAX_IMAGE_HEIGHT,
    quality = config.imageConfig.COMPRESSION_QUALITY,
    maxSizeMB = config.imageConfig.COMPRESSION_TARGET_SIZE_MB,
    format = 'webp', // デフォルトでWebP形式を使用
  } = options;

  // ブラウザ環境のチェック
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('画像圧縮はブラウザ環境でのみ実行できます');
  }

  // ファイル形式の検証
  if (!file.type.startsWith('image/') && !isHeicFile(file)) {
    throw new Error(`サポートされていないファイル形式です: ${file.type || '不明'}`);
  }

  // HEIC形式の場合は、まずJPEGに変換
  // 注意: HEIC形式はブラウザで直接処理できないため、一度JPEGに変換する必要があります
  // heic2anyライブラリはHEIC → JPEG/PNGの変換のみサポートしており、
  // 直接WebPに変換することはできません
  // そのため、HEIC → JPEG（高品質）→ WebP（圧縮）という2段階の変換になります
  let processedFile = file;
  if (isHeicFile(file)) {
    try {
      // HEIC → JPEG変換（高品質0.92で変換して画質劣化を最小限に）
      const jpegBlob = await convertHeicToJpeg(file);
      // BlobをFileに変換（元のファイル名の拡張子を.jpgに変更）
      const jpegFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      processedFile = new File([jpegBlob], jpegFileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      // この時点ではJPEGですが、次のステップでWebPに変換されます（formatオプションが'webp'の場合）
    } catch (error) {
      throw new Error(`HEIC形式の変換に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // WebP形式が指定されているが、ブラウザがサポートしていない場合はJPEGにフォールバック
  // HEIC形式の場合は、既にJPEGに変換されているので、そのままWebPに変換されます
  const useWebP = format === 'webp' && supportsWebP();
  const outputFormat = useWebP ? 'image/webp' : 'image/jpeg';
  const outputExtension = useWebP ? '.webp' : '.jpg';

  return new Promise((resolve, reject) => {

    // ファイルサイズの検証（大きすぎるファイルは処理を避ける）
    const MAX_INPUT_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_INPUT_SIZE) {
      reject(new Error(`ファイルサイズが大きすぎます: ${(file.size / 1024 / 1024).toFixed(2)}MB`));
      return;
    }

    // 大きなファイルの場合は、createImageBitmapを使用（より効率的）
    // サポートされていない場合は、Blob URLを使用
    // 5MB以上でcreateImageBitmapを使用することで、メモリ効率を向上させ、大きな画像の読み込みエラーを防ぐ
    const useCreateImageBitmap = typeof window !== 'undefined' && typeof window.createImageBitmap !== 'undefined' && file.size > 5 * 1024 * 1024; // 5MB以上

    if (useCreateImageBitmap) {
      // createImageBitmapを使用（大きな画像に適している）
      window.createImageBitmap(file)
        .then((imageBitmap) => {
          try {
            // 画像のサイズを計算
            let width = imageBitmap.width;
            let height = imageBitmap.height;

            // 画像サイズが0の場合はエラー
            if (width === 0 || height === 0) {
              reject(new Error('画像のサイズが無効です'));
              return;
            }

            // アスペクト比を保ちながらリサイズ
            if (width > maxWidth || height > maxHeight) {
              const aspectRatio = width / height;
              if (width > height) {
                width = Math.min(width, maxWidth);
                height = width / aspectRatio;
              } else {
                height = Math.min(height, maxHeight);
                width = height * aspectRatio;
              }
            }

            // Canvasを作成して画像を描画
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Canvas context could not be created"));
              return;
            }

            // 画像を描画
            ctx.drawImage(imageBitmap, 0, 0, width, height);
            imageBitmap.close(); // メモリを解放

            // WebP形式（またはJPEG形式）で圧縮
            compressCanvasToFile(canvas, outputFormat, quality, maxSizeMB, file.name, outputExtension)
              .then(resolve)
              .catch(reject);
          } catch (error) {
            reject(new Error(`画像処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`));
          }
        })
        .catch((error) => {
          console.error('createImageBitmapエラー:', {
            error,
            fileName: processedFile.name,
            fileSize: processedFile.size,
            fileType: processedFile.type,
          });
          // createImageBitmapが失敗した場合は、Blob URL方式にフォールバック
          loadImageWithBlobURL(processedFile, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension)
            .then(resolve)
            .catch(reject);
        });
    } else {
      // 小さなファイルの場合は、Blob URLを使用（DataURLよりも効率的）
      loadImageWithBlobURL(processedFile, maxWidth, maxHeight, outputFormat, quality, maxSizeMB, outputExtension)
        .then(resolve)
        .catch(reject);
    }
  });
}

/**
 * Canvasを圧縮してFileに変換するヘルパー関数
 */
function compressCanvasToFile(
  canvas: HTMLCanvasElement,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  originalFileName: string,
  outputExtension: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    const compressWithQuality = (q: number): Promise<File> => {
      return new Promise((resolveCompress, rejectCompress) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              rejectCompress(new Error(`画像の圧縮に失敗しました（品質: ${q}）`));
              return;
            }

            const sizeMB = blob.size / (1024 * 1024);
            // 目標サイズより大きい場合、品質を下げて再試行
            const MIN_QUALITY = 0.5;
            const QUALITY_STEP = 0.1;
            if (sizeMB > maxSizeMB && q > MIN_QUALITY) {
              resolveCompress(
                compressWithQuality(Math.max(q - QUALITY_STEP, MIN_QUALITY))
              );
            } else {
              const compressedFile = new File(
                [blob],
                originalFileName.replace(/\.[^/.]+$/, outputExtension),
                {
                  type: outputFormat,
                  lastModified: Date.now(),
                }
              );
              resolveCompress(compressedFile);
            }
          },
          outputFormat,
          q
        );
      });
    };

    compressWithQuality(quality).then(resolve).catch(reject);
  });
}

/**
 * Blob URLを使用して画像を読み込むヘルパー関数
 */
function loadImageWithBlobURL(
  file: File,
  maxWidth: number,
  maxHeight: number,
  outputFormat: string,
  quality: number,
  maxSizeMB: number,
  outputExtension: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    let blobUrl: string | null = null;

    try {
      blobUrl = URL.createObjectURL(file);
    } catch (error) {
      reject(new Error(`Blob URLの作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`));
      return;
    }

    const img = new Image();

    // 画像読み込みのタイムアウトを設定（60秒に延長 - 大きなファイル用）
    const timeoutId = setTimeout(() => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      reject(new Error(`画像の読み込みがタイムアウトしました（60秒）。ファイルサイズが大きすぎる可能性があります（${(file.size / 1024 / 1024).toFixed(2)}MB）。`));
    }, 60000);

    img.onload = () => {
      clearTimeout(timeoutId);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl); // メモリを解放
      }

      try {
        // 画像のサイズを計算
        let width = img.width;
        let height = img.height;

        // 画像サイズが0の場合はエラー
        if (width === 0 || height === 0) {
          reject(new Error('画像のサイズが無効です'));
          return;
        }

        console.log(`画像読み込み成功: ${width}x${height}, ファイルサイズ: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

        // アスペクト比を保ちながらリサイズ
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
          console.log(`リサイズ: ${width}x${height}`);
        }

        // Canvasを作成して画像を描画
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context could not be created"));
          return;
        }

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);

        // WebP形式（またはJPEG形式）で圧縮
        compressCanvasToFile(canvas, outputFormat, quality, maxSizeMB, file.name, outputExtension)
          .then(resolve)
          .catch(reject);
      } catch (error) {
        reject(new Error(`画像処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`));
      }
    };

    img.onerror = (event) => {
      clearTimeout(timeoutId);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      console.error('画像読み込みエラー:', {
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
        blobUrl: blobUrl ? '作成済み' : '作成失敗',
        event: event,
        error: event instanceof ErrorEvent ? event.error : null,
      });

      // ファイルサイズが大きい場合の特別なメッセージ
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > 10) {
        reject(new Error(`画像の読み込みに失敗しました。ファイルサイズが大きすぎる可能性があります（${fileSizeMB.toFixed(2)}MB）。推奨サイズは10MB以下です。別の画像を選択するか、画像を小さくしてから再度お試しください。`));
      } else {
        reject(new Error(`画像の読み込みに失敗しました。ファイル形式（${file.type || '不明'}）がサポートされていない可能性があります。`));
      }
    };

    // 画像の読み込みを開始
    try {
      img.src = blobUrl;
    } catch (error) {
      clearTimeout(timeoutId);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      reject(new Error(`画像の読み込み開始に失敗しました: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

/**
 * 画像ファイルが圧縮が必要かどうかを判定します
 * @param file 画像ファイル
 * @param maxSizeMB 最大ファイルサイズ（MB）
 * @returns 圧縮が必要な場合true
 */
/**
 * 画像ファイルが圧縮が必要かどうかを判定する関数
 *
 * ファイルサイズが目標サイズを超えている場合、圧縮が必要と判断します。
 *
 * @param file - 判定対象の画像ファイル
 * @param maxSizeMB - 最大ファイルサイズ（MB、デフォルト: config.imageConfig.COMPRESSION_TARGET_SIZE_MB）
 * @returns 圧縮が必要な場合 true
 */
export function needsCompression(
  file: File,
  maxSizeMB: number = config.imageConfig.COMPRESSION_TARGET_SIZE_MB
): boolean {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > maxSizeMB;
}

/**
 * 画像ファイルが大きすぎるかどうかを判定する関数（圧縮を強制する閾値）
 *
 * ファイルサイズが最大許容サイズを超えている場合、大きすぎると判断します。
 * この関数は、圧縮後でもサイズ制限を超える可能性があるファイルを検出するために使用します。
 *
 * @param file - 判定対象の画像ファイル
 * @param maxSizeMB - 最大ファイルサイズ（MB、デフォルト: config.imageConfig.MAX_FILE_SIZE_MB）
 * @returns 大きすぎる場合 true
 */
export function isTooLarge(
  file: File,
  maxSizeMB: number = config.imageConfig.MAX_FILE_SIZE_MB
): boolean {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > maxSizeMB;
}
