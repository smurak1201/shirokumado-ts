/**
 * 統一されたエラーハンドリングユーティリティ
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(
      `Database error: ${message}`,
      500,
      'DATABASE_ERROR'
    );
    this.name = 'DatabaseError';
    if (originalError instanceof Error) {
      this.cause = originalError;
    }
  }
}

export class BlobStorageError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(
      `Blob storage error: ${message}`,
      500,
      'BLOB_STORAGE_ERROR'
    );
    this.name = 'BlobStorageError';
    if (originalError instanceof Error) {
      this.cause = originalError;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * エラーを安全にログに記録します
 */
export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : '';

  if (error instanceof AppError) {
    console.error(`${prefix} ${error.name}:`, {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      cause: error.cause,
    });
  } else if (error instanceof Error) {
    console.error(`${prefix} Error:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
      // エラーオブジェクトの全てのプロパティを記録
      ...(error as any),
    });
  } else {
    console.error(`${prefix} Unknown error:`, {
      error,
      errorType: typeof error,
      errorString: String(error),
    });
  }
}

/**
 * エラーをユーザー向けのメッセージに変換します
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message;
  }
  return 'An unexpected error occurred';
}
