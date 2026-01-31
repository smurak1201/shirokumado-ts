# ダッシュボード認証機能

**日付**: 2026-01-30
**ブランチ**: feature/dashboard-auth
**対象**: ダッシュボード（`app/dashboard/`）
**ステータス**: 未着手
**完了日**: -

---

## 進捗状況

| #   | タスク                           | 優先度 | ステータス | 備考 |
| --- | -------------------------------- | :----: | :--------: | ---- |
| 1   | 許可メールアドレスのテーブル作成 |   高   |    [o]     |      |
| 2   | Auth.js でログイン制限を実装     |   高   |    [o]     |      |
| 3   | ミドルウェアでルート保護         |   高   |    [ ]     |      |
| 4   | ログインページの作成             |   高   |    [ ]     |      |
| 5   | ダッシュボードにログアウト機能   |   中   |    [ ]     |      |
| 6   | Prisma マイグレーション実行      |   高   |    [ ]     |      |
| 7   | シーダーに初期データ登録処理追加 |   高   |    [ ]     |      |
| 8   | 初期データ登録                   |   高   |    [ ]     |      |
| 9   | 動作確認・ビルドテスト           |   -    |    [ ]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

ダッシュボード（`/dashboard`）は商品管理機能を提供しており、管理者のみがアクセスできる必要がある。現在は誰でもアクセス可能な状態であり、セキュリティ上の問題がある。

### 課題

- **課題1**: ダッシュボードに認証がなく、誰でもアクセス可能
- **課題2**: 管理者を特定のGoogleアカウントに限定する仕組みがない

### 設計方針

- **方針1**: Auth.js（Google OAuth）を使用し、特定のメールアドレスのみログインを許可
- **方針2**: 新規ユーザー登録は不要。許可リストにないメールアドレスはログイン拒否
- **方針3**: ミドルウェアでダッシュボードへのアクセスを保護
- **方針4**: データベースセッションを使用（既に設定済み）

### 許可するメールアドレス

データベース（`allowed_admins` テーブル）で管理。追加・削除は Neon コンソールまたは Prisma Studio から行う。

**初期データ**:

```
s.murakoshi1201@gmail.com (role: admin)
```

**ロール一覧**:

| ロール | アクセス範囲 |
|--------|-------------|
| `admin` | すべてのダッシュボード |
| `homepage` | ホームページ側のみ |
| `shop` | ECサイト側のみ（将来細分化の可能性）|

### 前提条件

この仕様書は `2026-01-30-02-dashboard-restructure.md`（ディレクトリ構造変更）の完了を前提とする。

### CLAUDE.md準拠事項

本認証機能では以下のルールに従うこと。

**設計原則**:
- **YAGNI**: 新規ユーザー登録機能は実装しない。許可リストによるシンプルな認証のみ
- **KISS**: Auth.jsの標準機能を活用し、カスタム認証ロジックは最小限に

**コード品質**:
- 未使用のインポートは削除すること
- 関数の引数と返り値には型を付けること
- リントエラーを解消すること（`npm run lint`）

**Server/Client Components**:
- ログインページ（`signin/page.tsx`）はServer Componentとして実装
- Server Actionsを使用してサインイン・サインアウトを実行
- ミドルウェアでルート保護を行う

**セキュリティ**:
- **Server Actionsでも認証を検証すること**（CLAUDE.mdルール）
- 許可メールアドレスはデータベースで管理（コードにハードコードしない）
- セッションはデータベースで管理（JWT不使用）

---

## タスク詳細

### タスク1: 許可メールアドレスのテーブル作成 [完了]

**対象ファイル**:

- `prisma/schema.prisma`（既存・変更）
- `lib/auth-config.ts`（**新規作成**）

**問題点**:

許可するメールアドレスを管理する仕組みがない。

**修正内容**:

許可メールアドレスを管理するテーブルを作成し、データベースから許可リストを取得する関数を実装する。

**実装例**:

```prisma
// prisma/schema.prisma に追加

// 管理者許可メールアドレステーブル
model AllowedAdmin {
  id        String   @id @default(cuid())
  email     String   @unique
  role      String   @default("admin") // admin, homepage, shop, ...
  createdAt DateTime @default(now()) @map("created_at")

  @@map("allowed_admins")
}
```

