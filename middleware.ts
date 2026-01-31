/**
 * 認証ミドルウェア
 *
 * ダッシュボードへのアクセスを認証済みユーザーに限定する
 * 未認証ユーザーはログインページへリダイレクト
 */
import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnAuthPage = req.nextUrl.pathname.startsWith('/auth');

  // ダッシュボードへの未認証アクセスはログインページへリダイレクト
  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', req.nextUrl));
  }

  // ログイン済みユーザーが認証ページにアクセスした場合はダッシュボードへ
  if (isOnAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl));
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
