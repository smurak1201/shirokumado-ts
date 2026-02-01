/**
 * 統一されたエラーハンドリングユーティリティ (lib/errors.ts)
 *
 * アプリケーション全体で使用するカスタムエラークラスとエラーコードを提供します。
 *
 * 主な機能:
 * - カスタムエラークラス（DatabaseError, BlobStorageError, ValidationError, NotFoundError）
 * - エラーコードの一元管理（VALIDATION_ERROR, DATABASE_ERROR など）
 * - エラーメッセージの変換（ユーザー向けメッセージ）
 * - HTTP ステータスコードの自動設定
 *
 * 使用箇所:
 * - API Routes（エラーレスポンス）
 * - Server Actions（データベース操作のエラーハンドリング）
 * - Blob Storage 操作（ファイルアップロードのエラーハンドリング）
 *
 * ベストプラクティス:
 * - すべてのエラーは AppError またはそのサブクラスを使用
 * - エラーコードは ErrorCodes から選択（文字列リテラルを避ける）
 * - 元のエラー（cause）を保存して、デバッグを容易にする
 * - ユーザー向けメッセージは getUserFriendlyMessage で変換
 *
 * エラーの継承階層:
 * - Error（JavaScript 標準）
 *   - AppError（基底クラス）
 *     - DatabaseError（データベース操作のエラー）
 *     - BlobStorageError（ファイルストレージのエラー）
 *     - ValidationError（入力バリデーションのエラー）
 *     - NotFoundError（リソースが見つからない）
 *
 * 注意点:
 * - 本番環境ではスタックトレースをユーザーに表示しない（セキュリティ考慮）
 * - エラーログは必ず logger.ts で記録する
 *
 * @see lib/logger.ts - エラーログの記録
 * @see lib/api-helpers.ts - API エラーレスポンスの生成
 */

