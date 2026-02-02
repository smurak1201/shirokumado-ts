/**
 * ローディングページ
 *
 * (public)ルートグループ内のページ遷移時に表示されるローディング状態。
 * テーマカラー（淡いブルー）を使用したスピナーを中央に配置。
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
