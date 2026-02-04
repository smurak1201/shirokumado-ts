# Prismaエラーハンドリングの統一

**日付**: 2026-02-04
**ブランチ**: main（直接修正）
**対象**: 認証関連ファイル、Cronエンドポイント
**ステータス**: 完了
**完了日**: 2026-02-04

---

## 進捗状況

| #   | タスク                          | 優先度 | ステータス | 備考 |
| --- | ------------------------------- | :----: | :--------: | ---- |
| 1   | lib/auth-config.tsの修正        |   高   |    [o]     |      |
| 2   | auth.tsの修正                   |   高   |    [o]     |      |
| 3   | cleanup-sessions/route.tsの修正 |   中   |    [o]     |      |
| 4   | 動作確認・ビルドテスト          |   -    |    [o]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

CLAUDE.mdでは「すべてのPrisma操作は`safePrismaOperation`でラップすること」と定めているが、認証関連のファイルでこのルールが適用されていない箇所がある。

### 課題

- **課題1**: `lib/auth-config.ts`の`isAllowedEmail`と`getRoleNameByEmail`関数でPrisma操作が`safePrismaOperation`でラップされていない
- **課題2**: `auth.ts`の`createUser`イベント内で`prisma.user.update`が直接呼び出されている
- **課題3**: `app/api/cron/cleanup-sessions/route.ts`が他のAPI Routesと異なり`withErrorHandling`でラップされていない

### 設計方針

- **方針1**: 認証フロー内のPrisma操作も他と同様に`safePrismaOperation`でラップする
- **方針2**: Cronエンドポイントも`withErrorHandling`でラップし、統一されたエラーハンドリングを適用する
- **方針3**: 認証エラー（Cron Secretの検証失敗）は従来通り手動で処理する

### CLAUDE.md準拠事項

本改修では以下のルールに従うこと。

**Prisma**:

- **すべての操作は`safePrismaOperation`でラップすること**

**API Routes**:

- **`withErrorHandling`でエラーハンドリングを統一すること**

**コード品質**:

- 未使用のインポートは削除すること
- 関数の引数と返り値には型を付けること
- リントエラーを解消すること（`npm run lint`）

---

## タスク詳細

### タスク1: lib/auth-config.tsの修正 [完了]

**対象ファイル**:

- `lib/auth-config.ts`（既存・変更）

**問題点**:

`isAllowedEmail`と`getRoleNameByEmail`で`prisma.allowedAdmin.findUnique`が`safePrismaOperation`でラップされていない。

**修正内容**:

両関数で`safePrismaOperation`をimportし、Prisma操作をラップする。

**実装例**:

```typescript
// lib/auth-config.ts
/**
 * 認証設定とユーティリティ
 *
 * 管理画面へのアクセス制御を管理
 */

import { prisma, safePrismaOperation } from "@/lib/prisma";

/**
 * メールアドレスがログイン許可リストに含まれているかチェック
 */
export async function isAllowedEmail(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;

  const allowedAdmin = await safePrismaOperation(
    () =>
      prisma.allowedAdmin.findUnique({
        where: { email },
      }),
    "isAllowedEmail",
  );

  return !!allowedAdmin;
}

/**
 * AllowedAdminテーブルからメールアドレスに対応するロール名を取得
 */
export async function getRoleNameByEmail(
  email: string | null | undefined,
): Promise<string | null> {
  if (!email) return null;

  const allowedAdmin = await safePrismaOperation(
    () =>
      prisma.allowedAdmin.findUnique({
        where: { email },
      }),
    "getRoleNameByEmail",
  );

  return allowedAdmin?.roleName ?? null;
}
```

**チェックリスト**:

- [o] `safePrismaOperation`をimportに追加
- [o] `isAllowedEmail`内のPrisma操作をラップ
- [o] `getRoleNameByEmail`内のPrisma操作をラップ

---

### タスク2: auth.tsの修正 [完了]

**対象ファイル**:

- `auth.ts`（既存・変更）

**問題点**:

`createUser`イベント内の`prisma.user.update`が`safePrismaOperation`でラップされていない（43行目）。

**修正内容**:

