/**
 * FAQページ (app/faq/page.tsx)
 *
 * よくある質問と回答をアコーディオン形式で一覧表示するページです。
 *
 * 主な機能:
 * - アコーディオン形式による質問と回答の表示
 * - レスポンシブ対応のレイアウト（モバイルファースト）
 * - 固定ヘッダーとフッターによる一貫したナビゲーション
 *
 * 実装の特性:
 * - Server Component（静的コンテンツのため、サーバー側でレンダリング）
 * - データは静的ファイル（data.ts）から取得
 *
 * データ構造:
 * - FAQデータは `app/faq/data.ts` で管理
 * - 質問と回答のペアを配列で定義
 * - データの追加・変更はdata.tsを編集するだけで反映
 *
 * 注意点:
 * - ヘッダーはposition:fixed のため、スペーサー（h-20）が必要
 * - FAQSectionコンポーネントはshowTitle propsでタイトル表示を制御可能
 */
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import FAQSection from "../components/FAQSection";
import { faqs } from "./data";

/**
 * FAQページコンポーネント
 *
 * よくある質問と回答を表示する専用ページです。
 * ヘッダー、FAQセクション、フッターで構成されます。
 *
 * レイアウト構成:
 * - ヘッダー: ロゴ、Instagramリンク、ナビゲーション（固定表示）
 * - メインコンテンツ: FAQ一覧（アコーディオン形式、アニメーション付き）
 * - フッター: 店舗情報、地図、連絡先
 *
 * レスポンシブ対応:
 * - モバイル: px-4, py-8（コンパクトな余白）
 * - タブレット: px-6, py-12（中程度の余白）
 * - デスクトップ: px-8, py-16（広い余白）
 *
 * 最大幅: max-w-4xl（読みやすさを重視した幅制限）
 */
export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      {/*
       * ヘッダー（position: fixedで画面上部に固定）
       * 理由: スクロール時も常に表示することで、他のページへのナビゲーションを確保
       */}
      <FixedHeader />

      {/*
       * ヘッダースペーサー
       * 必要な理由: ヘッダーはposition: fixedで固定されているため、通常のフローから外れる
       * このスペーサー（h-20 = 80px）がないと、FAQコンテンツがヘッダーの裏に隠れる
       * 高さ20は FixedHeader の高さに対応（Tailwind: h-20 = 5rem = 80px）
       */}
      <div className="h-20" />

      {/*
       * メインコンテンツ
       * FAQを読みやすく表示するためのレイアウト
       *
       * max-w-4xl: 最大幅を1024pxに制限
       * 理由: 質問と回答は文章量が多いため、行が長すぎると読みづらい
       * 一般的に、可読性の観点から1行60-80文字程度が適切
       *
       * レスポンシブパディング:
       * px-4 (モバイル): 左右16px
       * md:px-6 (タブレット): 左右24px
       * lg:px-8 (デスクトップ): 左右32px
       *
       * py-8/py-12/py-16: 縦方向の余白（上下の適度なスペース確保）
       */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        {/*
         * FAQ一覧セクション
         *
         * showTitle={true}: ページタイトル「よくある質問」を表示
         * 理由: FAQページでは明確なタイトルが必要
         *
         * faqs: app/faq/data.ts から取得した質問と回答のデータ
         * アコーディオン形式で表示され、クリックで回答を展開
         */}
        <FAQSection faqs={faqs} showTitle={true} />
      </main>

      {/*
       * フッター
       * サイト情報、店舗情報、連絡先を提供
       * すべてのページで一貫したフッターを表示することでユーザーに安心感を与える
       */}
      <Footer />
    </div>
  );
}
