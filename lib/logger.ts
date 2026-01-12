/**
 * 構造化ログユーティリティ
 *
 * JSON 形式の構造化ログを出力します。
 * ログ分析ツールとの統合やデバッグを容易にします。
 */

/**
 * ログレベル
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * ログエントリの型定義
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
  metadata?: Record<string, unknown>;
}

/**
 * ログを出力します
 */
function log(level: LogLevel, message: string, options?: {
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
 */
export function debug(message: string, options?: {
  context?: string;
  metadata?: Record<string, unknown>;
}): void {
  log(LogLevel.DEBUG, message, options);
}

/**
 * 情報レベルのログを出力します
 */
export function info(message: string, options?: {
  context?: string;
  metadata?: Record<string, unknown>;
}): void {
  log(LogLevel.INFO, message, options);
}

/**
 * 警告レベルのログを出力します
 */
export function warn(message: string, options?: {
  context?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}): void {
  log(LogLevel.WARN, message, options);
}

/**
 * エラーレベルのログを出力します
 */
export function error(message: string, options?: {
  context?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}): void {
  log(LogLevel.ERROR, message, options);
}

/**
 * ログユーティリティのエクスポート
 */
export const log = {
  debug,
  info,
  warn,
  error,
};
