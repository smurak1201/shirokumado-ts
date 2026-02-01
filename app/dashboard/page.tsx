/**
 * ダッシュボードルートページ
 *
 * /dashboard へのアクセスを /dashboard/homepage へリダイレクト。
 */
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/dashboard/homepage');
}
