'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard/homepage', label: 'ホームページ' },
  { href: '/dashboard/shop', label: 'ECサイト' },
] as const;

/**
 * ダッシュボードのタブナビゲーションコンポーネント
 *
 * ホームページ管理とECサイト管理を切り替えるタブUIを提供します。
 * スクロールしても上部に固定表示されます。
 */
export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4">
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
      </div>
    </nav>
  );
}
