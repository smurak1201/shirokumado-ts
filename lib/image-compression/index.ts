/**
 * 画像圧縮ユーティリティ
 *
 * スマホで撮影した大きな画像を、アップロード前にブラウザ側で自動的に圧縮・リサイズします。
 * サーバーへの負荷軽減と通信量削減を目的としています。
 *
 * 主な機能:
 * - 画像の自動圧縮・リサイズ（Canvas API使用）
 * - WebP形式への変換（JPEGより約25-35%小さいファイルサイズ）
 * - HEIC形式（iPhoneのデフォルト形式）のサポート
 * - ファイルサイズに応じた最適な読み込み方法の選択
 * - 段階的な品質調整による目標サイズの達成
 *
 * 実装の理由:
 * - **ブラウザ側で処理**: サーバー負荷を軽減し、ユーザー体験を向上
 * - **WebP形式を優先**: JPEG/PNGより高圧縮率で、ブラウザサポートも広範囲
 * - **HEIC対応**: iPhoneユーザーが追加操作なしでアップロード可能
 * - **段階的な品質調整**: 目標サイズを確実に達成するため、品質を0.1ずつ下げる
 *
 * ブラウザAPIの使い分け:
 * - 小さいファイル（5MB未満）: Blob URL + HTMLImageElement（シンプルで互換性高い）
 * - 大きいファイル（5MB以上）: createImageBitmap（メモリ効率が良い）
 *
 * パフォーマンス最適化:
 * - 遅延インポート: heic2anyライブラリはHEIC使用時のみ読み込み
 * - 並列処理なし: 画像処理はメモリを大量に消費するため、一度に1つずつ処理
 * - タイムアウト設定: 60秒で処理を中断し、無限ループを防止
 *
 * 注意点:
 * - ブラウザ環境でのみ実行可能（Canvas API、createImageBitmap使用）
 * - HEIC → JPEG → WebP と2段階変換するため、HEIC処理は時間がかかる
 * - WebP非対応ブラウザは自動的にJPEGにフォールバック
 * - ファイルサイズが50MBを超える場合は処理を拒否
 *
 * 使用例:
 * ```typescript
 * const compressedFile = await compressImage(originalFile);
 * const compressedJpeg = await compressImage(originalFile, { format: 'jpeg' });
 * const customSize = await compressImage(originalFile, { maxWidth: 1024, quality: 0.9 });
 * ```
 */

import { config } from '../config';
import { isHeicFile, convertHeicToJpeg } from './heic';
import { supportsWebP, getFileSizeMB, createErrorMessage } from './utils';
import { loadImage } from './load';

// ユーティリティ関数を再エクスポート
export { getFileSizeMB } from './utils';

/**
 * 画像ファイルかどうかを判定します（HEIC形式も含む）
 *
 * 3段階の判定を行うことで、様々な環境からアップロードされた画像に対応します。
 *
 * @param file - 判定対象のファイル
 * @returns 画像ファイルの場合 true、それ以外は false
 *
 * 判定ロジック:
 * 1. **MIMEタイプ判定**: file.type が 'image/' で始まる場合（標準的なケース）
 * 2. **HEIC判定**: HEIC形式のファイル（iPhoneのデフォルト形式）
 * 3. **拡張子判定**: MIMEタイプが空または 'application/octet-stream' の場合
 *
 * 実装の理由:
 * - iPhoneで撮影した写真は、環境によってfile.typeが空になることがある
 * - 古いブラウザでは一部の画像形式のMIMEタイプが正しく設定されない
 * - HEIC形式は標準のMIMEタイプ判定では検出できない場合がある
 *
 * 注意点:
 * - SVGファイルも画像として扱われるが、Canvas処理には制限がある
 * - 拡張子判定は大文字小文字を区別しない（.JPG も .jpg も許可）
 */
export function isImageFile(file: File): boolean {
  // 1. ファイルタイプがimage/で始まる場合（最も一般的なケース）
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }

  // 2. HEIC形式の場合（iPhoneのデフォルト形式）
  if (isHeicFile(file)) {
    return true;
  }

  // 3. ファイルタイプが空または不明な場合、拡張子で判定
  // 理由: 一部の環境ではMIMEタイプが正しく設定されないため
  if (!file.type || file.type === 'application/octet-stream') {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i;
    return imageExtensions.test(file.name);
  }

  return false;
}

/**
 * 画像圧縮のオプション設定
 *
 * すべてのプロパティはオプショナルで、指定しない場合は config.imageConfig のデフォルト値が使用されます。
 *
 * @property maxWidth - 画像の最大幅（ピクセル）、デフォルト: 1920
 * @property maxHeight - 画像の最大高さ（ピクセル）、デフォルト: 1920
 * @property quality - 圧縮品質（0.0 - 1.0）、デフォルト: 0.85
 *                     0.85は高品質を保ちながらファイルサイズを削減するバランスの良い値
 * @property maxSizeMB - 目標ファイルサイズ（MB）、デフォルト: 3.5
 *                       この値を超える場合、品質を段階的に下げて目標サイズを達成
 * @property format - 出力形式（'webp' | 'jpeg'）、デフォルト: 'webp'
 *                    WebPがサポートされていない場合は自動的にJPEGにフォールバック
 */
interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
  format?: 'webp' | 'jpeg';
}

/**
 * 画像ファイルを圧縮・リサイズします
 *
 * ブラウザ側でCanvas APIを使用して画像を処理し、サーバーへの負荷を軽減します。
 * WebP形式を優先的に使用することで、JPEGよりも約25-35%小さなファイルサイズを実現します。
 *
 * @param file - 元の画像ファイル（JPEG、PNG、HEIC、WebPなど）
 * @param options - 圧縮オプション（すべてオプショナル）
 * @returns 圧縮された画像ファイル（WebP形式、サポートされていない場合はJPEG形式）
 * @throws {Error} ブラウザ環境でない場合
 * @throws {Error} サポートされていないファイル形式の場合
 * @throws {Error} ファイルサイズが大きすぎる場合（50MBを超える）
 * @throws {Error} HEIC形式の変換に失敗した場合
 *
 * 処理の流れ:
 * 1. **環境チェック**: ブラウザ環境であることを確認
 * 2. **ファイル形式検証**: サポートされている画像形式かチェック
 * 3. **ファイルサイズ検証**: 50MB以下であることを確認
 * 4. **HEIC変換** （HEIC形式の場合のみ）: HEIC → JPEG（高品質0.92）
 * 5. **WebP判定**: ブラウザがWebPをサポートしているか確認
 * 6. **画像読み込みと圧縮**: loadImage関数で読み込み、圧縮、リサイズを実行
 *
 * 実装の理由:
 * - **HEIC → JPEG → WebP の2段階変換**: heic2anyライブラリはWebPへの直接変換をサポートしていないため
 * - **高品質でJPEG変換（0.92）**: 2段階変換による画質劣化を最小限に抑える
 * - **WebPへの自動フォールバック**: 古いブラウザでも動作するようにJPEGに切り替え
 *
 * 注意点:
 * - HEIC形式の処理は2段階変換のため、他の形式より時間がかかる
 * - WebP非対応ブラウザ（IE11など）では自動的にJPEG形式で出力
 * - ファイルサイズが大きい場合、処理に時間がかかる可能性がある
 *
 * トレードオフ:
 * - **WebP優先**: ファイルサイズは小さいが、一部の古いブラウザでは非対応
 * - **段階的な品質調整**: 目標サイズを確実に達成するが、処理時間が増える可能性
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // オプションのデフォルト値を設定
  // 理由: ユーザーが指定しない場合でも適切な値で動作するようにする
  const {
    maxWidth = config.imageConfig.MAX_IMAGE_WIDTH, // 1920px
    maxHeight = config.imageConfig.MAX_IMAGE_HEIGHT, // 1920px
    quality = config.imageConfig.COMPRESSION_QUALITY, // 0.85
    maxSizeMB = config.imageConfig.COMPRESSION_TARGET_SIZE_MB, // 3.5MB
    format = 'webp', // デフォルトでWebP形式を使用（JPEGより25-35%小さい）
  } = options;

  // ブラウザ環境のチェック
  // 理由: Canvas API、createImageBitmapなどのブラウザAPIを使用するため
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('画像圧縮はブラウザ環境でのみ実行できます');
  }

  // ファイル形式の検証
  // 理由: 画像以外のファイルをCanvas処理するとエラーになる
  if (!file.type.startsWith('image/') && !isHeicFile(file)) {
    throw new Error(`サポートされていないファイル形式です: ${file.type || '不明'}`);
  }

  // ファイルサイズの検証（大きすぎるファイルは処理を避ける）
  // 理由: 50MBを超える画像はブラウザのメモリを圧迫し、処理が失敗する可能性が高い
  if (file.size > config.imageConfig.MAX_INPUT_SIZE_BYTES) {
    throw new Error(`ファイルサイズが大きすぎます: ${getFileSizeMB(file.size).toFixed(2)}MB`);
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
    } catch (error) {
      throw new Error(createErrorMessage('HEIC形式の変換に失敗しました', error));
    }
  }

  // WebP形式が指定されているが、ブラウザがサポートしていない場合はJPEGにフォールバック
  // 理由: IE11などの古いブラウザではWebPが非対応のため、互換性を確保
  // HEIC形式の場合は、既にJPEGに変換されているので、そのままWebPに変換されます
  const useWebP = format === 'webp' && supportsWebP();
  const outputFormat = useWebP ? 'image/webp' : 'image/jpeg';
  const outputExtension = useWebP ? '.webp' : '.jpg';

  return loadImage(
    processedFile,
    maxWidth,
    maxHeight,
    outputFormat,
    quality,
    maxSizeMB,
    outputExtension
  );
}

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
  return getFileSizeMB(file.size) > maxSizeMB;
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
  return getFileSizeMB(file.size) > maxSizeMB;
}
