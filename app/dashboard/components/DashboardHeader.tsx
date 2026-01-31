/**
 * ダッシュボードヘッダーコンポーネント
 *
 * ページタイトル、ユーザー情報、ログアウトボタン、タブナビゲーションを表示
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';

interface DashboardHeaderProps {
  title: string;
  session: Session | null;
  onSignOut: () => Promise<void>;
}

const tabs = [
  { href: '/dashboard/homepage', label: 'ホームページ' },
  { href: '/dashboard/shop', label: 'ECサイト' },
] as const;

export default function DashboardHeader({ title, session, onSignOut }: DashboardHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 mb-6 bg-gray-50 pb-4">
      <div className="mb-4 pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <span className="truncate text-xs text-gray-600 sm:text-sm">{session?.user?.email}</span>
          <form action={onSignOut}>
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg bg-gray-200 px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-300 sm:px-4 sm:py-2 sm:text-sm cursor-pointer"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
      <nav className="rounded-lg border-b border-gray-200 bg-white overflow-hidden">
        <div className="flex gap-2 sm:gap-4">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors sm:px-4 sm:py-3 ${
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
