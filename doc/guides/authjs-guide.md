# Auth.js ガイド

Auth.js（旧 NextAuth.js）を使用した認証システムの実装について詳しく説明します。

## 目次

- [概要](#概要)
- [Auth.js とは](#authjs-とは)
- [OAuth とは](#oauth-とは)
  - [OAuth の基本概念](#oauth-の基本概念)
  - [OAuth 2.0 の認証フロー](#oauth-20-の認証フロー)
  - [OAuth を使うメリット](#oauth-を使うメリット)
- [インストールと初期設定](#インストールと初期設定)
  - [パッケージのインストール](#パッケージのインストール)
  - [環境変数の設定](#環境変数の設定)
  - [Auth.js の設定ファイル](#authjs-の設定ファイル)
- [認証プロバイダー](#認証プロバイダー)
  - [OAuth プロバイダー](#oauth-プロバイダー)
  - [Credentials プロバイダー](#credentials-プロバイダー)
- [セッション管理](#セッション管理)
  - [JWT セッション](#jwt-セッション)
  - [データベースセッション](#データベースセッション)
- [Prisma アダプター](#prisma-アダプター)
  - [スキーマの設定](#スキーマの設定)
  - [アダプターの設定](#アダプターの設定)
- [ミドルウェアによるルート保護](#ミドルウェアによるルート保護)
- [クライアントサイドでの認証](#クライアントサイドでの認証)
  - [SessionProvider](#sessionprovider)
  - [useSession フック](#usesession-フック)
- [サーバーサイドでの認証](#サーバーサイドでの認証)
  - [Server Components での使用](#server-components-での使用)
  - [Server Actions での使用](#server-actions-での使用)
  - [API Routes での使用](#api-routes-での使用)
- [ダッシュボード保護の実装例](#ダッシュボード保護の実装例)
- [Stripe 連携時の考慮事項](#stripe-連携時の考慮事項)
- [セキュリティのベストプラクティス](#セキュリティのベストプラクティス)
- [トラブルシューティング](#トラブルシューティング)
- [参考リンク](#参考リンク)

## 概要

Auth.js は、Next.js アプリケーションに認証機能を簡単に追加できるライブラリです。OAuth プロバイダー（Google、GitHub など）、メール認証、カスタム認証など、様々な認証方式をサポートしています。

**Auth.js の主な特徴**:

- **複数の認証プロバイダー**: Google、GitHub、Discord など 50 以上の OAuth プロバイダーをサポート
- **セッション管理**: JWT またはデータベースベースのセッション管理
- **データベース連携**: Prisma、Drizzle など様々な ORM/データベースアダプターをサポート
- **型安全性**: TypeScript との統合が優れており、型安全な開発が可能
- **セキュリティ**: CSRF 保護、セキュアな Cookie 管理などが標準で実装

## Auth.js とは

Auth.js（旧 NextAuth.js v5）は、Web アプリケーション向けの認証ライブラリです。Next.js だけでなく、SvelteKit、Express などの他のフレームワークでも使用できますが、Next.js との統合が最も充実しています。

**Next.js との統合機能**:

- App Router / Pages Router 両方をサポート
- Server Components との統合
- Middleware による自動的なルート保護
- Server Actions での認証チェック

## OAuth とは

OAuth（Open Authorization）は、ユーザーがパスワードを共有せずに、あるサービス（アプリケーション）が別のサービス（Google、GitHub など）のユーザー情報にアクセスすることを許可するための標準プロトコルです。

### OAuth の基本概念

OAuth 2.0 には 4 つの主要な役割（ロール）があります。

```
┌─────────────────────────────────────────────────────────────────┐
│                        OAuth 2.0 の登場人物                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │ Resource     │         │ Client       │                     │
│  │ Owner        │         │ (白熊堂アプリ) │                     │
│  │ (ユーザー)    │         │              │                     │
│  └──────────────┘         └──────────────┘                     │
│         │                        │                              │
│         │ 認可を与える            │ アクセスを要求                │
│         ▼                        ▼                              │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │ Authorization│◄───────►│ Resource     │                     │
│  │ Server       │         │ Server       │                     │
│  │ (Google認証) │         │ (Google API) │                     │
│  └──────────────┘         └──────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| 役割 | 説明 | 例 |
|------|------|-----|
| **Resource Owner** | リソースの所有者。通常はエンドユーザー | アプリを使うユーザー |
| **Client** | ユーザーの代わりにリソースにアクセスするアプリケーション | 白熊堂のWebアプリ |
| **Authorization Server** | ユーザーを認証し、アクセストークンを発行するサーバー | Google の認証サーバー |
| **Resource Server** | 保護されたリソースをホストするサーバー | Google のユーザー情報 API |

### OAuth 2.0 の認証フロー

Auth.js で最もよく使用される「Authorization Code Flow」の流れを説明します。

```
┌────────┐                               ┌────────────┐                        ┌────────────┐
│ ユーザー │                               │  白熊堂アプリ │                        │   Google   │
└────────┘                               └────────────┘                        └────────────┘
     │                                          │                                     │
     │ 1. 「Googleでログイン」をクリック           │                                     │
     │─────────────────────────────────────────►│                                     │
     │                                          │                                     │
     │ 2. Googleの認証画面にリダイレクト           │                                     │
     │◄─────────────────────────────────────────│                                     │
     │                                          │                                     │
     │ 3. Googleにログイン & アプリへのアクセスを許可 │                                     │
     │─────────────────────────────────────────────────────────────────────────────────►│
     │                                          │                                     │
     │ 4. 認可コード付きでアプリにリダイレクト       │                                     │
     │◄─────────────────────────────────────────────────────────────────────────────────│
     │                                          │                                     │
     │                                          │ 5. 認可コードをアクセストークンと交換    │
     │                                          │────────────────────────────────────►│
     │                                          │                                     │
     │                                          │ 6. アクセストークンを返却              │
     │                                          │◄────────────────────────────────────│
     │                                          │                                     │
     │                                          │ 7. トークンでユーザー情報を取得         │
     │                                          │────────────────────────────────────►│
     │                                          │                                     │
     │                                          │ 8. ユーザー情報（名前、メール等）を返却  │
     │                                          │◄────────────────────────────────────│
     │                                          │                                     │
     │ 9. ログイン完了！セッションを作成            │                                     │
     │◄─────────────────────────────────────────│                                     │
     │                                          │                                     │
```

**各ステップの詳細**:

1. **ログインボタンクリック**: ユーザーが「Googleでログイン」ボタンをクリック
2. **リダイレクト**: アプリは Google の認証画面（Authorization Server）にリダイレクト
3. **認証と認可**: ユーザーが Google にログインし、アプリへのアクセスを許可
4. **認可コード取得**: Google がユーザーをアプリにリダイレクトし、URL に認可コードを付与
5. **トークン交換**: アプリがサーバーサイドで認可コードをアクセストークンと交換
6. **トークン受領**: Google がアクセストークン（とリフレッシュトークン）を返却
7. **リソースアクセス**: アプリがアクセストークンを使って Google API にリクエスト
8. **情報取得**: Google がユーザーのプロフィール情報を返却
9. **セッション作成**: アプリがユーザー情報を元にセッションを作成し、ログイン完了

**重要なポイント**:

- ユーザーのパスワードはアプリに渡されない（Google のみが知っている）
- アクセストークンは有効期限があり、期限切れ後はリフレッシュトークンで更新
- Auth.js はこの複雑なフローを自動的に処理してくれる

### OAuth を使うメリット

**1. セキュリティの向上**

```
従来の方式:
ユーザー ──(パスワード)──► 各サービス
         ──(パスワード)──► 各サービス
         ──(パスワード)──► 各サービス
         ↓
パスワードが複数のサービスに保存される = リスク増大

OAuth:
ユーザー ──(パスワード)──► Google のみ
         ──(トークン)───► 各サービス
         ↓
パスワードは1箇所のみ = リスク軽減
```

- ユーザーのパスワードをアプリで保存・管理する必要がない
- パスワード漏洩のリスクを軽減
- 大手プロバイダー（Google、GitHub）の堅牢なセキュリティを活用

**2. ユーザー体験の向上**

- 新規登録フォームの入力が不要
- パスワードを覚える必要がない
- ワンクリックでログイン可能

**3. 開発者の負担軽減**

- パスワードのハッシュ化・保存の実装が不要
- パスワードリセット機能の実装が不要
- メール認証の実装が不要（プロバイダーが保証）

**4. 信頼性の向上**

- ユーザーは既知のサービス（Google など）を通じて認証するため安心
- アプリへの信頼度が向上

**OAuth と OpenID Connect（OIDC）の違い**:

| 項目 | OAuth 2.0 | OpenID Connect |
|------|-----------|----------------|
| 目的 | 認可（Authorization） | 認証（Authentication） |
| 用途 | リソースへのアクセス許可 | ユーザーの身元確認 |
| 取得情報 | アクセストークン | アクセストークン + ID トークン |

Auth.js で使用する Google や GitHub のプロバイダーは、OAuth 2.0 の上に構築された OpenID Connect を使用しており、認証と認可の両方を行います。

## インストールと初期設定

### パッケージのインストール

```bash
npm install next-auth@beta
```

**Auth.js v5 について**:

Auth.js v5 は「ベータ版」という名称ですが、長期間にわたり開発・改善が続けられており、多くの本番環境で採用されています。App Router や Server Components との統合が大幅に改善されているため、新規プロジェクトでは v5 の使用を推奨します。

| バージョン | 状態 | 推奨用途 |
|-----------|------|---------|
| v5 (beta) | 比較的安定、活発に開発中 | App Router を使用する新規プロジェクト |
| v4 (stable) | 安定版 | Pages Router を使用するプロジェクト、または安定性を最優先する場合 |

安定版を使用したい場合は `next-auth@4` をインストールしてください（ただし設定方法が異なります）。

### 環境変数の設定

`.env.local` ファイルに以下の環境変数を設定します。

```env
# Auth.js の設定
AUTH_SECRET=your-secret-key-here

# OAuth プロバイダーの設定（例：Google）
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# OAuth プロバイダーの設定（例：Apple）
AUTH_APPLE_ID=your-apple-client-id
AUTH_APPLE_SECRET=your-apple-client-secret
```

**AUTH_SECRET の生成方法**:

```bash
npx auth secret
```

または

```bash
openssl rand -base64 32
```

### Auth.js の設定ファイル

プロジェクトのルートに `auth.ts` ファイルを作成します。

```typescript
// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, Apple],
});
```

次に、API ルートハンドラーを作成します。

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

## 認証プロバイダー

### OAuth プロバイダー

OAuth プロバイダーを使用すると、Google、Apple などの外部サービスを使った認証が可能です。

```typescript
// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  ],
});
```

**Google OAuth の設定手順**:

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「認証情報」に移動
4. 「OAuth 2.0 クライアント ID」を作成
5. 承認済みの JavaScript 生成元: `http://localhost:3000`
6. 承認済みのリダイレクト URI: `http://localhost:3000/api/auth/callback/google`
7. クライアント ID とシークレットを環境変数に設定

**Apple OAuth（Sign in with Apple）の設定手順**:

Apple の認証設定は Google に比べて複雑です。以下の手順に従ってください。

1. **Apple Developer Program への登録**
   - [Apple Developer](https://developer.apple.com/) に登録（年間 $99）
   - 個人または組織として登録が必要

2. **App ID の作成**
   - Apple Developer Console → 「Certificates, Identifiers & Profiles」
   - 「Identifiers」→「App IDs」→「+」ボタン
   - 「Sign in with Apple」を有効化

3. **Services ID の作成**（これが OAuth の Client ID になります）
   - 「Identifiers」→「Services IDs」→「+」ボタン
   - Description: アプリ名（例：白熊堂）
   - Identifier: リバースドメイン形式（例：`com.shirokumado.auth`）
   - 「Sign in with Apple」を有効化し、Configure をクリック
   - Primary App ID: 先ほど作成した App ID を選択
   - Domains: `localhost`（開発用）、`yourdomain.com`（本番用）
   - Return URLs: `http://localhost:3000/api/auth/callback/apple`

4. **秘密鍵の作成**
   - 「Keys」→「+」ボタン
   - 「Sign in with Apple」を有効化
   - キーをダウンロード（`.p8` ファイル）
   - **重要**: このファイルは一度しかダウンロードできません

5. **Client Secret の生成**
   Apple は通常の Client Secret ではなく、JWT を使用します。以下のスクリプトで生成できます。

   ```typescript
   // scripts/generate-apple-secret.ts
   import jwt from "jsonwebtoken";
   import fs from "fs";

   const privateKey = fs.readFileSync("path/to/AuthKey_XXXXXXXXXX.p8", "utf8");

   const secret = jwt.sign({}, privateKey, {
     algorithm: "ES256",
     expiresIn: "180d", // 最大6ヶ月
     audience: "https://appleid.apple.com",
     issuer: "YOUR_TEAM_ID", // Apple Developer の Team ID
     subject: "com.shirokumado.auth", // Services ID の Identifier
     keyid: "XXXXXXXXXX", // Key ID（キー作成時に表示される）
   });

   console.log(secret);
   ```

   ```bash
   npm install jsonwebtoken
   npx ts-node scripts/generate-apple-secret.ts
   ```

6. **環境変数の設定**

   ```env
   AUTH_APPLE_ID=com.shirokumado.auth  # Services ID の Identifier
   AUTH_APPLE_SECRET=生成したJWT
   ```

**Apple 認証の注意点**:

- Client Secret（JWT）は最大 6 ヶ月で期限切れになるため、定期的に再生成が必要
- Apple はユーザーのメールアドレスを「Hide My Email」で隠すオプションを提供するため、リレーメールアドレス（`xxxxx@privaterelay.appleid.com`）が返される場合がある
- 初回ログイン時のみユーザー名が取得でき、2 回目以降は取得できない（必要なら初回で保存する）

### Credentials プロバイダー

メールアドレスとパスワードを使用したカスタム認証を実装できます。

```typescript
// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});
```

**注意**: Credentials プロバイダーを使用する場合、パスワードのハッシュ化には `bcryptjs` を使用することを推奨します。

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

## セッション管理

Auth.js は 2 種類のセッション管理方式をサポートしています。

### JWT セッション

デフォルトの方式です。セッション情報を JWT トークンとして Cookie に保存します。

```typescript
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [...],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日間
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
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
```

**メリット**:
- データベースへのアクセスが不要で高速
- スケーラビリティが高い

**デメリット**:
- セッションの即座の無効化が困難
- トークンサイズに制限がある

### データベースセッション

セッション情報をデータベースに保存します。

```typescript
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [...],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
});
```

**メリット**:
- セッションの即座の無効化が可能
- より詳細なセッション管理が可能

**デメリット**:
- 毎リクエストでデータベースアクセスが発生

## Prisma アダプター

Auth.js を Prisma と連携させることで、ユーザー情報やセッション情報をデータベースに保存できます。

### スキーマの設定

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  hashedPassword String?
  role          String    @default("user")
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
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

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

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

### アダプターの設定

```bash
npm install @auth/prisma-adapter
```

```typescript
// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});
```

## ミドルウェアによるルート保護

Next.js のミドルウェアを使用して、特定のルートを保護できます。

```typescript
// middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isOnAuthPage = req.nextUrl.pathname.startsWith("/auth");

  // ダッシュボードへのアクセスは認証必須
  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin", req.nextUrl));
  }

  // 管理者ページへのアクセスは管理者ロール必須
  if (isOnAdmin) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/auth/signin", req.nextUrl));
    }
    if (req.auth?.user?.role !== "admin") {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }

  // 認証済みユーザーが認証ページにアクセスした場合はリダイレクト
  if (isOnAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
```

## クライアントサイドでの認証

### SessionProvider

クライアントコンポーネントでセッション情報を使用するには、`SessionProvider` でアプリケーションをラップします。

```typescript
// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

```typescript
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### useSession フック

```typescript
// components/UserMenu.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>読み込み中...</div>;
  }

  if (!session) {
    return (
      <button onClick={() => signIn()}>
        ログイン
      </button>
    );
  }

  return (
    <div>
      <p>{session.user?.name}さん</p>
      <button onClick={() => signOut()}>
        ログアウト
      </button>
    </div>
  );
}
```

## サーバーサイドでの認証

### Server Components での使用

```typescript
// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{session.user?.name}さん</p>
    </div>
  );
}
```

### Server Actions での使用

```typescript
// app/actions/product.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const session = await auth();

  if (!session) {
    throw new Error("認証が必要です");
  }

  // 管理者権限のチェック
  if (session.user?.role !== "admin") {
    throw new Error("管理者権限が必要です");
  }

  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string, 10);

  await prisma.product.create({
    data: {
      name,
      price,
      createdBy: session.user.id,
    },
  });

  revalidatePath("/dashboard");
}
```

### API Routes での使用

```typescript
// app/api/products/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      ...body,
      createdBy: session.user?.id,
    },
  });

  return NextResponse.json(product);
}
```

## ダッシュボード保護の実装例

白熊堂プロジェクトのダッシュボードを保護する実装例です。

```typescript
// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
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
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
```

```typescript
// middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin", req.nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

```typescript
// app/auth/signin/page.tsx
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <h1 className="text-2xl font-bold text-center">ログイン</h1>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Google でログイン
          </button>
        </form>
      </div>
    </div>
  );
}
```

## Stripe 連携時の考慮事項

EC サイトで Stripe を使用する場合、Auth.js との連携で以下の点を考慮する必要があります。

### ユーザーと Stripe Customer の紐付け

```prisma
// prisma/schema.prisma
model User {
  id               String    @id @default(cuid())
  name             String?
  email            String?   @unique
  emailVerified    DateTime?
  image            String?
  hashedPassword   String?
  role             String    @default("user")
  stripeCustomerId String?   @unique
  accounts         Account[]
  sessions         Session[]
  orders           Order[]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model Order {
  id                     String   @id @default(cuid())
  userId                 String
  user                   User     @relation(fields: [userId], references: [id])
  stripePaymentIntentId  String?  @unique
  stripeCheckoutSessionId String? @unique
  status                 String   @default("pending")
  total                  Int
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

### Stripe Customer の自動作成

```typescript
// lib/stripe.ts
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("ユーザーが見つかりません");
  }

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    metadata: {
      userId: user.id,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
```

### チェックアウトセッションの作成

```typescript
// app/api/checkout/route.ts
import { auth } from "@/auth";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    );
  }

  const { items } = await request.json();

  const customerId = await getOrCreateStripeCustomer(session.user.id);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: items.map((item: { priceId: string; quantity: number }) => ({
      price: item.priceId,
      quantity: item.quantity,
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      userId: session.user.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### Webhook でのユーザー特定

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      if (userId) {
        await prisma.order.create({
          data: {
            userId,
            stripeCheckoutSessionId: session.id,
            status: "completed",
            total: session.amount_total ?? 0,
          },
        });
      }
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      // 支払い成功時の処理
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

## セキュリティのベストプラクティス

### 1. 環境変数の管理

```env
# 本番環境では必ず強力なシークレットを使用
AUTH_SECRET=your-very-long-random-secret-key

# NEXT_PUBLIC_ プレフィックスは使用しない（クライアントに公開されるため）
AUTH_GOOGLE_ID=xxx
AUTH_GOOGLE_SECRET=xxx
```

### 2. CSRF 保護

Auth.js は自動的に CSRF トークンを生成・検証します。フォーム送信時には必ず Auth.js が提供する関数を使用してください。

### 3. Server Actions での認証チェック

```typescript
"use server";

import { auth } from "@/auth";

export async function sensitiveAction() {
  const session = await auth();

  // 必ず認証チェックを行う
  if (!session) {
    throw new Error("認証が必要です");
  }

  // 権限チェックも忘れずに
  if (session.user?.role !== "admin") {
    throw new Error("権限がありません");
  }

  // 処理を実行
}
```

### 4. セッションの有効期限

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間（必要に応じて調整）
  },
});
```

### 5. 許可されたコールバック URL の制限

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 同一オリジンのみ許可
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // それ以外はベース URL にリダイレクト
      return baseUrl;
    },
  },
});
```

### 6. レート制限の実装

```typescript
// middleware.ts
import { auth } from "@/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export default auth(async (req) => {
  // 認証ページへのレート制限
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    const ip = req.ip ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return new Response("Too Many Requests", { status: 429 });
    }
  }

  // その他のミドルウェア処理...
});
```

## トラブルシューティング

### よくある問題と解決策

**1. セッションが取得できない**

```typescript
// Server Component で auth() を await しているか確認
const session = await auth(); // await を忘れずに
```

**2. Credentials プロバイダーでセッションが保存されない**

```typescript
// JWT セッション戦略を明示的に指定
session: {
  strategy: "jwt",
}
```

**3. TypeScript の型エラー**

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

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```

**4. OAuth プロバイダーのコールバックエラー**

- リダイレクト URI が正確に設定されているか確認
- 本番環境では HTTPS を使用
- コールバック URL: `{YOUR_DOMAIN}/api/auth/callback/{PROVIDER}`

**5. CSRF トークンエラー**

```typescript
// フォーム送信時は signIn/signOut 関数を使用
import { signIn, signOut } from "next-auth/react";

// または Server Action を使用
import { signIn, signOut } from "@/auth";
```

## 参考リンク

- [Auth.js 公式ドキュメント](https://authjs.dev/)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
- [OAuth Providers](https://authjs.dev/getting-started/providers)
- [Stripe + Next.js](https://stripe.com/docs/stripe-js/react)
- [Vercel Edge Config for Auth](https://vercel.com/docs/storage/edge-config/using-edge-config-with-auth)