`safePrismaOperation`をimportし、`createUser`イベント内のPrisma操作をラップする。

**実装例（変更箇所のみ）**:

```typescript
// auth.ts（変更前）10行目
import { prisma } from "@/lib/prisma";

// auth.ts（変更後）
import { prisma, safePrismaOperation } from "@/lib/prisma";
```

```typescript
// auth.ts（変更前）39-48行目
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

// auth.ts（変更後）
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
```

**チェックリスト**:

- [o] `safePrismaOperation`をimportに追加
- [o] `createUser`イベント内のPrisma操作をラップ

---

### タスク3: cleanup-sessions/route.tsの修正 [完了]

**対象ファイル**:

- `app/api/cron/cleanup-sessions/route.ts`（既存・変更）

**問題点**:

他のAPI Routesは`withErrorHandling`でラップされているが、このエンドポイントは直接`NextResponse`を返している。

**修正内容**:

`withErrorHandling`でGETハンドラーをラップし、エラーハンドリングを統一する。Cron Secretの検証は`withErrorHandling`内で行う。

**実装例**:

```typescript
// app/api/cron/cleanup-sessions/route.ts
/**
 * 期限切れセッションのクリーンアップAPI
 *
 * Vercel Cronから毎月1日 UTC 15:00（日本時間 0:00）に呼び出され、
 * 期限切れのセッションを削除する
 *
 * 環境変数:
 * - CRON_SECRET: Vercelダッシュボードで設定（Production環境のみ）
 */
import { prisma, safePrismaOperation } from "@/lib/prisma";
import { withErrorHandling, apiSuccess, apiError } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: Request) => {
  // Vercel Cronからのリクエストを検証
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return apiError("Server configuration error", 500);
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return apiError("Unauthorized", 401);
  }

  const result = await safePrismaOperation(async () => {
    const deleted = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
    return deleted;
  }, "cleanup-sessions");

  console.log(`Cleanup completed: ${result.count} expired sessions deleted`);

  return apiSuccess({
    deletedCount: result.count,
    timestamp: new Date().toISOString(),
  });
});
```

**チェックリスト**:

- [o] `NextResponse`のimportを削除
- [o] `withErrorHandling`, `apiSuccess`, `apiError`をimport
- [o] GETハンドラーを`withErrorHandling`でラップ
- [o] `NextResponse.json`を`apiSuccess`/`apiError`に置き換え

---

### タスク4: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと
   - [o] TypeScriptエラーがないこと

2. **リント確認** (`npm run lint`)
   - [o] リントエラーがないこと

3. **品質チェックリスト**（CLAUDE.md準拠）
   - [o] 未使用のインポートは削除したか？
   - [o] 依頼された部分以外は変更していないか？

---

## 変更対象ファイル一覧

| ファイル                                 | 変更内容                      | ステータス |
| ---------------------------------------- | ----------------------------- | :--------: |
| `lib/auth-config.ts`                     | `safePrismaOperation`でラップ |    [o]     |
| `auth.ts`                                | `safePrismaOperation`でラップ |    [o]     |
| `app/api/cron/cleanup-sessions/route.ts` | `withErrorHandling`でラップ   |    [o]     |

---

## 備考

### 注意事項

- 認証フローに影響するため、修正後は認証が正常に動作することを確認すること
- Cronエンドポイントの認証検証ロジック（Bearer token）は変更しない

### 参考

- 類似実装: `app/api/products/route.ts`（`withErrorHandling`の使用例）
- `lib/prisma.ts`（`safePrismaOperation`の定義）

---

## 実装後の更新

各タスクの進捗に応じて以下を更新する:

**状態遷移ルール**（共通）:

- `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

1. **進捗状況テーブル**
   - 上記の状態遷移ルールに従って更新
   - 備考欄に補足情報があれば記載

2. **タスクの見出し**
   - 完了時に「[完了]」を追記する（例: `### タスク1: ... [完了]`）

3. **タスク内のチェックリスト**
   - `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

### 完了時の更新

1. ステータスを「完了」に変更
2. 完了日を追記
3. チェックリストを更新
4. 仕様書ファイルを `updates/completed/` ディレクトリに移動してよいか確認し、許可があれば移動
