/**
 * ダッシュボード共通レイアウト
 *
 * 認証チェックと共通ヘッダーを提供。
 * セッションがない場合はログインページへリダイレクト。
 */
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import DashboardHeader from './components/DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

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