/**
 * エラーコードの定数定義
 *
 * API レスポンスで使用されるエラーコードを一元管理します。
 * クライアント側でエラーの種類を判別する際に使用します。
 *
 * as const を使用する理由:
 * - オブジェクトのプロパティを読み取り専用にする
 * - TypeScript で厳密な型推論を可能にする（例: "VALIDATION_ERROR" という文字列リテラル型）
 *
 * エラーコードの一覧:
 * - VALIDATION_ERROR: 入力バリデーションエラー（例: 必須フィールド未入力、形式不正）
 * - DATABASE_ERROR: データベース操作エラー（例: 接続失敗、クエリエラー）
 * - BLOB_STORAGE_ERROR: ファイルストレージエラー（例: アップロード失敗、削除失敗）
 * - NOT_FOUND: リソースが見つからない（例: 商品ID不正、存在しない商品）
 * - UNAUTHORIZED: 認証エラー（例: ログインが必要）
 * - FORBIDDEN: 権限エラー（例: 管理者のみアクセス可能）
 * - INTERNAL_SERVER_ERROR: 内部サーバーエラー（例: 予期しないエラー）
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  BLOB_STORAGE_ERROR: 'BLOB_STORAGE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

/**
 * エラーコードの型定義
 *
 * ErrorCodes オブジェクトの値の型を抽出します。
 * これにより、文字列リテラルのユニオン型が生成されます。
 *
 * 生成される型:
 * ```typescript
 * type ErrorCode =
 *   | "VALIDATION_ERROR"
 *   | "DATABASE_ERROR"
 *   | "BLOB_STORAGE_ERROR"
 *   | "NOT_FOUND"
 *   | "UNAUTHORIZED"
 *   | "FORBIDDEN"
 *   | "INTERNAL_SERVER_ERROR";
 * ```
 *
 * 使用例:
 * ```typescript
 * function handleError(code: ErrorCode) {
 *   if (code === ErrorCodes.VALIDATION_ERROR) {
 *     // バリデーションエラーの処理
 *   }
 * }
 * ```
 *
 * 実装の技術的詳細:
 * - `typeof ErrorCodes`: ErrorCodes オブジェクトの型を取得
 * - `keyof typeof ErrorCodes`: キー（VALIDATION_ERROR など）のユニオン型
 * - `[keyof typeof ErrorCodes]`: 各キーの値の型（文字列リテラル）
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * アプリケーション共通のエラークラス（基底クラス）
 *
 * すべてのカスタムエラーの基底クラスです。
 * HTTP ステータスコードとエラーコードを持ち、API レスポンスの生成に使用します。
 *
 * プロパティ:
 * - message: エラーメッセージ（Error クラスから継承）
 * - statusCode: HTTP ステータスコード（デフォルト: 500）
 * - code: エラーコード（ErrorCodes から選択、オプション）
 * - name: エラークラス名（デフォルト: 'AppError'）
 * - stack: スタックトレース（Error.captureStackTrace で自動生成）
 *
 * 使用例:
 * ```typescript
 * throw new AppError('Something went wrong', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
 * ```
 *
 * 実装の技術的詳細:
 * - Error クラスを継承（JavaScript 標準のエラー機構を活用）
 * - Error.captureStackTrace: V8 エンジンのスタックトレース機能を使用
 *   - this.constructor を渡すことで、コンストラクタ自体をスタックから除外
 *   - これにより、エラーが投げられた場所が正しく表示される
 *
 * 注意点:
 * - 通常はこのクラスを直接使わず、サブクラス（DatabaseError など）を使用する
 * - statusCode は HTTP レスポンスのステータスコードと対応させる
 *
 * @see DatabaseError, BlobStorageError, ValidationError, NotFoundError - サブクラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    // 親クラス（Error）のコンストラクタを呼び出し
    super(message);
    // エラー名を設定（デバッグ時に役立つ）
    this.name = 'AppError';
    // スタックトレースをキャプチャ
    // 理由: エラーが投げられた場所を特定しやすくする
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * データベース操作のエラークラス
 *
 * Prisma によるデータベース操作で発生したエラーをラップします。
 * 元のエラー（cause）を保存することで、詳細なデバッグが可能になります。
 *
 * @param message エラーメッセージ（例: 'Failed to fetch products'）
 * @param originalError 元のエラー（Prisma のエラーなど）
 *
 * 使用例:
 * ```typescript
 * try {
 *   const products = await prisma.product.findMany();
 * } catch (error) {
 *   throw new DatabaseError('商品一覧の取得に失敗しました', error);
 * }
 * ```
 *
 * プロパティ:
 * - message: "Database error: {メッセージ}" の形式
 * - statusCode: 500（Internal Server Error）
 * - code: "DATABASE_ERROR"
 * - cause: 元のエラー（デバッグ用）
 *
 * 実装の理由:
 * - Prisma のエラーをそのまま返すとセキュリティリスクがある
 *   （データベーススキーマやクエリが露出する可能性）
 * - DatabaseError でラップすることで、安全なエラーメッセージを提供
 * - cause プロパティで元のエラーを保存し、サーバーログで詳細を確認できる
 *
 * 注意点:
 * - 元のエラーは Error インスタンスの場合のみ cause に保存される
 * - cause はユーザーに返さない（サーバーログのみ）
 *
 * @see lib/prisma.ts - safePrismaOperation で使用
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    // 親クラス（AppError）のコンストラクタを呼び出し
    // メッセージに "Database error:" プレフィックスを付ける
    super(
      `Database error: ${message}`,
      500, // HTTP 500（Internal Server Error）
      ErrorCodes.DATABASE_ERROR
    );
    this.name = 'DatabaseError';
    // 元のエラーが Error インスタンスの場合、cause プロパティに保存
    // 理由: デバッグ時に元のエラーの詳細（スタックトレースなど）を確認できる
    if (originalError instanceof Error) {
      this.cause = originalError;
    }
  }
}

/**
 * Blob Storage 操作のエラークラス
 *
 * Vercel Blob Storage によるファイル操作で発生したエラーをラップします。
 * 画像アップロード、削除などの操作で使用します。
 *
 * @param message エラーメッセージ（例: 'Failed to upload file'）
 * @param originalError 元のエラー（Vercel Blob SDK のエラーなど）
 *
 * 使用例:
 * ```typescript
 * try {
 *   await put(filename, content);
 * } catch (error) {
 *   throw new BlobStorageError('画像のアップロードに失敗しました', error);
 * }
 * ```
 *
 * プロパティ:
 * - message: "Blob storage error: {メッセージ}" の形式
 * - statusCode: 500（Internal Server Error）
 * - code: "BLOB_STORAGE_ERROR"
 * - cause: 元のエラー（デバッグ用）
 *
 * @see lib/blob.ts - uploadFile, deleteFile などで使用
 */
export class BlobStorageError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(
      `Blob storage error: ${message}`,
      500,
      ErrorCodes.BLOB_STORAGE_ERROR
    );
    this.name = 'BlobStorageError';
    // 元のエラーを cause に保存（デバッグ用）
    if (originalError instanceof Error) {
      this.cause = originalError;
    }
  }
}

