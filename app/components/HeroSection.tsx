"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import heroImage from "@/public/hero.webp";

/**
 * ヒーローセクションコンポーネント
 *
 * トップページのヒーロー画像を表示します。
 * Framer Motionを使用してフェードインアニメーションを実装しています。
 *
 * ## パララックス効果の仕組み（スマホ対応）
 * 参考: https://daian-kichijitsu.com/parallax/
 *
 * 1. 画像を`position: fixed`で画面に固定
 * 2. セクションに`clip-path: inset(0)`を設定し「窓」として機能させる
 * 3. スクロールすると窓（セクション）が動き、固定された画像の異なる部分が見える
 *
 * ## スマホ対応のポイント
 * - 画像サイズをCSS変数で渡し、セクションの高さを画像のアスペクト比に合わせる
 * - 画像コンテナの高さは「セクション高さ + ヘッダー高さ」でセクション全体をカバー
 *   （セクションはヘッダースペーサー分だけ下にあるため）
 * - 画像を変更してもCSS変数で自動対応（マジックナンバー不要）
 *
 * 関連ファイル:
 * - globals.css: パララックス効果のCSS定義
 * - page.tsx: ヘッダースペーサー（--header-height）
 */
export default function HeroSection() {
  return (
    <section
      className="hero-section relative w-full"
      style={
        {
          // 画像サイズをCSS変数として渡す（globals.cssでアスペクト比計算に使用）
          "--hero-width": heroImage.width,
          "--hero-height": heroImage.height,
        } as React.CSSProperties
      }
    >
      {/*
       * clip-pathで切り抜くコンテナ
       * このセクションが「窓」となり、固定された画像の一部だけが見える
       */}
      <div className="section-inner absolute inset-0 w-full h-full">
        {/*
         * パララックス効果用の背景画像
         * position: fixedで固定され、スクロールしても動かない
         * スタイルはglobals.cssの.hero-image-containerで定義
         */}
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
