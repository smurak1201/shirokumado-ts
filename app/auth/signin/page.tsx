/**
 * ログインページ (app/auth/signin/page.tsx)
 *
 * 管理者用のGoogleログインページです。
 * 許可されたGoogleアカウントでのみログインできます。
 *
 * 主な機能:
 * - Google OAuth認証によるログイン
 * - 既にログイン済みの場合はダッシュボードへリダイレクト
 * - セキュアな認証フロー（NextAuth.js使用）
 *
 * 実装の特性:
 * - Server Component（認証状態の確認はサーバー側で実行）
 * - Server Actions（フォーム送信をサーバー側で処理）
 *
 * セキュリティ:
 * - 環境変数（AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET）による認証設定
 * - 許可リスト（ALLOWED_EMAILS）による厳格なアクセス制御
 * - CSRF保護（NextAuth.jsが自動的に処理）
 *
 * 認証フロー:
 * 1. ユーザーが「Googleでログイン」ボタンをクリック
 * 2. Google OAuth同意画面へリダイレクト
 * 3. ユーザーがGoogleアカウントで認証
 * 4. コールバックURL経由で戻り、セッションを確立
 * 5. 許可リストに含まれる場合のみダッシュボードへアクセス可能
 *
 * デザイン方針:
 * - グラデーション背景で高級感とセキュリティの信頼性を演出
 * - ホバー・クリック時のアニメーションでインタラクティブ性を向上
 * - シンプルで明快なUI（ボタン1つのみ）
 *
 * 環境変数:
 * - AUTH_GOOGLE_ID: Google OAuth クライアントID
 * - AUTH_GOOGLE_SECRET: Google OAuth クライアントシークレット
 * - AUTH_SECRET: NextAuth.jsのシークレットキー
 * - ALLOWED_EMAILS: ログインを許可するメールアドレスのリスト
 *
 * @see /auth.ts - 認証設定ファイル
 * @see https://next-auth.js.org/ - NextAuth.js公式ドキュメント
 */
import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * ログインページコンポーネント
 *
 * 管理者が管理画面にアクセスするためのログインページです。
 * 既にログイン済みの場合は自動的にダッシュボードへリダイレクトします。
 *
 * 処理フロー:
 * 1. サーバー側で現在の認証状態を確認（await auth()）
 * 2. ログイン済みならダッシュボードへリダイレクト
 * 3. 未ログインならGoogleログインフォームを表示
 *
 * Server Componentとして実装:
 * - 認証状態の確認はサーバー側で安全に実行
 * - セッション情報をクライアントに送信する必要がない
 */
