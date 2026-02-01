/**
 * @fileoverview アスペクト比コンポーネント
 *
 * ## 概要
 * shadcn/ui ベースのアスペクト比維持コンポーネント
 * Radix UI の AspectRatio Primitive をベースに構築されています。
 *
 * ## 主な機能
 * - 指定したアスペクト比（縦横比）でコンテンツを表示
 * - レスポンシブ対応（画面サイズに応じて自動リサイズ）
 * - 画像や動画の表示に最適
 *
 * ## 実装の特性
 * - Client Component（"use client"）
 * - Radix UI AspectRatio を使用してアスペクト比を維持
 *
 * ## 使用例
 * ```tsx
 * // 16:9 のアスペクト比で画像を表示
 * <AspectRatio ratio={16 / 9}>
 *   <Image src="..." alt="..." fill className="object-cover" />
 * </AspectRatio>
 *
 * // 1:1 (正方形) のアスペクト比
 * <AspectRatio ratio={1}>
 *   <div className="bg-muted">正方形コンテンツ</div>
 * </AspectRatio>
 *
 * // 4:3 のアスペクト比
 * <AspectRatio ratio={4 / 3}>
 *   <iframe src="..." />
 * </AspectRatio>
 * ```
 *
 * @see https://ui.shadcn.com/docs/components/aspect-ratio
 * @see https://www.radix-ui.com/docs/primitives/components/aspect-ratio
 */
"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

// Radix UI AspectRatio Primitive のラッパーをエクスポート
const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
