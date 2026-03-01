/**
 * 公開サイト用レイアウト
 *
 * Parallel Routesの@modalスロットを受け取り、
 * メインコンテンツと並列にモーダルを描画する。
 */
export default function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
