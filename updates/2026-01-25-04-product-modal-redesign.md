# 商品モーダルウィンドウ モダン改修

**日付**: 2026-01-25
**ブランチ**: feature/product-modal-redesign
**対象**: 商品モーダル（`app/components/ProductModal.tsx`）
**ステータス**: 未着手
**完了日**: -

---

## 進捗状況

| #   | タスク                                   | 優先度 | ステータス | 備考 |
| --- | ---------------------------------------- | :----: | :--------: | ---- |
| 1   | Framer Motion によるモーダルアニメーション追加 |   高   |    [ ]     |      |
| 2   | 各セクションのスタガーアニメーション追加      |   高   |    [ ]     |      |
| 3   | 閉じるボタンのスタイル改善                   |   中   |    [ ]     |      |
| 4   | 画像セクションのホバーエフェクト追加          |   中   |    [ ]     |      |
| 5   | 価格セクションのデザイン改善                 |   中   |    [ ]     |      |
| 6   | 動作確認・ビルドテスト                       |   -    |    [ ]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

FAQページのモダン改修が完了し、アコーディオン形式とFramer Motionによるアニメーションが追加された。
商品モーダルウィンドウも同様にモダンなデザインに統一する必要がある。

### 課題

- **アニメーション不足**: 現在のモーダルはshadcn/uiデフォルトのアニメーションのみで、他のページと比較してインタラクションが乏しい
- **静的なUI**: 各セクション（画像、商品情報、価格）が静的に表示され、ユーザーの注目を集める演出がない
- **閉じるボタン**: デフォルトスタイルで、モーダル全体のデザインとの統一感が不足
- **ホバーエフェクト不足**: 画像セクションにホバー時のインタラクションがない

### 設計方針

- **Framer Motion活用**: FAQセクションと同様にFramer Motionを使用してアニメーションを追加
- **既存設定の再利用**: `lib/config.ts` の `animationConfig` を使用してアニメーション時間を統一
- **段階的な表示**: モーダル表示時に各セクションをスタガー（時間差）で表示
- **微細なインタラクション**: ホバー時の拡大やシャドウ変化で、インタラクティブな印象を与える
- **アクセシビリティ維持**: `prefers-reduced-motion` に対応し、モーション軽減設定を尊重

---

## タスク詳細

### タスク1: Framer Motion によるモーダルアニメーション追加

**対象ファイル**:

- `app/components/ProductModal.tsx`（既存・変更）

**問題点**:

現在はshadcn/ui のDialog デフォルトアニメーション（fade-in/zoom-in）のみ。
モーダルコンテンツ全体にFramer Motionのアニメーションを追加して、よりスムーズな表示を実現したい。

**修正内容**:

1. `framer-motion` から `motion` と `AnimatePresence` をインポート
2. モーダルコンテンツを `motion.div` でラップ
3. `initial`, `animate`, `exit` で表示・非表示アニメーションを定義

**実装例**:

```tsx
// app/components/ProductModal.tsx
"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { Product } from "../types";
import { formatPrice } from "@/lib/product-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { PriceBadge } from "./ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "./ui/card-modal";
import { config } from "@/lib/config";

// コンテナ全体のアニメーション
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
      delayChildren: 0.1,
    },
  },
};

// 各セクションのアニメーション
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

- [ ] `framer-motion` のインポート追加
- [ ] `containerVariants` と `itemVariants` を定義
- [ ] `config.animationConfig` から設定値を参照

---

### タスク2: 各セクションのスタガーアニメーション追加

**対象ファイル**:

- `app/components/ProductModal.tsx`（既存・変更）

**問題点**:

画像、商品情報、価格の3セクションが同時に表示される。
スタガー（時間差）で順次表示することで、ユーザーの視線を誘導したい。

**修正内容**:

1. 各セクション（ModalImageCard, ModalContentCard, ModalPriceCard）を `motion.div` でラップ
2. `variants={itemVariants}` を適用
3. 親コンテナに `variants={containerVariants}` を適用

**実装例**:

```tsx
// ProductModal.tsx の return 内
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden sm:rounded-lg">
    <ScrollArea className="max-h-[90vh]">
      <motion.div
        className="flex flex-col gap-4 p-4 md:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 画像部分 */}
        <motion.div variants={itemVariants}>
          <ModalImageCard>
            {/* 既存の画像コンテンツ */}
          </ModalImageCard>
        </motion.div>

        {/* 商品情報部分 */}
        <motion.div variants={itemVariants}>
          <ModalContentCard>
            {/* 既存の商品情報コンテンツ */}
          </ModalContentCard>
        </motion.div>

        {/* 価格部分 */}
        {(product.priceS || product.priceL) && (
          <motion.div variants={itemVariants}>
            <ModalPriceCard>
              {/* 既存の価格コンテンツ */}
            </ModalPriceCard>
          </motion.div>
        )}
      </motion.div>
    </ScrollArea>
  </DialogContent>
