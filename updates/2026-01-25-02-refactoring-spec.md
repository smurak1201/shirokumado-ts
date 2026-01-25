# リファクタリング仕様書

**日付**: 2026-01-25
**ブランチ**: feature/refactoring-improvements
**対象**: CLAUDE.mdルールに基づくコード品質改善
**ステータス**: 未着手

---

## 進捗状況

| #   | タスク                                    | 優先度 | ステータス | 備考 |
| --- | ----------------------------------------- | :----: | :--------: | ---- |
| 1   | ProductLayoutTab の動的インポート化       |   中   |    [ ]     |      |
| 2   | ProductGrid の動的インポート化            |   中   |    [ ]     |      |
| 3   | ProductModal の動的インポート化           |   中   |    [ ]     |      |
| 4   | UIコンポーネントの aria-label 追加        |   中   |    [ ]     |      |
| 5   | ドラッグ&ドロップ定数の抽出               |   中   |    [ ]     |      |
| 6   | アニメーション定数の抽出                  |   中   |    [ ]     |      |
| 7   | ProductImageField の画像最適化コメント    |   低   |    [ ]     |      |
| 8   | 動作確認・ビルドテスト                    |   -    |    [ ]     |      |
| 9   | ダッシュボード認証機構の実装（Auth.js）   |  後回し |    [ ]     | プロトタイプ完了後に実装 |
| 10  | API Routes 認証ミドルウェアの追加         |  後回し |    [ ]     | プロトタイプ完了後に実装 |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

CLAUDE.md に記載されたコーディング規約と、Next.js / React のベストプラクティスに基づき、コードベースの品質向上とセキュリティ強化を行う。

### 良好な点（修正不要）

以下の項目は既に適切に実装されているため、変更不要：

- **エラーハンドリング**: `withErrorHandling()` ラッパーと try-catch が全非同期処理に実装済み
- **非同期処理の並列化**: `Promise.all()` が適切に使用済み
- **型安全性**: 関数の引数・返り値に型定義済み
- **単一責任**: コンポーネントが適切に分割済み
- **未使用import**: なし
- **dangerouslySetInnerHTML**: 使用なし
- **動的クラス名**: 使用なし

### 設計方針

- **パフォーマンス改善**: `next/dynamic` による動的インポートでバンドルサイズを削減
- **アクセシビリティ対応**: `aria-label` の追加でスクリーンリーダー対応
- **保守性向上**: マジックナンバーの定数化
- **セキュリティ（後回し）**: Auth.js による認証機構はプロトタイプ完了後に実装

---

## タスク詳細

### タスク1: ProductLayoutTab の動的インポート化

**対象ファイル**:
- `app/dashboard/components/DashboardContent.tsx`
- `app/dashboard/components/ProductLayoutTab.tsx`

**問題点**:
`@dnd-kit` は大きなライブラリ（ドラッグ&ドロップ機能）のため、初期バンドルサイズが増加している。
レイアウトタブは常に表示されるわけではないため、遅延読み込みで十分。

**修正内容**:

`next/dynamic` を使用して、ProductLayoutTab を動的インポートに変更。

**実装例**:

```tsx
// app/dashboard/components/DashboardContent.tsx
import dynamic from "next/dynamic";

// 既存の静的インポートを削除
// import ProductLayoutTab from "./ProductLayoutTab";

// 動的インポートに変更
const ProductLayoutTab = dynamic(
  () => import("./ProductLayoutTab"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    ),
    ssr: false, // クライアントサイドのみで読み込み
  }
);
```

**チェックリスト**:
- [ ] `DashboardContent.tsx` で動的インポートに変更
- [ ] ローディングコンポーネントの作成
- [ ] `ssr: false` の設定（dnd-kitはクライアントのみ）
- [ ] 動作確認（ドラッグ&ドロップが正常に動作すること）

---

### タスク2: ProductGrid の動的インポート化

**対象ファイル**:
- `app/components/ProductCategoryTabs.tsx`
- `app/components/ProductGrid.tsx`

**問題点**:
`framer-motion` を使用しており、初期バンドルサイズが大きい。

**修正内容**:

ProductGrid を動的インポートに変更し、スケルトンローディングを表示。

**実装例**:

```tsx
// app/components/ProductCategoryTabs.tsx
import dynamic from "next/dynamic";

// 既存の静的インポートを削除
// import ProductGrid from "./ProductGrid";

// 動的インポートに変更
const ProductGrid = dynamic(
  () => import("./ProductGrid"),
  {
    loading: () => (
      <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    ),
  }
);
```

