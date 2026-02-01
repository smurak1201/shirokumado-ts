# 認証システム

このドキュメントでは、アプリケーションの認証システムの実装について説明します。

## 概要

このアプリケーションは**Auth.js v5**（next-auth）を使用した認証システムを実装しています。Google OAuthによる認証と、許可リストによる厳格なアクセス制御を組み合わせた設計になっています。

### 主な特徴

- **Google OAuth認証**: Googleアカウントでのログイン
- **許可リスト方式**: `AllowedAdmin`テーブルで管理された許可メールアドレスのみアクセス可能
- **データベースセッション**: Prismaアダプターによる7日間有効なセッション管理
- **Server Components保護**: ダッシュボード全体をルートレベルで保護

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
[Google認可画面]
   ↓
[Auth.js signInコールバック]
   ↓
[許可リスト（AllowedAdmin）でメールアドレス確認]
   ├─ 許可 → Userレコード作成/更新
   └─ 不許可 → ログイン拒否
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

ユーザーがGoogleボタンをクリックすると、Server Actionで`signIn('google')`を実行し、Google認可画面へリダイレクトします。

### ログアウト

**実装場所**: [app/dashboard/components/DashboardHeader.tsx](../app/dashboard/components/DashboardHeader.tsx)

```tsx
<form
  action={async () => {
    'use server';
    await signOut({ redirectTo: '/auth/signin' });
  }}
>
  <button type="submit">ログアウト</button>
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

### Userモデル

**場所**: [prisma/schema.prisma](../prisma/schema.prisma)

```prisma
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  role          String    @default("user")
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("users")
}
```

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
  role      String   @default("admin")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("allowed_admins")
}
```

このテーブルでログインを許可するメールアドレスを管理します。

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

### Protected Routes（Server Components）

**実装場所**: [app/dashboard/layout.tsx](../app/dashboard/layout.tsx)

```typescript
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return <div>{children}</div>;
}
```

`/dashboard`以下の全ページで、レイアウトレベルでセッションをチェックしています。未認証の場合は即座にログインページへリダイレクトします。

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
```

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
    session.user.role = user.role;
    return session;
  },
}
```

Googleでの認証成功後、`signIn`コールバックで`AllowedAdmin`テーブルをチェックし、許可されていないメールアドレスはログインを拒否します。

### 許可メールアドレスの管理

**実装場所**: [prisma/seed.ts](../prisma/seed.ts)

```typescript
const ALLOWED_ADMINS = [
  { email: 's.murakoshi1201@gmail.com', role: 'admin' },
  // 新しいメールアドレスをここに追加
];
```

管理者の追加・削除には以下の3つの方法があります。

#### 方法1: シーダーから（推奨）

この方法はコードで管理できるため、バージョン管理が可能で推奨されます。

**追加手順**:

1. `prisma/seed.ts`の`ALLOWED_ADMINS`配列にメールアドレスを追加:

```typescript
const ALLOWED_ADMINS = [
  { email: 's.murakoshi1201@gmail.com', role: 'admin' },
  { email: 'newadmin@example.com', role: 'admin' },  // 新規追加
];
```

2. シードスクリプトを実行:

```bash
npm run db:seed
```

既存のメールアドレスは自動的にupsert（更新または挿入）されるため、複数回実行しても安全です。

**削除手順**:

1. `prisma/seed.ts`の`ALLOWED_ADMINS`配列から削除したいメールアドレスを削除
2. データベースから直接削除（次の方法2または方法3を使用）

**注意**: シーダーは`upsert`を使用しているため、配列から削除してもデータベースのレコードは削除されません。削除したい場合は手動でデータベースから削除する必要があります。

#### 方法2: Neon コンソールから

SQLを使用して直接データベースを操作できます。

**手順**:

1. [Neon Console](https://console.neon.tech/)にログイン
2. プロジェクトを選択 → SQL Editor
3. 以下のSQLを実行:

```sql
-- 管理者を追加
INSERT INTO allowed_admins (id, email, role, created_at)
VALUES (gen_random_uuid(), 'newadmin@example.com', 'admin', NOW());

-- 管理者を削除
DELETE FROM allowed_admins WHERE email = 'oldadmin@example.com';

-- 管理者一覧を確認
SELECT * FROM allowed_admins ORDER BY created_at DESC;

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
   - **追加**: 「Add record」ボタンをクリック → `email`と`role`を入力 → 「Save 1 change」
   - **編集**: レコードをクリック → フィールドを編集 → 「Save 1 change」
   - **削除**: レコードを選択 → 「Delete 1 record」 → 確認

**注意**: Prisma StudioはローカルのデータベースURLに接続するため、本番環境のデータベースを編集する場合は環境変数を一時的に変更する必要があります（推奨しません）。

#### ロールの種類

現在サポートされているロール:

| ロール | 説明 | アクセス範囲 |
|--------|------|-------------|
| `admin` | 管理者 | すべてのダッシュボード機能 |
| `homepage` | ホームページ管理者 | ホームページ関連の機能のみ（将来実装予定） |
| `shop` | ショップ管理者 | ECサイト関連の機能のみ（将来実装予定） |

**注意**: 現在は`role`フィールドは保存されていますが、アクセス制御には使用されていません。将来的に機能別のアクセス制御を実装する際に使用される予定です。

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

許可リストにないメールアドレスでログインを試みると、Auth.jsのデフォルトのエラーページが表示されます。

- ユーザーには「AccessDenied」というエラーが表示される
- 詳細なエラーメッセージは表示されない（セキュリティのため）
- ログインを許可したい場合は、管理者が`allowed_admins`テーブルにメールアドレスを追加する必要がある

### 新規ユーザー登録について

このアプリケーションでは**新規ユーザー登録機能は実装していません**。

- すべてのユーザーは管理者が事前に`allowed_admins`テーブルに登録する必要がある
- 初めてログインしたユーザーは、Googleアカウント情報が`users`テーブルに自動的に作成される
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

**症状**: `prisma/seed.ts`を編集したが、新しい管理者がログインできない。

**原因**: シードスクリプトを実行していない、または実行に失敗している。

**解決方法**:

1. シードスクリプトを再実行:

```bash
npm run db:seed
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

```bash
# Neon コンソールで実行
INSERT INTO allowed_admins (id, email, role, created_at)
VALUES (gen_random_uuid(), 'newadmin@example.com', 'admin', NOW());
```

## 関連ファイル

| ファイル | 説明 |
|---------|------|
| [auth.ts](../auth.ts) | Auth.js設定（プロバイダー、セッション、コールバック） |
| [lib/auth-config.ts](../lib/auth-config.ts) | 認可チェック（許可リスト） |
| [app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts) | Auth.js APIエンドポイント |
| [app/auth/signin/page.tsx](../app/auth/signin/page.tsx) | ログインページ（Googleボタン） |
| [app/dashboard/layout.tsx](../app/dashboard/layout.tsx) | ダッシュボード保護（セッションチェック） |
| [app/dashboard/components/DashboardHeader.tsx](../app/dashboard/components/DashboardHeader.tsx) | ユーザー情報・ログアウトボタン |
| [prisma/schema.prisma](../prisma/schema.prisma) | データベーススキーマ（User, Account, Session等） |
| [prisma/seed.ts](../prisma/seed.ts) | 許可管理者データの初期投入 |
| [lib/api-helpers.ts](../lib/api-helpers.ts) | APIエラーハンドリング |
| [lib/prisma.ts](../lib/prisma.ts) | Prismaクライアント設定・safePrismaOperation |

## 参考資料

### 公式ドキュメント

- [Auth.js公式ドキュメント](https://authjs.dev/)
- [Next.js 15 認証ガイド](https://nextjs.org/docs/app/building-your-application/authentication)
- [@auth/prisma-adapter](https://authjs.dev/getting-started/adapters/prisma)
- [Google OAuth 2.0設定](https://developers.google.com/identity/protocols/oauth2)

### プロジェクト内ドキュメント

- [Auth.jsガイド](guides/authjs-guide.md) - このプロジェクトのAuth.js設定の詳細
- [開発ガイド](development-guide.md) - 開発環境のセットアップ
- [Prismaセットアップガイド](setup-prisma-blob.md) - データベース設定

### 関連仕様書

- `updates/completed/2026-01-30-03-dashboard-auth.md` - ダッシュボード認証機能の実装仕様
