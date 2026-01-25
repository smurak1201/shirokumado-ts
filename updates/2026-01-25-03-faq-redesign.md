# FAQページ モダン改修

**日付**: 2026-01-25
**ブランチ**: feature/faq-redesign
**対象**: FAQページ（app/faq/page.tsx）
**ステータス**: 未着手
**完了日**: -

---

## 進捗状況

| #   | タスク                                | 優先度 | ステータス | 備考 |
| --- | ------------------------------------- | :----: | :--------: | ---- |
| 1   | アコーディオン形式への変更            |   高   |    [ ]     |      |
| 2   | FAQセクションコンポーネントの作成     |   中   |    [ ]     |      |
| 3   | ページタイトルのアニメーション追加    |   中   |    [ ]     |      |
| 4   | FAQ項目のスクロールアニメーション追加 |   中   |    [ ]     |      |
| 5   | アコーディオン用スタイルの調整        |   低   |    [ ]     |      |
| 6   | 動作確認・ビルドテスト                |   -    |    [ ]     |      |

**凡例**: `[ ]` 未着手 / `[~]` 作業中 / `[o]` 完了

---

## 改修の目的

### 背景

現在のFAQページは、全ての質問と回答が展開された状態で表示されている。
質問数が12件あり、スクロール量が多くなっている。

### 課題

- **ユーザビリティ**: 目的の質問を探すのに時間がかかる
- **スマホ体験**: スクロール量が多く、回答を読み終わる前に次の質問が視界に入る
- **統一感**: トップページのモダンなデザインと比較して、シンプルすぎる

### 改修方針

- **アコーディオン形式**: 質問のみ表示し、タップで回答を展開
- **アニメーション追加**: トップページと同様のスタガーアニメーション
- **既存コンポーネント活用**: shadcn/ui の Accordion コンポーネントを使用
- **定数の再利用**: `lib/config.ts` のアニメーション設定を使用

---

## タスク詳細

### タスク1: アコーディオン形式への変更

**対象ファイル**:

- `app/faq/page.tsx`

**問題点**:
現在は `FAQCard` を使用して全ての質問・回答が展開された状態で表示されている。

**修正内容**:

既存の shadcn/ui `Accordion` コンポーネントを使用してアコーディオン形式に変更。

**実装例**:

```tsx
// app/faq/page.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { QuestionBadge } from "../components/ui/badge-question";
import { faqs } from "./data";

// FAQ一覧部分を以下のように変更
<Accordion type="single" collapsible className="space-y-3">
  {faqs.map((faq, index) => (
    <AccordionItem
      key={faq.question}
      value={`faq-${index}`}
      className="rounded-lg border border-border/60 px-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 data-[state=open]:border-primary/40"
    >
      <AccordionTrigger className="gap-3 py-4 hover:no-underline md:gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <QuestionBadge>Q{index + 1}</QuestionBadge>
          <span className="text-left text-base font-normal leading-relaxed text-foreground md:text-lg">
            {faq.question}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="ml-0 pb-2 md:ml-12">
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {faq.answer}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>;
```

**チェックリスト**:

- [ ] FAQCard から Accordion への変更
- [ ] `type="single" collapsible` で1つずつ開閉可能に
- [ ] QuestionBadge のスタイル維持
- [ ] ホバー時のスタイル適用

---

### タスク2: FAQセクションコンポーネントの作成

**対象ファイル**:

- `app/components/FAQSection.tsx`（新規作成）
- `app/faq/page.tsx`

**問題点**:
アニメーションを追加するには Client Component が必要。
page.tsx を Client Component にするのではなく、セクションを分離する。

**修正内容**:

`FAQSection.tsx` を新規作成し、Framer Motion によるアニメーションを実装。

**実装例**:

```tsx
// app/components/FAQSection.tsx（新規作成）
"use client";

import { motion, type Variants } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { QuestionBadge } from "./ui/badge-question";
import { config } from "@/lib/config";
import type { FAQ } from "@/app/faq/data";

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

interface FAQSectionProps {
  faqs: FAQ[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
    >
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div key={faq.question} variants={itemVariants}>
            <AccordionItem
              value={`faq-${index}`}
              className="rounded-lg border border-border/60 px-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 data-[state=open]:border-primary/40"
            >
              <AccordionTrigger className="gap-3 py-4 hover:no-underline md:gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <QuestionBadge>Q{index + 1}</QuestionBadge>
                  <span className="text-left text-base font-normal leading-relaxed text-foreground md:text-lg">
                    {faq.question}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="ml-0 pb-2 md:ml-12">
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {faq.answer}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  );
}
```

**page.tsx の変更**:

```tsx
// app/faq/page.tsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Separator } from "../components/ui/separator";
import FAQSection from "../components/FAQSection";
import { faqs } from "./data";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-20" />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        {/* ページタイトル */}
        <div className="mb-10 flex flex-col items-center gap-4 md:mb-12">
          <h1 className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl">
            よくある質問
          </h1>
          <Separator className="w-20 md:w-32" />
        </div>

        {/* FAQ一覧（アニメーション付き） */}
        <FAQSection faqs={faqs} />
      </main>

      <Footer />
    </div>
  );
}
```

**チェックリスト**:

- [ ] `FAQSection.tsx` を新規作成
- [ ] `page.tsx` で FAQSection を使用
- [ ] アニメーション設定を `config` から参照

---

