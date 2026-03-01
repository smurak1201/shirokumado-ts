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
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <FixedHeader />
      {/*
       * position:fixed のヘッダーに対応するスペーサー
       * fixedは通常フローから外れるため、このスペーサーがないと
       * 下のコンテンツがヘッダーの裏に隠れてしまう
       */}
      <div style={{ height: "var(--header-height)" }} />
      <div className="flex flex-1 flex-col">
        {children}
      </div>
      <Footer />
      {modal}
    </div>
  );
}