```typescript
// lib/auth-config.ts（新規作成）
import { prisma } from '@/lib/prisma';

/**
 * メールアドレスがログイン許可リストに含まれているかチェック
 *
 * データベースの allowed_admins テーブルを参照
 */
export async function isAllowedEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const allowedAdmin = await prisma.allowedAdmin.findUnique({
    where: { email },
  });

  return !!allowedAdmin;
}
```

**チェックリスト**:

- [x] `prisma/schema.prisma` に `AllowedAdmin` モデルを追加
- [x] `lib/auth-config.ts` を新規作成
- [ ] マイグレーション後、Neon または Prisma Studio で初期データを登録

---

### タスク2: Auth.js でログイン制限を実装 [完了]

**対象ファイル**:

- `auth.ts`（既存・変更）

**問題点**:

現在の設定では任意のGoogleアカウントでログインできてしまう。

**修正内容**:

`signIn` コールバックで許可リストをチェックし、許可されていないメールアドレスはログインを拒否する。

**実装例**:

```typescript
// auth.ts（変更）
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { isAllowedEmail } from '@/lib/auth-config';
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
      // 許可リストに含まれるメールアドレスのみログインを許可
      const allowed = await isAllowedEmail(user.email);
      if (!allowed) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});
```

**チェックリスト**:

- [x] `isAllowedEmail` をインポート
- [x] `signIn` コールバックを追加（非同期でDBチェック）
- [ ] 許可されていないメールでログインが拒否されること（タスク9で確認）

---

### タスク3: ミドルウェアでルート保護

**対象ファイル**:

- `middleware.ts`（**新規作成**）

**問題点**:

ダッシュボードへの未認証アクセスを防ぐ仕組みがない。

**修正内容**:

ミドルウェアを作成し、`/dashboard` へのアクセス時に認証をチェックする。

**実装例**:

```typescript
// middleware.ts（新規作成）
import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnAuthPage = req.nextUrl.pathname.startsWith('/auth');

  // ダッシュボードへの未認証アクセスはログインページへリダイレクト
  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', req.nextUrl));
  }

  // ログイン済みユーザーが認証ページにアクセスした場合はダッシュボードへ
  if (isOnAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl));
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
```

**チェックリスト**:

- [ ] `middleware.ts` を新規作成
- [ ] 未認証で `/dashboard` にアクセスするとログインページへリダイレクト
- [ ] 未認証で `/dashboard/homepage` にアクセスするとログインページへリダイレクト
- [ ] 未認証で `/dashboard/shop` にアクセスするとログインページへリダイレクト
- [ ] 認証済みで `/auth/signin` にアクセスするとダッシュボードへリダイレクト

---

### タスク4: ログインページの作成

**対象ファイル**:

- `app/auth/signin/page.tsx`（**新規作成**）

**問題点**:

ログインページが存在しない。

**修正内容**:

Googleログインボタンを配置したシンプルなログインページを作成する。

**実装例**:

```tsx
// app/auth/signin/page.tsx（新規作成）
import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const session = await auth();

  // 既にログイン済みの場合はダッシュボードへ
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          管理者ログイン
        </h1>
        <p className="mb-8 text-center text-sm text-gray-600">
          許可されたGoogleアカウントでログインしてください
        </p>

        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/dashboard' });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <GoogleIcon />
            <span>Googleでログイン</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
```

**チェックリスト**:

- [ ] `app/auth/signin/page.tsx` を新規作成
- [ ] Googleログインボタンが表示されること
- [ ] ログイン済みの場合はダッシュボードへリダイレクト

---

### タスク5: ダッシュボードにログアウト機能

**対象ファイル**:

- `app/dashboard/components/DashboardHeader.tsx`（**新規作成**）
- `app/dashboard/homepage/page.tsx`（既存・変更）

**問題点**:

ログアウト機能がない。

**修正内容**:

ダッシュボードヘッダーにユーザー情報とログアウトボタンを追加する。

**実装例**:

```tsx
// app/dashboard/components/DashboardHeader.tsx（新規作成）
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
```

**app/dashboard/homepage/page.tsx の変更（104-106行目付近）**:

```tsx
// 変更前
return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="mx-auto max-w-4xl px-4">
      <h1 className="mb-8 text-3xl font-bold">商品管理ダッシュボード</h1>

// 変更後
import DashboardHeader from '../components/DashboardHeader';

return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="mx-auto max-w-4xl px-4">
      <DashboardHeader title="商品管理ダッシュボード" />
```

