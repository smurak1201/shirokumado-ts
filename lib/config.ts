/**
 * アプリケーション設定
 *
 * このファイルにハードコードされている値を集約し、
 * 環境変数や設定から動的に変更できるようにします。
 */

/**
 * 画像アップロード関連の設定
 */
export const imageConfig = {
  // 最大ファイルサイズ（バイト）
  // Vercelの関数ペイロードサイズ制限（約4.5MB）に合わせて4MBに設定
  maxFileSize: 4 * 1024 * 1024, // 4MB

  // 最大ファイルサイズ（MB単位、表示用）
  maxFileSizeMB: 4,

  // 画像圧縮の目標サイズ（MB）
  // Vercelの制限より少し小さめに設定
  compressionTargetSizeMB: 3.5,

  // 画像の最大サイズ（ピクセル）
  maxWidth: 1920,
  maxHeight: 1920,

  // 画像圧縮の品質（0.0 - 1.0）
  compressionQuality: 0.85,

  // 最小圧縮品質（これ以下には下げない）
  minCompressionQuality: 0.3,

  // 圧縮時の品質ステップ
  compressionQualityStep: 0.1,
} as const;

/**
 * Blobストレージ関連の設定
 */
export const blobConfig = {
  // 商品画像の保存フォルダ名
  productsFolder: 'products',

  // キャッシュ制御の最大年齢（秒）
  cacheControlMaxAge: 31536000, // 1年
} as const;

/**
 * API関連の設定
 */
export const apiConfig = {
  // 商品一覧APIのキャッシュ時間（秒）
  productsCacheMaxAge: 60,

  // 商品一覧APIのstale-while-revalidate時間（秒）
  productsStaleWhileRevalidate: 120,

  // カテゴリー一覧APIのキャッシュ時間（秒）
  categoriesCacheMaxAge: 300,

  // カテゴリー一覧APIのstale-while-revalidate時間（秒）
  categoriesStaleWhileRevalidate: 600,
} as const;

/**
 * 表示関連の設定
 */
export const displayConfig = {
  // 商品一覧のグリッド列数
  productGridColumns: 3,

  // 配置変更タブのグリッド列数
  layoutGridColumns: 3,
} as const;
