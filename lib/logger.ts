/**
 * 構造化ログユーティリティ
 *
 * 本番環境はJSON形式、開発環境はカラー出力
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

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
        // スタックトレースは開発環境のみ（セキュリティ考慮）
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

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    const prefix = options?.context ? `[${options.context}]` : '';
    const levelColor = {
      [LogLevel.DEBUG]: '\x1b[36m',
      [LogLevel.INFO]: '\x1b[32m',
      [LogLevel.WARN]: '\x1b[33m',
      [LogLevel.ERROR]: '\x1b[31m',
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

export function debug(message: string, options?: {
  context?: string;
  metadata?: Record<string, unknown>;
}): void {
  logInternal(LogLevel.DEBUG, message, options);
}

export function info(message: string, options?: {
  context?: string;
  metadata?: Record<string, unknown>;
}): void {
  logInternal(LogLevel.INFO, message, options);
}

export function warn(message: string, options?: {
  context?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}): void {
  logInternal(LogLevel.WARN, message, options);
}

export function error(message: string, options?: {
  context?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}): void {
  logInternal(LogLevel.ERROR, message, options);
}

export const log = {
  debug,
  info,
  warn,
  error,
};
