/**
 * ヒーローセクションコンポーネント
 *
 * トップページの最上部に表示される、パララックス効果を持つヒーロー画像セクション。
 *
 * ## パララックス効果の仕組み(スマホ対応)
 * 1. 画像を`position: fixed`で画面に固定
 * 2. セクションに`clip-path: inset(0)`を設定し「窓」として機能させる
 * 3. スクロールすると窓(セクション)が動き、固定された画像の異なる部分が見える
 *
 * 参考: https://daian-kichijitsu.com/parallax/
 */
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import heroImage from "@/public/hero.webp";

export default function HeroSection() {
  return (
    <section
      className="hero-section relative w-full"
      style={
        {
          // 画像サイズをCSS変数として渡す(globals.cssでアスペクト比計算に使用)
          "--hero-width": heroImage.width,
          "--hero-height": heroImage.height,
        } as React.CSSProperties
      }
    >
      <div className="section-inner absolute inset-0 w-full h-full">
        {/*
         * パララックス効果用の背景画像コンテナ
         * .hero-image-container クラス(globals.css で定義):
         * - position: fixed で画面に固定
         * - 高さは「セクション高さ + ヘッダー高さ」で計算
         */}
        <motion.div
          className="hero-image-container z-[-1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Image
            src={heroImage}
            alt="ヒーロー画像"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-linear-to-b from-sky-100/20 via-transparent to-white/40" />
        </motion.div>
      </div>
    </section>
  );
}
