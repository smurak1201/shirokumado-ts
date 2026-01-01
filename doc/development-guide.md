# 開発ガイドライン

白熊堂プロジェクトの開発ガイドラインです。

## 📋 目次

- [コーディング規約](#コーディング規約)
- [命名規則](#命名規則)
- [ファイル構造](#ファイル構造)
- [Git ワークフロー](#git-ワークフロー)
- [コミットメッセージ](#コミットメッセージ)
- [コードレビュー](#コードレビュー)
- [テスト](#テスト)
- [コード生成時のベストプラクティス](#コード生成時のベストプラクティス)

## コーディング規約

### TypeScript

- **型安全性を重視**: `any`の使用は避け、適切な型定義を使用します
- **厳格な型チェック**: `tsconfig.json`の設定に従います
- **未使用変数の削除**: リンターエラーは必ず修正します

```typescript
// ❌ 悪い例
function getUser(id: any) {
  return prisma.user.findUnique({ where: { id } });
}

// ✅ 良い例
function getUser(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}
```

### React / Next.js

- **Server Componentsを優先**: デフォルトでServer Componentsを使用します
- **Client Componentsは必要最小限**: `'use client'`は必要な場合のみ使用します
- **エラーハンドリング**: 統一されたエラーハンドリングを使用します

```typescript
// ❌ 悪い例
'use client';
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []);
  return <div>{data}</div>;
}

// ✅ 良い例
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### エラーハンドリング

- **統一されたエラークラス**: `lib/errors.ts`のエラークラスを使用します
- **API Routes**: `lib/api-helpers.ts`の`withErrorHandling`を使用します

```typescript
// ❌ 悪い例
export async function GET() {
  try {
    const data = await prisma.user.findMany();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// ✅ 良い例
import { withErrorHandling, apiSuccess } from '@/lib/api-helpers';
import { safePrismaOperation } from '@/lib/prisma';

export const GET = withErrorHandling(async () => {
  const data = await safePrismaOperation(
    () => prisma.user.findMany(),
    'GET /api/users'
  );
  return apiSuccess({ data });
});
```

## 命名規則

### ファイル名

- **コンポーネント**: PascalCase（例: `UserProfile.tsx`）
- **ユーティリティ**: camelCase（例: `formatDate.ts`）
- **API Routes**: `route.ts`（Next.js App Routerの規約）
- **型定義**: PascalCase（例: `User.ts`）

### 変数・関数名

- **変数**: camelCase（例: `userName`, `isLoading`）
- **関数**: camelCase（例: `getUser`, `handleSubmit`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_FILE_SIZE`, `API_BASE_URL`）
- **型・インターフェース**: PascalCase（例: `User`, `ApiResponse`）

### コンポーネント

- **コンポーネント名**: PascalCase（例: `UserProfile`, `ProductCard`）
- **Props型**: `ComponentNameProps`（例: `UserProfileProps`）

```typescript
// ✅ 良い例
interface UserProfileProps {
  userId: number;
  showEmail?: boolean;
}

export function UserProfile({ userId, showEmail = false }: UserProfileProps) {
  // ...
}
```

## ファイル構造

### コンポーネント

```
app/
├── components/          # 再利用可能なコンポーネント
│   ├── ui/            # UIコンポーネント（ボタン、入力など）
│   └── features/      # 機能別コンポーネント
├── (routes)/          # ルートグループ
│   ├── page.tsx
│   └── layout.tsx
└── api/               # API Routes
    └── [resource]/
        └── route.ts
```

### ユーティリティ

```
lib/
├── prisma.ts          # Prisma Client
├── blob.ts            # Blob Storage
├── errors.ts          # エラーハンドリング
├── api-helpers.ts     # API Routesヘルパー
└── utils/             # 汎用ユーティリティ
    ├── format.ts
    └── validation.ts
```

## Git ワークフロー

### ブランチ戦略

- **main**: 本番環境用ブランチ（保護）
- **develop**: 開発用ブランチ
- **feature/**: 機能追加用ブランチ（例: `feature/user-authentication`）
- **fix/**: バグ修正用ブランチ（例: `fix/login-error`）
- **hotfix/**: 緊急修正用ブランチ（例: `hotfix/security-patch`）

### ブランチの命名規則

```
feature/[機能名]
fix/[修正内容]
hotfix/[緊急修正内容]
refactor/[リファクタリング内容]
docs/[ドキュメント内容]
```

### プルリクエスト

1. **タイトル**: 変更内容を明確に記述
2. **説明**: 変更の背景、実装内容、テスト方法を記述
3. **レビュー**: 最低1名の承認が必要
4. **CI/CD**: すべてのチェックが成功する必要がある

## コミットメッセージ

### フォーマット

```
[種類]: [簡潔な説明]

[詳細な説明（オプション）]

[関連Issue（オプション）]
```

### 種類

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル（フォーマットなど）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスやツールの変更

### 例

```
feat: ユーザー認証機能を追加

- ログイン・ログアウト機能を実装
- JWT認証を導入
- 認証ミドルウェアを追加

Closes #123
```

## コードレビュー

### レビューのポイント

1. **機能性**: 要件を満たしているか
2. **コード品質**: 読みやすく、保守しやすいか
3. **パフォーマンス**: パフォーマンスに問題がないか
4. **セキュリティ**: セキュリティ上の問題がないか
5. **テスト**: 適切にテストされているか

### レビュー時のコメント

- **必須修正**: マージ前に修正が必要
- **提案**: 改善の提案（任意）
- **質問**: 理解を深めるための質問

## テスト

### テストの種類

- **ユニットテスト**: 個別の関数・コンポーネントのテスト
- **統合テスト**: API Routesやデータベース操作のテスト
- **E2Eテスト**: ユーザーフローのテスト

### テストファイルの配置

```
__tests__/
├── unit/
│   └── lib/
├── integration/
│   └── api/
└── e2e/
    └── flows/
```

### テストの書き方

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils/format';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    expect(formatDate(date)).toBe('2024年1月1日');
  });
});
```

## パフォーマンス

### 最適化のポイント

1. **画像最適化**: Next.js Imageコンポーネントを使用
2. **コード分割**: 動的インポートを使用
3. **データフェッチ**: 適切なキャッシュ戦略を使用
4. **データベース**: 必要なデータのみ取得（N+1問題の回避）

```typescript
// ✅ 良い例: 必要なフィールドのみ取得
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ❌ 悪い例: すべてのフィールドを取得
const users = await prisma.user.findMany();
```

## セキュリティ

### ベストプラクティス

1. **環境変数**: 機密情報は環境変数で管理
2. **入力検証**: すべてのユーザー入力を検証
3. **SQLインジェクション**: Prismaを使用して回避
4. **XSS対策**: Reactの自動エスケープを活用
5. **CSRF対策**: Next.jsのCSRF保護を活用

## コード生成時のベストプラクティス

AIアシスタントやコード生成ツールを使用する際は、[コーディング標準ドキュメント](./coding-standards.md)を参照してください。

このドキュメントには以下の内容が含まれています：

- Next.js App Routerのベストプラクティス
- Prismaのクエリ最適化
- TypeScriptの型安全性
- 統一されたエラーハンドリング
- API Routesの実装パターン
- コンポーネント設計のガイドライン
- パフォーマンス最適化
- セキュリティベストプラクティス

コード生成時は、これらのベストプラクティスに従って一貫性のあるコードを生成してください。

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Best Practices](https://react.dev/learn)
- [コーディング標準とベストプラクティス](./coding-standards.md)
