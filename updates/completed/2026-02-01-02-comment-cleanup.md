# コメント整理 - 新コメント規則への準拠

**日付**: 2026-02-01
**ブランチ**: main（直接作業）
**対象**: 全ソースファイル（約110ファイル）
**ステータス**: 完了
**完了日**: 2026-02-01

---

## 進捗状況

| #   | タスク                                   | 優先度 | ステータス | 備考 |
| --- | ---------------------------------------- | :----: | :--------: | ---- |
| 1   | ページコンポーネント                     |   高   |    [o]     | 2026-02-01 完了 |
| 2   | トップレベルコンポーネント               |   高   |    [o]     | 2026-02-01 完了 |
| 3   | ダッシュボード - フォームコンポーネント  |   中   |    [o]     | 2026-02-01 完了 |
| 4   | ダッシュボード - リストコンポーネント    |   中   |    [o]     | 2026-02-01 完了 |
| 5   | ダッシュボード - レイアウトコンポーネント|   中   |    [o]     | 2026-02-01 完了 |
| 6   | ダッシュボード - フック                  |   中   |    [o]     | 2026-02-01 完了 |
| 7   | ダッシュボード - ユーティリティ          |   中   |    [o]     | 2026-02-01 完了 |
| 8   | UIコンポーネント                         |   低   |    [o]     | 2026-02-01 完了 (22ファイル) |
| 9   | ライブラリ/ユーティリティ                |   高   |    [o]     |      |
| 10  | API Routes                               |   中   |    [o]     |      |
| 11  | 設定ファイル・型定義                     |   低   |    [o]     |      |
| 12  | 動作確認・ビルドテスト                   |   -    |    [o]     | 2026-02-01 完了 |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

現在のコードベースには、学習用途を想定した詳細なコメントが記述されているが、コメントが多すぎてコードの可読性が低下している。

### 課題

- **課題1**: ファイル先頭の冗長なJSDocコメント（主な機能の箇条書き、注意点など）
- **課題2**: 自明なコードへのコメント（`<Header />`、`<Footer />`など）
- **課題3**: 標準的なReact/Next.jsパターンへの過剰な説明

### 設計方針

- **方針1**: コードだけで意図が明確に伝わる場合、コメントは削除する
- **方針2**: 初心者にわかりにくい実装（CSS特殊挙動、ライブラリ特有の使い方）には簡潔なコメントを残す
- **方針3**: アプリ特有の設計判断（ビジネスロジック、トレードオフ）には理由を記述する

### CLAUDE.md準拠事項

本改修では以下のコメント規則に従うこと。

**コメントが必要な場合**:
1. **初心者にはわかりにくい実装**
   - CSSの特殊な挙動（`position:fixed`の副作用など）
   - ライブラリ特有の使い方
   - 複雑なアルゴリズムや処理フロー

2. **このアプリ特有の設計判断**
   - なぜその実装を選んだのか
   - ビジネスロジック上の判断理由
   - トレードオフの説明

**コメントが不要な場合**:
- コンポーネント名や関数名から役割が明確な場合
- 自明なコード（`<Header />`、`<Footer />`など）
- 標準的なReact/Next.jsのパターン
- Tailwind CSSの基本的な使い方

**フォーマット**:
- すべてのコメントは**日本語**で記述すること
- **簡潔に**記述すること（長い説明が必要ならコードを改善）
- ファイルの先頭には簡潔な説明のみ（冗長な箇条書きは不要）

---

## タスク詳細

### タスク1: ページコンポーネント [完了]

**対象ファイル**:

- `app/page.tsx`（既存・変更）✅ 完了済み
- `app/shop/page.tsx`（既存・変更）✅ 完了
- `app/faq/page.tsx`（既存・変更）✅ 完了
- `app/auth/signin/page.tsx`（既存・変更）✅ 完了
- `app/dashboard/page.tsx`（既存・変更）✅ 完了
- `app/dashboard/homepage/page.tsx`（既存・変更）✅ 完了
- `app/dashboard/shop/page.tsx`（既存・変更）✅ 完了
- `app/layout.tsx`（既存・変更）✅ 完了
- `app/dashboard/layout.tsx`（既存・変更）✅ 完了
- `app/error.tsx`（既存・変更）✅ 完了

**修正方針**:

`app/page.tsx` の修正を参考に、以下のルールでコメントを整理する:

1. **ファイル先頭のJSDoc**: 簡潔な説明のみ残す（主な機能の箇条書き、注意点は削除）
2. **関数のJSDoc**: コンポーネント名から役割が明確な場合は削除
3. **JSXインラインコメント**: 自明なもの（`<Header />`など）は削除
4. **設計判断のコメント**: エラーハンドリングの方針など、重要な判断は残す
5. **初心者向けコメント**: `position:fixed`のスペーサーなど、技術的に難しい部分は残す

