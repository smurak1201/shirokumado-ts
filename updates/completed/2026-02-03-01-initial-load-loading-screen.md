# 初回ロード/リロード時のローディング画面表示対応

**日付**: 2026-02-03
**ブランチ**: feature/initial-load-loading-screen
**対象**: トップページ（`app/(public)/page.tsx`）
**ステータス**: 完了
**完了日**: 2026-02-03

---

## 進捗状況

| #   | タスク                            | 優先度 | ステータス | 備考 |
| --- | --------------------------------- | :----: | :--------: | ---- |
| 1   | LoadingScreenコンポーネントの作成 |   高   |    [o]     |      |
| 2   | HomeContentコンポーネントの作成   |   高   |    [o]     |      |
| 3   | page.tsxのSuspense構造への変更    |   高   |    [o]     |      |
| 4   | loading.tsxの更新                 |   中   |    [o]     |      |
| 5   | 動作確認・ビルドテスト            |   -    |    [o]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

トップページでは、DBからの商品取得時間のばらつきを誤魔化すため、また画面のちらつきを防ぐため、ローディング画面を最低1秒間表示する設計になっている。

### 課題

- **課題1**: クライアントサイドナビゲーション（他ページからトップページへの遷移）ではローディング画面が1秒間表示される（期待通り）
- **課題2**: 初回ロード（ブラウザで直接アクセス）やブラウザリロード時には、Next.js App Routerの仕様により`loading.tsx`が表示されず、1秒間白い画面が表示されてしまう

### 技術的な原因

Next.js App Routerの`loading.tsx`は`Suspense`境界として機能するが、これはクライアントサイドナビゲーション時のみ表示される。初回ロード（SSR）やブラウザリロード時には、サーバーでHTMLが完全に生成されてから送信されるため、`loading.tsx`は表示されない。

### 設計方針

- **Suspenseとストリーミングを活用**: データ取得部分を別のServer Componentに分離し、`<Suspense>`でラップすることで、初回ロード時にもfallback UIが即座に表示されるようにする
- **Server Componentのメリットを維持**: データ取得はサーバー側で行い、SEOとパフォーマンスを維持
- **DRY原則**: ローディングUIを共通コンポーネントとして切り出し、`loading.tsx`と`Suspense fallback`で再利用

### CLAUDE.md準拠事項

本改修では以下のルールに従うこと。

**設計原則**:
- **YAGNI**: 現時点で必要な機能のみ実装する（トップページのみの対応）
- **KISS**: Suspenseパターンというシンプルな解決策を選ぶ
- **DRY**: ローディングUIを共通コンポーネント化

**コード品質**:
- 未使用のインポートは削除すること
- 関数の引数と返り値には型を付けること
- リントエラーを解消すること（`npm run lint`）

**Server/Client Components**:
- デフォルトで Server Components を使用
- 今回の変更ではClient Componentは不要

---

## タスク詳細

### タスク1: LoadingScreenコンポーネントの作成

**対象ファイル**:

- `app/components/LoadingScreen.tsx`（**新規作成**）

**問題点**:

現在のローディングUIは`loading.tsx`に直接記述されており、Suspenseのfallbackとして再利用できない。

**修正内容**:

`loading.tsx`の内容を再利用可能なコンポーネントとして切り出す。

**実装例**:

```tsx
// app/components/LoadingScreen.tsx（新規作成）
/**
 * ローディング画面コンポーネント
 *
 * loading.tsxとSuspense fallbackの両方で再利用するための共通コンポーネント。
 */
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* ロゴ・店名 */}
        <div className="text-center">
          <h1 className="text-2xl font-light tracking-widest text-primary">
            白熊堂
          </h1>
          <p className="mt-1 text-xs tracking-wider text-muted-foreground">
            SHIROKUMADO
          </p>
        </div>

        {/* ドットスピナー */}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
        </div>

        {/* テキスト */}
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
```

**チェックリスト**:

- [ ] `LoadingScreen.tsx` を新規作成
- [ ] 既存の`loading.tsx`と同じUIであること

---

### タスク2: HomeContentコンポーネントの作成

**対象ファイル**:

- `app/(public)/HomeContent.tsx`（**新規作成**）

**問題点**:

現在の`page.tsx`ではデータ取得とUI表示が同一コンポーネント内にあり、Suspense境界を設定できない。

**修正内容**:

データ取得とメインコンテンツ部分を別のServer Componentに分離する。1秒の最低表示時間もこのコンポーネント内で処理する。

**実装例**:

```tsx
// app/(public)/HomeContent.tsx（新規作成）
/**
 * トップページのメインコンテンツ
 *
 * データ取得と表示を担当するServer Component。
 * Suspenseでラップされることを想定しており、
 * 初回ロード時にもローディング画面が表示されるようにする。
 */
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "@/app/components/ProductCategoryTabs";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import { Separator } from "@/app/components/ui/separator";
import { log } from "@/lib/logger";

// ローディング画面の最低表示時間（ms）
const MIN_LOADING_TIME_MS = 1000;

export default async function HomeContent() {
  let categoriesWithProducts: CategoryWithProducts[] = [];

  try {
    // データ取得と最低表示時間を並列で待機
    // データ取得が1000ms以上かかれば追加の遅延なし
    const [data] = await Promise.all([
      getPublishedProductsByCategory(),
      new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME_MS)),
    ]);
    categoriesWithProducts = data;
  } catch (error) {
    // 設計判断: データ取得エラー時もページは表示する（部分的なダウンタイムを許容）
    // ユーザーには通知せず、運用者のみログで確認
    log.error("商品データの取得に失敗しました", {
      context: "HomeContent",
      error,
    });
    categoriesWithProducts = [];
  }

  return (
    <>
      <FixedHeader />

      {/*
       * position:fixed のヘッダーに対応するスペーサー
       * fixedは通常フローから外れるため、このスペーサーがないと
       * 下のコンテンツがヘッダーの裏に隠れてしまう
       */}
      <div style={{ height: "var(--header-height)" }} />

      <HeroSection />

      <div className="mx-auto max-w-7xl px-2 md:px-6 lg:px-8">
        <Separator className="bg-border/60" />
      </div>

      <main className="mx-auto max-w-7xl px-2 py-8 md:px-6 md:py-20 lg:px-8 lg:py-24 overflow-x-hidden">
        <ProductCategoryTabs categoriesWithProducts={categoriesWithProducts} />
      </main>

      <Footer />
    </>
  );
}
```

