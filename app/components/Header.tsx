import Link from "next/link";
import Image from "next/image";

/**
 * ヘッダーコンポーネント
 *
 * 全ページ共通のヘッダーを表示します。
 * - 左上: ロゴ画像（トップページへのリンク）とInstagramアイコン
 * - 右上: ナビゲーションリンク（よくある質問）
 *
 * Server Component として実装されており、静的なコンテンツを表示します。
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-20 overflow-visible bg-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        {/* 左側: ロゴとInstagramアイコン */}
        <div className="relative flex items-center gap-3 overflow-visible">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              priority
              className="h-auto w-auto max-h-20 lg:max-h-20"
              style={{ maxWidth: "120px", maxHeight: "45px" }}
            />
          </Link>
          <a
            href="https://www.instagram.com/shirokumado2021/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center transition-opacity hover:opacity-80"
            aria-label="Instagram"
          >
            <Image
              src="/logo-instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-6 w-6 text-gray-900 md:h-7 md:w-7"
            />
          </a>
        </div>

        {/* 右側: ナビゲーションリンク */}
        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/faq"
            className="text-sm text-gray-700 transition-colors hover:text-gray-900 md:text-base"
          >
            よくある質問
          </Link>
        </nav>
      </div>
      {/* 下線 */}
      <div className="h-px bg-gray-200" />
    </header>
  );
}