**参考**:

- `app/page.tsx` がすでに修正済みなので、この形式に合わせる

**チェックリスト**:

- [o] `app/shop/page.tsx` のコメント整理（109行→33行）
- [o] `app/faq/page.tsx` のコメント整理（101行→33行）
- [o] `app/auth/signin/page.tsx` のコメント整理（279行→79行）
- [o] `app/dashboard/page.tsx` のコメント整理（38行→9行）
- [o] `app/dashboard/homepage/page.tsx` のコメント整理（209行→102行）
- [o] `app/dashboard/shop/page.tsx` のコメント整理（77行→27行）
- [o] `app/layout.tsx` のコメント整理（208行→41行）
- [o] `app/dashboard/layout.tsx` のコメント整理（94行→37行）
- [o] `app/error.tsx` のコメント整理（201行→46行）

---

### タスク2: トップレベルコンポーネント [完了]

**対象ファイル**:

- `app/components/ErrorBoundary.tsx`（既存・変更）
- `app/components/FAQSection.tsx`（既存・変更）
- `app/components/FixedHeader.tsx`（既存・変更）
- `app/components/Footer.tsx`（既存・変更）
- `app/components/HeroSection.tsx`（既存・変更）
- `app/components/ProductCategoryTabs.tsx`（既存・変更）
- `app/components/ProductGrid.tsx`（既存・変更）
- `app/components/ProductModal.tsx`（既存・変更）
- `app/components/ProductTile.tsx`（既存・変更）

**修正方針**:

同様に、冗長なコメントを削除し、必要最小限のコメントのみ残す。

**チェックリスト**:

- [o] `ErrorBoundary.tsx` のコメント整理
- [o] `FAQSection.tsx` のコメント整理
- [o] `FixedHeader.tsx` のコメント整理
- [o] `Footer.tsx` のコメント整理
- [o] `HeroSection.tsx` のコメント整理
- [o] `ProductCategoryTabs.tsx` のコメント整理
- [o] `ProductGrid.tsx` のコメント整理
- [o] `ProductModal.tsx` のコメント整理
- [o] `ProductTile.tsx` のコメント整理

---

### タスク3: ダッシュボード - フォームコンポーネント [完了]

**対象ファイル**:

- `app/dashboard/homepage/components/form/ProductBasicFields.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductDateFields.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductDateInput.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductForm.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductFormFields.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductFormFooter.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductFormModal.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductImageField.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductPriceFields.tsx`（既存・変更）✅
- `app/dashboard/homepage/components/form/ProductPublishedField.tsx`（既存・変更）✅

**修正方針**:

フォームバリデーションやエラーハンドリングの設計判断は残す。自明なフィールド説明は削除。

**チェックリスト**:

- [o] 10個のフォームコンポーネントのコメント整理

---

### タスク4: ダッシュボード - リストコンポーネント [完了]

**対象ファイル**:

- `app/dashboard/homepage/components/list/ProductCard.tsx`（既存・変更）
- `app/dashboard/homepage/components/list/ProductCardContent.tsx`（既存・変更）
- `app/dashboard/homepage/components/list/ProductList.tsx`（既存・変更）
- `app/dashboard/homepage/components/list/ProductListContent.tsx`（既存・変更）
- `app/dashboard/homepage/components/list/ProductListTabs.tsx`（既存・変更）
- `app/dashboard/homepage/components/list/ProductSearchFilters.tsx`（既存・変更）

**修正方針**:

同様に、冗長なコメントを削除。

**チェックリスト**:

- [o] `ProductCard.tsx` のコメント整理（ファイル先頭とprops型のJSDocを削除、JSX内のコメントを削除）
- [o] `ProductCardContent.tsx` のコメント整理（ファイル先頭とprops型のJSDocを削除、JSX内のコメントを削除）
- [o] `ProductList.tsx` のコメント整理（ファイル先頭とprops型・関数のJSDocを削除、JSX内のコメントを削除）
- [o] `ProductListContent.tsx` のコメント整理（ファイル先頭とprops型のJSDocを削除、JSX内のコメントを削除）
- [o] `ProductListTabs.tsx` のコメント整理（ファイル先頭とprops型のJSDocを削除、JSX内のコメントを削除）
- [o] `ProductSearchFilters.tsx` のコメント整理（ファイル先頭とprops型のJSDocを削除、JSX内のコメントを削除）

---
### タスク5: ダッシュボード - レイアウトコンポーネント [完了]

**対象ファイル**:

