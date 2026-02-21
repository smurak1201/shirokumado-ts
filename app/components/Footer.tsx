/**
 * フッターコンポーネント
 *
 * 全ページ共通のフッター。店舗情報と Googleマップを表示する。
 */
import Image from "next/image";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { Card, CardHeader } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { cn } from "@/lib/utils";
import LazyGoogleMap from "./LazyGoogleMap";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-linear-to-b from-background to-muted/20 py-12 md:py-16 lg:py-20 overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-8 flex items-center gap-3 sm:gap-4 md:gap-5">
          <Link
            href="/"
            className="transition-all hover:opacity-80 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <Image
              src="/logo.svg"
              alt="白熊堂"
              width={120}
              height={45}
              className="h-auto w-20 md:w-25"
            />
          </Link>
          <a
            href="https://www.instagram.com/shirokumado2021/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center rounded-full p-2 transition-all",
              "hover:bg-accent hover:scale-110 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Instagram"
          >
            <Image
              src="/logo-instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
            />
          </a>
        </div>

        <div className="grid grid-cols-4 gap-1 md:gap-6">
          <div className="space-y-1 md:space-y-3">
            <p className="text-[8px] font-normal uppercase tracking-wider text-foreground md:text-sm">
              住所
            </p>
            <div className="space-y-0.5 text-[8px] leading-relaxed text-muted-foreground md:text-sm">
              <p>神奈川県川崎市川崎区小川町4-1</p>
              <p>ラチッタデッラ マッジョーレ1F</p>
            </div>
          </div>

          <div className="space-y-1 md:space-y-3">
            <p className="text-[8px] font-normal uppercase tracking-wider text-foreground md:text-sm">
              営業情報
            </p>
            <div className="space-y-1 text-[8px] leading-relaxed text-muted-foreground md:text-sm">
              <div>
                <p className="font-medium text-foreground/90">営業時間</p>
                <p>11:00～21:00(L.O.20:00)</p>
              </div>
              <div>
                <p className="font-medium text-foreground/90">定休日</p>
                <p>通年営業 月1回不定休</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 md:space-y-3">
            <p className="text-[8px] font-normal uppercase tracking-wider text-foreground md:text-sm">
              お問い合わせ
            </p>
            <div className="space-y-0.5 text-[8px] leading-relaxed text-muted-foreground md:text-sm">
              <a
                href="tel:070-9157-3772"
                className={cn(
                  "block font-medium transition-all active:scale-95",
                  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                )}
              >
                070-9157-3772
              </a>
            </div>
          </div>

          <div>
            <Card className="overflow-hidden border-border/60 transition-all duration-500">
              <CardHeader className="p-0">
                <AspectRatio ratio={4 / 3} className="overflow-hidden">
                  <LazyGoogleMap />
                </AspectRatio>
              </CardHeader>
            </Card>
          </div>
        </div>

        <Separator className="my-12" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2021-{new Date().getFullYear()} 白熊堂
          </p>
        </div>
      </div>
    </footer>
  );
}
