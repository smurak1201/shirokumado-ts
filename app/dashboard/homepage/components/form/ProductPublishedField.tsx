/**
 * @fileoverview 商品フォーム公開状態フィールドコンポーネント - 公開/非公開の選択
 *
 * ## 目的
 * - 商品の公開状態（公開/非公開）を選択するラジオボタンを提供
 * - 公開期間が設定されている場合、手動変更を無効化
 * - 公開状態の自動計算についての説明表示
 *
 * ## 主な機能
 * - 公開/非公開のラジオボタン
 * - 公開期間設定時の無効化
 * - 無効化時の説明メッセージ表示
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductDateFields.tsx
 * - 商品作成・編集フォームの公開設定セクション
 *
 * ## 実装の特性
 * - **Client Component**: "use client" ディレクティブ使用
 * - **条件付き無効化**: hasDateRangeValue が true の場合、手動変更を防止
 * - **視覚的フィードバック**: 無効時はテキストをグレーアウト
 *
 * ## 公開状態の自動計算について
 * - hasDateRangeValue が true: 公開日または終了日が設定されている
 * - useProductForm で公開状態を自動計算
 * - 理由: 公開期間と公開状態の不整合を防ぐ
 *
 * ## なぜ手動変更を無効化するのか
 * - 公開期間が設定されている場合、公開状態は期間から自動判定される
 * - 手動で変更すると、期間と状態が不整合になる可能性
 * - トレードオフ: 柔軟性は低下するが、データの整合性が向上
 */

"use client";

import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import type { ProductFormData } from "../../hooks/useProductForm";

/**
 * 商品公開状態フィールドのprops型定義
 *
 * @property formData - フォームの入力データ
 * @property setFormData - フォームデータの更新関数（React.useState のセッター）
 * @property hasDateRangeValue - 公開期間が設定されているか（手動変更を制御）
 * @property fieldPrefix - input要素のid属性プレフィックス（id重複防止）。オプション、デフォルト: ""
 */
interface ProductPublishedFieldProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  hasDateRangeValue: boolean;
  fieldPrefix?: string;
}

/**
 * 商品フォームの公開情報フィールドコンポーネント
 *
 * 公開・非公開のラジオボタンを提供します。
 * 公開日・終了日が設定されている場合、公開情報は自動的に判定されます。
 *
 * @param props - ProductPublishedFieldProps型のプロップス
 * @returns 公開状態フィールドのJSX要素
 *
 * ## フィールドの構成
 * - RadioGroup: 公開/非公開の選択
 * - 説明メッセージ: 公開期間が設定されている場合のみ表示
 *
 * ## value の変換
 * - formData.published が true の場合: "published"
 * - formData.published が false の場合: "unpublished"
 * - 理由: RadioGroup は文字列を扱うため、boolean を文字列に変換
 *
 * ## onValueChange の処理
 * - value が "published" の場合: published を true に設定
 * - value が "unpublished" の場合: published を false に設定
 *
 * ## disabled の効果
 * - hasDateRangeValue が true の場合、ラジオボタンを無効化
 * - 理由: 公開期間が設定されている場合、公開状態は自動計算される
 * - 視覚的フィードバック: テキストがグレーアウト（text-gray-400）
 */
export default function ProductPublishedField({
  formData,
  setFormData,
  hasDateRangeValue,
  fieldPrefix = "",
}: ProductPublishedFieldProps) {
  return (
    <div className="space-y-2">
      <Label>公開情報</Label>

      {/* shadcn/ui の RadioGroup コンポーネント */}
      {/* value: 選択された値（"published" または "unpublished"） */}
      {/* onValueChange: 選択時にフォーム状態を更新 */}
      {/* disabled: 公開期間が設定されている場合、手動変更を無効化 */}
      {/* className="flex items-center gap-4": ラジオボタンを横並びで配置 */}
      <RadioGroup
        value={formData.published ? "published" : "unpublished"}
        onValueChange={(value) =>
          // value が "published" の場合 true、それ以外は false
          setFormData((prev) => ({ ...prev, published: value === "published" }))
        }
        disabled={hasDateRangeValue}
        className="flex items-center gap-4"
      >
        {/* 公開ラジオボタン */}
        <div className="flex items-center space-x-2">
          {/* RadioGroupItem: ラジオボタンの円形UI */}
          <RadioGroupItem value="published" id={`${fieldPrefix}published-true`} />

          {/* Label: ラジオボタンのラベル */}
          {/* htmlFor: label をクリックするとラジオボタンが選択される */}
          {/* className: フォントスタイルと無効時のグレーアウト */}
          {/*   - font-normal: 通常のフォントウェイト */}
          {/*   - text-gray-400: 無効時はグレーアウト */}
          {/*   - cursor-pointer: 有効時はポインターカーソル */}
          <Label
            htmlFor={`${fieldPrefix}published-true`}
            className={`font-normal ${hasDateRangeValue ? "text-gray-400" : "cursor-pointer"}`}
          >
            公開
          </Label>
        </div>

        {/* 非公開ラジオボタン */}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="unpublished" id={`${fieldPrefix}published-false`} />
          <Label
            htmlFor={`${fieldPrefix}published-false`}
            className={`font-normal ${hasDateRangeValue ? "text-gray-400" : "cursor-pointer"}`}
          >
            非公開
          </Label>
        </div>
      </RadioGroup>

      {/* 説明メッセージ: 公開期間が設定されている場合のみ表示 */}
      {/* hasDateRangeValue が true の場合、ユーザーに理由を説明 */}
      {/* text-xs: 小さいフォントサイズ */}
      {/* text-gray-500: グレーのテキスト（補足情報として） */}
      {hasDateRangeValue && (
        <p className="text-xs text-gray-500">
          公開日・終了日が設定されているため、公開情報は自動的に判定されます
        </p>
      )}
    </div>
  );
}