### タスク3: ページタイトルのアニメーション追加

**対象ファイル**:

- `app/components/FAQSection.tsx`（または新規コンポーネント）

**問題点**:
ページタイトル部分にもアニメーションを追加したい。

**修正内容**:

タイトル部分を `motion.div` でラップし、フェードインアニメーションを追加。

**実装例（FAQSection.tsx に統合する場合）**:

```tsx
// FAQSection.tsx に titleVariants を追加
const titleVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: config.animationConfig.SCROLL_ANIMATION_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};

// FAQSectionProps を拡張
interface FAQSectionProps {
  faqs: FAQ[];
  showTitle?: boolean;
}

// コンポーネント内でタイトルも含める
export default function FAQSection({
  faqs,
  showTitle = true,
}: FAQSectionProps) {
  return (
    <>
      {showTitle && (
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 flex flex-col items-center gap-4 md:mb-12"
        >
          <h1 className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl">
            よくある質問
          </h1>
          <Separator className="w-20 md:w-32" />
        </motion.div>
      )}

      {/* FAQ一覧（既存のコード） */}
    </>
  );
}
```

**チェックリスト**:

- [ ] タイトル用の `titleVariants` を追加
- [ ] タイトル部分を `motion.div` でラップ
- [ ] `showTitle` prop で表示/非表示を制御可能に

---

### タスク4: FAQ項目のスクロールアニメーション追加

**対象ファイル**:

- `app/components/FAQSection.tsx`

**問題点**:
タスク2で基本的なアニメーションは実装されるが、詳細な調整が必要。

**修正内容**:

- `whileInView` でスクロール時にアニメーション発火
- `viewport: { once: true }` で一度だけアニメーション
- `staggerChildren` で順次表示

**注意点**:

- トップページの `ProductGrid` と同様のアニメーション設定を使用
- `config.animationConfig` から定数を参照

**チェックリスト**:

- [ ] `whileInView` の設定確認
- [ ] `staggerChildren` の動作確認
- [ ] スマホでの動作確認

---

### タスク5: アコーディオン用スタイルの調整

**対象ファイル**:

- `app/components/ui/accordion.tsx`（または FAQSection 内でカスタマイズ）

**問題点**:
デフォルトの Accordion スタイルを FAQ ページに合わせて調整が必要。

**修正内容**:

- `AccordionItem` の border-bottom を削除（カード形式にするため）
- ホバー時のスタイルを追加
- 開閉時のボーダーカラー変更

**実装例（AccordionItem のクラス）**:

```tsx
// FAQSection.tsx 内の AccordionItem
<AccordionItem
  value={`faq-${index}`}
  className={cn(
    "rounded-lg border border-border/60 px-4",
    "transition-all duration-300",
    "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
    "data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5"
  )}
>
```

**チェックリスト**:

- [ ] AccordionItem のスタイル調整
- [ ] ホバー効果の確認
- [ ] 開閉状態のスタイル確認
- [ ] ダークモード対応確認（該当する場合）

---

### タスク6: 動作確認・ビルドテスト

**確認項目**:

1. **ローカル確認** (`npm run dev`)
   - [ ] アコーディオンが正常に開閉すること
   - [ ] アニメーションが正常に動作すること
   - [ ] スクロール時にFAQ項目が順次フェードインすること
   - [ ] ホバー時のスタイルが適用されること

2. **スマホ確認**
   - [ ] タップで開閉が正常に動作すること
   - [ ] アニメーションがスムーズであること
   - [ ] パフォーマンスに問題がないこと

3. **ビルド確認** (`npm run build`)
   - [ ] ビルドエラーがないこと
   - [ ] TypeScriptエラーがないこと

4. **アクセシビリティ確認**
   - [ ] キーボード操作で開閉可能なこと
   - [ ] スクリーンリーダーで正しく読み上げられること
   - [ ] `prefers-reduced-motion` が適用されること

---

## 変更対象ファイル一覧

| ファイル                        | 変更内容                             | ステータス |
| ------------------------------- | ------------------------------------ | :--------: |
| `app/faq/page.tsx`              | FAQSection への置き換え              |    [ ]     |
| `app/components/FAQSection.tsx` | **新規作成** - アニメーション付きFAQ |    [ ]     |

### 削除候補ファイル

| ファイル                               | 理由                                     | ステータス |
| -------------------------------------- | ---------------------------------------- | :--------: |
| `app/components/ui/card-faq.tsx`       | Accordion 形式に変更後、不要になる可能性 |    [ ]     |
| `app/components/ui/badge-question.tsx` | FAQSection 内で直接スタイル適用する場合  |    [ ]     |

**注意**: 削除候補ファイルは、他の場所で使用されていないことを確認してから削除すること。

---

## 備考

### 既存コンポーネントの活用

- shadcn/ui の `Accordion` コンポーネントは既に導入済み
- `aria-hidden="true"` が ChevronDown アイコンに設定済み（タスク4で対応済み）

### トップページとの統一感

- アニメーション設定は `config.animationConfig` を再利用
- ホバー効果は `primary` カラーを使用（淡いブルー）
- `staggerChildren` で順次表示

### パフォーマンス考慮

- `whileInView` で画面内に入ったときのみアニメーション
- `viewport: { once: true }` で一度だけ実行
- Framer Motion が `prefers-reduced-motion` を自動サポート

---

## 実装後の更新

### 進捗状況の更新

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
