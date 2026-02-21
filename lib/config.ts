/**
 * アプリケーション全体の設定を一元管理
 */

export const config = {
  // 画像アップロード・圧縮の制限値
  imageConfig: {
    // Vercelの関数ペイロードサイズ制限（約4.5MB）に合わせて4MBに設定
    MAX_FILE_SIZE_MB: 4,
    MAX_FILE_SIZE_BYTES: 4 * 1024 * 1024,
    COMPRESSION_TARGET_SIZE_MB: 3.5, // 圧縮後の目標サイズ
    MAX_IMAGE_WIDTH: 1920,
    MAX_IMAGE_HEIGHT: 1920,
    COMPRESSION_QUALITY: 0.85,
    MAX_INPUT_SIZE_MB: 50, // ユーザーが選択できるファイルの上限
    MAX_INPUT_SIZE_BYTES: 50 * 1024 * 1024,
    RECOMMENDED_FILE_SIZE_MB: 10, // この値を超えると警告を表示
    IMAGE_LOAD_TIMEOUT_MS: 60000,
    // createImageBitmapはメモリ効率が良いが、大きすぎるファイルでは不安定なため閾値を設定
    CREATE_IMAGE_BITMAP_THRESHOLD_MB: 5,
    CREATE_IMAGE_BITMAP_THRESHOLD_BYTES: 5 * 1024 * 1024,
  },

  // Vercel Blob Storageの設定
  blobConfig: {
    PRODUCT_IMAGE_FOLDER: "products",
    CACHE_CONTROL_MAX_AGE: 31536000, // 1年
  },

  // 商品一覧APIのCDNキャッシュ設定
  apiConfig: {
    // 商品データは管理画面での更新時にrevalidatePathで即座に無効化されるため、長めに設定
    PRODUCT_LIST_CACHE_SECONDS: 2592000, // 30日
    PRODUCT_LIST_STALE_WHILE_REVALIDATE_SECONDS: 2592000, // 30日
  },

  // フロントエンドの表示設定
  displayConfig: {
    GRID_COLUMNS: 3,
    MODAL_CLOSE_DELAY_MS: 300, // モーダルの閉じるアニメーション時間
  },

  // ドラッグ&ドロップの設定
  dndConfig: {
    // クリックとドラッグを区別するための最小移動距離
    POINTER_ACTIVATION_DISTANCE: 5,
    // 長押しでドラッグを開始するまでの待機時間
    TOUCH_ACTIVATION_DELAY: 200,
    TOUCH_TOLERANCE: 5,
  },
} as const;
