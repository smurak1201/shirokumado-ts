"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import heroImage from "@/public/hero.webp";

/**
 * ヒーローセクションコンポーネント
 *
 * トップページのヒーロー画像を表示します。
 * Framer Motionを使用してフェードインアニメーションを実装しています。
 * CSSのみでパララックス効果を実現（スマホ対応）。
 * 参考: https://daian-kichijitsu.com/parallax/
 */
export default function HeroSection() {
  return (
    <section
      className="hero-section relative w-full"
      style={
        {
          "--hero-width": heroImage.width,
          "--hero-height": heroImage.height,
        } as React.CSSProperties
      }
    >
      {/* セクションの内側コンテナ（clip-pathで切り抜き） */}
      <div className="section-inner absolute inset-0 w-full h-full">
        {/* パララックス効果用の背景画像（position: fixedで固定） */}
        <div className="hero-image-container z-[-1]">
          <Image
            src={heroImage}
            alt="ヒーロー画像"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

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
