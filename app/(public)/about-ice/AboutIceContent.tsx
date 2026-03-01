"use client";

import Image from "next/image";
import { aboutIceSections, type AboutIceSection } from "./data";
import { useInView } from "@/app/hooks/useInView";
import { scrollAnimationClass } from "@/lib/animation";

/**
 * コンテンツセクション
 * モバイル: テキスト -> 画像の縦積み
 * md以上: テキストと画像を横並び（奇数/偶数で左右を入れ替え）
 */
function ContentSection({
  section,
  index,
}: {
  section: AboutIceSection;
  index: number;
}) {
  const isReversed = index % 2 !== 0;
  const { ref, isInView } = useInView({ margin: "0px 0px -80px 0px" });

  return (
    <section
      ref={ref}
      className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16 lg:py-20"
    >
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12 lg:gap-16">
        {/* テキスト */}
        <div className={isReversed ? "md:order-2" : ""}>
          <h2
            className={`${scrollAnimationClass(isInView)} mb-6 text-lg font-normal tracking-wide text-foreground md:text-xl lg:text-2xl`}
          >
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`${scrollAnimationClass(isInView, i)} text-sm leading-loose text-muted-foreground md:text-base`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* 画像 */}
        <div
          className={`${scrollAnimationClass(isInView, section.paragraphs.length)} ${isReversed ? "md:order-1" : ""}`}
        >
          {section.images.map((image) => (
            <div
              key={image.src}
              className="relative aspect-4/3 overflow-hidden rounded-lg"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutIceContent() {
  return (
    <main className="pb-12 md:pb-16">
      {/* ページタイトル: FAQページと統一したスタイル */}
      <div className="animate-page-title mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 pt-8 md:px-8 md:pt-12">
        <h1 className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl">
          天然氷について
        </h1>
        <div className="h-px w-16 bg-border md:w-24" />
        <p className="mt-6 max-w-lg text-center text-sm leading-relaxed text-muted-foreground md:text-base">
          天然氷とは、冬の厳しい寒さのなかで、山の湧水をじっくりと時間をかけて凍らせた氷のこと。機械で急速に作られる氷とはまったく異なる、自然の力だけが生み出す特別な氷です。
        </p>
      </div>

      {aboutIceSections.map((section, index) => (
        <ContentSection key={section.id} section={section} index={index} />
      ))}
    </main>
  );
}
