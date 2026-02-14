"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { config } from "@/lib/config";
import { aboutIceSections, type AboutIceSection } from "./data";

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
    },
  },
};

const childFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: config.animationConfig.FADE_IN_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};

/** フルブリード画像セクション（パララックス効果） */
function FullbleedImage({ image }: { image: AboutIceSection["images"][number] }) {
  return (
    <section className="about-ice-fullbleed relative w-full">
      <div className="section-inner absolute inset-0 h-full w-full">
        <div className="about-ice-fullbleed-image z-[-1]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
}

/** テキストセクション */
function TextSection({ section }: { section: AboutIceSection }) {
  return (
    <motion.section
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      className="mx-auto max-w-2xl px-6 py-16 md:py-24 lg:py-32"
    >
      <motion.h2
        variants={childFadeUp}
        className="mb-6 text-center text-xl font-medium tracking-wide text-foreground md:mb-8 md:text-2xl lg:text-3xl"
      >
        {section.title}
      </motion.h2>
      <div className="space-y-4 md:space-y-5">
        {section.paragraphs.map((paragraph, i) => (
          <motion.p
            key={i}
            variants={childFadeUp}
            className="text-sm leading-loose text-muted-foreground md:text-base lg:text-lg"
          >
            {paragraph}
          </motion.p>
        ))}
      </div>
    </motion.section>
  );
}

export default function AboutIceContent() {
  return (
    <main>
      {/* フルスクリーンヒーロー（パララックス） */}
      <section className="about-ice-hero relative w-full">
        <div className="section-inner absolute inset-0 h-full w-full">
          <motion.div
            className="about-ice-hero-image z-[-1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Image
              src="/S__3301387.jpg"
              alt="日光の杉林に囲まれた天然氷の池"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            {/* ダークオーバーレイ: テキストの視認性を確保 */}
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>

          {/* タイトル: 画面中央に配置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <h1 className="text-2xl font-light tracking-widest text-white md:text-4xl lg:text-5xl">
              天然氷について
            </h1>
          </motion.div>
        </div>
      </section>

      {/* セクション: テキスト → フルブリード画像 の繰り返し */}
      {aboutIceSections.map((section) => (
        <div key={section.id}>
          <TextSection section={section} />
          {section.images.map((image) => (
            <FullbleedImage key={image.src} image={image} />
          ))}
        </div>
      ))}
    </main>
  );
}
