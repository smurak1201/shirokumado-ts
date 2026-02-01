/**
 * @fileoverview ダッシュボードルートページ - ホームページへの自動リダイレクト
 *
 * ## 目的
 * - `/dashboard` へのアクセスを `/dashboard/homepage` へ自動的にリダイレクト
 * - ユーザーが明示的にサブページを指定しなくても、デフォルトページを表示
 *
 * ## 実装の特性
 * - **Server Component**: サーバーサイドでリダイレクト処理を実行
 * - **動的レンダリング**: redirect() を使用するため、毎回実行される
 *
 * ## 設計の理由
 * - `/dashboard` をアクセス可能にしつつ、ユーザーには常にホームページを表示
 * - ルーティングの一貫性を保つため、リダイレクトは明示的に行う
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/redirect
 */

import { redirect } from 'next/navigation';

/**
 * ダッシュボードのルートページコンポーネント
 *
 * `/dashboard` にアクセスした際に `/dashboard/homepage` へリダイレクトします。
 * これにより、ユーザーは常にホームページから開始されます。
 *
 * @returns このコンポーネントは何も返さず、リダイレクトのみ実行します
 *
 * ## 実装の注意点
 * - `redirect()` は例外をスローするため、この関数は正常に完了しません
 * - Server Component でのみ使用可能（Client Component では使用不可）
 */
export default function DashboardPage() {
  // ホームページへリダイレクト
  // redirect() は内部で例外をスローし、Next.jsがキャッチしてリダイレクトを処理
  redirect('/dashboard/homepage');
}
