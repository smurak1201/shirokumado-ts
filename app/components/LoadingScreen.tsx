/**
 * ローディング画面コンポーネント
 *
 * loading.tsxとHomePageWrapperで再利用するための共通コンポーネント。
 */
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* ロゴ・店名 */}
        <div className="text-center">
          <h1 className="text-2xl font-light tracking-widest text-primary">
            白熊堂
          </h1>
          <p className="mt-1 text-xs tracking-wider text-muted-foreground">
            SHIROKUMADO
          </p>
        </div>

        {/* ドットスピナー */}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
        </div>

        {/* テキスト */}
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
