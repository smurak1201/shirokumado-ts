/**
 * @fileoverview 商品フォーム価格フィールドコンポーネント - Sサイズ・Lサイズの価格入力
 *
 * ## 目的
 * - 商品のSサイズとLサイズの価格入力フィールドを提供
 * - 数値のみの入力制限とフォーマット処理
 * - カンマ区切り表示（1000 → 1,000）
 *
 * ## 主な機能
 * - Sサイズ価格入力（数値、カンマ区切り表示）
 * - Lサイズ価格入力（数値、カンマ区切り表示）
 * - キーボード入力制限（数値のみ許可）
 * - 自動フォーマット（カンマ挿入）
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductFormFields.tsx
 * - 商品作成・編集フォームの価格セクション
 *
 * ## 実装の特性
 * - **Client Component**: 親コンポーネントが "use client" を使用
 * - **数値バリデーション**: isNumericKey で数値以外のキー入力を防止
 * - **フォーマット処理**: formatPriceForInput でカンマ区切り表示
 * - **パース処理**: parsePrice でカンマを削除して数値文字列に変換
 *
 * ## なぜ type="text" を使うのか
 * - type="number" だとカンマ区切り表示ができない
 * - inputMode="numeric" でモバイル端末では数値キーボードを表示
 * - トレードオフ: カスタムバリデーションが必要だが、UXが向上
 *
 * ## lib/product-utils のヘルパー関数
 * - formatPriceForInput: 数値文字列をカンマ区切りに変換（1000 → "1,000"）
 * - parsePrice: カンマを削除して数値文字列に変換（"1,000" → "1000"）
 * - isNumericKey: 数値キー判定（0-9、Backspace、Delete など）
 */

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { formatPriceForInput, parsePrice, isNumericKey } from "@/lib/product-utils";
import type { ProductFormData } from "../../hooks/useProductForm";

/**
 * 商品価格フィールドのprops型定義
 *
 * @property formData - フォームの入力データ
 * @property setFormData - フォームデータの更新関数（React.useState のセッター）
 * @property fieldPrefix - input要素のid属性プレフィックス（id重複防止）。オプション、デフォルト: ""
 */
interface ProductPriceFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  fieldPrefix?: string;
}

/**
 * 商品フォームの価格フィールドコンポーネント
 *
 * SサイズとLサイズの価格入力フィールドを提供します。
 * 数値のみの入力を許可し、カンマ区切り表示（1,000円）に自動フォーマットします。
 *
 * @param props - ProductPriceFieldsProps型のプロップス
 * @returns 価格フィールドのJSX要素
 *
 * ## フィールドの構成
 * - grid grid-cols-2: 2列グリッドレイアウト（Sサイズ、Lサイズを横並び）
 * - gap-4: 列間のスペース
 *
 * ## 数値バリデーションの実装
 * 1. onKeyDown: キー入力時に数値以外を preventDefault で防止
 * 2. onChange: 入力内容をパースしてカンマを削除
 *
 * ## フォーマット処理の流れ
 * 1. ユーザーが "1000" と入力
 * 2. onKeyDown: 数値キーなので許可
 * 3. onChange: parsePrice("1000") → "1000"（カンマなし）
 * 4. setFormData で状態を更新
 * 5. 再レンダリング時: formatPriceForInput("1000") → "1,000"（カンマあり）
 *
 * ## なぜ onKeyDown で preventDefault するのか
 * - onChange だけだと、入力された文字が一瞬表示される
 * - onKeyDown で先に防ぐことで、スムーズなUXを実現
 */
export default function ProductPriceFields({
  formData,
  setFormData,
  fieldPrefix = "",
}: ProductPriceFieldsProps) {
  return (
    // 2列グリッドレイアウト: Sサイズ、Lサイズを横並びで表示
    // gap-4: 列間にスペースを配置
    <div className="grid grid-cols-2 gap-4">
      {/* Sサイズ価格フィールド */}
      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}priceS`}>Sサイズの料金（円）</Label>
        {/* type="text": カンマ区切り表示のため（type="number" だとカンマが使えない） */}
        {/* inputMode="numeric": モバイル端末で数値キーボードを表示 */}
        {/* value: formatPriceForInput でカンマ区切り表示（"1000" → "1,000"） */}
        <Input
          type="text"
          id={`${fieldPrefix}priceS`}
          inputMode="numeric"
          value={formatPriceForInput(formData.priceS)}
          // onKeyDown: キー入力時に数値以外を防止
          // isNumericKey: 0-9、Backspace、Delete、矢印キーなどを許可
          // preventDefault: 数値以外のキー入力を無効化
          onKeyDown={(e) => {
            if (!isNumericKey(e)) {
              e.preventDefault();
            }
          }}
          // onChange: 入力内容をパースしてフォーム状態に反映
          // parsePrice: カンマを削除して数値文字列に変換（"1,000" → "1000"）
          onChange={(e) => {
            const cleaned = parsePrice(e.target.value);
            // スプレッド演算子で既存データを保持し、priceS だけを更新
            setFormData((prev) => ({ ...prev, priceS: cleaned }));
          }}
        />
      </div>

      {/* Lサイズ価格フィールド */}
      {/* Sサイズと同じ実装（priceL フィールドを更新） */}
      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}priceL`}>Lサイズの料金（円）</Label>
        <Input
          type="text"
          id={`${fieldPrefix}priceL`}
          inputMode="numeric"
          value={formatPriceForInput(formData.priceL)}
          onKeyDown={(e) => {
            if (!isNumericKey(e)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const cleaned = parsePrice(e.target.value);
            setFormData((prev) => ({ ...prev, priceL: cleaned }));
          }}
        />
      </div>
    </div>
  );
}
