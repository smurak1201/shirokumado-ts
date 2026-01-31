/**
 * Next.js 16 Proxy設定
 *
 * ルートレベルでのリダイレクト制御を行う
 * 詳細な認証チェックはapp/dashboard/layout.tsxで実施
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'authjs.session-token';
const SECURE_AUTH_COOKIE_NAME = '__Secure-authjs.session-token';

/**
 * セッションクッキーの存在を確認
 */
function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has(AUTH_COOKIE_NAME) ||
    request.cookies.has(SECURE_AUTH_COOKIE_NAME)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = hasSessionCookie(request);

  // ダッシュボードへの未認証アクセスはログインページへリダイレクト
  if (pathname.startsWith('/dashboard') && !hasSession) {
    return Response.redirect(new URL('/auth/signin', request.url));
  }

  // ログイン済みユーザーが認証ページにアクセスした場合はダッシュボードへ
  if (pathname.startsWith('/auth') && hasSession) {
    return Response.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
