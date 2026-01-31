import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import DashboardTabs from './components/DashboardTabs';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * ダッシュボード共通レイアウトコンポーネント
 *
 * すべてのダッシュボードページに共通のレイアウトを提供します。
 * タブナビゲーションを含み、各ダッシュボード間の切り替えを可能にします。
 *
 * 認証チェック: セッションが存在しない場合はログインページへリダイレクト
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTabs />
      {children}
    </div>
  );
}