**チェックリスト**:

- [ ] `HomeContent.tsx` を新規作成
- [ ] データ取得ロジックが正しく移行されていること
- [ ] 1秒の遅延が含まれていること
- [ ] エラーハンドリングが含まれていること

---

### タスク3: page.tsxのSuspense構造への変更

**対象ファイル**:

- `app/(public)/page.tsx`（既存・変更）

**問題点**:

現在の構造ではSuspense境界がなく、初回ロード時にローディング画面が表示されない。

**修正内容**:

`<Suspense>`で`HomeContent`をラップし、fallbackに`LoadingScreen`を指定する。

**変更前**:

```tsx
// app/(public)/page.tsx（変更前）
import {
  getPublishedProductsByCategory,
  type CategoryWithProducts,
} from "@/lib/products";
import ProductCategoryTabs from "@/app/components/ProductCategoryTabs";
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import { Separator } from "@/app/components/ui/separator";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

const MIN_LOADING_TIME_MS = 1000;

export default async function Home() {
  // データ取得ロジック...
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FixedHeader />
      {/* ... */}
    </div>
  );
}
```

**変更後**:

```tsx
// app/(public)/page.tsx（変更後）
/**
 * トップページ
 *
 * Suspenseを使用して初回ロード/リロード時にもローディング画面を表示。
 * データ取得はHomeContentコンポーネントで行う。
 */
import { Suspense } from "react";
import LoadingScreen from "@/app/components/LoadingScreen";
import HomeContent from "./HomeContent";

// 商品データは頻繁に更新されるため、リクエストごとに最新データを取得
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
```

**チェックリスト**:

- [ ] `page.tsx` をSuspense構造に変更
- [ ] 不要なimportを削除
- [ ] `export const dynamic = "force-dynamic"` を維持

---

### タスク4: loading.tsxの更新

**対象ファイル**:

- `app/(public)/loading.tsx`（既存・変更）

**問題点**:

ローディングUIが重複して定義されている（DRY違反）。

**修正内容**:

`LoadingScreen`コンポーネントを使用するよう変更し、DRYを維持する。

**変更前**:

```tsx
// app/(public)/loading.tsx（変更前）
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* ローディングUIの内容... */}
      </div>
    </div>
  );
}
```

**変更後**:

```tsx
// app/(public)/loading.tsx（変更後）
/**
 * ローディングページ
 *
 * (public)ルートグループ内のクライアントサイドナビゲーション時に表示。
 * LoadingScreenコンポーネントを再利用してDRYを維持。
 */
import LoadingScreen from "@/app/components/LoadingScreen";

export default function Loading() {
  return <LoadingScreen />;
}
```

**チェックリスト**:

- [ ] `loading.tsx` を更新
- [ ] `LoadingScreen`をimport

---

### タスク5: 動作確認・ビルドテスト

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [ ] ブラウザで直接トップページにアクセスした際、1秒間ローディング画面が表示されること
   - [ ] ブラウザでトップページをリロードした際、1秒間ローディング画面が表示されること
   - [ ] 他ページからトップページに遷移した際、1秒間ローディング画面が表示されること（既存動作の維持）
   - [ ] ローディング画面のデザインが変わっていないこと
   - [ ] データ取得後、正しく商品が表示されること

2. **ビルド確認** (`npm run build`)
   - [ ] ビルドエラーがないこと
   - [ ] TypeScriptエラーがないこと

3. **品質チェックリスト**（CLAUDE.md準拠）
   - [ ] 未使用のインポートは削除したか？
   - [ ] リントエラーは解消したか？（`npm run lint`）

---

## 変更対象ファイル一覧

| ファイル                           | 変更内容                                              | ステータス |
| ---------------------------------- | ----------------------------------------------------- | :--------: |
| `app/components/LoadingScreen.tsx` | **新規作成** - 再利用可能なローディングUIコンポーネント |    [ ]     |
| `app/(public)/HomeContent.tsx`     | **新規作成** - データ取得とメインコンテンツ           |    [ ]     |
| `app/(public)/page.tsx`            | Suspense構造への変更                                  |    [ ]     |
| `app/(public)/loading.tsx`         | LoadingScreenコンポーネントを使用するよう変更         |    [ ]     |

---

## 備考

### 注意事項

- この変更はトップページのみに適用される。FAQページやshopページには影響しない
- `export const dynamic = "force-dynamic"` は維持し、キャッシュせずに毎回最新データを取得する動作を維持

### 技術的な補足

- **Suspenseストリーミング**: Next.jsのストリーミングSSRにより、Suspense fallbackは初回ロード時に即座にクライアントに送信され、データ取得完了後にコンテンツがストリーミングで送信される
- **1秒の遅延の動作**: `Promise.all`でデータ取得と1秒の遅延を並列実行しているため、データ取得が1秒以上かかる場合は追加の遅延なしでコンテンツが表示される

### 参考

- Next.js公式ドキュメント: [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

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
4. 仕様書ファイルを `updates/completed/` ディレクトリに移動してよいか確認し、許可があれば移動

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
