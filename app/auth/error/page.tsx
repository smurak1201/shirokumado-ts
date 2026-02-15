/**
 * 認証エラーページ
 *
 * Auth.jsからリダイレクトされるエラーページ。
 * エラータイプに応じたメッセージを表示する。
 */
import Link from 'next/link';

type ErrorType = 'Configuration' | 'AccessDenied' | 'Verification' | 'Default';

const errorMessages: Record<ErrorType, { title: string; description: string }> = {
  Configuration: {
    title: '設定エラー',
    description: '認証システムの設定に問題があります。管理者にお問い合わせください。',
  },
  AccessDenied: {
    title: 'アクセスが許可されていません',
    description:
      'このメールアドレスはログインが許可されていません。許可されたアカウントでログインしてください。',
  },
  Verification: {
    title: '認証エラー',
    description: '認証の検証に失敗しました。もう一度お試しください。',
  },
  Default: {
    title: 'エラーが発生しました',
    description: 'ログイン中にエラーが発生しました。もう一度お試しください。',
  },
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const errorType = (error as ErrorType) || 'Default';
  const { title, description } = errorMessages[errorType] || errorMessages.Default;

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/80 p-10 shadow-2xl backdrop-blur-sm sm:p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-600 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-3 bg-linear-to-r from-red-700 to-orange-600 bg-clip-text text-3xl font-bold text-transparent">
            {title}
          </h1>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-6 py-4 font-medium text-gray-700 shadow-md transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <svg
              className="relative h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            <span className="relative">ログインページに戻る</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
