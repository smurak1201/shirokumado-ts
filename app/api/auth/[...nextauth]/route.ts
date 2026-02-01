/**
 * NextAuth.js 認証 API エンドポイント
 *
 * Google OAuthによる認証を提供。認証可能ユーザーは環境変数 ADMIN_EMAIL で制限。
 * セッションはサーバーレス対応のためJWTを使用。詳細設定は auth.ts で管理。
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
