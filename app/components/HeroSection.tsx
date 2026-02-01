/**
 * ヒーローセクションコンポーネント (app/components/HeroSection.tsx)
 *
 * トップページの最上部に表示される、視覚的に印象的なヒーロー画像セクションです。
 *
 * 主な機能:
 * - パララックス効果によるスクロール演出（スマホ対応）
 * - フェードインアニメーション（画像とオーバーレイ）
 * - グラデーションオーバーレイによる視覚効果
 * - レスポンシブ対応（画像のアスペクト比を自動計算）
 *
 * 実装の特性:
 * - Client Component（framer-motion によるアニメーションのため）
 * - next/image による画像の自動最適化
 * - priority 読み込み（ヒーロー画像は最初に表示されるため）
 * - CSS 変数で画像サイズを渡して、globals.css でアスペクト比を計算
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
 * ベストプラクティス:
 * - CSS 変数（--hero-width, --hero-height）でマジックナンバーを回避
 * - globals.css でパララックス効果の CSS を一元管理
 * - グラデーションオーバーレイで画像とコンテンツのコントラストを調整
 *
 * 関連ファイル:
 * - globals.css: パララックス効果のCSS定義（.hero-section, .hero-image-container）
 * - app/page.tsx: ヘッダースペーサー（--header-height）
 * - public/hero.webp: ヒーロー画像
 */
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import heroImage from "@/public/hero.webp";

/**
 * ヒーローセクションコンポーネント
 *
 * トップページのヒーロー画像を表示します。
 * パララックス効果とフェードインアニメーションを実装しています。
 *
 * 構成要素:
 * - セクションコンテナ: CSS 変数で画像サイズを渡す
 * - クリップコンテナ: clip-path で「窓」として機能
 * - 画像コンテナ: position: fixed でパララックス効果を実現
 * - オーバーレイ: グラデーションで画像の視覚効果を調整
 */
export default function HeroSection() {
  /**
   * ヒーローセクションのコンテナ
   *
   * .hero-section クラス:
   * - globals.css で定義されたパララックス効果の CSS が適用される
   * - clip-path: inset(0) で「窓」として機能
   * - height: calc(...) で画像のアスペクト比に応じた高さを自動計算
   *
   * CSS 変数の設定:
   * - --hero-width: 画像の幅（next/image の metadata から取得）
   * - --hero-height: 画像の高さ（next/image の metadata から取得）
   * - これらの値は globals.css でアスペクト比の計算に使用される
   *
   * 利点:
   * - 画像を変更しても、CSS 変数が自動的に更新される
   * - マジックナンバーを避けて、保守性が向上
   */
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
       * クリップコンテナ (.section-inner)
       *
       * パララックス効果の「窓」として機能:
       * - absolute inset-0: 親要素（section）全体を覆う
       * - この要素がスクロールと共に移動することで、
       *   固定された背景画像の異なる部分が見える仕組み
       */}
      <div className="section-inner absolute inset-0 w-full h-full">
        {/*
         * パララックス効果用の背景画像コンテナ
         *
         * .hero-image-container クラス（globals.css で定義）:
         * - position: fixed で画面に固定
         * - 高さは「セクション高さ + ヘッダー高さ」で計算
         * - スクロールしても画像は動かず、窓（セクション）が動く
         *
         * z-[-1]: 他の要素の背後に配置（オーバーレイの下）
         *
         * アニメーション:
         * - initial: 初期状態（透明）
         * - animate: アニメーション後の状態（不透明）
         * - duration: 1秒かけてゆったりとフェードイン
         * - ease: "easeOut" で自然な減速カーブ
         */}
        <motion.div
          className="hero-image-container z-[-1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/*
           * ヒーロー画像
           *
           * next/image による最適化:
           * - fill: 親要素いっぱいに画像を表示
           * - object-cover: アスペクト比を維持しつつ、領域全体を覆う
           * - object-center: 画像の中央を基準に配置
           * - priority: 優先的に読み込み（LCP 向上）
           *   - 理由: ヒーロー画像は最初に表示される重要な要素
           * - sizes="100vw": 画面幅いっぱいに表示
           *
           * alt 属性:
           * - スクリーンリーダーと SEO のため、適切な代替テキストを設定
           */}
          <Image
            src={heroImage}
            alt="ヒーロー画像"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>

        {/*
         * グラデーションオーバーレイのコンテナ
         *
         * アニメーション:
         * - 画像と独立してフェードイン（duration: 0.8秒）
         * - 理由: 画像（1秒）よりわずかに早く完了することで、
         *   レイヤー感のある視覚効果を実現
         *
         * absolute inset-0: 画像コンテナ全体を覆う
         */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/*
           * グラデーションオーバーレイ
           *
           * bg-linear-to-b: 上から下へのグラデーション
           *   - from-sky-100/20: 上側は淡いブルーの20%透明度
           *   - via-transparent: 中央は透明
           *   - to-white/40: 下側は白の40%透明度
           *
           * 意図:
           * - 上側の淡いブルーでヘッダーとの境界を柔らかく
           * - 下側の白でコンテンツエリアへの自然な遷移を作る
           * - 中央は透明で画像本来の色を活かす
           *
           * デザインの理由:
           * - 画像の色が濃すぎる場合に、オーバーレイで調整
           * - ヘッダーやコンテンツとのコントラストを確保
           */}
          <div className="absolute inset-0 bg-linear-to-b from-sky-100/20 via-transparent to-white/40" />
        </motion.div>
      </div>
    </section>
  );
}
