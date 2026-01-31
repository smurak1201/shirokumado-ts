import type { ReactNode } from 'react';
import DashboardTabs from './components/DashboardTabs';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTabs />
      {children}
    </div>
  );
}
