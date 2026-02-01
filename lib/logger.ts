/**
 * 構造化ログユーティリティ (lib/logger.ts)
 *
 * アプリケーション全体で使用する統一されたログ出力を提供します。
 *
 * 主な機能:
 * - JSON 形式の構造化ログ出力（本番環境）
 * - 読みやすいカラー出力（開発環境）
 * - ログレベル管理（DEBUG, INFO, WARN, ERROR）
 * - コンテキスト情報の付与
 * - エラーオブジェクトの自動解析
 *
 * 使用箇所:
 * - データベース操作のエラーログ
 * - API エンドポイントのリクエスト/レスポンスログ
 * - アプリケーション全体のエラーハンドリング
 *
 * ベストプラクティス:
 * - すべてのエラーはログに記録する
 * - context パラメータで発生箇所を明示する
 * - metadata で追加情報を構造化して記録
 *
 * 注意点:
 * - 本番環境では JSON 形式で出力される（ログ分析ツール向け）
 * - 開発環境ではスタックトレースを含む（デバッグ用）
 * - 本番環境ではスタックトレースは含まれない（セキュリティ考慮）
 */

/**
 * ログレベル
 *
 * アプリケーションで使用するログの重要度を定義します。
 *
 * - DEBUG: デバッグ情報（開発時のみ使用）
 * - INFO: 一般的な情報ログ（正常動作の記録）
 * - WARN: 警告（エラーではないが注意が必要）
 * - ERROR: エラー（エラーハンドリングが必要）
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * ログエントリの型定義
 *
 * ログ分析ツール（DataDog、CloudWatch など）で解析しやすい形式です。
 *
 * 理由: JSON 形式で構造化することで、ログ検索やフィルタリングが容易になる
 */
export interface LogEntry {
  /** ログレベル */
  level: LogLevel;
  /** ログメッセージ */
  message: string;
  /** タイムスタンプ（ISO 8601形式） */
  timestamp: string;
  /** ログの発生箇所（関数名、モジュール名など） */
  context?: string;
  /** エラー情報（Error オブジェクトから抽出） */
  error?: {
    /** エラー名（Error、TypeError など） */
    name: string;
    /** エラーメッセージ */
    message: string;
    /** スタックトレース（開発環境のみ） */
    stack?: string;
    /** エラーの原因（Error.cause） */
    cause?: unknown;
  };
  /** 追加のメタデータ（任意の構造化データ） */
  metadata?: Record<string, unknown>;
}

/**
 * ログを出力します（内部関数）
 *
 * すべてのログ出力関数（debug, info, warn, error）から呼ばれる共通処理です。
 * 環境に応じて適切な形式でログを出力します。
 *
 * @param level ログレベル（DEBUG, INFO, WARN, ERROR）
 * @param message ログメッセージ（何が起きたかを示す文字列）
 * @param options オプション設定
 * @param options.context ログの発生箇所（関数名、モジュール名など）例: 'uploadFile', 'API:products'
 * @param options.error エラーオブジェクト（Error インスタンスまたはその他の値）
 * @param options.metadata 追加のメタデータ（構造化データとして記録）例: { userId: 123, productId: 456 }
 *
 * 実装の理由:
 * - 本番環境では JSON 形式で出力し、ログ分析ツール（DataDog、CloudWatch など）との統合を容易にする
 * - 開発環境では色付きで読みやすく表示し、デバッグを効率化する
 * - スタックトレースは開発環境のみで出力（本番環境ではセキュリティリスクを考慮して非表示）
 *
 * トレードオフ:
 * - JSON 出力: ログ分析には最適だが、そのままでは人間が読みにくい
 * - カラー出力: デバッグには便利だが、ログファイルに記録すると制御文字が含まれる
 * - 現在の実装は環境ごとに最適な形式を選択することで両方の利点を活かす
 */
function logInternal(level: LogLevel, message: string, options?: {
  context?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (options?.context) {
    entry.context = options.context;
  }

  if (options?.error) {
    if (options.error instanceof Error) {
      entry.error = {
        name: options.error.name,
        message: options.error.message,
        stack: process.env.NODE_ENV === 'development' ? options.error.stack : undefined,
        cause: options.error.cause,
      };
    } else {
      entry.error = {
        name: 'UnknownError',
        message: String(options.error),
      };
    }
  }

  if (options?.metadata) {
    entry.metadata = options.metadata;
  }

  // 本番環境では JSON 形式で出力（ログ分析ツールとの統合を容易にする）
  // 開発環境では読みやすい形式で出力
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    // 開発環境では色付きで出力
    const prefix = options?.context ? `[${options.context}]` : '';
    const levelColor = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    }[level];
    const resetColor = '\x1b[0m';

    const logMethod = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
    }[level];

    logMethod(
      `${levelColor}${level.toUpperCase()}${resetColor} ${prefix} ${message}`,
      options?.error || options?.metadata || ''
    );
  }
}

/**
 * デバッグレベルのログを出力します
 *
 * 開発時のデバッグ情報を記録します。本番環境でも出力されますが、
 * 通常はログレベルフィルタで非表示にすることを推奨します。
 *
 * @param message ログメッセージ（例: 'データベースクエリを実行', 'キャッシュヒット'）
 * @param options オプション設定
 * @param options.context ログの発生箇所（例: 'getProducts', 'cache'）
 * @param options.metadata 追加のメタデータ（例: { query: 'SELECT...', duration: 123 }）
 *
 * 使用例:
 * ```typescript
 * debug('商品データを取得中', {
 *   context: 'getProducts',
 *   metadata: { categoryId: 1 }
 * });
 * ```
 *
 * 注意点:
 * - 本番環境では大量のデバッグログがパフォーマンスに影響する可能性がある
 * - 機密情報（パスワード、トークンなど）は絶対にログに記録しないこと
 */
