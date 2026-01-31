import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import DashboardHeader from './components/DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * ダッシュボード共通レイアウトコンポーネント
 *
 * すべてのダッシュボードページに共通のレイアウトを提供します。
 * ヘッダー（タイトル、ユーザー情報、タブナビゲーション）を含みます。
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
      <div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <DashboardHeader
            title="ダッシュボード"
            session={session}
            onSignOut={async () => {
              'use server';
              await signOut({ redirectTo: '/auth/signin' });
            }}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
