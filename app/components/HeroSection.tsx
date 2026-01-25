"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * ヒーローセクションコンポーネント
 *
 * トップページのヒーロー画像を表示します。
 * Framer Motionを使用してフェードインアニメーションを実装しています。
 * デスクトップではCSSのみでパララックス効果を実現（スマホでは通常表示）。
 * 参考: https://daian-kichijitsu.com/parallax/
 */
export default function HeroSection() {
  return (
    <section className="relative h-[40vh] min-h-[75px] w-full overflow-hidden md:h-[60vh] md:min-h-[125px] lg:h-[70vh] lg:min-h-[150px]">
      {/* スマホ用: 通常のImageコンポーネント */}
      <div className="md:hidden absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="/hero.webp"
            alt="白熊堂"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        {/* グラデーションオーバーレイ - 淡いブルー系 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute inset-0 bg-linear-to-b from-sky-100/20 via-transparent to-white/40"
        />
      </div>

      {/* デスクトップ用: パララックス効果 */}
      <div className="hidden md:block section-inner absolute inset-0 w-full h-full">
        {/* パララックス効果用の背景画像（position: fixedで固定） */}
        <div className="hero-bg fixed top-0 left-0 z-[-1] w-full h-screen bg-cover bg-center bg-no-repeat" />
        
        {/* フェードインアニメーション用のmotion.div */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* グラデーションオーバーレイ - 淡いブルー系 */}
          <div className="absolute inset-0 bg-linear-to-b from-sky-100/20 via-transparent to-white/40" />
        </motion.div>
      </div>
    </section>
  );
}