</Dialog>
```

**チェックリスト**:

- [ ] 親コンテナに `motion.div` と `containerVariants` を適用
- [ ] 各セクションを `motion.div` でラップ
- [ ] `itemVariants` を適用して順次表示

---

### タスク3: 閉じるボタンのスタイル改善

**対象ファイル**:

- `app/components/ui/dialog.tsx`（既存・変更）または
- `app/components/ProductModal.tsx`（カスタム閉じるボタンを追加）

**問題点**:

デフォルトの閉じるボタン（X アイコン）がモーダル右上に小さく配置されており、タップしにくい。
また、ホバー時のフィードバックが弱い。

**修正内容**:

閉じるボタンのスタイルを改善し、以下を実現：
- タップ領域を大きく（44x44px以上）
- 背景色とホバーエフェクトを追加
- アイコンサイズを少し大きく

**実装例（dialog.tsx を変更する場合）**:

```tsx
// app/components/ui/dialog.tsx（DialogContent 内の DialogPrimitive.Close）
<DialogPrimitive.Close
  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
  aria-label="閉じる"
>
  <X className="h-5 w-5" aria-hidden="true" />
  <span className="sr-only">閉じる</span>
</DialogPrimitive.Close>
```

**変更点**:

| 項目 | 変更前 | 変更後 |
| ---- | ------ | ------ |
| サイズ | 指定なし（アイコンサイズのみ） | `h-8 w-8`（32x32px） |
| 背景 | なし | `bg-background/80 backdrop-blur-sm` |
| ボーダー | なし | `border border-border/50` |
| ホバー | `hover:opacity-100` | `hover:opacity-100 hover:bg-accent hover:scale-110` |
| アイコン | `h-4 w-4` | `h-5 w-5` |

**チェックリスト**:

- [ ] 閉じるボタンのタップ領域を拡大
- [ ] 背景色とblurエフェクトを追加
- [ ] ホバー時のスケールアニメーションを追加

---

### タスク4: 画像セクションのホバーエフェクト追加

**対象ファイル**:

- `app/components/ProductModal.tsx`（既存・変更）

**問題点**:

画像セクションにホバー時のインタラクションがなく、静的な印象を与える。

**修正内容**:

画像コンテナにホバー時の微細なスケールアニメーションを追加。
Framer Motionの `whileHover` を使用して、滑らかなトランジションを実現。

**実装例**:

```tsx
// 画像部分を motion.div でラップし、whileHover を追加
<motion.div
  variants={itemVariants}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.3 }}
>
  <ModalImageCard className="cursor-pointer">
    <ModalCardHeader>
      <div className="relative h-[40vh] min-h-[200px] max-h-[450px] md:h-[45vh] md:max-h-[500px] overflow-hidden bg-muted">
        {product.imageUrl ? (
          <motion.div
            className="relative h-full w-full flex items-center justify-center p-4 md:p-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 672px"
              priority
            />
          </motion.div>
        ) : (
          <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
        )}
      </div>
    </ModalCardHeader>
  </ModalImageCard>