**チェックリスト**:

- [ ] `app/dashboard/components/DashboardHeader.tsx` を新規作成
- [ ] `app/dashboard/homepage/page.tsx` でヘッダーコンポーネントをインポート
- [ ] ログアウトボタンが機能すること

---

### タスク6: Prisma マイグレーション実行

**対象ファイル**:

- `prisma/migrations/`（マイグレーションファイル生成）

**問題点**:

認証用テーブル（users, accounts, sessions, verification_tokens）がデータベースに存在しない。

**修正内容**:

Prisma マイグレーションを実行してテーブルを作成する。

**実行コマンド**:

```bash
npm run db:migrate
```

マイグレーション名: `add_auth_tables`

**チェックリスト**:

- [ ] マイグレーションが正常に完了すること
- [ ] `users`, `accounts`, `sessions`, `verification_tokens`, `allowed_admins` テーブルが作成されること

---

### タスク7: シーダーに初期データ登録処理追加

**対象ファイル**:

- `prisma/seed.ts`（既存・変更）

**問題点**:

初期データをNeonコンソールから手動で登録するのは手間がかかり、再現性がない。

**修正内容**:

既存のシーダーに許可管理者メールアドレスの登録処理を追加する。

**実装例**:

```typescript
// prisma/seed.ts に追加

// 許可する管理者
const ALLOWED_ADMINS = [
  { email: 's.murakoshi1201@gmail.com', role: 'admin' },
];

async function main() {
  console.log('シードデータの投入を開始します...');

  // 許可管理者の作成
  for (const admin of ALLOWED_ADMINS) {
    await prisma.allowedAdmin.upsert({
      where: { email: admin.email },
      update: { role: admin.role },
      create: { email: admin.email, role: admin.role },
    });
  }
  console.log(
    '許可管理者を作成しました:',
    ALLOWED_ADMINS.map((a) => `${a.email} (${a.role})`).join(', ')
  );

  // 既存のカテゴリー作成処理...
}
```

**チェックリスト**:

- [ ] `prisma/seed.ts` に `AllowedAdmin` のシード処理を追加
- [ ] `upsert` を使用して冪等性を確保

---

### タスク8: 初期データ登録

**対象**:

- データベース（`allowed_admins` テーブル）

**問題点**:

許可メールアドレスが登録されていない状態では誰もログインできない。

**修正内容**:

シーダーまたは Neon コンソールから初期の管理者メールアドレスを登録する。

**実行手順（シーダー）**:

```bash
npm run db:seed
```

シーダーは `upsert` を使用しているため、既にデータが存在する場合でも安全に再実行可能。

**実行手順（Neon コンソール）**:

