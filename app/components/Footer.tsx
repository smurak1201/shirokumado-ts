import Image from "next/image";

/**
 * フッターコンポーネント
 * 店舗ロゴと店舗情報を表示
 */
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-12">
        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* ロゴセクション */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <Image
              src="/logo.webp"
              alt="白熊堂"
              width={120}
              height={45}
              className="h-auto w-auto"
              style={{ maxHeight: "4rem", maxWidth: "120px" }}
              quality={100}
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

          {/* 住所 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              住所
            </h3>
            <div className="space-y-1 text-sm leading-relaxed text-gray-600">
              <p>神奈川県川崎市川崎区小川町4-1</p>
              <p>ラチッタデッラ マッジョーレ1F</p>
            </div>
          </div>

          {/* 営業情報 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              営業情報
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              <div>
                <p className="font-medium text-gray-700">営業時間</p>
                <p className="font-medium">11:00～21:00(L.O.20:00)</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">定休日</p>
                <p className="font-medium">通年営業 月1回不定休</p>
              </div>
            </div>
          </div>

          {/* お問い合わせ */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              お問い合わせ
            </h3>
            <div className="space-y-1 text-sm leading-relaxed text-gray-600">
              <a
                href="tel:070-9157-3772"
                className="block transition-colors hover:text-gray-900"
              >
                070-9157-3772
              </a>
            </div>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-xs text-gray-500">© 2024 白熊堂</p>
        </div>
      </div>
    </footer>
  );
}