**チェックリスト**:
- [ ] `ProductCategoryTabs.tsx` で動的インポートに変更
- [ ] スケルトンローディング（6個のプレースホルダー）の作成
- [ ] 動作確認（商品グリッドが正常に表示されること）
- [ ] アニメーションが正常に動作すること

---

### タスク3: ProductModal の動的インポート化

**対象ファイル**:
- `app/components/ProductGrid.tsx`
- `app/components/ProductModal.tsx`

**問題点**:
モーダルは初期表示時に必要ないため、遅延読み込みで十分。

**修正内容**:

ProductModal を動的インポートに変更。

**実装例**:

```tsx
// app/components/ProductGrid.tsx
import dynamic from "next/dynamic";

// 既存の静的インポートを削除
// import ProductModal from "./ProductModal";

// 動的インポートに変更
const ProductModal = dynamic(
  () => import("./ProductModal"),
  { ssr: false }
);
```

**チェックリスト**:
- [ ] `ProductGrid.tsx` で動的インポートに変更
- [ ] `ssr: false` の設定
- [ ] 動作確認（モーダルが正常に開閉すること）

---

### タスク4: UIコンポーネントの aria-label 追加

**対象ファイル**:
- `app/components/ui/sheet.tsx`（68-71行目）
- `app/components/ui/dialog.tsx`（47-50行目）
- `app/components/ui/accordion.tsx`（37行目）

**問題点**:
閉じるボタンやアコーディオンアイコンに `aria-label` がない。
`sr-only` クラスは存在するが、ボタン要素自体に `aria-label` を追加すべき。

**修正内容**:

**sheet.tsx（68行目付近）**:

```tsx
// 変更前
<SheetPrimitive.Close className="...">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</SheetPrimitive.Close>

// 変更後
<SheetPrimitive.Close className="..." aria-label="閉じる">
  <X className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">閉じる</span>
</SheetPrimitive.Close>
```

**dialog.tsx（47行目付近）**:

```tsx
// 変更前
<DialogPrimitive.Close className="...">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>

// 変更後
<DialogPrimitive.Close className="..." aria-label="閉じる">
  <X className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">閉じる</span>
</DialogPrimitive.Close>
```

**accordion.tsx（37行目付近）**:

```tsx
// 変更前
<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />

// 変更後
<ChevronDown
  className="h-4 w-4 shrink-0 transition-transform duration-200"
  aria-hidden="true"
/>
```

**チェックリスト**:
- [ ] `sheet.tsx` に `aria-label="閉じる"` 追加
- [ ] `dialog.tsx` に `aria-label="閉じる"` 追加
- [ ] `accordion.tsx` のアイコンに `aria-hidden="true"` 追加
- [ ] `sr-only` のテキストを日本語化（"Close" → "閉じる"）

---

### タスク5: ドラッグ&ドロップ定数の抽出

**対象ファイル**:
- `lib/config.ts`
- `app/dashboard/components/ProductLayoutTab.tsx`（51-60行目）

**問題点**:
センサーの設定値がハードコードされている：
- `distance: 5`
- `delay: 200`
- `tolerance: 5`

**修正内容**:

**lib/config.ts に追加**:

```tsx
export const config = {
  // ... 既存の設定

  /**
   * ドラッグ&ドロップに関する設定
   */
  dndConfig: {
    /**
     * ポインターセンサーのアクティベーション距離（ピクセル）
     * クリックとドラッグを区別するための最小移動距離
     */
    POINTER_ACTIVATION_DISTANCE: 5,

    /**
     * タッチセンサーのアクティベーション遅延（ミリ秒）
     * 長押しでドラッグを開始するまでの待機時間
     */
    TOUCH_ACTIVATION_DELAY: 200,

    /**
     * タッチセンサーの許容誤差（ピクセル）
     * ドラッグ中に許容される指のブレ
     */
    TOUCH_TOLERANCE: 5,
  },
} as const;
```

**ProductLayoutTab.tsx の変更**:

