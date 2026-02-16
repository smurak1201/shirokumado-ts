/**
 * ダッシュボード共通レイアウト
 *
 * 共通ヘッダーを提供。認証チェックはMiddlewareで行う。
 */
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { auth, signOut } from '@/auth';
import DashboardHeader from './components/DashboardHeader';

export const metadata: Metadata = {
  title: {
    default: "ダッシュボード | 白熊堂",
    template: "%s | 白熊堂 管理画面",
  },
  description: "白熊堂の管理画面",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "ダッシュボード | 白熊堂",
    description: "白熊堂の管理画面",
  },
};

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
