# Auth.js ガイド

Auth.js（旧 NextAuth.js）を使用した認証システムの実装ガイドです。

## このドキュメントの役割

このドキュメントは「**認証システムの実装方法**」を説明します。OAuth、セッション管理、ルート保護など、認証機能を理解したいときに参照してください。

**関連ドキュメント**:

- [Prisma ガイド](./prisma-guide.md): データベースアダプター
- [開発ガイドライン](../development-guide.md#セキュリティ): セキュリティのベストプラクティス

## 目次

- [概要](#概要)
- [基礎知識](#基礎知識)
  - [OAuth とは](#oauth-とは)
  - [JWT とは](#jwt-とは)
- [インストールと初期設定](#インストールと初期設定)
- [認証プロバイダー](#認証プロバイダー)
  - [OAuth プロバイダー（Google / Apple）](#oauth-プロバイダーgoogle--apple)
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
  - [推奨構成](#推奨構成)
  - [Stripe 連携](#stripe-連携)
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

# Apple OAuth
AUTH_APPLE_ID=your-apple-service-id
AUTH_APPLE_SECRET=your-apple-client-secret
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
import Apple from "next-auth/providers/apple";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, Apple],
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

### OAuth プロバイダー（Google / Apple）

**Google OAuth の設定**:

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「認証情報」→「OAuth 2.0 クライアント ID」を作成
3. リダイレクト URI: `http://localhost:3000/api/auth/callback/google`

**Apple OAuth の設定**:

Apple の認証設定は Google に比べて複雑です。

1. [Apple Developer](https://developer.apple.com/) に登録（年間 $99）
2. App ID を作成し「Sign in with Apple」を有効化
3. Services ID を作成（これが Client ID になる）
   - Identifier: `com.shirokumado.auth`
   - Return URL: `http://localhost:3000/api/auth/callback/apple`
4. 秘密鍵（.p8 ファイル）を作成・ダウンロード
5. JWT 形式の Client Secret を生成

```typescript
// scripts/generate-apple-secret.ts
import jwt from "jsonwebtoken";
import fs from "fs";

const privateKey = fs.readFileSync("path/to/AuthKey.p8", "utf8");

const secret = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  audience: "https://appleid.apple.com",
  issuer: "YOUR_TEAM_ID",
  subject: "com.shirokumado.auth",
  keyid: "KEY_ID",
});
```

**Apple 認証の注意点**:

- Client Secret（JWT）は最大 6 ヶ月で期限切れ → 定期的に再生成が必要
- 「Hide My Email」でリレーメールアドレスが返される場合がある
- ユーザー名は初回ログイン時のみ取得可能

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

```prisma
// prisma/schema.prisma
model User {
  id             String    @id @default(cuid())
  name           String?
  email          String?   @unique
  emailVerified  DateTime?
  image          String?
  hashedPassword String?
  role           String    @default("user")
  accounts       Account[]
  sessions       Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## 認証の実装

### ミドルウェアによるルート保護

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

### 推奨構成

白熊堂プロジェクトでは、Stripe を使った EC サイトの構築を検討しているため、**データベースセッション**を推奨します。

**理由**:

1. 決済セキュリティ: 不正アクセス検知時に即座にセッションを無効化できる
2. サブスクリプション管理: 支払い状態の変更をセッションに即時反映できる
3. マルチデバイス対応: 複数デバイスでのセッション管理が可能

```typescript
// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, Apple],
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60, // 1週間
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.stripeCustomerId = user.stripeCustomerId;
      return session;
    },
  },
});
```

### Stripe 連携

**スキーマ拡張**:

```prisma
model User {
  // ... 既存フィールド
  stripeCustomerId String? @unique
  orders           Order[]
}

model Order {
  id                      String   @id @default(cuid())
  userId                  String
  user                    User     @relation(fields: [userId], references: [id])
  stripeCheckoutSessionId String?  @unique
  status                  String   @default("pending")
  total                   Int
  createdAt               DateTime @default(now())
}
```

**Stripe Customer の自動作成**:

```typescript
// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user?.email ?? undefined,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
```

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

**型の拡張例**:

```typescript
// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}
```

---

## 参考リンク

- [Auth.js 公式ドキュメント](https://authjs.dev/)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
- [Stripe + Next.js](https://stripe.com/docs/stripe-js/react)
