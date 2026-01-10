/**
 * アプリケーション全体の設定を一元管理するファイル
 *
 * ハードコードされた値を集約し、変更や環境ごとの設定を容易にします。
 * 設定値を変更する場合は、このファイルを編集するだけで全体に反映されます。
 */
export const config = {
  /**
   * 画像アップロードと圧縮に関する設定
   */
  imageConfig: {
    /**
     * 許容される最大ファイルサイズ（MB）
     * Vercel の関数ペイロードサイズ制限（約4.5MB）に合わせて4MBに設定
     */
    MAX_FILE_SIZE_MB: 4,

    /**
     * 許容される最大ファイルサイズ（バイト）
     * ファイルサイズの検証時に使用します
     */
    MAX_FILE_SIZE_BYTES: 4 * 1024 * 1024, // 4MB

    /**
     * 圧縮後の目標ファイルサイズ（MB）
     * Vercel の制限より少し小さめに設定して安全マージンを確保
     */
    COMPRESSION_TARGET_SIZE_MB: 3.5,

    /**
     * 画像の最大幅（ピクセル）
     * このサイズを超える画像は自動的にリサイズされます
     */
    MAX_IMAGE_WIDTH: 1920,

    /**
     * 画像の最大高さ（ピクセル）
     * このサイズを超える画像は自動的にリサイズされます
     */
    MAX_IMAGE_HEIGHT: 1920,

    /**
     * 画像圧縮品質（0.0 - 1.0）
     * 0.85 は高品質を保ちながらファイルサイズを削減するバランスの良い値です
     */
    COMPRESSION_QUALITY: 0.85,
  },

  /**
   * Vercel Blob Storage に関する設定
   */
  blobConfig: {
    /**
     * 商品画像の保存フォルダ名
     * Blob Storage 内で商品画像を整理するために使用します
     */
    PRODUCT_IMAGE_FOLDER: "products",

    /**
     * Blob のキャッシュ期間（秒）
     * 1年（31536000秒）に設定して、画像の再取得を最小限に抑えます
     */
    CACHE_CONTROL_MAX_AGE: 31536000, // 1年
  },

  /**
   * API エンドポイントに関する設定
   */
  apiConfig: {
    /**
     * 商品一覧 API のキャッシュ期間（秒）
     * 60秒間キャッシュすることで、データベースへの負荷を軽減します
     */
    PRODUCT_LIST_CACHE_SECONDS: 60,

    /**
     * 商品一覧 API の stale-while-revalidate 期間（秒）
     * キャッシュが古くなっても、再検証中は古いデータを返します
     */
    PRODUCT_LIST_STALE_WHILE_REVALIDATE_SECONDS: 120, // 2分

    /**
     * カテゴリー一覧 API のキャッシュ期間（秒）
     * カテゴリーは商品より変更頻度が低いため、5分間キャッシュします
     */
    CATEGORY_LIST_CACHE_SECONDS: 300, // 5分

    /**
     * カテゴリー一覧 API の stale-while-revalidate 期間（秒）
     * キャッシュが古くなっても、再検証中は古いデータを返します
     */
    CATEGORY_LIST_STALE_WHILE_REVALIDATE_SECONDS: 600, // 10分
  },

  /**
   * UI 表示に関する設定
   */
  displayConfig: {
    /**
     * 商品一覧のグリッド列数
     * 3列表示で商品をタイル状に配置します
     */
    GRID_COLUMNS: 3,
  },
};