- `app/dashboard/components/DashboardHeader.tsx`（既存・変更）
- `app/dashboard/homepage/components/layout/LayoutCategoryTabs.tsx`（既存・変更）
- `app/dashboard/homepage/components/layout/ProductLayoutTab.tsx`（既存・変更）
- `app/dashboard/homepage/components/layout/SortableProductItem.tsx`（既存・変更）

**修正方針**:

ドラッグ&ドロップなど、特殊なライブラリの使い方には簡潔なコメントを残す。

**チェックリスト**:

- [o] `DashboardHeader.tsx` のコメント整理（ファイル先頭のJSDocを簡潔化、冗長なインラインコメントを削除）
- [o] `LayoutCategoryTabs.tsx` のコメント整理（スクロールインジケーターのコメントは残す）
- [o] `ProductLayoutTab.tsx` のコメント整理（@dnd-kitの特殊な実装コメントは残す）
- [o] `SortableProductItem.tsx` のコメント整理（touchAction: "none"の理由コメントは残す）

---

### タスク6: ダッシュボード - フック [完了]

**対象ファイル**:

- `app/dashboard/homepage/hooks/useImageCompression.ts`（既存・変更）✅
- `app/dashboard/homepage/hooks/useImageUpload.ts`（既存・変更）✅
- `app/dashboard/homepage/hooks/useProductForm.ts`（既存・変更）✅
- `app/dashboard/homepage/hooks/useProductReorder.ts`（既存・変更）✅
- `app/dashboard/homepage/hooks/useProductSearch.ts`（既存・変更）✅
- `app/dashboard/homepage/hooks/useScrollPosition.ts`（既存・変更）✅
- `app/dashboard/homepage/hooks/useTabState.ts`（既存・変更）✅
- `app/hooks/useProductModal.ts`（既存・変更）✅

**修正方針**:

カスタムフックのロジックやアルゴリズムに関する重要なコメントは残す。自明な説明は削除。

**チェックリスト**:

- [o] 8個のフックのコメント整理

---

### タスク7: ダッシュボード - ユーティリティ [完了]

**対象ファイル**:

- `app/dashboard/homepage/utils/productFormData.ts`（既存・変更）✅
- `app/dashboard/homepage/utils/productFormSubmit.ts`（既存・変更）✅
- `app/dashboard/homepage/utils/productUtils.ts`（既存・変更）✅
- `app/dashboard/homepage/types.ts`（既存・変更）✅

**修正方針**:

データ変換の理由や、特殊な処理の判断理由は残す。

**チェックリスト**:

- [o] 4個のユーティリティファイルのコメント整理

---

### タスク8: UIコンポーネント [完了]

**対象ファイル**:

- `app/components/ui/` 配下の全ファイル（22個）

**修正方針**:

shadcn/uiベースのコンポーネントなので、カスタマイズ部分のみコメントを残す。基本的な使い方の説明は削除。

**完了内容**:

以下の22ファイルを整理しました：

**基本UIコンポーネント** (10個):
- [o] button.tsx - active:scale-95のカスタマイズコメントを残す
- [o] input.tsx - モバイル自動ズーム防止のコメントを残す
- [o] label.tsx
- [o] textarea.tsx - モバイル自動ズーム防止のコメントを残す
- [o] select.tsx
- [o] radio-group.tsx
- [o] badge.tsx - successバリアントのカスタマイズコメントを残す
- [o] card.tsx
- [o] separator.tsx
- [o] skeleton.tsx

**複雑UIコンポーネント** (7個):
- [o] dialog.tsx - 閉じるボタンのカスタマイズコメントを残す
- [o] tabs.tsx - active:scale-95のカスタマイズコメントを残す
- [o] accordion.tsx - active:scale-95、hover:underline、アイコン回転のカスタマイズコメントを残す
- [o] tooltip.tsx
- [o] sheet.tsx
- [o] scroll-area.tsx
- [o] aspect-ratio.tsx

**カスタムUIコンポーネント** (5個):
- [o] card-faq.tsx - ホバーエフェクトのカスタマイズ理由を残す
- [o] card-modal.tsx - border-0とグラデーション背景のカスタマイズ理由を残す
- [o] card-product.tsx - インタラクションのカスタマイズ理由を残す
- [o] badge-price.tsx - 大きめサイズの理由を残す
- [o] badge-question.tsx - 太字とshrink-0の理由を残す

**修正のポイント**:
- shadcn/uiの標準機能の説明は削除
- カスタマイズ部分（active:scale-95、モバイル対応等）のコメントは残す
- カスタムコンポーネントは、カスタマイズの理由を簡潔に記述
- 使用例、主な機能の箇条書き等の冗長なコメントは削除

---

### タスク9: ライブラリ/ユーティリティ [完了]

**対象ファイル**:

