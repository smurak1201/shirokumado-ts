/**
 * Auth.js 設定ファイル
 *
 * Google OAuth認証を使用し、許可リストに含まれるメールアドレスのみログインを許可する
 * セッションはデータベースで管理
 */
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { isAllowedEmail, getRoleNameByEmail } from '@/lib/auth-config';
import type { Adapter } from 'next-auth/adapters';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [Google],
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60, // 1週間
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = await isAllowedEmail(user.email);
      if (!allowed) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.roleName ?? 'homepage';
      return session;
    },
  },
  events: {
    // ユーザー新規作成時にAllowedAdminのロールをUserに反映
    async createUser({ user }) {
      const roleName = (await getRoleNameByEmail(user.email)) ?? 'homepage';
      await safePrismaOperation(
        () => prisma.user.update({
          where: { id: user.id },
          data: { roleName },
        }),
        'createUser'
      );
    },
  },
});
