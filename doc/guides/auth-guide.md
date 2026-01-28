# Auth.js ガイド

Auth.js（旧 NextAuth.js）を使用した認証システムの実装について詳しく説明します。

## 目次

- [概要](#概要)
- [Auth.js とは](#authjs-とは)
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

## インストールと初期設定

### パッケージのインストール

```bash
npm install next-auth@beta
```

**注意**: Auth.js v5 は現在ベータ版です。安定版を使用したい場合は `next-auth@4` を使用してください。

### 環境変数の設定

`.env.local` ファイルに以下の環境変数を設定します。

```env
# Auth.js の設定
AUTH_SECRET=your-secret-key-here

# OAuth プロバイダーの設定（例：Google）
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# OAuth プロバイダーの設定（例：GitHub）
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
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
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub],
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

OAuth プロバイダーを使用すると、Google、GitHub などの外部サービスを使った認証が可能です。

```typescript
// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
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
