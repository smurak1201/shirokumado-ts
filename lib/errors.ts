/**
 * 統一されたエラーハンドリングユーティリティ
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

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

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
      ErrorCodes.DATABASE_ERROR
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
      ErrorCodes.BLOB_STORAGE_ERROR
    );
    this.name = 'BlobStorageError';
    if (originalError instanceof Error) {
      this.cause = originalError;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, ErrorCodes.VALIDATION_ERROR);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * 本番環境では予期しないエラーの詳細を隠す（セキュリティ対策）
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

export function getUserFriendlyMessageJa(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "処理に失敗しました";
}
