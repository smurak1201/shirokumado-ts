import type { ReactNode } from 'react';
import DashboardTabs from './components/DashboardTabs';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * ダッシュボード共通レイアウトコンポーネント
 *
 * すべてのダッシュボードページに共通のレイアウトを提供します。
 * タブナビゲーションを含み、各ダッシュボード間の切り替えを可能にします。
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTabs />
      {children}
    </div>
  );
}