- `lib/api-helpers.ts`（既存・変更）✅ 完了済み
- `lib/api-types.ts`（既存・変更）✅ 完了済み
- `lib/auth-config.ts`（既存・変更）✅ 完了済み
- `lib/blob.ts`（既存・変更）✅ 完了済み
- `lib/config.ts`（既存・変更）✅ 完了済み
- `lib/env.ts`（既存・変更）✅ 完了済み
- `lib/errors.ts`（既存・変更）✅ 完了済み
- `lib/logger.ts`（既存・変更）✅ 完了済み
- `lib/prisma.ts`（既存・変更）✅ 完了済み
- `lib/product-utils.ts`（既存・変更）✅ 完了済み
- `lib/products.ts`（既存・変更）✅ 完了済み
- `lib/utils.ts`（既存・変更）✅ 完了済み
- `lib/image-compression/` 配下の全ファイル（9個）✅ 完了済み

**修正方針**:

ライブラリコードは複雑なアルゴリズムや設計判断が含まれる可能性が高いため、慎重にコメントを精査する。重要な判断理由は残す。

**チェックリスト**:

- [o] libディレクトリのコメント整理（約20ファイル）

---

### タスク10: API Routes [完了]

**対象ファイル**:

- `app/api/auth/[...nextauth]/route.ts`（既存・変更）
- `app/api/categories/route.ts`（既存・変更）
- `app/api/products/route.ts`（既存・変更）
- `app/api/products/[id]/route.ts`（既存・変更）
- `app/api/products/[id]/delete.ts`（既存・変更）
- `app/api/products/[id]/get.ts`（既存・変更）
- `app/api/products/[id]/put-validation.ts`（既存・変更）
- `app/api/products/[id]/put.ts`（既存・変更）
- `app/api/products/reorder/route.ts`（既存・変更）
- `app/api/products/upload/route.ts`（既存・変更）

**修正方針**:

認証・バリデーション・エラーハンドリングの設計判断は残す。標準的なAPI実装の説明は削除。

**チェックリスト**:

- [o] 10個のAPI Routeのコメント整理

---

### タスク11: 設定ファイル・型定義 [完了]

**対象ファイル**:

- `auth.ts`（既存・変更）
- `app/types.ts`（既存・変更）
- `app/faq/data.ts`（既存・変更）
- `types/next-auth.d.ts`（既存・変更）

**修正方針**:

型定義の説明は、複雑な型の場合のみ残す。設定ファイルも同様。

**チェックリスト**:

- [o] `auth.ts` のコメント整理（コールバックのJSDocを削除）
- [o] `app/types.ts` のコメント整理（ファイル先頭と型定義のコメントを簡潔化）
- [o] `app/faq/data.ts` のコメント整理（冗長なコメントを削除）
- [o] `types/next-auth.d.ts` の確認（修正不要）

---

### タスク12: 動作確認・ビルドテスト [完了]

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [o] すべてのページが正常に表示されること
   - [o] ダッシュボードの機能が正常に動作すること

2. **ビルド確認** (`npm run build`)
   - [o] ビルドエラーがないこと
   - [o] TypeScriptエラーがないこと

3. **品質チェックリスト**（CLAUDE.md準拠）
   - [o] 不要なコメントは削除されているか？
   - [o] 初心者にわかりにくい箇所に簡潔な説明があるか？
   - [o] アプリ特有の設計判断に理由が記述されているか？
   - [o] コメントは簡潔で、日本語で記述されているか？

---

## 変更対象ファイル一覧

| カテゴリ                  | ファイル数 | ステータス |
| ------------------------- | :--------: | :--------: |
| ページコンポーネント      |     10     |    [o]     |
| トップレベルコンポーネント|      9     |    [o]     |
| ダッシュボード - フォーム |     10     |    [o]     |
| ダッシュボード - リスト   |      6     |    [o]     |
| ダッシュボード - レイアウト|      4     |    [o]     |
| ダッシュボード - フック   |      8     |    [o]     |
| ダッシュボード - ユーティリティ|  4     |    [o]     |
| UIコンポーネント          |     22     |    [o]     |
| ライブラリ/ユーティリティ |     20     |    [o]     |
| API Routes                |     10     |    [o]     |
| 設定ファイル・型定義      |      4     |    [o]     |

**合計**: 約110ファイル

---

## 備考

### 注意事項

- **`app/page.tsx` は修正済み**: この形式を参考に他のファイルを修正すること
- **並行作業可能**: タスク1〜11は独立しているため、複数人で並行作業できる
- **慎重に判断**: 削除して良いか迷ったら、残す方向で判断する
- **コミット単位**: タスクごとにコミットすることを推奨

### 参考

- 修正済みファイル: `app/page.tsx` (120行 → 62行に削減)
- コメント規則: `CLAUDE.md` の「## コメント規則」セクション

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
