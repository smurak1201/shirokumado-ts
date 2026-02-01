/**
 * ダッシュボードヘッダーコンポーネント
 *
 * ## 目的
 * ダッシュボード全体の共通ヘッダーとして、ページタイトル、ユーザー情報、
 * ログアウト機能、タブナビゲーションを提供します。
 *
 * ## 主な機能
 * - ページタイトルの表示（ページごとに動的に変更可能）
 * - ログイン中のユーザーメールアドレスの表示
 * - ログアウトボタン（Server Action経由）
 * - タブナビゲーション（ホームページ管理・ECサイト管理）
 * - レスポンシブ対応（モバイル〜デスクトップ）
 *
 * ## 使用するProps
 * - `title`: ページタイトル（例: "ダッシュボード"）
 * - `session`: NextAuthのセッション情報（ユーザー情報取得用）
 * - `onSignOut`: ログアウト処理のServer Action
 *
 * ## 実装の特性
 * - **Client Component**: usePathnameでアクティブタブを判定するため
 * - **Sticky Header**: スクロール時も画面上部に固定される
 * - **Server Action**: ログアウトはフォーム送信でServer Actionを呼び出し
 *
 * ## ベストプラクティス
 * - タブ定義は`as const`で型安全に管理
 * - レスポンシブデザインはモバイルファーストで実装（sm:ブレークポイント使用）
 * - アクティブ状態の判定はpathname.startsWith()で部分一致（サブページも含む）
 *
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';

/**
 * DashboardHeaderコンポーネントのprops型定義
 *
 * @property {string} title - ページタイトル（例: "ダッシュボード"）
 * @property {Session | null} session - NextAuthのセッション情報（ユーザー情報取得用）
 * @property {() => Promise<void>} onSignOut - ログアウト処理のServer Action
 */
interface DashboardHeaderProps {
  title: string;
  session: Session | null;
  onSignOut: () => Promise<void>;
}

/**
 * ダッシュボードのタブ定義
 *
 * 各タブのリンク先とラベルを定義します。
 * `as const`を使用することで、TypeScriptの型推論が厳密になり、
 * タイプミスを防ぐことができます。
 *
 * ## タブの追加方法
 * 新しいタブを追加する場合は、以下のように配列に要素を追加してください：
 * ```typescript
 * { href: '/dashboard/orders', label: '注文管理' },
 * ```
 */
const tabs = [
  { href: '/dashboard/homepage', label: 'ホームページ' },
  { href: '/dashboard/shop', label: 'ECサイト' },
] as const;

/**
 * ダッシュボードヘッダーコンポーネント
 *
 * ダッシュボードの最上部に固定表示されるヘッダーです。
 * タイトル、ユーザー情報、ログアウトボタン、タブナビゲーションを含みます。
 *
 * @param {DashboardHeaderProps} props - コンポーネントのprops
 * @param {string} props.title - ページタイトル
 * @param {Session | null} props.session - セッション情報
 * @param {() => Promise<void>} props.onSignOut - ログアウト処理
 *
 * @returns {JSX.Element} ダッシュボードヘッダー
 *
 * ## レスポンシブデザイン
 * - モバイル: 縦並びレイアウト、小さめのフォントサイズ
 * - デスクトップ（sm:以上）: 横並びレイアウト、大きめのフォントサイズ
 */
export default function DashboardHeader({ title, session, onSignOut }: DashboardHeaderProps) {
  // 現在のパス名を取得（アクティブタブの判定に使用）
  const pathname = usePathname();

  return (
    // ヘッダー全体のコンテナ
    // sticky top-0: スクロール時も画面上部に固定
    // z-20: 他の要素より前面に表示（モーダルより低い優先度）
    // bg-gray-50: 背景色で本文と区別
    <header className="sticky top-0 z-20 mb-6 bg-gray-50 pb-4">
      {/* タイトルとユーザー情報エリア */}
      {/*
        レスポンシブレイアウト:
        - モバイル: flex-col（縦並び）
        - デスクトップ: sm:flex-row（横並び）+ sm:items-center（垂直方向中央揃え）
        - sm:justify-between: タイトルとユーザー情報を両端に配置
      */}
      <div className="mb-4 pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* ページタイトル */}
        {/* text-2xl sm:text-3xl: モバイルは小さめ、デスクトップは大きめ */}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>

        {/* ユーザー情報とログアウトボタンエリア */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* ログイン中のユーザーメールアドレス */}
          {/*
            truncate: 長いメールアドレスは省略記号(...)で表示
            text-gray-600: 控えめな色で補足情報として表示
          */}
          <span className="truncate text-xs text-gray-600 sm:text-sm">{session?.user?.email}</span>

          {/* ログアウトフォーム */}
          {/*
            Server Actionをformのaction属性に渡すことで、
            JavaScriptが無効な環境でも動作する（Progressive Enhancement）
          */}
          <form action={onSignOut}>
            {/* ログアウトボタン */}
            {/*
              デザイン:
              - bg-gray-200: タイトルより控えめな色（破壊的アクションではない）
              - hover:bg-gray-300: ホバー時に濃くしてインタラクティブ性を示す
              - active:scale-95: クリック時に押し込まれる感覚
              - whitespace-nowrap: テキストを改行しない（"ログ\nアウト"を防ぐ）
            */}
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg bg-gray-200 px-3 py-1.5 text-xs text-gray-700 transition-all hover:bg-gray-300 sm:px-4 sm:py-2 sm:text-sm cursor-pointer active:scale-95"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>

      {/* タブナビゲーション */}
      {/*
        overflow-hidden: 角丸の境界からコンテンツがはみ出さないようにする
        border-b border-gray-200: タブの下に薄い境界線
      */}
      <nav className="rounded-lg border-b border-gray-200 bg-white overflow-hidden">
        <div className="flex gap-2 sm:gap-4">
          {/* タブのループ */}
          {tabs.map((tab) => {
            // アクティブタブの判定
            // pathname.startsWith()を使うことで、サブページもアクティブと判定される
            // 例: "/dashboard/homepage/edit" も "ホームページ" タブがアクティブになる
            const isActive = pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                // 動的クラス名の適用
                // アクティブ時: 下線を濃く、テキストを黒に
                // 非アクティブ時: 下線なし、テキストをグレーに、ホバーで下線表示
                className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-all cursor-pointer active:scale-95 sm:px-4 sm:py-3 ${
                  isActive
                    ? 'border-gray-900 text-gray-900' // アクティブ状態
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700' // 非アクティブ状態
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
