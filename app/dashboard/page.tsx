import { redirect } from 'next/navigation';

/**
 * ダッシュボードルートページ
 *
 * /dashboard にアクセスした際に /dashboard/homepage へリダイレクトします。
 */
export default function DashboardPage() {
  redirect('/dashboard/homepage');
}
