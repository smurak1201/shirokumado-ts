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

/** 画像セクション */
function ImageSection({ image }: { image: AboutIceSection["images"][number] }) {
  return (
    <div className="relative mx-auto aspect-4/3 w-full overflow-hidden md:max-w-5xl">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 1024px, 100vw"
      />
    </div>
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
      className="mx-auto max-w-2xl px-6 py-12 md:py-16 lg:py-20"
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
    <main className="pb-12 md:pb-16">
      {/* ページタイトル: FAQページと統一したスタイル */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-4 pt-8 md:pt-12"
      >
        <h1 className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl">
          天然氷について
        </h1>
        <div className="h-px w-16 bg-border md:w-24" />
      </motion.div>

      {/* セクション: テキスト → 画像 の繰り返し */}
      {aboutIceSections.map((section) => (
        <div key={section.id}>
          <TextSection section={section} />
          {section.images.map((image) => (
            <ImageSection key={image.src} image={image} />
          ))}
        </div>
      ))}
    </main>
  );
}
