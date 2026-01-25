"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * ヒーローセクションコンポーネント
 *
 * トップページのヒーロー画像を表示します。
 * Framer Motionを使用してフェードインアニメーションを実装しています。
 * スクロールに応じてパララックス効果を適用します。
 * モバイルでもスムーズに動作するよう最適化されています。
 */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const parallaxElement = parallaxRef.current;
    if (!parallaxElement || !sectionRef.current) return;

    // Intersection Observerでビューポート内にある時だけ処理を実行
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isScrollingRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0 }
    );

    observer.observe(sectionRef.current);

    // パララックス効果を適用する関数
    const updateParallax = () => {
      if (!isScrollingRef.current || !parallaxElement) return;

      const scrollY = window.scrollY;
      const scrollDelta = Math.abs(scrollY - lastScrollYRef.current);

      // モバイルでは更新頻度を下げる（スクロール変化が3px以上の場合のみ更新）
      const threshold = window.innerWidth < 768 ? 3 : 1;
      if (scrollDelta < threshold) {
        return;
      }

      const sectionRect = sectionRef.current?.getBoundingClientRect();
      if (sectionRect) {
        // セクションがビューポート内にある場合のみパララックス効果を適用
        if (sectionRect.bottom >= 0 && sectionRect.top <= window.innerHeight) {
          // モバイルでは係数を小さくして滑らかに
          const parallaxSpeed = window.innerWidth < 768 ? 0.3 : 0.5;
          const parallaxY = scrollY * parallaxSpeed;

          // refを直接操作してReactの再レンダリングを避ける
          parallaxElement.style.transform = `translate3d(0, ${parallaxY}px, 0)`;
          lastScrollYRef.current = scrollY;
        }
      }
    };

    // requestAnimationFrameでスムーズに更新
    const onScroll = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(updateParallax);
    };

    // 初期値を設定
    updateParallax();
    lastScrollYRef.current = window.scrollY;

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[40vh] min-h-[75px] w-full overflow-hidden md:h-[60vh] md:min-h-[125px] lg:h-[70vh] lg:min-h-[150px]"
    >
      {/* パララックス効果用のコンテナ */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "translate3d(0, 0, 0)",
        }}
      >
        {/* フェードインアニメーション用のmotion.div */}
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