```tsx
// import追加
import { config } from "@/lib/config";

// センサー設定を定数参照に変更
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: config.dndConfig.POINTER_ACTIVATION_DISTANCE,
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: config.dndConfig.TOUCH_ACTIVATION_DELAY,
      tolerance: config.dndConfig.TOUCH_TOLERANCE,
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

**チェックリスト**:
- [ ] `lib/config.ts` に `dndConfig` セクション追加
- [ ] `ProductLayoutTab.tsx` で定数を参照するよう変更
- [ ] 動作確認（ドラッグ&ドロップが正常に動作すること）

---

### タスク6: アニメーション定数の抽出

**対象ファイル**:
- `lib/config.ts`
- `app/components/ProductGrid.tsx`（20行目、30行目付近）

**問題点**:
アニメーション設定値がハードコードされている：
- `staggerChildren: 0.08`
- `duration: 0.4`

**修正内容**:

**lib/config.ts に追加**:

```tsx
export const config = {
  // ... 既存の設定

  /**
   * アニメーションに関する設定
   */
  animationConfig: {
    /**
     * 子要素のスタガー間隔（秒）
     * 連続する要素の表示遅延
     */
    STAGGER_CHILDREN_SECONDS: 0.08,

    /**
     * フェードインアニメーションの時間（秒）
     */
    FADE_IN_DURATION_SECONDS: 0.4,

    /**
     * スクロールアニメーションの時間（秒）
     */
    SCROLL_ANIMATION_DURATION_SECONDS: 0.5,
  },
} as const;
```

**ProductGrid.tsx の変更**:

```tsx
// import追加
import { config } from "@/lib/config";

// 定数を参照
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: config.animationConfig.FADE_IN_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};
```

**チェックリスト**:
- [ ] `lib/config.ts` に `animationConfig` セクション追加
- [ ] `ProductGrid.tsx` で定数を参照するよう変更
- [ ] 動作確認（アニメーションが正常に動作すること）

---

### タスク7: ProductImageField の画像最適化コメント

**対象ファイル**:
- `app/dashboard/components/ProductImageField.tsx`（52-58行目）

**問題点**:
`unoptimized` プロパティにより、`next/image` の最適化が無効化されている。
ただし、プレビュー画像は Blob URL（`blob:...`）のため、Next.js の画像最適化は適用できない。

**修正内容**:

`unoptimized` を維持しつつ、理由をコメントで明記する。

**実装例**:

```tsx
<Image
  src={imagePreview}
  alt="プレビュー"
  fill
  className="rounded object-cover"
  // プレビュー画像は Blob URL のため、next/image の最適化対象外
  // クライアントサイドで圧縮済みのため、unoptimized を使用
  unoptimized
/>
```

**チェックリスト**:
- [ ] コメント追加で `unoptimized` の理由を明記

---

### タスク8: 動作確認・ビルドテスト

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [ ] 動的インポートが正しく動作すること（ローディング表示）
   - [ ] スクリーンリーダーで aria-label が読み上げられること

2. **ビルド確認** (`npm run build`)
   - [ ] ビルドエラーがないこと
   - [ ] TypeScriptエラーがないこと
   - [ ] 警告が増加していないこと

3. **リグレッションテスト**
   - [ ] トップページの商品一覧表示が正常であること
   - [ ] 商品モーダルが正常に開閉すること
   - [ ] ダッシュボードのドラッグ&ドロップが正常に動作すること
   - [ ] 商品の作成・編集・削除が正常に動作すること
   - [ ] 画像アップロードが正常に動作すること

4. **バンドルサイズ確認**（任意）
   - [ ] `npm run build` 後のバンドルサイズを比較
   - [ ] 動的インポートにより初期バンドルが削減されていること

---

## 後回しタスク（プロトタイプ完了後に実装）

> 以下のタスクはAuth.js導入後に実装します。

### タスク9: ダッシュボード認証機構の実装（Auth.js）

**対象ファイル**:
- `app/dashboard/layout.tsx`（新規作成）
- `app/login/page.tsx`（新規作成）

**問題点**:
ダッシュボードページに認証チェックがなく、誰でもアクセス可能な状態。

**修正内容**:

1. Auth.js を導入
2. `app/dashboard/layout.tsx` を新規作成し、認証状態をチェック
3. 未認証ユーザーはログインページにリダイレクト

**実装例**:

```tsx
// app/dashboard/layout.tsx（新規作成）
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
```

**チェックリスト**:
- [ ] Auth.js の導入とセットアップ
- [ ] ログインページの作成（`app/login/page.tsx`）
- [ ] ダッシュボード用 `layout.tsx` の作成
- [ ] 認証チェック処理の実装
- [ ] リダイレクト処理の実装
- [ ] 環境変数の設定（`AUTH_SECRET` 等）

---

### タスク10: API Routes 認証ミドルウェアの追加

**対象ファイル**:
- `lib/api-helpers.ts`
- `app/api/products/route.ts`
- `app/api/products/[id]/route.ts`
- `app/api/products/reorder/route.ts`
- `app/api/products/upload/route.ts`

**問題点**:
API Routes に認証チェックがなく、誰でも商品の作成・更新・削除が可能。

**修正内容**:

1. `withAuth` ラッパー関数を `lib/api-helpers.ts` に追加
2. POST, PUT, DELETE メソッドに認証チェックを適用
3. GET メソッドは公開のまま維持（商品一覧表示用）

**実装例**:

```tsx
// lib/api-helpers.ts に追加
import { auth } from "@/auth";

