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
    <header className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.user?.email}</span>
          <form action={onSignOut}>
            <button
              type="submit"
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
      <nav className="sticky top-0 z-10 -mx-4 border-b border-gray-200 bg-white px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-4">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
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
