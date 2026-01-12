import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerEnv } from '@/lib/env';

/**
 * 環境変数の検証
 * アプリケーション起動時に環境変数を検証します
 */
function validateEnvironmentVariables(): void {
  try {
    getServerEnv();
  } catch (error) {
    // 開発環境ではエラーメッセージを表示
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ 環境変数の検証に失敗しました:');
      console.error(error);
      console.error('\n必要な環境変数:');
      console.error('- DATABASE_URL_ACCELERATE: Prisma Accelerate の URL');
      console.error('- BLOB_READ_WRITE_TOKEN: Vercel Blob Storage の認証トークン');
    }
    // 本番環境ではエラーをスローしてアプリケーションを起動しない
    throw error;
  }
}

// 起動時に環境変数を検証
validateEnvironmentVariables();

/**
 * Next.js ミドルウェア
 * リクエストごとに実行されます
 *
 * 注意: Next.js 16 では `middleware` が非推奨となり、`proxy` への移行が推奨されています。
 * しかし、`proxy` は Node.js Runtime でのみ動作し、Edge Runtime をサポートしていません。
 * このアプリは Edge Runtime を使用しているため、現時点では `middleware` を継続使用しています。
 * 将来的に `proxy` が Edge Runtime をサポートした場合、移行を検討します。
 *
 * 参考: https://nextjs.org/docs/messages/middleware-to-proxy
 */
export function middleware(_request: NextRequest) {
  // 現在は環境変数の検証のみを行います
  // 将来的に認証やレート制限などを追加する可能性があります
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 以下のパスを除くすべてのリクエストパスにマッチ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
