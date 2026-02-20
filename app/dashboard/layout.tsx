/**
 * ダッシュボード共通レイアウト
 *
 * 共通ヘッダーを提供し、未認証時はログイン案内を表示する。
 * 未認証でもHTMLを返すことで、OGPメタタグがクローラーに正しく配信される。
 */
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
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
    type: "website",
    locale: "ja_JP",
    siteName: "白熊堂",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "白熊堂 - 管理画面",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ダッシュボード | 白熊堂",
    description: "白熊堂の管理画面",
    images: ["/og-image.png"],
  },
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
            <svg
              className="h-8 w-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">
            ログインが必要です
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            セッションが切れました。再度ログインしてください。
          </p>
          <Link
            href="/auth/signin"
            className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-all hover:bg-gray-800 active:scale-95"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
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
