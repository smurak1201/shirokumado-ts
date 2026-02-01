/**
 * @fileoverview ダッシュボード共通レイアウト - 認証保護と共通UI
 *
 * ## 目的
 * - すべてのダッシュボードページに共通のレイアウトとヘッダーを提供
 * - セッションベースの認証チェックを一元管理
 * - ログイン済みユーザーのみアクセスを許可
 *
 * ## 主な機能
 * - 認証状態の確認とリダイレクト
 * - 共通ヘッダー（タイトル、タブナビゲーション、サインアウト）の表示
 * - レスポンシブな最大幅レイアウト（max-w-4xl）
 *
 * ## 実装の特性
 * - **Server Component**: 認証チェックをサーバー側で実行
 * - **非同期コンポーネント**: auth() でセッション取得を待機
 * - **Server Action**: onSignOut 内で 'use server' を使用
 *
 * ## セキュリティ
 * - すべてのダッシュボードページは認証必須
 * - セッションがない場合は自動的にログインページへリダイレクト
 * - サインアウト後はログインページへ遷移
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
 */

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import DashboardHeader from './components/DashboardHeader';

/**
 * DashboardLayoutコンポーネントのprops
 *
 * @property children - レイアウト内に表示する子要素（各ダッシュボードページ）
 */
interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * ダッシュボード共通レイアウトコンポーネント
 *
 * すべてのダッシュボードページに共通のレイアウトを提供します。
 * 認証チェックを行い、未ログインユーザーをログインページへリダイレクトします。
 *
 * @param props - コンポーネントのprops
 * @param props.children - レイアウト内に表示するページコンテンツ
 * @returns レイアウトが適用されたダッシュボードUI
 *
 * ## 構成要素
 * - DashboardHeader: タイトル、タブナビゲーション、サインアウトボタン
 * - children: 各ダッシュボードページのコンテンツ
 *
 * ## 実装の注意点
 * - このレイアウトは /dashboard 以下のすべてのページに適用される
 * - 認証チェックは毎回サーバー側で実行される（動的レンダリング）
 * - Server Action を使用しているため、JavaScriptなしでもサインアウト可能
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // セッション情報を取得（NextAuth.js の auth() 関数を使用）
  const session = await auth();

  // 認証チェック: セッションが存在しない場合はログインページへリダイレクト
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    // 全画面レイアウト: 最小高さを画面全体に設定し、背景色をグレーに
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* コンテンツエリア: レスポンシブな最大幅と左右パディング */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* ダッシュボードヘッダー: タイトル、タブ、サインアウトボタン */}
          <DashboardHeader
            title="ダッシュボード"
            session={session}
            // Server Action: サインアウト処理
            // 'use server' ディレクティブにより、この関数はサーバー側で実行される
            // JavaScriptが無効でも動作する（Progressive Enhancement）
            onSignOut={async () => {
              'use server';
              await signOut({ redirectTo: '/auth/signin' });
            }}
          />
          {/* 各ダッシュボードページのコンテンツをここに表示 */}
          {children}
        </div>
      </div>
    </div>
  );
}
