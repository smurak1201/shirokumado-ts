/**
 * ダッシュボード共通レイアウト
 *
 * 共通ヘッダーを提供。認証チェックはMiddlewareで行う。
 */
import type { ReactNode } from 'react';
import { auth, signOut } from '@/auth';
import DashboardHeader from './components/DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  // Middlewareで認証済みユーザーのみがここに到達する
  if (!session) {
    return null;
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