</motion.div>
```

**チェックリスト**:

- [ ] 画像カードに `whileHover` スケールエフェクトを追加
- [ ] 画像自体にも別のスケールエフェクトを追加（カードより大きめ）
- [ ] `transition` でアニメーション時間を指定

---

### タスク5: 価格セクションのデザイン改善

**対象ファイル**:

- `app/components/ProductModal.tsx`（既存・変更）
- `app/components/ui/card-modal.tsx`（必要に応じて変更）

**問題点**:

価格セクションのデザインが他のセクションと比較してシンプルすぎる。

**修正内容**:

1. 価格カードの背景にグラデーションを追加
2. 価格バッジの表示をより目立たせる
3. Sサイズ/Lサイズの区切り線をより洗練されたデザインに

**実装例**:

```tsx
// app/components/ui/card-modal.tsx - ModalPriceCard を改善
export function ModalPriceCard({ className, ...props }: ModalCardProps) {
  return (
    <Card
      className={cn(
        "border-0 shadow-sm",
        "bg-gradient-to-br from-primary/5 via-background to-primary/5",
        className
      )}
      {...props}
    />
  );
}
```

```tsx
// ProductModal.tsx - 価格部分のレイアウト改善
<ModalPriceCard>
  <ModalCardContent>
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
      {product.priceS && (
        <motion.div
          className="flex flex-col items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Small
          </span>
          <PriceBadge className="text-lg md:text-xl">
            {formatPrice(product.priceS)}
          </PriceBadge>
        </motion.div>
      )}
      {product.priceS && product.priceL && (
        <div className="flex flex-col items-center">
          <Separator orientation="vertical" className="h-12 md:h-16 bg-border/50" />
        </div>
      )}
      {product.priceL && (
        <motion.div
          className="flex flex-col items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Large
          </span>
          <PriceBadge className="text-lg md:text-xl">
            {formatPrice(product.priceL)}
          </PriceBadge>
        </motion.div>
      )}
    </div>
  </ModalCardContent>
</ModalPriceCard>
```

**変更点**:

| 項目 | 変更前 | 変更後 |
| ---- | ------ | ------ |
| 背景 | `bg-muted/30` | グラデーション `from-primary/5 via-background to-primary/5` |
| サイズラベル | `S` / `L` | `Small` / `Large` |
| ラベルスタイル | `font-normal` | `font-medium tracking-widest` |
| 価格ホバー | なし | `whileHover={{ scale: 1.05 }}` |
| ギャップ | `gap-3 md:gap-6` | `gap-6 md:gap-10` |

**チェックリスト**:

- [ ] ModalPriceCard の背景にグラデーションを追加
- [ ] サイズラベルの表記を `Small` / `Large` に変更
- [ ] 価格部分にホバーエフェクトを追加
- [ ] ギャップを調整してゆとりを持たせる

---

### タスク6: 動作確認・ビルドテスト

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [ ] モーダルが開く際にアニメーションが動作すること
   - [ ] 各セクションが順次表示されること（スタガー）
   - [ ] 閉じるボタンのホバーエフェクトが動作すること
   - [ ] 画像セクションのホバーエフェクトが動作すること
   - [ ] 価格セクションのホバーエフェクトが動作すること

2. **スマホ確認**
   - [ ] タッチ操作でモーダルが開閉すること
   - [ ] 閉じるボタンがタップしやすいこと（44x44px以上）
   - [ ] アニメーションがスムーズであること
   - [ ] スクロールが正常に動作すること

3. **ビルド確認** (`npm run build`)
   - [ ] ビルドエラーがないこと
   - [ ] TypeScriptエラーがないこと

4. **アクセシビリティ確認**
   - [ ] ESCキーでモーダルが閉じること
   - [ ] フォーカストラップが正常に動作すること
   - [ ] `prefers-reduced-motion` でアニメーションが軽減されること

---

## 変更対象ファイル一覧

| ファイル                            | 変更内容                               | ステータス |
| ----------------------------------- | -------------------------------------- | :--------: |
| `app/components/ProductModal.tsx`   | Framer Motion アニメーション追加       |    [ ]     |
| `app/components/ui/card-modal.tsx`  | ModalPriceCard のグラデーション追加    |    [ ]     |
| `app/components/ui/dialog.tsx`      | 閉じるボタンのスタイル改善             |    [ ]     |

---

## 備考

### 既存コンポーネントの活用

- Framer Motion は既にプロジェクトで使用中（FAQSection, HeroSection, ProductGrid等）
- `config.animationConfig` の設定値を再利用してアニメーション時間を統一

### パフォーマンス考慮

- `will-change` プロパティは使用しない（Framer Motionが自動最適化）
- 画像には `priority` 属性を維持（モーダル表示時のLCP改善）
- ホバーエフェクトは控えめなスケール値（1.02〜1.05）を使用

### 参考実装

- FAQセクション: `app/components/FAQSection.tsx`（スタガーアニメーションの参考）
- ProductGrid: `app/components/ProductGrid.tsx`（アニメーション設定の参考）

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

全タスク完了後:

1. ステータスを「未着手」→「完了」に変更
2. 完了日を追記
3. 実際に変更したファイル一覧を確認・更新
4. 検証結果をチェックリストに記入

```markdown
**ステータス**: 完了
**完了日**: YYYY-MM-DD
```