export function debug(message: string, options?: {
  context?: string;
  metadata?: Record<string, unknown>;
}): void {
  logInternal(LogLevel.DEBUG, message, options);
}

/**
 * 情報レベルのログを出力します
 *
 * アプリケーションの正常な動作を記録します。
 * エラーではないが、運用上重要なイベント（起動、終了、重要な処理の開始/完了など）を記録します。
 *
 * @param message ログメッセージ（例: 'サーバー起動完了', '商品データの更新完了'）
 * @param options オプション設定
 * @param options.context ログの発生箇所（例: 'server', 'updateProduct'）
 * @param options.metadata 追加のメタデータ（例: { port: 3000, productId: 123 }）
 *
 * 使用例:
 * ```typescript
 * info('商品を正常に作成しました', {
 *   context: 'createProduct',
 *   metadata: { productId: 123, name: '新商品' }
 * });
 * ```
 *
 * ベストプラクティス:
 * - 重要なビジネスロジックの完了時に記録する
 * - ユーザーのアクション（作成、更新、削除など）を追跡する
 * - システムの状態変化（起動、シャットダウンなど）を記録する
 */
export function info(message: string, options?: {
  context?: string;
  metadata?: Record<string, unknown>;
}): void {
  logInternal(LogLevel.INFO, message, options);
}

/**
 * 警告レベルのログを出力します
 *
 * エラーではないが、注意が必要な状況を記録します。
 * アプリケーションは正常に動作を続けるが、将来的に問題になる可能性があるイベントを記録します。
 *
 * @param message ログメッセージ（例: '非推奨のAPIを使用しています', 'キャッシュミス'）
 * @param options オプション設定
 * @param options.context ログの発生箇所（例: 'getProducts', 'cache'）
 * @param options.error エラーオブジェクト（警告の原因となったエラー、オプション）
 * @param options.metadata 追加のメタデータ（例: { apiVersion: 'v1', recommended: 'v2' }）
 *
 * 使用例:
 * ```typescript
 * warn('商品画像が見つかりませんでした（デフォルト画像を使用）', {
 *   context: 'getProductImage',
 *   metadata: { productId: 123, fallbackImage: 'default.jpg' }
 * });
 * ```
 *
 * 使用場面:
 * - 非推奨の機能を使用している場合
 * - リソースが不足している場合（メモリ、ディスク容量など）
 * - フォールバック処理を実行した場合
 * - パフォーマンスが低下している場合
 *
 * 注意点:
 * - 頻繁に発生する警告はログが肥大化するため、適切な頻度で記録すること
 * - 警告を無視せず、定期的に確認して根本原因を解決すること
 */
export function warn(message: string, options?: {
  context?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}): void {
  logInternal(LogLevel.WARN, message, options);
}

/**
 * エラーレベルのログを出力します
 *
 * エラーが発生したことを記録します。アプリケーションの正常な動作が妨げられた場合に使用します。
 * すべてのエラーは必ずこの関数でログに記録してください。
 *
 * @param message ログメッセージ（何が失敗したかを示す文字列）例: 'データベース接続に失敗しました'
 * @param options オプション設定
 * @param options.context ログの発生箇所（例: 'connectDatabase', 'API:createProduct'）
 * @param options.error エラーオブジェクト（Error インスタンスまたはその他の値）
 * @param options.metadata 追加のメタデータ（例: { userId: 123, requestId: 'abc-123' }）
 *
 * 使用例:
 * ```typescript
 * try {
 *   await db.product.create({ data: productData });
 * } catch (err) {
 *   error('商品の作成に失敗しました', {
 *     context: 'createProduct',
 *     error: err,
 *     metadata: { productData }
 *   });
 *   throw err; // エラーを再スローして上位でハンドリング
 * }
 * ```
 *
 * ベストプラクティス:
 * - すべての try-catch ブロックでエラーをログに記録する
 * - context パラメータで発生箇所を明示する（トラブルシューティングが容易になる）
 * - metadata で関連する情報を記録する（ただし機密情報は含めない）
 * - エラーをログに記録した後、適切にハンドリングする（再スロー、フォールバック処理など）
 *
 * セキュリティ注意点:
 * - 本番環境ではスタックトレースはログに記録されるが、ユーザーには表示しないこと
 * - パスワード、トークン、個人情報などの機密データをメタデータに含めないこと
 */
export function error(message: string, options?: {
  context?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}): void {
  logInternal(LogLevel.ERROR, message, options);
}

/**
 * ログユーティリティのエクスポート
 *
 * すべてのログ出力関数をまとめたオブジェクトです。
 * 名前空間としてインポートして使用することで、コードの可読性が向上します。
 *
 * 使用例:
 * ```typescript
 * import { log } from '@/lib/logger';
 *
 * log.info('処理を開始します', { context: 'main' });
 * log.error('エラーが発生しました', { context: 'main', error: err });
 * ```
 *
 * 個別関数を直接インポートすることも可能:
 * ```typescript
 * import { error, info } from '@/lib/logger';
 *
 * info('処理を開始します', { context: 'main' });
 * error('エラーが発生しました', { context: 'main', error: err });
 * ```
 *
 * どちらの方法でも機能的には同じですが、log オブジェクトを使用する方が
 * ログ関数であることが明確になり、コードレビュー時に見つけやすくなります。
 */
export const log = {
  debug,
  info,
  warn,
  error,
};
