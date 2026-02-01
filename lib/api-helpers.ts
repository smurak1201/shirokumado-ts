/**
 * API Routes用のヘルパー関数
 *
 * エラーハンドリング、レスポンス生成、バリデーションを提供
 */

import { NextResponse } from 'next/server';
import { AppError, getUserFriendlyMessage, ValidationError } from './errors';
import { log } from './logger';

/**
 * API Routeのエラーハンドリングラッパー
 *
 * 本番環境では予期しないエラーの詳細を隠す（セキュリティ対策）
 */
export function handleApiError(error: unknown): NextResponse {
  log.error('API Routeでエラーが発生しました', {
    context: 'API Route',
    error,
  });

  if (error instanceof AppError) {
    const response = NextResponse.json(
      {
        error: getUserFriendlyMessage(error),
        code: error.code,
      },
      { status: error.statusCode }
    );
    // charset=utf-8を明示的に設定（日本語などの多バイト文字対応）
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  }

  // 本番環境では安全なメッセージのみ返す
  const isProduction = process.env.NODE_ENV === 'production';
  const response = NextResponse.json(
    {
      error: isProduction
        ? 'An unexpected error occurred'
        : getUserFriendlyMessage(error),
    },
    { status: 500 }
  );
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}

export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      code,
    },
    { status }
  );
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}

/**
 * 非同期API Routeハンドラーをラップしてエラーハンドリングを自動化
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function parseProductId(id: string): number {
  const productId = parseInt(id);
  if (isNaN(productId)) {
    throw new ValidationError('無効な商品IDです');
  }
  return productId;
}
