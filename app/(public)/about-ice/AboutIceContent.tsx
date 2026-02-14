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
    <div className="relative aspect-4/3 w-full overflow-hidden">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        sizes="100vw"
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
      {/* ヒーロー画像 + タイトルオーバーレイ */}
      <section className="relative aspect-video w-full md:aspect-auto md:h-[60vh] lg:h-[70vh]">
        <Image
          src="/S__3301387.jpg"
          alt="日光の杉林に囲まれた天然氷の池"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <h1 className="text-2xl font-light tracking-widest text-white md:text-4xl lg:text-5xl">
            天然氷について
          </h1>
        </motion.div>
      </section>

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
