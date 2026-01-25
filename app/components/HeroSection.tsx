"use client";

import { motion } from "framer-motion";

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
    <section className="relative h-[40vh] min-h-[75px] w-full md:h-[60vh] md:min-h-[125px] lg:h-[70vh] lg:min-h-[150px] sm:h-[50vh] sm:min-h-[200px]">
      {/* セクションの内側コンテナ（clip-pathで切り抜き） */}
      <div className="section-inner absolute inset-0 w-full h-full">
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