/**
 * 入力バリデーションのエラークラス
 *
 * ユーザー入力の検証で発生したエラーを表します。
 * 必須フィールドの未入力、形式不正、範囲外の値などで使用します。
 *
 * @param message エラーメッセージ（例: '商品名は必須です'）
 *
 * 使用例:
 * ```typescript
 * if (!productName || productName.trim().length === 0) {
 *   throw new ValidationError('商品名は必須です');
 * }
 *
 * if (price < 0) {
 *   throw new ValidationError('価格は0以上である必要があります');
 * }
 * ```
 *
 * プロパティ:
 * - message: エラーメッセージ（そのまま）
 * - statusCode: 400（Bad Request）
 * - code: "VALIDATION_ERROR"
 *
 * 実装の理由:
 * - statusCode を 400 に設定（クライアントのリクエストが不正であることを示す）
 * - メッセージはユーザーに表示されるため、分かりやすい日本語で記述
 *
 * 注意点:
 * - このエラーはユーザーに直接表示される
 * - メッセージは具体的で、修正方法が分かるように記述する
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, ErrorCodes.VALIDATION_ERROR);
    this.name = 'ValidationError';
  }
}

/**
 * リソースが見つからないエラークラス
 *
 * データベースや Blob Storage で指定されたリソースが見つからない場合に使用します。
 *
 * @param resource リソースの種類（例: 'Product', 'Category', 'Image'）
 *
 * 使用例:
 * ```typescript
 * const product = await prisma.product.findUnique({ where: { id } });
 * if (!product) {
 *   throw new NotFoundError('Product');
 * }
 * // メッセージ: "Product not found"
 * ```
 *
 * プロパティ:
 * - message: "{リソース名} not found" の形式
 * - statusCode: 404（Not Found）
 * - code: "NOT_FOUND"
 *
 * 実装の理由:
 * - statusCode を 404 に設定（リソースが存在しないことを示す）
 * - リソース名を引数で受け取ることで、どのリソースが見つからないか明確にする
 *
 * 使用場面:
 * - GET /api/products/:id で商品が見つからない
 * - PUT /api/products/:id で更新対象の商品が見つからない
 * - DELETE /api/products/:id で削除対象の商品が見つからない
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}


/**
 * エラーをユーザー向けのメッセージに変換します（英語）
 *
 * エラーオブジェクトを受け取り、ユーザーに表示可能な安全なメッセージに変換します。
 * セキュリティ上の理由から、本番環境では詳細なエラーメッセージを隠します。
 *
 * @param error エラーオブジェクト（AppError, Error, または unknown）
 * @returns ユーザー向けのエラーメッセージ（英語）
 *
 * 使用例:
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   const message = getUserFriendlyMessage(error);
 *   return NextResponse.json({ error: message }, { status: 500 });
 * }
 * ```
 *
 * 判定ロジック:
 * 1. AppError のインスタンス → そのままメッセージを返す
 *    （ValidationError、DatabaseError など、ユーザー向けに作成されたメッセージ）
 * 2. Error のインスタンス:
 *    - 本番環境 → 汎用メッセージ（"An unexpected error occurred"）
 *    - 開発環境 → 元のメッセージ（デバッグ用）
 * 3. その他（unknown） → 汎用メッセージ
 *
 * セキュリティ上の注意:
 * - 本番環境では詳細なエラーメッセージを表示しない
 *   （データベーススキーマ、ファイルパスなどの露出を防ぐ）
 * - 開発環境では詳細を表示してデバッグを容易にする
 */
export function getUserFriendlyMessage(error: unknown): string {
  // AppError のサブクラス（ValidationError など）はそのまま返す
  // 理由: ユーザー向けに作成されたメッセージであり、安全
  if (error instanceof AppError) {
    return error.message;
  }
  // Error インスタンスの場合、環境に応じて処理
  if (error instanceof Error) {
    // 本番環境: 詳細を隠し、汎用メッセージを返す（セキュリティ考慮）
    // 開発環境: 元のメッセージを返す（デバッグ用）
    return process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message;
  }
  // その他の値（string, number など）は汎用メッセージを返す
  return 'An unexpected error occurred';
}

/**
 * エラーを日本語のユーザー向けメッセージに変換します
 *
 * クライアント側（React コンポーネント）のエラーハンドリングで使用します。
 * ユーザーに日本語でエラーメッセージを表示する際に使用します。
 *
 * @param error エラーオブジェクト（AppError, Error, または unknown）
 * @returns ユーザー向けのエラーメッセージ（日本語）
 *
 * 使用例:
 * ```typescript
 * // クライアントコンポーネント
 * try {
 *   await fetch('/api/products', { method: 'POST', body: JSON.stringify(data) });
 * } catch (error) {
 *   const message = getUserFriendlyMessageJa(error);
 *   alert(message); // "処理に失敗しました"
 * }
 * ```
 *
 * 判定ロジック:
 * 1. AppError のインスタンス → そのままメッセージを返す
 *    （日本語で記述されたメッセージを想定）
 * 2. Error のインスタンス → 元のメッセージを返す
 * 3. その他（unknown） → 汎用メッセージ（"処理に失敗しました"）
 *
 * getUserFriendlyMessage との違い:
 * - getUserFriendlyMessage: 英語、本番環境で詳細を隠す（サーバー側）
 * - getUserFriendlyMessageJa: 日本語、詳細を表示（クライアント側）
 *
 * 注意点:
 * - この関数はクライアント側で使用されることを想定
 * - サーバー側のエラーは getUserFriendlyMessage を使用
 */
export function getUserFriendlyMessageJa(error: unknown): string {
  // AppError のサブクラスはそのまま返す
  if (error instanceof AppError) {
    return error.message;
  }
  // Error インスタンスは元のメッセージを返す
  if (error instanceof Error) {
    return error.message;
  }
  // その他の値は汎用メッセージを返す
  return "処理に失敗しました";
}
