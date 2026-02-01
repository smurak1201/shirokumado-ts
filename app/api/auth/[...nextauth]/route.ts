/**
 * NextAuth.js 認証 API エンドポイント
 *
 * ## 目的
 * NextAuth.js による認証機能を提供します。
 * このファイルは NextAuth.js のハンドラーをエクスポートするだけのシンプルなルーターです。
 *
 * ## 主な機能
 * - Google OAuth による認証
 * - セッション管理
 * - コールバック処理
 *
 * ## HTTPメソッド
 * - GET: 認証プロバイダーのリダイレクト、セッション情報の取得など
 * - POST: サインイン、サインアウトなど
 *
 * ## URLパターン
 * - /api/auth/signin: サインインページ
 * - /api/auth/signout: サインアウト
 * - /api/auth/callback/google: Google OAuth コールバック
 * - /api/auth/session: セッション情報の取得
 *
 * ## 認証設定
 * 認証の詳細設定は [@/auth](../../../../auth.ts) で定義されています。
 * - プロバイダー: Google OAuth
 * - セッション方式: JWT
 * - 認証可能ユーザー: 環境変数 ADMIN_EMAIL で指定されたメールアドレスのみ
 *
 * ## 実装の理由
 * - NextAuth.js の規約: /api/auth/[...nextauth] パスに handlers をエクスポート
 * - 認証ロジックの分離: auth.ts で認証設定を一元管理し、このファイルはルーティングのみ担当
 *
 * ## セキュリティ考慮事項
 * - 認証可能ユーザーの制限: 環境変数で指定されたメールアドレスのみアクセス可能
 * - JWT セッション: サーバーレス環境でも動作するよう、データベースセッションではなくJWTを使用
 *
 * @see {@link ../../../../auth.ts} 認証設定の詳細
 * @module app/api/auth/[...nextauth]/route
 */

import { handlers } from '@/auth';

/**
 * NextAuth.js のハンドラーをエクスポート
 *
 * handlers は [@/auth](../../../../auth.ts) で定義された NextAuth の設定から生成されています。
 * - GET: 認証プロバイダーのリダイレクト、セッション情報の取得など
 * - POST: サインイン、サインアウトなど
 */
export const { GET, POST } = handlers;