1. [Neon Console](https://console.neon.tech/) にログイン
2. プロジェクトを選択 → SQL Editor
3. 以下のSQLを実行:

```sql
INSERT INTO allowed_admins (id, email, created_at)
VALUES (gen_random_uuid(), 's.murakoshi1201@gmail.com', NOW());
```

**実行手順（Prisma Studio）**:

```bash
npm run db:studio
```

1. ブラウザで `AllowedAdmin` テーブルを開く
2. 「Add record」をクリック
3. `email` に `s.murakoshi1201@gmail.com` を入力
4. 「Save 1 change」をクリック

**チェックリスト**:

- [ ] `allowed_admins` テーブルに初期データが登録されていること

---

### タスク9: 動作確認・ビルドテスト

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [ ] `/dashboard` に未認証でアクセスすると `/auth/signin` へリダイレクト
   - [ ] `/dashboard/homepage` に未認証でアクセスすると `/auth/signin` へリダイレクト
   - [ ] `/dashboard/shop` に未認証でアクセスすると `/auth/signin` へリダイレクト
   - [ ] `/auth/signin` でGoogleログインボタンが表示される
   - [ ] 許可されたメールアドレス（s.murakoshi1201@gmail.com）でログインできる
   - [ ] 許可されていないメールアドレスではログインが拒否される
   - [ ] ログイン後、ダッシュボード選択画面が表示される
   - [ ] ヘッダーにメールアドレスとログアウトボタンが表示される
   - [ ] ログアウトボタンをクリックするとログアウトしてログインページへ

2. **ビルド確認** (`npm run build`)
   - [ ] ビルドエラーがないこと
   - [ ] TypeScriptエラーがないこと

3. **品質チェックリスト**（CLAUDE.md準拠）
   - [ ] この機能は**今**必要か？（YAGNI）
   - [ ] もっとシンプルな方法はないか？（KISS）
   - [ ] 未使用のインポートは削除したか？
   - [ ] リントエラーは解消したか？（`npm run lint`）
   - [ ] Server Actionsで認証が検証されているか？

---

## 変更対象ファイル一覧

| ファイル                                    | 変更内容                            | ステータス |
| ------------------------------------------- | ----------------------------------- | :--------: |
| `prisma/schema.prisma`                      | AllowedAdminモデル追加              |    [o]     |
| `prisma/seed.ts`                            | AllowedAdminシード処理追加          |    [ ]     |
| `lib/auth-config.ts`                        | **新規作成** - 許可メール判定（DB） |    [o]     |
| `auth.ts`                                   | signInコールバック追加              |    [o]     |
| `middleware.ts`                             | **新規作成** - ルート保護           |    [ ]     |
| `app/auth/signin/page.tsx`                  | **新規作成** - ログインページ       |    [ ]     |
| `app/dashboard/components/DashboardHeader.tsx` | **新規作成** - ヘッダー          |    [ ]     |
| `app/dashboard/homepage/page.tsx`           | ヘッダーコンポーネント使用          |    [ ]     |

---

## 備考

### 注意事項

- 新規ユーザー登録機能は実装しない（許可リストのメールアドレスのみ）
- 許可リストにないメールアドレスでログインを試みると、Auth.jsのエラーページが表示される
- 許可メールアドレスはデータベースで管理するため、コードにハードコードしない

### セキュリティ考慮事項（CLAUDE.md準拠）

- **Server Actionsでも認証を検証すること**: ダッシュボード内のServer Actionsでは `auth()` を呼び出してセッションを確認
- **ミドルウェアでルート保護**: `/dashboard/*` へのアクセスは認証必須
- **データベースセッション**: JWTではなくデータベースでセッションを管理（セキュリティ向上）
- **許可リストのDB管理**: メールアドレスをコードにハードコードせず、DBで管理することで変更時の再デプロイが不要

### 管理者の追加・削除方法

**シーダーから（推奨）**:

1. `prisma/seed.ts` の `ALLOWED_ADMIN_EMAILS` 配列を編集
2. `npm run db:seed` を実行

```typescript
const ALLOWED_ADMIN_EMAILS = [
  's.murakoshi1201@gmail.com',
  'newadmin@example.com', // 追加
];
```

**Neon コンソールから**:

1. [Neon Console](https://console.neon.tech/) にログイン
2. プロジェクトを選択 → SQL Editor
3. 以下のSQLを実行:

```sql
-- 管理者を追加
INSERT INTO allowed_admins (id, email, created_at)
VALUES (gen_random_uuid(), 'newadmin@example.com', NOW());

-- 管理者を削除
DELETE FROM allowed_admins WHERE email = 'oldadmin@example.com';

-- 管理者一覧を確認
SELECT * FROM allowed_admins;
```

**Prisma Studio から**（ローカル開発時）:

```bash
npm run db:studio
```

ブラウザで `AllowedAdmin` テーブルを直接編集

### 参考

- Auth.js 設定ファイル: `auth.ts`
- Auth.js ガイド: `docs/guides/authjs-guide.md`

---

## 実装後の更新

各タスクの進捗に応じて以下を更新する:

**状態遷移ルール**（共通）:

- `[ ]` → `[~]` : 作業開始時
- `[~]` → `[o]` : 作業完了時

1. **進捗状況テーブル**
   - 上記の状態遷移ルールに従って更新
   - 備考欄に補足情報があれば記載

2. **タスクの見出し**
   - 完了時に「[完了]」を追記する（例: `### タスク1: ... [完了]`）

3. **タスク内のチェックリスト**
   - 上記の状態遷移ルールに従って各項目を更新

### 完了時の更新

1. ステータスを「完了」に変更
2. 完了日を追記
3. チェックリストを更新
4. 仕様書ファイルを `updates/completed/` ディレクトリに移動してよいか確認し、許可があれば移動

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
