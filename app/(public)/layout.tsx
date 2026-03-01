/**
 * 公開サイト用レイアウト
 *
 * 全公開ページ共通のFixedHeader + スペーサー + Footerを配置。
 * Parallel Routesの@modalスロットを受け取り、
 * メインコンテンツと並列にモーダルを描画する。
 */
import FixedHeader from "@/app/components/FixedHeader";
import Footer from "@/app/components/Footer";

export default function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FixedHeader />
      {/*
       * position:fixed のヘッダーに対応するスペーサー
       * fixedは通常フローから外れるため、このスペーサーがないと
       * 下のコンテンツがヘッダーの裏に隠れてしまう
       */}
      <div style={{ height: "var(--header-height)" }} />
      {children}
      <Footer />
      {modal}
    </div>
  );
}
