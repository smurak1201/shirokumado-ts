# 認証システム

このドキュメントでは、アプリケーションの認証システムの実装について説明します。

## 目次

- [概要](#概要)
- [使用技術](#使用技術)
- [認証フロー](#認証フロー)
  - [ログイン](#ログイン)
  - [ログアウト](#ログアウト)
  - [セッション管理](#セッション管理)
- [データベーススキーマ](#データベーススキーマ)
  - [Roleモデル（ロールマスター）](#roleモデルロールマスター)
  - [Userモデル](#userモデル)
  - [Accountモデル（OAuth連携情報）](#accountモデルoauth連携情報)
  - [Sessionモデル](#sessionモデル)
  - [AllowedAdminモデル（独自実装）](#allowedadminモデル独自実装)
  - [タイムスタンプについて](#タイムスタンプについて)
- [環境変数設定](#環境変数設定)
  - [環境変数の取得方法](#環境変数の取得方法)
- [アクセス制御](#アクセス制御)
  - [Protected Routes（Proxy）](#protected-routesproxy)
  - [許可リストによる認可](#許可リストによる認可)
  - [許可メールアドレスの管理](#許可メールアドレスの管理)
- [セキュリティ](#セキュリティ)
  - [エラーハンドリング](#エラーハンドリング)
  - [データベース操作の統一](#データベース操作の統一)
  - [ユーザー入力の検証](#ユーザー入力の検証)
- [API Routes（認証エンドポイント）](#api-routes認証エンドポイント)
- [セッションの使用方法](#セッションの使用方法)
  - [Server Components](#server-components)
  - [Client Components](#client-components)
- [注意事項](#注意事項)
  - [ログイン拒否時の動作](#ログイン拒否時の動作)
  - [新規ユーザー登録について](#新規ユーザー登録について)
  - [セキュリティのベストプラクティス](#セキュリティのベストプラクティス)
- [トラブルシューティング](#トラブルシューティング)
  - [ログインできない](#ログインできない)
  - [セッションが保存されない](#セッションが保存されない)
  - [許可リストの更新が反映されない](#許可リストの更新が反映されない)
- [関連ファイル](#関連ファイル)
- [参考資料](#参考資料)

## 概要

このアプリケーションは**Auth.js v5**（next-auth）を使用した認証システムを実装しています。Google OAuthによる認証と、許可リストによる厳格なアクセス制御を組み合わせた設計になっています。

### 主な特徴

- **Google OAuth認証**: Googleアカウントでのログイン
- **許可リスト方式**: `AllowedAdmin`テーブルで管理された許可メールアドレスのみアクセス可能
- **データベースセッション**: Prismaアダプターによる7日間有効なセッション管理
- **Proxyによるルートガード**: Next.js 16のProxy機能でリダイレクト制御を一元管理

## 使用技術

| 技術 | バージョン | 用途 |
|------|-----------|------|
| next-auth | 5.0.0-beta.30 | 認証フレームワーク |
| @auth/prisma-adapter | 2.11.1 | データベースアダプター |
| Prisma | - | ORM（セッション管理） |
| PostgreSQL (Neon) | - | データベース |

## 認証フロー

```
ユーザー
   ↓
[Googleでログイン]
   ↓
[Google認可画面（アカウント選択）]
   ↓
[Auth.js signInコールバック]
   ↓
[許可リスト（AllowedAdmin）でメールアドレス確認]
   ├─ 許可 → Userレコード作成/更新
   └─ 不許可 → ログイン拒否
   ↓
[createUserイベント（新規ユーザーのみ）]
   ↓
[AllowedAdminのロールをUserに反映]
   ↓
[sessionコールバック → id, role追加]
   ↓
[/dashboardへリダイレクト]
   ↓
[以降のリクエストでセッション検証]
```

### ログイン

**実装場所**: [app/auth/signin/page.tsx](../app/auth/signin/page.tsx)

```tsx
<form
  action={async () => {
    'use server';
    await signIn('google', { redirectTo: '/dashboard' });
  }}
>
  <button type="submit">Googleでログイン</button>
</form>
```

ユーザーがGoogleボタンをクリックすると、Server Actionで`signIn('google')`を実行し、Google認可画面へリダイレクトします。Googleプロバイダーに`prompt: 'select_account'`を設定しているため、ログアウト後の再ログイン時も毎回アカウント選択画面が表示されます。

### ログアウト

**実装場所**: [app/dashboard/components/DashboardHeader.tsx](../app/dashboard/components/DashboardHeader.tsx)

Server Actionをform actionで呼び出し、`useFormStatus`で送信中の状態を表示します。

```tsx
// useFormStatus は <form> の子コンポーネントで呼ぶ必要がある
function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'ログアウト中...' : 'ログアウト'}
    </button>
  );
}

// layout.tsx から Server Action を props で受け取る
<form action={onSignOut}>
  <SignOutButton />
</form>
```

### セッション管理

**実装場所**: [auth.ts](../auth.ts)

```typescript
session: {
  strategy: 'database',  // Prismaでセッションを管理
  maxAge: 7 * 24 * 60 * 60,  // 7日間
}
```

セッション情報はPostgreSQLの`sessions`テーブルに保存されます。JWTではなくデータベース戦略を使用することで、セッションの無効化がリアルタイムで反映されます。

## データベーススキーマ

### Roleモデル（ロールマスター）

**場所**: [prisma/schema.prisma](../prisma/schema.prisma)

ロールを一元管理するマスターテーブルです。`name`をプライマリキーとして使用し、UserとAllowedAdminから参照されます。

```prisma
model Role {
  name          String         @id
  description   String?
  users         User[]
  allowedAdmins AllowedAdmin[]
  createdAt     DateTime       @default(now()) @map("created_at")

  @@map("roles")
}
```

シードで以下の3つのロールが作成されます:

| name | description |
|------|-------------|
| `admin` | すべてのダッシュボード機能にアクセス可能 |
| `homepage` | ホームページ関連の機能のみ |
| `shop` | ECサイト関連の機能のみ |

### Userモデル

**場所**: [prisma/schema.prisma](../prisma/schema.prisma)

```prisma
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
```

`roleName`は`Role`テーブルへの外部キーです。初回ログイン時に`AllowedAdmin`で設定されたロールが自動的に設定されます。未設定の場合はデフォルトで`homepage`が使用されます。

### Accountモデル（OAuth連携情報）

```prisma
model Account {
  id                String  @id @default(uuid())
  userId            String  @map("user_id")
  type              String
  provider          String  // "google"
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
```

### Sessionモデル

```prisma
model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

### AllowedAdminモデル（独自実装）

```prisma
model AllowedAdmin {
  id        String   @id @default(uuid())
  email     String   @unique
  roleName  String   @map("role_name")
  role      Role     @relation(fields: [roleName], references: [name])
  createdAt DateTime @default(now()) @map("created_at")

  @@map("allowed_admins")
}
```

このテーブルでログインを許可するメールアドレスとそのロールを管理します。`roleName`は`Role`テーブルへの外部キーで、存在しないロール名は設定できません。

### タイムスタンプについて

`createdAt`や`updatedAt`などのタイムスタンプは**UTC（協定世界時）**で保存されます。

- Prismaの`@default(now())`はPostgreSQLの`NOW()`関数を使用
- PostgreSQL（Neon含む）はデフォルトでUTCでタイムスタンプを保存
- 日本時間（JST）はUTC+9なので、9時間の差があります

**表示時の変換例**:

```typescript
// JavaScriptで日本時間に変換
const createdAtJST = new Date(record.createdAt).toLocaleString('ja-JP', {
  timeZone: 'Asia/Tokyo'
});
```

**SQLで日本時間に変換**（Neon Console等で確認する場合）:

```sql
SELECT
  email,
  created_at AT TIME ZONE 'Asia/Tokyo' AS created_at_jst
FROM allowed_admins;
```

UTCで保存することはベストプラクティスであり、タイムゾーンをまたぐ場合やサマータイムの影響を受けない利点があります。

## 環境変数設定

**場所**: `.env`

```env
# Auth.js設定
AUTH_SECRET="ランダムな秘密鍵"
AUTH_GOOGLE_ID="Google Cloud ConsoleのクライアントID"
AUTH_GOOGLE_SECRET="Google Cloud Consoleのクライアントシークレット"

# データベース接続
DATABASE_URL="postgresql://..."
```

### 環境変数の取得方法

#### AUTH_SECRET

次のコマンドで生成できます:

```bash
openssl rand -base64 32
```

#### AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「認証情報」へ移動
4. 「認証情報を作成」→「OAuthクライアントID」を選択
5. アプリケーションの種類: 「ウェブアプリケーション」
6. 承認済みのリダイレクトURI:
   - 開発: `http://localhost:3000/api/auth/callback/google`
   - 本番: `https://your-domain.com/api/auth/callback/google`
7. クライアントIDとシークレットをコピー

## アクセス制御

### Protected Routes（Proxy）

**実装場所**: [proxy.ts](../proxy.ts)

Next.js 16のProxy機能を使用して、認証状態に基づくルートガードを一元管理しています。

```typescript
import { auth } from '@/auth';

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 認証ページへのアクセス（認証済みならダッシュボードへ）
  if (pathname.startsWith('/auth')) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard/homepage', req.url));
    }
    return;
  }

  // ダッシュボードへのアクセス（未認証ならログインページへ）
  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/signin', req.url));
    }
    return;
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
```

**ポイント**:
- NextAuth v5の`auth()`関数を使用してセッションの有効性を確認
- クッキーの存在だけでなく、実際のセッションの有効性をチェック
- `/dashboard`以下への未認証アクセスは`/auth/signin`へリダイレクト
- `/auth`以下への認証済みアクセスは`/dashboard/homepage`へリダイレクト
- リダイレクトロジックをproxyに一元化することで、リダイレクトループを防止

### 許可リストによる認可

**実装場所**: [lib/auth-config.ts](../lib/auth-config.ts)

```typescript
export async function isAllowedEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const allowedAdmin = await prisma.allowedAdmin.findUnique({
    where: { email },
  });

  return !!allowedAdmin;
}

export async function getRoleNameByEmail(email: string | null | undefined): Promise<string | null> {
  if (!email) return null;

  const allowedAdmin = await prisma.allowedAdmin.findUnique({
    where: { email },
  });

  return allowedAdmin?.roleName ?? null;
}
```

- `isAllowedEmail`: メールアドレスが許可リストに含まれているかチェック
- `getRoleNameByEmail`: メールアドレスに対応するロール名を取得（ユーザー作成時に使用）

**使用場所**: [auth.ts](../auth.ts)

```typescript
callbacks: {
  async signIn({ user }) {
    const allowed = await isAllowedEmail(user.email);
    if (!allowed) {
      return false;  // ログイン拒否
    }
    return true;
  },
  async session({ session, user }) {
    // セッションにユーザー情報を追加
    session.user.id = user.id;
    session.user.role = user.roleName ?? 'homepage';
    return session;
  },
},
events: {
  // ユーザー新規作成時にAllowedAdminのロールをUserに反映
  async createUser({ user }) {
    const roleName = (await getRoleNameByEmail(user.email)) ?? 'homepage';
    await prisma.user.update({
      where: { id: user.id },
      data: { roleName },
    });
  },
},
```

Googleでの認証成功後、`signIn`コールバックで`AllowedAdmin`テーブルをチェックし、許可されていないメールアドレスはログインを拒否します。

新規ユーザーの場合、`createUser`イベントで`AllowedAdmin`テーブルからロール名を取得し、`User`テーブルの`roleName`に反映します。ロールが未設定の場合は`homepage`がデフォルトとして使用されます。

#### DBアクセスについての補足

`isAllowedEmail`と`getRoleByEmail`は同じ`AllowedAdmin`テーブルに対して別々にクエリを実行しています。これを1回にまとめられないか検討しましたが、現状維持としています。

**理由:**

- **Auth.jsの設計に準拠**: `signIn`コールバック（認証可否の判定）と`createUser`イベント（ユーザー作成後の処理）は意図的に分離されており、それぞれの責務が明確
- **影響は限定的**: 2回のDBアクセスが発生するのは**新規ユーザー登録時のみ**（既存ユーザーのログインでは`signIn`のみ）
- **キャッシュ導入のリスク**: 最適化のためにインメモリキャッシュを導入すると、Vercelなどのサーバーレス環境で期待通りに動作しない可能性があり、コードの複雑性も増す

シンプルさを保つメリットがパフォーマンス最適化のメリットを上回るため、現状の実装を維持しています。

### 許可メールアドレスの管理

**実装場所**: [prisma/seeds/allowed-admins.ts](../prisma/seeds/allowed-admins.ts)

```typescript
// 許可する管理者
const ALLOWED_ADMINS = [
  { email: 's.murakoshi1201@gmail.com', role: 'admin' },
  // 新しいメールアドレスをここに追加
];
```

管理者の追加・削除には以下の3つの方法があります。

#### 方法1: シーダーから（推奨）

この方法はコードで管理できるため、バージョン管理が可能で推奨されます。

**追加手順**:

1. `prisma/seeds/allowed-admins.ts`の`ALLOWED_ADMINS`配列にメールアドレスを追加:

```typescript
const ALLOWED_ADMINS = [
  { email: 's.murakoshi1201@gmail.com', role: 'admin' },
  { email: 'newadmin@example.com', role: 'admin' },  // 新規追加
];
```

**注意**: `role`には`Role`テーブルで定義されているロール名（`admin`、`homepage`、`shop`）のみ指定できます。

2. シードスクリプトを実行:

```bash
# 許可管理者だけをシード（推奨）
npm run db:seed -- allowed-admins

# または全テーブルをシード
npm run db:seed -- all
```

既存のメールアドレスは自動的にupsert（更新または挿入）されるため、複数回実行しても安全です。

**削除手順**:

1. `prisma/seeds/allowed-admins.ts`の`ALLOWED_ADMINS`配列から削除したいメールアドレスを削除
2. データベースから直接削除（次の方法2または方法3を使用）

**注意**: シーダーは`upsert`を使用しているため、配列から削除してもデータベースのレコードは削除されません。削除したい場合は手動でデータベースから削除する必要があります。

#### 方法2: Neon コンソールから

SQLを使用して直接データベースを操作できます。

**手順**:

1. [Neon Console](https://console.neon.tech/)にログイン
2. プロジェクトを選択 → SQL Editor
3. 以下のSQLを実行:

```sql
-- 利用可能なロールを確認
SELECT * FROM roles;

-- 管理者を追加（role_nameはrolesテーブルに存在するnameを指定）
INSERT INTO allowed_admins (id, email, role_name, created_at)
VALUES (gen_random_uuid(), 'newadmin@example.com', 'admin', NOW());

-- 管理者を削除
DELETE FROM allowed_admins WHERE email = 'oldadmin@example.com';

-- 管理者一覧を確認（ロール情報付き）
SELECT aa.email, aa.role_name, r.description
FROM allowed_admins aa
JOIN roles r ON aa.role_name = r.name
ORDER BY aa.created_at DESC;

-- 特定のメールアドレスの存在確認
SELECT * FROM allowed_admins WHERE email = 'target@example.com';
```

#### 方法3: Prisma Studio から（ローカル開発時）

GUIで直感的に編集できます。ローカル開発環境での確認やテストに便利です。

**手順**:

1. Prisma Studioを起動:

```bash
npm run db:studio
```

2. ブラウザが自動的に開き、`http://localhost:5555`にアクセス
3. `AllowedAdmin`テーブルを選択
4. 以下の操作が可能:
   - **追加**: 「Add record」ボタンをクリック → `email`と`roleName`を入力 → 「Save 1 change」
   - **編集**: レコードをクリック → フィールドを編集 → 「Save 1 change」
   - **削除**: レコードを選択 → 「Delete 1 record」 → 確認

**注意**: `roleName`には`Role`テーブルに存在するロール名（`admin`、`homepage`、`shop`）を指定してください。

**注意**: Prisma StudioはローカルのデータベースURLに接続するため、本番環境のデータベースを編集する場合は環境変数を一時的に変更する必要があります（推奨しません）。

#### ロールの種類

ロールは`Role`テーブル（ロールマスター）で管理されています。シード実行時に以下のロールが作成されます:

| ロール名 | 説明 | アクセス範囲 |
|----------|------|-------------|
| `admin` | 管理者 | すべてのダッシュボード機能 |
| `homepage` | ホームページ管理者 | ホームページ関連の機能のみ（将来実装予定） |
| `shop` | ショップ管理者 | ECサイト関連の機能のみ（将来実装予定） |

**ロール管理の仕組み**:

- ロールは`Role`テーブルで一元管理され、`AllowedAdmin`と`User`から外部キーで参照されます
- `AllowedAdmin.roleName`に設定したロールが、初回ログイン時に`User.roleName`にコピーされます
- ロールが未設定の場合、デフォルトで`homepage`が使用されます
- 存在しないロール名は外部キー制約により設定できません

**新しいロールを追加する場合**:

1. `prisma/seeds/roles.ts`の`ROLES`配列に新しいロールを追加
2. シードスクリプトを実行:

```bash
# rolesだけをシード
npm run db:seed -- roles

# または全テーブルをシード
npm run db:seed -- all
```

## セキュリティ

### エラーハンドリング

**実装場所**: [lib/api-helpers.ts](../lib/api-helpers.ts)

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const response = NextResponse.json(
  {
    error: isProduction
      ? 'An unexpected error occurred'  // 本番環境では詳細を隠す
      : getUserFriendlyMessage(error),
  },
  { status: 500 }
);
```

本番環境では詳細なエラーメッセージを表示せず、攻撃者に情報を与えないようにしています。

### データベース操作の統一

**実装場所**: [lib/prisma.ts](../lib/prisma.ts)

```typescript
export async function safePrismaOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new DatabaseError(
      `Failed to execute database operation${context ? ` in ${context}` : ''}`,
      error
    );
  }
}
```

すべてのデータベース操作を`safePrismaOperation`でラップし、エラーを適切にキャッチ・ログ記録します。

### ユーザー入力の検証

API Routesでは、ユーザー入力を必ず検証します:

```typescript
if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
  throw new ValidationError('商品名は必須です');
}
```

## API Routes（認証エンドポイント）

**実装場所**: [app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts)

```typescript
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

Next.jsのキャッチオールルート（`[...nextauth]`）で、Auth.js関連の全リクエスト（ログイン、コールバック、セッション取得など）を処理します。

以下のエンドポイントが自動的に生成されます:

- `GET /api/auth/signin` - ログインページ（Auth.js組み込み）
- `GET /api/auth/callback/google` - Googleコールバック
- `GET /api/auth/signout` - ログアウト
- `GET /api/auth/session` - セッション情報取得
- `POST /api/auth/signin/google` - Googleログイン開始

## セッションの使用方法

### Server Components

```typescript
import { auth } from '@/auth';

export default async function MyPage() {
  const session = await auth();

  if (!session) {
    // 未認証の処理
  }

  // session.user.id, session.user.email などにアクセス可能
  return <div>こんにちは、{session.user.name}さん</div>;
}
```

### Client Components

Client Componentsでセッションを使用する場合は、`useSession`フックを使用できます（next-authのv5では`SessionProvider`が不要になりました）:

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function MyClientComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>読み込み中...</div>;
  }

  if (!session) {
    return <div>ログインしていません</div>;
  }

  return <div>こんにちは、{session.user.name}さん</div>;
}
```

## 注意事項

### ログイン拒否時の動作

許可リストにないメールアドレスでログインを試みると、カスタムエラーページ（`/auth/error`）が表示されます。

**実装場所**: [app/auth/error/page.tsx](../app/auth/error/page.tsx)

エラータイプに応じたメッセージを表示:

| エラータイプ | タイトル | 説明 |
|-------------|---------|------|
| `AccessDenied` | アクセスが許可されていません | このメールアドレスはログインが許可されていません |
| `Configuration` | 設定エラー | 認証システムの設定に問題があります |
| `Verification` | 認証エラー | 認証の検証に失敗しました |
| その他 | エラーが発生しました | ログイン中にエラーが発生しました |

- ログインページに戻るボタンを提供
- ログインを許可したい場合は、管理者が`allowed_admins`テーブルにメールアドレスを追加する必要がある

### 新規ユーザー登録について

このアプリケーションでは**新規ユーザー登録機能は実装していません**。

- すべてのユーザーは管理者が事前に`allowed_admins`テーブルに登録する必要がある
- 初めてログインしたユーザーは、Googleアカウント情報が`users`テーブルに自動的に作成される
- **初回ログイン時に`AllowedAdmin`テーブルで設定されたロールが`User`テーブルに自動的に反映される**
- ただし、ログイン前に`allowed_admins`テーブルに登録されていないとログインできない

### セキュリティのベストプラクティス

#### Server Actionsでの認証チェック

Server Actionsを実装する際は、必ずセッションを検証してください:

```typescript
'use server';

import { auth } from '@/auth';

export async function updateProduct(id: string, data: ProductData) {
  const session = await auth();

  if (!session) {
    throw new Error('認証が必要です');
  }

  // 実際の処理...
}
```

#### データベースセッションの利点

このアプリケーションはデータベースセッション戦略を使用しています:

- **リアルタイム無効化**: ユーザーのセッションを即座に無効化できる
- **セッション管理**: 全ユーザーのアクティブなセッションを確認できる
- **セキュリティ**: サーバー側でセッション情報を完全に制御できる

セッションを無効化する方法:

```sql
-- 特定ユーザーの全セッションを削除
DELETE FROM sessions WHERE user_id = 'ユーザーID';

-- 期限切れセッションをクリーンアップ
DELETE FROM sessions WHERE expires < NOW();
```

#### 期限切れセッションの自動クリーンアップ

Auth.jsのデータベースセッションでは、期限切れのセッションは自動的に削除されません。放置するとデータベースに不要なレコードが蓄積されるため、Vercel Cron Jobsで自動クリーンアップを実装しています。

**実行スケジュール**: 毎月1日 日本時間 0:00（UTC 15:00）

**Cron式の書き方**:

```
┌───────────── 分 (0 - 59)
│ ┌─────────── 時 (0 - 23) ※UTC
│ │ ┌───────── 日 (1 - 31)
│ │ │ ┌─────── 月 (1 - 12)
│ │ │ │ ┌───── 曜日 (0 - 6, 0=日曜)
│ │ │ │ │
* * * * *
```

| 記号 | 意味 |
|------|------|
| `*` | すべての値（毎〜） |
| 数字 | その値のときだけ実行 |

**現在の設定の解説**:

```
0 15 1 * *
│  │  │ │ │
│  │  │ │ └─ * = 毎曜日（曜日を限定しない）
│  │  │ └─── * = 毎月（月を限定しない）
│  │  └───── 1 = 1日のみ
│  └──────── 15 = 15時のみ（UTC）
└─────────── 0 = 0分のみ
```

| スケジュール | Cron式 | 説明 |
|-------------|--------|------|
| 毎日 日本時間0:00 | `0 15 * * *` | UTC 15:00 = JST 0:00 |
| 毎週日曜 日本時間0:00 | `0 15 * * 0` | 曜日0 = 日曜日 |
| 毎月1日 日本時間0:00 | `0 15 1 * *` | 現在の設定 |

**関連ファイル**:

| ファイル | 説明 |
|---------|------|
| [app/api/cron/cleanup-sessions/route.ts](../app/api/cron/cleanup-sessions/route.ts) | クリーンアップAPI |
| [vercel.json](../vercel.json) | Cron設定 |

**必要な環境変数**（Vercelダッシュボードで設定）:

| 変数名 | 説明 | 設定場所 |
|--------|------|----------|
| `CRON_SECRET` | Cronリクエストの認証用シークレット | Vercel Settings → Environment Variables（Production） |

**シークレットの生成方法**:

```bash
openssl rand -base64 32
```

**手動でクリーンアップを実行する場合**:

Neon ConsoleでSQLを直接実行するか、Vercelダッシュボードの「Cron Jobs」タブから手動トリガーできます。

#### 環境変数の管理

**重要**: 以下の環境変数は絶対にコミットしないでください:

- `AUTH_SECRET`
- `AUTH_GOOGLE_SECRET`
- `DATABASE_URL`

`.gitignore`に`.env`が含まれていることを確認してください:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

本番環境では、Vercelなどのホスティングサービスの環境変数設定画面で設定します。

## トラブルシューティング

### ログインできない

1. **メールアドレスが許可リストに登録されているか確認**

```bash
# PostgreSQLに接続して確認
npx prisma studio

# または直接クエリ
npx prisma db execute --stdin <<< "SELECT * FROM allowed_admins;"
```

2. **環境変数が正しく設定されているか確認**

```bash
# .envファイルの確認
cat .env | grep AUTH_
```

3. **Google Cloud Consoleの設定を確認**
   - リダイレクトURIが正しいか
   - OAuthクライアントが有効か

### セッションが保存されない

1. **データベース接続を確認**

```bash
npx prisma db pull
```

2. **Prismaのマイグレーション状態を確認**

```bash
npx prisma migrate status
```

3. **セッションテーブルが存在するか確認**

```bash
npx prisma studio
# sessionsテーブルを確認
```

### 許可リストの更新が反映されない

**症状**: `prisma/seeds/allowed-admins.ts`を編集したが、新しい管理者がログインできない。

**原因**: シードスクリプトを実行していない、または実行に失敗している。

**解決方法**:

1. シードスクリプトを再実行:

```bash
# 許可管理者だけをシード
npm run db:seed -- allowed-admins

# または全テーブルをシード
npm run db:seed -- all
```

2. シード実行後、データベースに反映されているか確認:

```bash
npx prisma studio
# allowed_adminsテーブルで追加したメールアドレスが存在するか確認
```

または、Neon コンソールでSQLを実行:

```sql
SELECT * FROM allowed_admins WHERE email = '追加したメールアドレス';
```

3. それでも反映されない場合、シードスクリプトのエラーを確認:

```bash
npm run db:seed 2>&1 | tee seed.log
# エラーメッセージを確認
```

**代替方法**: シードではなく、直接データベースに追加:

```sql
-- Neon コンソールで実行
INSERT INTO allowed_admins (id, email, role_name, created_at)
VALUES (gen_random_uuid(), 'newadmin@example.com', 'admin', NOW());
```

## 関連ファイル

| ファイル | 説明 |
|---------|------|
| [auth.ts](../auth.ts) | Auth.js設定（プロバイダー、セッション、コールバック） |
| [proxy.ts](../proxy.ts) | 認証ルートガード（リダイレクト制御を一元管理） |
| [lib/auth-config.ts](../lib/auth-config.ts) | 認可チェック（許可リスト） |
| [app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts) | Auth.js APIエンドポイント |
| [app/auth/signin/page.tsx](../app/auth/signin/page.tsx) | ログインページ（Googleボタン） |
| [app/auth/error/page.tsx](../app/auth/error/page.tsx) | 認証エラーページ |
| [app/dashboard/layout.tsx](../app/dashboard/layout.tsx) | ダッシュボード共通レイアウト・ヘッダー |
| [app/dashboard/components/DashboardHeader.tsx](../app/dashboard/components/DashboardHeader.tsx) | ユーザー情報・ログアウトボタン |
| [prisma/schema.prisma](../prisma/schema.prisma) | データベーススキーマ（User, Account, Session等） |
| [prisma/seed.ts](../prisma/seed.ts) | シーダーエントリーポイント（個別テーブル指定可能） |
| [prisma/seeds/](../prisma/seeds/) | テーブルごとのシードデータ（roles, allowed-admins, categories, products） |
| [lib/api-helpers.ts](../lib/api-helpers.ts) | APIエラーハンドリング |
| [lib/prisma.ts](../lib/prisma.ts) | Prismaクライアント設定・safePrismaOperation |

## 参考資料

### 公式ドキュメント

- [Auth.js公式ドキュメント](https://authjs.dev/)
- [Next.js 15 認証ガイド](https://nextjs.org/docs/app/building-your-application/authentication)
- [@auth/prisma-adapter](https://authjs.dev/getting-started/adapters/prisma)
- [Google OAuth 2.0設定](https://developers.google.com/identity/protocols/oauth2)

### プロジェクト内ドキュメント

- [Auth.jsガイド](guides/backend/authjs-guide.md) - このプロジェクトのAuth.js設定の詳細
- [開発ガイド](development-guide.md) - 開発環境のセットアップ
- [Prismaセットアップガイド](setup-prisma-blob.md) - データベース設定

### 関連仕様書

- `updates/completed/2026-01-30-03-dashboard-auth.md` - ダッシュボード認証機能の実装仕様
