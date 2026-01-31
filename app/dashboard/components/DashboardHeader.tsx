/**
 * ダッシュボードヘッダーコンポーネント
 *
 * ページタイトル、ユーザー情報、ログアウトボタンを表示
 */
import { auth, signOut } from '@/auth';

interface DashboardHeaderProps {
  title: string;
}

export default async function DashboardHeader({ title }: DashboardHeaderProps) {
  const session = await auth();

  return (
    <header className="mb-8 flex items-center justify-between">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.email}</span>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/auth/signin' });
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
