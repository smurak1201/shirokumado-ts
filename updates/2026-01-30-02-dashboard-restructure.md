# ダッシュボード構造変更

**日付**: 2026-01-30
**ブランチ**: feature/dashboard-restructure
**対象**: ダッシュボード（`app/dashboard/`）、ECサイト（`app/shop/`）
**ステータス**: 未着手
**完了日**: -

---

## 進捗状況

| #   | タスク                                   | 優先度 | ステータス | 備考 |
| --- | ---------------------------------------- | :----: | :--------: | ---- |
| 1   | 現在の dashboard を homepage に移動      |   高   |    [ ]     |      |
| 2   | ダッシュボードリダイレクトの設定         |   高   |    [ ]     |      |
| 3   | ダッシュボード共通レイアウト（タブUI）   |   高   |    [ ]     |      |
| 4   | ECサイト用ダッシュボードのプレースホルダ |   中   |    [ ]     |      |
| 5   | ECサイト表示用ページのプレースホルダ     |   中   |    [ ]     |      |
| 6   | 動作確認・ビルドテスト                   |   -    |    [ ]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

現在のダッシュボード（`/dashboard`）はホームページ用の商品管理機能を提供している。今後、ECサイトを追加する予定があり、ECサイト用のダッシュボードも必要になる。

### 課題

- **課題1**: ECサイト用ダッシュボードを追加する場所がない
- **課題2**: `/dashboard` が単一の機能に紐づいており、拡張性がない

### 設計方針

- **方針1**: `/dashboard` を選択画面とし、配下に各ダッシュボードを配置
- **方針2**: 現在のダッシュボードを `/dashboard/homepage` に移動
- **方針3**: ECサイト用ダッシュボードは `/dashboard/shop` に配置（ルートのみ先行作成）
- **方針4**: ECサイト表示用ページは `/shop` に配置（ルートのみ先行作成）
- **方針5**: タブUIで各ダッシュボードを切り替えられるようにする

### CLAUDE.md準拠事項

本構造変更では以下のルールに従うこと。

**設計原則**:
- **YAGNI**: ECサイト用ダッシュボードとECサイトページはプレースホルダのみ作成。実装は別タスクで行う
- **KISS**: シンプルなリダイレクトとタブUIで実現

**コード品質**:
- 未使用のインポートは削除すること
- 関数の引数と返り値には型を付けること
- リントエラーを解消すること（`npm run lint`）

**Server/Client Components**:
- `DashboardTabs.tsx` は `usePathname` を使用するため `"use client"` が必要
- `layout.tsx` と `page.tsx` はServer Componentとして実装

### 変更後のルート構造

```
/dashboard          ← 選択画面（homepage/shop を選ぶ）
/dashboard/homepage ← ホームページ用ダッシュボード（現在の /dashboard）
/dashboard/shop     ← ECサイト用ダッシュボード（プレースホルダ）
/shop               ← ECサイト表示用ページ（プレースホルダ）
```

---

## タスク詳細

### タスク1: 現在の dashboard を homepage に移動

**対象ファイル**:

- `app/dashboard/` 配下の全ファイル（既存・移動）

**問題点**:

現在のダッシュボードが `/dashboard` 直下にあり、ECサイト用ダッシュボードを追加できない。

**修正内容**:

`app/dashboard/` 配下のファイルを `app/dashboard/homepage/` に移動する。

**移動対象**:

```
app/dashboard/
├── page.tsx              → app/dashboard/homepage/page.tsx
├── types.ts              → app/dashboard/homepage/types.ts
├── components/           → app/dashboard/homepage/components/
├── hooks/                → app/dashboard/homepage/hooks/
└── utils/                → app/dashboard/homepage/utils/
```

**import パスの修正**:

移動後、各ファイル内の相対パスを確認し、必要に応じて修正する。`@/` で始まるパスは変更不要。

**スタイルの調整**:

`layout.tsx` で `min-h-screen bg-gray-50` を設定するため、`homepage/page.tsx` からこれらを削除する。

```tsx
// 変更前（app/dashboard/homepage/page.tsx 103行目付近）
return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="mx-auto max-w-4xl px-4">

// 変更後
return (
  <div className="py-8">
    <div className="mx-auto max-w-4xl px-4">
```

**チェックリスト**:

- [ ] `app/dashboard/homepage/` ディレクトリを作成
- [ ] `page.tsx` を移動
- [ ] `types.ts` を移動
- [ ] `components/` を移動
- [ ] `hooks/` を移動
- [ ] `utils/` を移動
- [ ] import パスが正しいことを確認
- [ ] `homepage/page.tsx` のスタイルを調整（min-h-screen, bg-gray-50 を削除）

---

### タスク2: ダッシュボードリダイレクトの設定

**対象ファイル**:

- `app/dashboard/page.tsx`（**新規作成**）

**問題点**:

`/dashboard` にアクセスした際の遷移先がない。

**修正内容**:

`/dashboard` にアクセスした場合、`/dashboard/homepage` へ自動リダイレクトする。

**実装例**:

```tsx
// app/dashboard/page.tsx（新規作成）
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/dashboard/homepage');
}
```

**チェックリスト**:

- [ ] `app/dashboard/page.tsx` を新規作成
- [ ] `/dashboard` にアクセスすると `/dashboard/homepage` へリダイレクトされること

---

### タスク3: ダッシュボード共通レイアウト（タブUI）

**対象ファイル**:

- `app/dashboard/layout.tsx`（**新規作成**）
- `app/dashboard/components/DashboardTabs.tsx`（**新規作成**）

**問題点**:

各ダッシュボード間を移動するナビゲーションがない。

**修正内容**:

タブUIを含む共通レイアウトを作成する。タブで `homepage` と `shop` を切り替えられるようにする。

**実装例**:

```tsx
// app/dashboard/components/DashboardTabs.tsx（新規作成）
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard/homepage', label: 'ホームページ' },
  { href: '/dashboard/shop', label: 'ECサイト' },
] as const;

export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex gap-4">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

```tsx
// app/dashboard/layout.tsx（新規作成）
import type { ReactNode } from 'react';
import DashboardTabs from './components/DashboardTabs';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTabs />
      {children}
    </div>
  );
}
```

**チェックリスト**:

- [ ] `app/dashboard/components/` ディレクトリを作成
- [ ] `DashboardTabs.tsx` を新規作成
- [ ] `app/dashboard/layout.tsx` を新規作成
- [ ] タブで homepage と shop を切り替えられること
- [ ] 現在のページのタブがアクティブ表示されること

---

### タスク4: ECサイト用ダッシュボードのプレースホルダ

**対象ファイル**:

- `app/dashboard/shop/page.tsx`（**新規作成**）

**問題点**:

ECサイト用ダッシュボードのルートが存在しない。

**修正内容**:

プレースホルダページを作成し、「準備中」のメッセージを表示する。

**実装例**:

```tsx
// app/dashboard/shop/page.tsx（新規作成）
import Link from 'next/link';

export default function ShopDashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6 text-6xl">🛒</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          ECサイト管理
        </h1>
        <p className="mb-8 text-gray-600">
          このページは現在準備中です
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}
```

**チェックリスト**:

- [ ] `app/dashboard/shop/` ディレクトリを作成
- [ ] `page.tsx` を新規作成
- [ ] 「準備中」メッセージが表示されること

---

### タスク5: ECサイト表示用ページのプレースホルダ

**対象ファイル**:

- `app/shop/page.tsx`（**新規作成**）

**問題点**:

ECサイト表示用ページのルートが存在しない。

**修正内容**:

プレースホルダページを作成し、「準備中」のメッセージを表示する。

**実装例**:

```tsx
// app/shop/page.tsx（新規作成）
import Link from 'next/link';

export default function ShopPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6 text-6xl">🏪</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          オンラインショップ
        </h1>
        <p className="mb-8 text-gray-600">
          オンラインショップは現在準備中です
          <br />
          もうしばらくお待ちください
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
```

**チェックリスト**:

- [ ] `app/shop/` ディレクトリを作成
- [ ] `page.tsx` を新規作成
- [ ] 「準備中」メッセージが表示されること

---

### タスク6: 動作確認・ビルドテスト

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [ ] `/dashboard` にアクセスすると `/dashboard/homepage` へリダイレクトされること
   - [ ] `/dashboard/homepage` で商品管理ダッシュボードが表示されること
   - [ ] `/dashboard/shop` で「準備中」メッセージが表示されること
   - [ ] `/shop` で「準備中」メッセージが表示されること
   - [ ] タブUIで homepage と shop を切り替えられること
   - [ ] 現在のページのタブがアクティブ表示されること

2. **ビルド確認** (`npm run build`)
   - [ ] ビルドエラーがないこと
   - [ ] TypeScriptエラーがないこと

3. **品質チェックリスト**（CLAUDE.md準拠）
   - [ ] この機能は**今**必要か？（YAGNI）
   - [ ] もっとシンプルな方法はないか？（KISS）
   - [ ] 未使用のインポートは削除したか？
   - [ ] リントエラーは解消したか？（`npm run lint`）

---

## 変更対象ファイル一覧

| ファイル                                   | 変更内容                           | ステータス |
| ------------------------------------------ | ---------------------------------- | :--------: |
| `app/dashboard/homepage/page.tsx`          | 移動（旧 `app/dashboard/page.tsx`）|    [ ]     |
| `app/dashboard/homepage/types.ts`          | 移動                               |    [ ]     |
| `app/dashboard/homepage/components/*`      | 移動                               |    [ ]     |
| `app/dashboard/homepage/hooks/*`           | 移動                               |    [ ]     |
| `app/dashboard/homepage/utils/*`           | 移動                               |    [ ]     |
| `app/dashboard/page.tsx`                   | **新規作成** - リダイレクト        |    [ ]     |
| `app/dashboard/layout.tsx`                 | **新規作成** - 共通レイアウト      |    [ ]     |
| `app/dashboard/components/DashboardTabs.tsx` | **新規作成** - タブUI            |    [ ]     |
| `app/dashboard/shop/page.tsx`              | **新規作成** - プレースホルダ      |    [ ]     |
| `app/shop/page.tsx`                        | **新規作成** - プレースホルダ      |    [ ]     |

---

## 備考

### 注意事項

- ファイル移動時に import パスが壊れないよう注意
- `@/` で始まる絶対パスは変更不要
- 相対パス（`./` や `../`）は確認が必要

### 認証機能との関係

この構造変更は、認証機能（`2026-01-30-03-dashboard-auth.md`）の前提となる。認証機能の実装では以下のパスを使用する：

- 保護対象: `/dashboard/*`（homepage、shop 両方）
- ログインページ: `/auth/signin`
- ログイン後のリダイレクト先: `/dashboard`（選択画面）

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

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