export function withAuth<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T): Promise<NextResponse> => {
    const session = await auth();
    if (!session) {
      return apiError("認証が必要です", 401, "UNAUTHORIZED");
    }
    return handler(...args);
  };
}
```

**各エンドポイントでの使用例**:

```tsx
// app/api/products/route.ts
// GETは認証不要（公開）
export const GET = withErrorHandling(async (request: NextRequest) => {
  // 既存の処理
});

// POSTは認証必要
export const POST = withErrorHandling(
  withAuth(async (request: NextRequest) => {
    // 既存の処理
  })
);
```

**チェックリスト**:
- [ ] `lib/api-helpers.ts` に `withAuth` ラッパー関数を追加
- [ ] `app/api/products/route.ts` の POST に認証追加
- [ ] `app/api/products/[id]/route.ts` の PUT, DELETE に認証追加
- [ ] `app/api/products/reorder/route.ts` の POST に認証追加
- [ ] `app/api/products/upload/route.ts` の POST に認証追加
- [ ] 認証エラー時の適切なレスポンス確認

---

## 変更対象ファイル一覧

### 今回実装するファイル

| ファイル                                          | 変更内容                    | ステータス |
| ------------------------------------------------- | --------------------------- | :--------: |
| `lib/config.ts`                                   | dndConfig, animationConfig 追加 |    [ ]     |
| `app/dashboard/components/DashboardContent.tsx`   | 動的インポート              |    [ ]     |
| `app/dashboard/components/ProductLayoutTab.tsx`   | 定数参照                    |    [ ]     |
| `app/components/ProductCategoryTabs.tsx`          | 動的インポート              |    [ ]     |
| `app/components/ProductGrid.tsx`                  | 動的インポート、定数参照    |    [ ]     |
| `app/components/ui/sheet.tsx`                     | aria-label 追加             |    [ ]     |
| `app/components/ui/dialog.tsx`                    | aria-label 追加             |    [ ]     |
| `app/components/ui/accordion.tsx`                 | aria-hidden 追加            |    [ ]     |
| `app/dashboard/components/ProductImageField.tsx`  | コメント追加                |    [ ]     |

### 後回しファイル（Auth.js導入後）

| ファイル                                          | 変更内容                    | ステータス |
| ------------------------------------------------- | --------------------------- | :--------: |
| `lib/api-helpers.ts`                              | withAuth ラッパー追加       |    [ ]     |
| `app/login/page.tsx`                              | **新規作成** - ログインページ |    [ ]     |
| `app/dashboard/layout.tsx`                        | **新規作成** - 認証チェック |    [ ]     |
| `app/api/products/route.ts`                       | 認証追加（POST）            |    [ ]     |
| `app/api/products/[id]/route.ts`                  | 認証追加（PUT, DELETE）     |    [ ]     |
| `app/api/products/reorder/route.ts`               | 認証追加（POST）            |    [ ]     |
| `app/api/products/upload/route.ts`                | 認証追加（POST）            |    [ ]     |

---

## 備考

### 認証実装について（後回し）

- **Auth.js**（旧 NextAuth.js v5）を使用予定
- プロトタイプ完了後に実装
- 必要な環境変数: `AUTH_SECRET`, `AUTH_URL`

### 既存機能への影響

- 既存の正常に動作している部分には変更を加えないこと
- 動的インポートの導入により、初回表示時に若干の遅延が発生する可能性あり
- ローディング表示を適切に設定することで、UX への影響を最小化

### 実装順序の推奨

**今回実装するタスク（プロトタイプ段階）:**

1. タスク5, 6（定数化）- 他のタスクに影響なし、単独で実装可能
2. タスク4（aria-label）- 他のタスクに影響なし、単独で実装可能
3. タスク7（コメント追加）- 他のタスクに影響なし、単独で実装可能
4. タスク1, 2, 3（動的インポート）- 互いに独立、並行実装可能
5. タスク8（動作確認）- 上記タスク完了後に実施

**後回しのタスク（プロトタイプ完了後）:**

6. タスク9（ダッシュボード認証）- Auth.js を導入
7. タスク10（API認証）- タスク9完了後に実装

---

## 実装後の更新

### 進捗状況の更新

各タスク完了時に進捗状況テーブルを更新する:

- `[ ]` → `[~]` : 作業開始時
- `[~]` → `[o]` : 作業完了時
- 備考欄に補足情報があれば記載

### 完了時の更新

全タスク完了後:

1. ステータスを「未着手」→「完了」に変更
2. 完了日を追記
3. 実際に変更したファイル一覧を確認・更新
4. 検証結果をチェックリストに記入

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
