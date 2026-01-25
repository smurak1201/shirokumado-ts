"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * ヒーローセクションコンポーネント
 *
 * トップページのヒーロー画像を表示します。
 * Framer Motionを使用してフェードインアニメーションを実装しています。
 * スクロールに応じてパララックス効果を適用します。
 */
export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        // セクションがビューポート内にある場合のみパララックス効果を適用
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          const currentScrollY = window.scrollY;
          // スクロール位置の変化が小さい場合は更新をスキップ（モバイル最適化）
          if (Math.abs(currentScrollY - lastScrollYRef.current) > 1) {
            setScrollY(currentScrollY);
            lastScrollYRef.current = currentScrollY;
          }
        }
      }
    };

    // 初期値を設定
    handleScroll();
    lastScrollYRef.current = window.scrollY;

    // requestAnimationFrameでスムーズに更新
    const onScroll = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // パララックス効果: スクロール量の50%だけ画像を移動
  const parallaxY = scrollY * 0.5;

  return (
    <section
      ref={sectionRef}
      className="relative h-[40vh] min-h-[75px] w-full overflow-hidden md:h-[60vh] md:min-h-[125px] lg:h-[70vh] lg:min-h-[150px]"
    >
      {/* パララックス効果用のコンテナ */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(0, ${parallaxY}px, 0)`,
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* フェードインアニメーション用のmotion.div */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Image
            src="/hero.webp"
            alt="白熊堂"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            style={{
              objectPosition: "center center",
            }}
          />
        </motion.div>
      </div>
      {/* グラデーションオーバーレイ - 淡いブルー系 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute inset-0 bg-linear-to-b from-sky-100/20 via-transparent to-white/40"
      />
    </section>
  );
}
