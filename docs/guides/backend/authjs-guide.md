# Auth.js ガイド

Auth.js（旧 NextAuth.js）を使用した認証システムの実装ガイドです。

## このドキュメントの役割

このドキュメントは「**認証システムの実装方法**」を説明します。OAuth、セッション管理、ルート保護など、認証機能を理解したいときに参照してください。

**関連ドキュメント**:

- [Prisma ガイド](./prisma-guide.md): データベースアダプター
- [開発ガイドライン](../../development-guide.md#セキュリティ): セキュリティのベストプラクティス

## 目次

- [概要](#概要)
- [基礎知識](#基礎知識)
  - [OAuth とは](#oauth-とは)
  - [JWT とは](#jwt-とは)
- [インストールと初期設定](#インストールと初期設定)
- [認証プロバイダー](#認証プロバイダー)
  - [OAuth プロバイダー（Google / Apple）](#oauth-プロバイダー（google-apple）)
  - [Credentials プロバイダー](#credentials-プロバイダー)
- [セッション管理](#セッション管理)
  - [JWT セッション vs データベースセッション](#jwt-セッション-vs-データベースセッション)
  - [セッション方式の選び方](#セッション方式の選び方)
- [Prisma アダプター](#prisma-アダプター)
- [認証の実装](#認証の実装)
  - [ミドルウェアによるルート保護](#ミドルウェアによるルート保護)
  - [クライアントサイドでの認証](#クライアントサイドでの認証)
  - [サーバーサイドでの認証](#サーバーサイドでの認証)
- [白熊堂プロジェクトでの実装](#白熊堂プロジェクトでの実装)
  - [実装構成](#実装構成)
  - [アクセス制御（許可リスト）](#アクセス制御許可リスト)
  - [ロールベースの権限管理](#ロールベースの権限管理)
  - [セッションクリーンアップ](#セッションクリーンアップ)
- [セキュリティのベストプラクティス](#セキュリティのベストプラクティス)
- [トラブルシューティング](#トラブルシューティング)
- [参考リンク](#参考リンク)

---

## 概要

Auth.js は、Next.js アプリケーションに認証機能を追加するためのライブラリです。

**主な特徴**:

- **複数の認証プロバイダー**: Google、Apple、GitHub など 50 以上の OAuth プロバイダーをサポート
- **セッション管理**: JWT またはデータベースベースのセッション管理
- **Next.js 統合**: App Router、Server Components、Middleware との優れた統合
- **型安全性**: TypeScript との統合が優れており、型安全な開発が可能

**Auth.js v5 について**:

```bash
npm install next-auth@beta
```

Auth.js v5 は「ベータ版」という名称ですが、長期間にわたり開発・改善が続けられており、多くの本番環境で採用されています。

| バージョン  | 状態                     | 推奨用途                                   |
| ----------- | ------------------------ | ------------------------------------------ |
| v5 (beta)   | 比較的安定、活発に開発中 | App Router を使用する新規プロジェクト      |
| v4 (stable) | 安定版                   | Pages Router、または安定性を最優先する場合 |

---

## 基礎知識

### OAuth とは

OAuth（Open Authorization）は、ユーザーがパスワードを共有せずに、アプリケーションが外部サービス（Google など）のユーザー情報にアクセスすることを許可するための標準プロトコルです。

**OAuth 2.0 の登場人物**:

| 役割                 | 説明                                   | 例                        |
| -------------------- | -------------------------------------- | ------------------------- |
| Resource Owner       | リソースの所有者（ユーザー）           | アプリを使うユーザー      |
| Client               | リソースにアクセスするアプリ           | 白熊堂の Web アプリ       |
| Authorization Server | 認証とトークン発行を行うサーバー       | Google の認証サーバー     |
| Resource Server      | 保護されたリソースをホストするサーバー | Google のユーザー情報 API |

**認証フロー（Authorization Code Flow）**:

```
ユーザー                    白熊堂アプリ                   Google
   │                           │                           │
   │ 1. Googleでログイン        │                           │
   │──────────────────────────►│                           │
   │                           │                           │
   │ 2. Google認証画面へ        │                           │
   │◄──────────────────────────│                           │
   │                           │                           │
   │ 3. ログイン & 許可         │                           │
   │───────────────────────────────────────────────────────►│
   │                           │                           │
   │ 4. 認可コード付きでリダイレクト                          │
   │◄───────────────────────────────────────────────────────│
   │                           │                           │
   │                           │ 5. コード→トークン交換     │
   │                           │──────────────────────────►│
   │                           │                           │
   │                           │ 6. アクセストークン        │
   │                           │◄──────────────────────────│
   │                           │                           │
   │ 7. ログイン完了            │                           │
   │◄──────────────────────────│                           │
```

**OAuth を使うメリット**:

- **セキュリティ**: パスワードをアプリで保存・管理する必要がない
- **ユーザー体験**: 新規登録フォームの入力が不要、ワンクリックでログイン
- **開発負担軽減**: パスワードリセット機能などの実装が不要

### JWT とは

JWT（JSON Web Token）は、当事者間で情報を安全に送信するためのトークン形式です（RFC 7519）。

**JWT の構造**:

```
xxxxx.yyyyy.zzzzz
  │      │      │
  │      │      └── Signature（署名）
  │      └── Payload（ペイロード：ユーザー情報など）
  └── Header（ヘッダー：アルゴリズム情報）
```

```json
// Payload の例
{
  "sub": "user123",
  "name": "山田太郎",
  "role": "admin",
  "iat": 1704067200,
  "exp": 1706745600
}
```

**重要なポイント**:

- JWT は**署名**されているため、改ざんを検知できる
- JWT は**暗号化されていない**ため、内容は誰でも読める（Base64 デコードするだけ）
- パスワードなどの機密情報は JWT に含めてはいけない

---

## インストールと初期設定

**1. パッケージのインストール**:

```bash
npm install next-auth@beta
```

**2. 環境変数の設定**（`.env.local`）:

```env
AUTH_SECRET=your-secret-key-here

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

`AUTH_SECRET` の生成:

```bash
npx auth secret
```

**3. Auth.js の設定ファイル**:

```typescript
// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
});
```

**4. API ルートハンドラー**:

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

---

## 認証プロバイダー

### OAuth プロバイダー（Google）

> **注意**: このアプリでは現在 **Google OAuth のみ**を使用しています。Apple OAuth は未実装です。

**Google OAuth の設定**:

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「認証情報」→「OAuth 2.0 クライアント ID」を作成
3. リダイレクト URI: `http://localhost:3000/api/auth/callback/google`

**このアプリでの Google プロバイダー設定**:

[`auth.ts`](../../auth.ts)

```typescript
Google({
  authorization: {
    params: {
      // ログイン時に毎回アカウント選択画面を表示する
      prompt: 'select_account',
    },
  },
}),
```

### Credentials プロバイダー

メールアドレスとパスワードを使用したカスタム認証:

```typescript
// auth.ts
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

Credentials({
  credentials: {
    email: { label: "メールアドレス", type: "email" },
    password: { label: "パスワード", type: "password" },
  },
  async authorize(credentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email as string },
    });

    if (!user?.hashedPassword) return null;

    const isValid = await bcrypt.compare(
      credentials.password as string,
      user.hashedPassword,
    );

    return isValid ? user : null;
  },
});
```

---

## セッション管理

### JWT セッション vs データベースセッション

| 観点                 | JWT セッション            | データベースセッション          |
| -------------------- | ------------------------- | ------------------------------- |
| パフォーマンス       | ◎ 高速（DB アクセス不要） | △ 毎リクエストで DB アクセス    |
| スケーラビリティ     | ◎ サーバー間で共有不要    | △ DB がボトルネックになる可能性 |
| セッション無効化     | × 即座の無効化が困難      | ◎ 即座に無効化可能              |
| セッション情報の更新 | × トークン再発行が必要    | ◎ DB 更新で即時反映             |

**JWT セッションの設定**:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [...],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 1週間
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

**データベースセッションの設定**:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [...],
  session: {
    strategy: "database",
    maxAge: 24 * 60 * 60, // 24時間
  },
});
```

### セッション方式の選び方

**JWT セッションが適しているケース** ✅

- 一般的な Web アプリ（ブログ、ポートフォリオなど）
- 高トラフィックなサービス（DB 負荷を軽減したい）
- サーバーレス環境（Vercel、AWS Lambda）

**JWT セッションを避けるべきケース** ❌

- 即座のセッション無効化が必要（パスワード変更時など）
- ユーザーのロールや権限がリアルタイムで変わる
- 同時ログイン数の制限が必要

**データベースセッションが適しているケース** ✅

- EC サイト / 決済機能があるサービス
- 管理者向けシステム（権限変更の即時反映）
- マルチデバイス対応（セッション一覧の表示など）

**データベースセッションを避けるべきケース** ❌

- 超高トラフィックなサービス
- Vercel の Edge Runtime（DB 接続不可）

---

## Prisma アダプター

```bash
npm install @auth/prisma-adapter
```

**スキーマ設定**:

このアプリでは、Auth.js 標準テーブルに加えて `AllowedAdmin`（許可リスト）と `Role`（ロールマスター）を追加しています。

[`prisma/schema.prisma`](../../prisma/schema.prisma)

```prisma
// ユーザーテーブル（Auth.js用）
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  roleName      String?   @map("role_name")
  role          Role?     @relation(fields: [roleName], references: [name])
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("users")
}

// OAuthアカウントテーブル（Auth.js用）
model Account {
  id                String  @id @default(uuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// セッションテーブル（Auth.js用）
model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// メール認証用トークンテーブル（Auth.js用）
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// 管理者許可メールアドレステーブル
model AllowedAdmin {
  id        String   @id @default(uuid())
  email     String   @unique
  roleName  String   @map("role_name")
  role      Role     @relation(fields: [roleName], references: [name])
  createdAt DateTime @default(now()) @map("created_at")

  @@map("allowed_admins")
}

// ロールマスターテーブル
model Role {
  name          String         @id
  description   String?
  users         User[]
  allowedAdmins AllowedAdmin[]
  createdAt     DateTime       @default(now()) @map("created_at")

  @@map("roles")
}
```

**標準スキーマとの主な違い**:

- `@id @default(uuid())`: cuid() ではなく uuid() を使用
- `@map()`: カラム名をスネークケースにマッピング
- `@@map()`: テーブル名を明示的に指定
- `roleName` フィールド: `Role` テーブルとのリレーションでロール管理
- `AllowedAdmin`: ログイン許可リスト（このテーブルに登録されたメールアドレスのみログイン可能）
- `Role`: ロールマスター（admin, homepage, shop）

---

## 認証の実装

### ミドルウェアによるルート保護

> **注意**: 白熊堂プロジェクトでは Middleware を使用していません。`dashboard/layout.tsx` 内で `auth()` を呼び出してセッションを検証し、未認証時はログイン案内UIを表示する方式を採用しています。以下は Auth.js の一般的なミドルウェア実装例です。

```typescript
// middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnAuthPage = req.nextUrl.pathname.startsWith("/auth");

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin", req.nextUrl));
  }

  if (isOnAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
```

### クライアントサイドでの認証

```typescript
// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

```typescript
// components/UserMenu.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>読み込み中...</div>;

  if (!session) {
    return <button onClick={() => signIn()}>ログイン</button>;
  }

  return (
    <div>
      <p>{session.user?.name}さん</p>
      <button onClick={() => signOut()}>ログアウト</button>
    </div>
  );
}
```

### サーバーサイドでの認証

**Server Components**:

```typescript
// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/auth/signin");

  return <h1>ようこそ、{session.user?.name}さん</h1>;
}
```

**Server Actions**:

```typescript
"use server";

import { auth } from "@/auth";

export async function createProduct(formData: FormData) {
  const session = await auth();

  if (!session) throw new Error("認証が必要です");
  if (session.user?.role !== "admin") throw new Error("権限がありません");

  // 処理を実行
}
```

**API Routes**:

```typescript
// app/api/products/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // 処理を実行
}
```

---

## 白熊堂プロジェクトでの実装

### 実装構成

白熊堂プロジェクトでは、管理画面（ダッシュボード）へのアクセス制御のために **データベースセッション** + **許可リスト** + **ロールベースの権限管理**を採用しています。

**設計のポイント**:

1. **Google OAuth のみ**: パスワード管理が不要でセキュリティリスクを低減
2. **許可リスト方式**: `AllowedAdmin` テーブルに登録されたメールアドレスのみログイン可能
3. **ロールベース権限**: `Role` テーブルで権限を管理（admin, homepage, shop）
4. **データベースセッション**: セッションの即時無効化が可能

[`auth.ts`](../../auth.ts)

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import { prisma, safePrismaOperation } from '@/lib/prisma';
import { isAllowedEmail, getRoleNameByEmail } from '@/lib/auth-config';
import type { Adapter } from 'next-auth/adapters';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      authorization: {
        params: {
          // ログイン時に毎回アカウント選択画面を表示する
          prompt: 'select_account',
        },
      },
    }),
  ],
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
```

### アクセス制御（許可リスト）

[`lib/auth-config.ts`](../../lib/auth-config.ts) で、ログイン許可リストのチェックとロール取得を行います。

```typescript
import { prisma, safePrismaOperation } from '@/lib/prisma';

// メールアドレスがログイン許可リストに含まれているかチェック
export async function isAllowedEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const allowedAdmin = await safePrismaOperation(
    () => prisma.allowedAdmin.findUnique({
      where: { email },
    }),
    'isAllowedEmail'
  );

  return !!allowedAdmin;
}

// AllowedAdminテーブルからメールアドレスに対応するロール名を取得
export async function getRoleNameByEmail(email: string | null | undefined): Promise<string | null> {
  if (!email) return null;

  const allowedAdmin = await safePrismaOperation(
    () => prisma.allowedAdmin.findUnique({
      where: { email },
    }),
    'getRoleNameByEmail'
  );

  return allowedAdmin?.roleName ?? null;
}
```

**認証フローの流れ**:

1. ユーザーが Google でログイン
2. `signIn` コールバックで `AllowedAdmin` テーブルを確認
3. 許可リストに含まれていない場合はログインを拒否（`return false`）
4. 初回ログイン時、`createUser` イベントで `AllowedAdmin` のロールを `User` に反映
5. `session` コールバックでセッションにユーザー ID とロールを含める

### ロールベースの権限管理

ロールは `Role` テーブルで管理されており、シードデータで以下の 3 種類が定義されています：

| ロール名   | 説明                               |
| ---------- | ---------------------------------- |
| `admin`    | すべてのダッシュボード機能にアクセス可能 |
| `homepage` | ホームページ関連の機能のみ         |
| `shop`     | ECサイト関連の機能のみ             |

### セッションクリーンアップ

期限切れセッションを定期的に削除する Cron ジョブが実装されています。

[`app/api/cron/cleanup-sessions/route.ts`](../../app/api/cron/cleanup-sessions/route.ts)

- **実行タイミング**: Vercel Cron から毎月 1 日 UTC 15:00（日本時間 0:00）に呼び出し
- **認証**: `CRON_SECRET` 環境変数による Bearer トークン認証
- **処理**: `expires` が現在時刻より前のセッションを `deleteMany` で一括削除

---

## セキュリティのベストプラクティス

**1. 環境変数の管理**

```env
# NEXT_PUBLIC_ プレフィックスは使用しない（クライアントに公開されるため）
AUTH_SECRET=your-very-long-random-secret-key
AUTH_GOOGLE_SECRET=xxx
```

**2. Server Actions での認証チェック**

```typescript
"use server";

export async function sensitiveAction() {
  const session = await auth();

  if (!session) throw new Error("認証が必要です");
  if (session.user?.role !== "admin") throw new Error("権限がありません");

  // 処理を実行
}
```

**3. コールバック URL の制限**

```typescript
callbacks: {
  async redirect({ url, baseUrl }) {
    if (url.startsWith(baseUrl)) return url;
    return baseUrl;
  },
}
```

**4. レート制限**

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

---

## トラブルシューティング

| 問題                                   | 解決策                                               |
| -------------------------------------- | ---------------------------------------------------- |
| セッションが取得できない               | `await auth()` の `await` を確認                     |
| Credentials でセッションが保存されない | `session: { strategy: "jwt" }` を明示的に指定        |
| OAuth コールバックエラー               | リダイレクト URI が正確か確認、本番では HTTPS を使用 |
| TypeScript の型エラー                  | `types/next-auth.d.ts` で型を拡張                    |
| `403: disallowed_useragent` エラー     | LINE等のアプリ内ブラウザ（WebView）からのGoogle OAuthはGoogleがブロックしている。外部ブラウザへ誘導する `WebViewGuard` コンポーネントで対応済み（[詳細](../../authentication.md#アプリ内ブラウザで「403-disalloweduseragent」エラー)） |

**型の拡張例**:

[`types/next-auth.d.ts`](../../types/next-auth.d.ts)

```typescript
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    roleName: string | null;
  }
}
```

- `Session.user.role`: `session` コールバック内で `user.roleName ?? 'homepage'` として設定
- `User.roleName`: Prisma スキーマの `User.roleName` フィールドに対応

---

## 参考リンク

- [Auth.js 公式ドキュメント](https://authjs.dev/)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