export default async function SignInPage() {
  // 現在の認証状態を取得
  // await auth(): NextAuth.jsのセッション取得関数
  const session = await auth();

  // 既にログイン済みの場合はダッシュボードへリダイレクト
  // 理由: ログインページにアクセスする必要がないため、無駄な操作を防ぐ
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/*
       * ログインカード
       *
       * レイアウト:
       * - w-full max-w-md: モバイルでは全幅、デスクトップでは最大448px
       * - space-y-8: 子要素間の縦方向スペース
       * - rounded-2xl: 大きな角丸で柔らかい印象
       *
       * 視覚効果:
       * - bg-white/80: 半透明の白背景（80%の不透明度）
       * - backdrop-blur-sm: 背景のぼかし効果（グラスモーフィズム）
       * - shadow-2xl: 大きな影で浮き上がる印象
       * - hover:shadow-3xl: ホバー時にさらに影を強調
       *
       * レスポンシブパディング:
       * - p-10: デフォルト（モバイル）で40px
       * - sm:p-12: 小画面以上で48px
       *
       * デザインの意図:
       * - グラスモーフィズムで高級感とモダンな印象
       * - ホバーエフェクトでインタラクティブ性を強調
       */}
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/80 p-10 shadow-2xl backdrop-blur-sm transition-all hover:shadow-3xl sm:p-12">
        <div className="text-center">
          {/*
           * ロックアイコン
           * セキュリティをイメージさせるビジュアル
           *
           * グラデーション背景（from-blue-500 to-purple-600）:
           * - 信頼性（青）と創造性（紫）を組み合わせ
           * - 管理画面の専門性を視覚的に表現
           */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/*
               * 南京錠のアイコン
               * セキュアなログインであることを視覚的に伝える
               */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/*
           * ページタイトル
           * グラデーションテキストで視覚的なインパクト
           *
           * bg-gradient-to-r from-gray-900 to-gray-700:
           * - 濃いグレーから明るいグレーへのグラデーション
           * - bg-clip-text: グラデーションを文字に適用
           * - text-transparent: 文字を透明にしてグラデーションを表示
           */}
          <h1 className="mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
            管理者ログイン
          </h1>

          {/*
           * 説明文
           * ログイン方法とセキュリティ要件を明示
           */}
          <p className="text-sm text-gray-600">
            許可されたGoogleアカウントでログインしてください
          </p>
        </div>

        {/*
         * ログインフォーム
         *
         * Server Action（'use server'）を使用:
         * - フォーム送信をサーバー側で処理
         * - クライアント側のJavaScriptが無効でも動作
         * - セキュリティ向上（認証ロジックをサーバーで実行）
         *
         * action: async関数で定義
         * - signIn('google', { redirectTo: '/dashboard' }):
         *   - 'google': Google OAuthプロバイダーを使用
         *   - redirectTo: ログイン成功後のリダイレクト先
         *
         * 処理フロー:
         * 1. ユーザーがボタンをクリック
         * 2. Server Actionが実行される
         * 3. signIn()がGoogle OAuth同意画面へリダイレクト
         * 4. ユーザーが認証すると/dashboardへリダイレクト
         */}
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/dashboard' });
          }}
          className="mt-8"
        >
          {/*
           * Googleログインボタン
           *
           * レイアウト:
           * - flex items-center justify-center gap-3: アイコンとテキストを中央揃え
           * - w-full: 幅いっぱいに表示（クリックしやすい）
           * - px-6 py-4: 適度なパディングでクリック領域を確保
           *
           * ビジュアル:
           * - rounded-xl border-2 border-gray-200: 角丸と境界線
           * - bg-white: 白背景（Googleボタンの標準スタイル）
           *
           * インタラクション:
           * - group: 子要素にホバー状態を伝播
           * - hover:border-blue-300: ホバー時に青い境界線
           * - hover:shadow-xl: ホバー時に影を強調
           * - hover:scale-105: ホバー時に5%拡大
           * - active:scale-95: クリック時に5%縮小（押下感）
           * - transition-all duration-300: すべての変化を300msでアニメーション
           *
           * アクセシビリティ:
           * - type="submit": フォーム送信ボタンであることを明示
           * - cursor-pointer: ポインターカーソルでクリック可能を示す
           */}
          <button
            type="submit"
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-6 py-4 font-medium text-gray-700 shadow-md transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            {/*
             * ホバー時のグラデーション背景
             * absolute inset-0: ボタン全体を覆う
             * opacity-0 → group-hover:opacity-100: ホバー時に表示
             * transition-opacity: 透明度変化をアニメーション
             *
             * 視覚効果:
             * - ホバー時にグラデーション背景が表示される
             * - アイコンとテキストはrelativeなので前面に表示される
             */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Googleアイコン（相対位置で前面に表示） */}
            <GoogleIcon />

            {/* ボタンテキスト（相対位置で前面に表示） */}
            <span className="relative">Googleでログイン</span>
          </button>
        </form>

        {/*
         * セキュリティメッセージ
         * ユーザーに安心感を与える
         */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            セキュアな認証システムで保護されています
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Googleアイコンコンポーネント
 *
 * Google公式のブランドカラーを使用したアイコンです。
 * Google Identity Branding Guidelinesに準拠しています。
 *
 * カラーコード:
 * - #4285F4: Google Blue（青）
 * - #34A853: Google Green（緑）
 * - #FBBC05: Google Yellow（黄）
 * - #EA4335: Google Red（赤）
 *
 * デザインの意図:
 * - Googleの公式カラーを使用することで、本物のGoogle認証であることを視覚的に伝える
 * - ブランド認知度を活用してユーザーに安心感を与える
 *
 * @see https://developers.google.com/identity/branding-guidelines
 */
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      {/* 青色の部分（右上） */}
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      {/* 緑色の部分（右下） */}
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      {/* 黄色の部分（左中央） */}
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      {/* 赤色の部分（左上） */}
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
