/**
 * ローディング画面コンポーネント
 *
 * loading.tsxとSuspense fallbackで再利用するための共通コンポーネント。
 *
 * 注意: SafariのストリーミングSSRには最小チャンクサイズ制限（約1KB）がある。
 * このコンポーネントのHTML出力が1KB未満だと、Safariで初回ロード時に
 * ローディング画面が表示されない可能性がある。
 * @see https://bugs.webkit.org/show_bug.cgi?id=252413
 */
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* 背景の装飾 - 淡い円形グラデーション */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-6 animate-fade-in relative z-10">
        {/* 白熊アイコン */}
        <div className="text-primary/80">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
            aria-hidden="true"
          >
            {/* 耳（左） */}
            <circle cx="16" cy="16" r="10" fill="currentColor" />
            <circle cx="16" cy="16" r="6" fill="white" fillOpacity="0.3" />
            {/* 耳（右） */}
            <circle cx="48" cy="16" r="10" fill="currentColor" />
            <circle cx="48" cy="16" r="6" fill="white" fillOpacity="0.3" />
            {/* 顔 */}
            <ellipse cx="32" cy="36" rx="24" ry="22" fill="currentColor" />
            {/* 目（左） */}
            <circle cx="24" cy="32" r="3" fill="white" fillOpacity="0.9" />
            <circle cx="25" cy="31" r="1" fill="currentColor" />
            {/* 目（右） */}
            <circle cx="40" cy="32" r="3" fill="white" fillOpacity="0.9" />
            <circle cx="41" cy="31" r="1" fill="currentColor" />
            {/* 鼻 */}
            <ellipse cx="32" cy="40" r="4" ry="3" fill="white" fillOpacity="0.7" />
            <ellipse cx="32" cy="39" r="2" ry="1.5" fill="currentColor" fillOpacity="0.5" />
          </svg>
        </div>

        {/* ロゴ・店名 */}
        <div className="text-center">
          <h1 className="text-2xl font-normal tracking-widest text-primary">
            白熊堂
          </h1>
          <p className="mt-1 text-xs tracking-wider text-muted-foreground">
            SHIROKUMADO
          </p>
        </div>

        {/* キャッチフレーズ */}
        <p className="text-sm text-muted-foreground/80 font-normal tracking-wide">
          ふわふわ氷の贅沢なひととき
        </p>

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
