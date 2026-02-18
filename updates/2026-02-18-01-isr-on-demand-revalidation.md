# ISR + オンデマンド再検証の導入

**日付**: 2026-02-18
**ブランチ**: claude/loading-screen-seo-question-8RL4Y
**対象**: トップページ（`app/(public)/page.tsx`）、商品管理API
**ステータス**: 完了
**完了日**: 2026-02-18

---

## 進捗状況

| #   | タスク                                                       | 優先度 | ステータス | 備考 |
| --- | ------------------------------------------------------------ | :----: | :--------: | ---- |
| 1   | トップページのISR化（force-dynamic削除 + ローディング遅延削除） |   高   |    [o]     |      |
| 2   | 商品更新APIにrevalidatePath追加                              |   高   |    [o]     |      |
| 3   | 動作確認・ビルドテスト                                       |   -    |    [o]     | ビルド・リントのエラーは既存の問題（ネットワーク・別ファイル）のみ |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

トップページの商品データはDBから取得しているが、以下の理由で`force-dynamic`（リクエストごとにSSR）を使用し、さらに1.5秒の最低ローディング時間を設けている：

1. DBのコールドスタート等で表示時間が安定しない
2. ローディング画面が中途半端に表示されると視認性が悪い

しかしこの構成には以下の問題がある：

- **SEO**: LCPが常に1.5秒以上になり、Core Web Vitalsに悪影響
- **UX**: 毎回ローディング画面が表示され、体感が遅い
- **コスト**: 毎リクエストでDBアクセスが発生し、Neonのコンピュート時間が増加

### 課題

- **課題1**: `force-dynamic`により毎回SSRが実行され、DBアクセスが毎リクエスト発生する
- **課題2**: 1.5秒の人工的な遅延がLCPを悪化させている
- **課題3**: 商品データの更新頻度は低いのに、毎回リアルタイムにDBから取得している

### 設計方針

- **ISR（Incremental Static Regeneration）**: ページを一度レンダリングしてキャッシュし、以降はキャッシュから即座に返す
- **オンデマンド再検証**: 管理画面で商品を更新した際に`revalidatePath('/')`でキャッシュを無効化し、次のリクエストで再レンダリング
- **Suspenseは維持**: キャッシュミス時（初回リクエスト、再検証後）のみローディング画面を表示。キャッシュヒット時は即座にページが表示される

### CLAUDE.md準拠事項

本改修では以下のルールに従うこと。

**設計原則**:

- **YAGNI**: 現時点で必要な機能のみ実装する
- **KISS**: 最もシンプルな解決策を選ぶ（`revalidatePath`を追加するだけ）

**コード品質**:

- 未使用のインポートは削除すること
- 関数の引数と返り値には型を付けること
- リントエラーを解消すること（`npm run lint`）

**Server/Client Components**:

- デフォルトで Server Components を使用

---

## タスク詳細

### タスク1: トップページのISR化 [完了]

**対象ファイル**:

- `app/(public)/page.tsx`（既存・変更）
- `app/(public)/HomeContent.tsx`（既存・変更）

**問題点**:

`force-dynamic`により毎回SSRが実行され、さらに1.5秒の人工的な遅延が加わっている。

**修正内容**:

1. `page.tsx`から`export const dynamic = "force-dynamic"`とその上のコメントを削除
2. `HomeContent.tsx`から`MIN_LOADING_TIME_MS`定数と`Promise.all`のsetTimeoutを削除し、直接データ取得に変更
3. 両ファイルのファイル先頭コメントを更新

#### page.tsx の変更

**`export const dynamic` の削除（25〜26行目）**:

```tsx
// 変更前
// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

// 変更後
// （上記2行を削除）
```

**ファイル先頭コメントの変更（1〜6行目）**:

```tsx
// 変更前
/**
 * トップページ
 *
 * Suspenseを使用して、データ取得中はローディング画面を表示。
 * HomeContentでPromise.allを使い、最低1秒のローディング時間を保証。
 */

// 変更後
/**
 * トップページ
 *
 * ISR + オンデマンド再検証でキャッシュを管理。
 * キャッシュミス時はSuspenseのfallbackでローディング画面を表示。
 */
```

#### HomeContent.tsx の変更

**`MIN_LOADING_TIME_MS` 定数の削除（20〜23行目）**:

```tsx
// 変更前
// 設計判断: ローディング画面の最低表示時間（ms）
// 一瞬だけ表示されると逆に煩わしく、またDBのコールドスタートで
// 表示時間が安定しないため、あえて最低表示時間を設けている。
const MIN_LOADING_TIME_MS = 1500;

// 変更後
// （上記4行を削除）
```

**データ取得の簡素化（64〜72行目）**:

```tsx
// 変更前
    // データ取得と最低表示時間を並列で待機
    // - データ取得が0.3秒で完了 → 1.5秒後にコンテンツ表示
    // - データ取得が2.5秒かかる → 2.5秒後にコンテンツ表示
    const [data] = await Promise.all([
      getPublishedProductsByCategory(),
      new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME_MS)),
    ]);
    categoriesWithProducts = data;

// 変更後
    categoriesWithProducts = await getPublishedProductsByCategory();
```

**ファイル先頭コメントの変更（1〜7行目）**:

```tsx
// 変更前
/**
 * トップページのメインコンテンツ
 *
 * データ取得と表示を担当するServer Component。
 * Promise.allでデータ取得と最低表示時間を並列で待機し、
 * 最低1.5秒のローディング表示を保証する。
 */

// 変更後
/**
 * トップページのメインコンテンツ
 *
 * データ取得と表示を担当するServer Component。
 * ISR + オンデマンド再検証でキャッシュを管理。
 * キャッシュミス時のみSuspense fallback（ローディング画面）が表示される。
 */
```

**チェックリスト**:

- [o] `page.tsx`から`force-dynamic`とそのコメントを削除
- [o] `HomeContent.tsx`から`MIN_LOADING_TIME_MS`と人工的な遅延を削除
- [o] データ取得を`Promise.all`から直接呼び出しに変更
- [o] 両ファイルの先頭コメントを更新
- [o] Suspense + LoadingScreenの構造は維持されていること

---

### タスク2: 商品更新APIにrevalidatePath追加 [完了]

**対象ファイル**:

- `app/api/products/route.ts`（既存・変更）— POST（新規作成）
- `app/api/products/[id]/put.ts`（既存・変更）— 商品更新
- `app/api/products/[id]/delete.ts`（既存・変更）— 商品削除
- `app/api/products/reorder/route.ts`（既存・変更）— 並び替え

**問題点**:

ISR化したトップページのキャッシュは、商品データが変更されても自動では更新されない。管理画面からの商品操作（作成・更新・削除・並び替え）後にキャッシュを明示的に無効化する必要がある。

**修正内容**:

商品データを変更するすべてのAPIエンドポイントで、処理成功後に`revalidatePath('/')`を呼び出してトップページのキャッシュを無効化する。

#### app/api/products/route.ts（POST）の変更

**importに追加（先頭付近）**:

```tsx
import { revalidatePath } from 'next/cache';
```

**returnの直前（103行目付近）に追加**:

```tsx
// 変更前
  return apiSuccess({ product }, 201);

// 変更後
  // トップページのISRキャッシュを無効化
  revalidatePath('/');

  return apiSuccess({ product }, 201);
```

#### app/api/products/[id]/put.ts の変更

**importに追加（先頭付近）**:

```tsx
import { revalidatePath } from 'next/cache';
```

**returnの直前（115行目付近）に追加**:

```tsx
// 変更前
  return apiSuccess({ product });

// 変更後
  // トップページのISRキャッシュを無効化
  revalidatePath('/');

  return apiSuccess({ product });
```

#### app/api/products/[id]/delete.ts の変更

**importに追加（先頭付近）**:

```tsx
import { revalidatePath } from 'next/cache';
```

**returnの直前（46行目付近）に追加**:

```tsx
// 変更前
  return apiSuccess({ message: '商品を削除しました' });

// 変更後
  // トップページのISRキャッシュを無効化
  revalidatePath('/');

  return apiSuccess({ message: '商品を削除しました' });
```

#### app/api/products/reorder/route.ts の変更

**importに追加（先頭付近）**:

```tsx
import { revalidatePath } from 'next/cache';
```

**returnの直前（38行目付近）に追加**:

```tsx
// 変更前
  return apiSuccess({ message: '商品の順序を更新しました' });

// 変更後
  // トップページのISRキャッシュを無効化
  revalidatePath('/');

  return apiSuccess({ message: '商品の順序を更新しました' });
```

**チェックリスト**:

- [o] `app/api/products/route.ts`（POST）に`revalidatePath('/')`を追加
- [o] `app/api/products/[id]/put.ts`に`revalidatePath('/')`を追加
- [o] `app/api/products/[id]/delete.ts`に`revalidatePath('/')`を追加
- [o] `app/api/products/reorder/route.ts`に`revalidatePath('/')`を追加
- [o] すべてのimportに`revalidatePath`が追加されていること

---

### タスク3: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと（Google Fontsネットワークエラーは既存の環境問題）
   - [o] TypeScriptエラーがないこと（HeroSection.tsxの画像インポートエラーは既存の問題）

2. **リント確認** (`npm run lint`)
   - [o] リントエラーがないこと（WebViewGuard.tsxのエラーは既存の問題で今回の変更とは無関係）

3. **品質チェックリスト**（CLAUDE.md準拠）
   - [o] 未使用のインポートは削除したか？
   - [o] この機能は**今**必要か？（YAGNI）
   - [o] もっとシンプルな方法はないか？（KISS）

---

## 変更対象ファイル一覧

| ファイル                             | 変更内容                                     | ステータス |
| ------------------------------------ | -------------------------------------------- | :--------: |
| `app/(public)/page.tsx`              | `force-dynamic`削除、コメント更新            |    [o]     |
| `app/(public)/HomeContent.tsx`       | ローディング遅延削除、データ取得簡素化、コメント更新 |    [o]     |
| `app/api/products/route.ts`          | POSTに`revalidatePath('/')`追加              |    [o]     |
| `app/api/products/[id]/put.ts`       | `revalidatePath('/')`追加                    |    [o]     |
| `app/api/products/[id]/delete.ts`    | `revalidatePath('/')`追加                    |    [o]     |
| `app/api/products/reorder/route.ts`  | `revalidatePath('/')`追加                    |    [o]     |

---

## 備考

### 動作の変化

| 状態                     | 変更前（force-dynamic）         | 変更後（ISR + オンデマンド再検証）                 |
| ------------------------ | ------------------------------- | -------------------------------------------------- |
| 通常アクセス             | 毎回SSR + 1.5秒遅延            | キャッシュから即座に返却（ローディング画面なし）    |
| 商品更新後の初回アクセス | 毎回SSR + 1.5秒遅延            | SSR（ローディング画面表示後にコンテンツ差し替え）   |
| DBコールドスタート時     | 1.5秒〜数秒                    | キャッシュヒット時は影響なし                       |
| LCP                      | 常に1.5秒以上                   | キャッシュヒット時はほぼ0                          |
| DBアクセス頻度           | 毎リクエスト                    | 商品更新後の初回アクセス時のみ                     |

### キャッシュミス時の挙動

ISR化後も、以下のタイミングではSuspense fallback（ローディング画面）が表示される：

1. **デプロイ直後の初回アクセス**
2. **`revalidatePath('/')`呼び出し後の初回アクセス**

これらのケースではDBアクセスが発生するが、人工的な1.5秒の遅延は削除されるため、DBの応答速度に応じた最短時間でコンテンツが表示される。

### ISRの仕組み（技術的な補足）

Next.js App Routerでは、`force-dynamic`や動的API（`cookies()`、`headers()`等）を使用しないルートは**静的ルート**として扱われる。静的ルートの動作：

1. 初回リクエスト時にサーバーでレンダリング（ストリーミングSSRでSuspense fallbackを先に送信）
2. レンダリング結果をFull Route Cacheに保存
3. 以降のリクエストではキャッシュから即座にHTMLを返却
4. `revalidatePath('/')`が呼ばれるとキャッシュを無効化
5. 次のリクエストで再レンダリング → キャッシュ更新

Prismaによるデータベースアクセスは`fetch`ではないため、Next.jsの動的レンダリングのトリガーにはならない。

### 変更しないもの

- **管理画面のAPI（GET `/api/products`）**: `force-dynamic`のまま維持。管理画面では常に最新データが必要なため
- **`page.tsx`のmetadata**: canonical URL等はそのまま維持
- **LoadingScreenコンポーネント**: 変更不要
- **`lib/config.ts`のAPI関連キャッシュ設定**: 管理画面APIのCache-Controlヘッダー用であり、ISRとは独立

### 参考

- Next.js公式: [Incremental Static Regeneration (ISR)](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- Next.js公式: [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

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

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
