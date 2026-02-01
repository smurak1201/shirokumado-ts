/**
 * ECサイト管理ダッシュボードページ（プレースホルダ）
 *
 * ## 目的
 * 将来実装予定のECサイト管理機能のプレースホルダーページです。
 * ユーザーに「準備中」であることを伝え、ダッシュボードへの戻り導線を提供します。
 *
 * ## 主な機能
 * - 準備中メッセージの表示（視覚的にわかりやすいアイコン付き）
 * - ダッシュボードへの戻りリンク
 *
 * ## 実装の特性
 * - **Server Component**: 静的コンテンツのみで状態管理が不要なため
 * - **将来の拡張**: ECサイト機能実装時にこのファイルを置き換える予定
 *
 * ## 今後の実装予定
 * - オンライン販売商品の管理
 * - 在庫管理
 * - 注文管理
 * - 配送設定
 *
 * @returns {JSX.Element} ECサイト管理ページのプレースホルダー
 */
import Link from 'next/link';

/**
 * ECサイト管理ダッシュボードページコンポーネント
 *
 * 準備中メッセージを中央に表示するシンプルなレイアウトです。
 *
 * @returns {JSX.Element} プレースホルダーページ
 */
export default function ShopDashboardPage() {
  return (
    // メインコンテナ
    // min-h-[calc(100vh-49px)]: ヘッダー高さ（49px）を除いた高さで画面全体を埋める
    // flex + items-center + justify-center: コンテンツを画面中央に配置
    <div className="flex min-h-[calc(100vh-49px)] items-center justify-center">
      {/* 準備中メッセージカード */}
      <div className="text-center">
        {/* アイコン: 🛒 ショッピングカートで機能を視覚的に示す */}
        {/* text-6xl: 大きく表示してユーザーの注意を引く */}
        <div className="mb-6 text-6xl">🛒</div>

        {/* ページタイトル */}
        {/* text-2xl font-bold: 重要な情報として強調 */}
        {/* text-gray-900: 最も濃い色でコントラストを確保 */}
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          ECサイト管理
        </h1>

        {/* 準備中メッセージ */}
        {/* text-gray-600: タイトルより控えめな色で階層を表現 */}
        <p className="mb-8 text-gray-600">
          このページは現在準備中です
        </p>

        {/* ダッシュボードへの戻りボタン */}
        {/*
          デザイン:
          - bg-gray-900: 明確なCTA（Call To Action）として目立たせる
          - hover:bg-gray-800: ホバー時に色を変えてインタラクティブ性を示す
          - active:scale-95: クリック時にボタンが押し込まれる感覚を与える
          - rounded-lg: 角丸でモダンな印象
          - px-6 py-3: 十分なクリック領域を確保（アクセシビリティ）
        */}
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-all hover:bg-gray-800 active:scale-95"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}
