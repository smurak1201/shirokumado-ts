/**
 * Next.js 16 Proxy設定
 *
 * 認証状態に基づくルートガードを一元管理。
 * NextAuth v5のauth()を使用してセッションの有効性を確認。
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
import { auth } from '@/auth';

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 認証ページへのアクセス（認証済みならダッシュボードへ）
  if (pathname.startsWith('/auth')) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard/homepage', req.url));
    }
    return;
  }

  // ダッシュボードへのアクセス（未認証ならログインページへ）
  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/signin', req.url));
    }
    return;
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
