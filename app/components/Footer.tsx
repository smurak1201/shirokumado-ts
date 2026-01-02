import Image from "next/image";

/**
 * フッターコンポーネント
 * 店舗ロゴと店舗情報を表示
 */
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
          {/* ロゴ */}
          <div className="flex flex-col gap-4">
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              className="h-auto w-auto max-h-16"
            />
            <a
              href="https://www.instagram.com/shirokumado2021/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center justify-center transition-opacity hover:opacity-80"
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

          {/* 店舗情報 */}
          <div className="flex flex-col gap-4 text-sm text-gray-700 md:text-base">
            <div className="space-y-1">
              <p className="font-medium text-gray-900">住所</p>
              <p>神奈川県川崎市川崎区小川町4-1</p>
              <p>ラチッタデッラ マッジョーレ1F</p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-gray-900">営業時間</p>
              <p>11:00～21:00(L.O.20:00)</p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-gray-900">電話番号</p>
              <a
                href="tel:070-9157-3772"
                className="transition-colors hover:text-gray-900"
              >
                070-9157-3772
              </a>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-gray-900">定休日</p>
              <p>通年営業 月1回不定休</p>
            </div>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          <p>© 2024 白熊堂</p>
        </div>
      </div>
    </footer>
  );
}
