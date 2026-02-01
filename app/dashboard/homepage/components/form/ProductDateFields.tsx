/**
 * @fileoverview 商品フォーム日付フィールドコンポーネント - 公開期間と公開状態の管理
 *
 * ## 目的
 * - 商品の公開期間（公開日・終了日）と公開状態の入力フィールドを提供
 * - 公開期間が設定されている場合、公開状態を自動計算
 * - 公開日・終了日のクリア機能
 *
 * ## 主な機能
 * - 公開状態フィールド（公開/非公開のラジオボタン）
 * - 公開日入力（日付+時刻、デフォルト11:00）
 * - 終了日入力（日付+時刻、デフォルト20:00）
 * - 日付クリアボタン
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductFormFields.tsx
 * - 商品作成・編集フォームの公開設定セクション
 *
 * ## 実装の特性
 * - **Client Component**: 親コンポーネントが "use client" を使用
 * - **公開状態の自動計算**: hasDateRangeValue が true の場合、手動変更を無効化
 * - **レスポンシブレイアウト**: モバイルは縦並び、デスクトップは横並び
 *
 * ## コンポーネント構成
 * - ProductPublishedField: 公開状態のラジオボタン
 * - ProductDateInput: 日付+時刻の入力フィールド（公開日、終了日）
 *
 * ## 公開状態の自動計算について
 * - hasDateRangeValue が true: 公開日または終了日が設定されている
 * - 公開状態は useProductForm で自動計算される
 * - 理由: 公開期間と公開状態の不整合を防ぐ
 *
 * ## デフォルト時刻の理由
 * - 公開日: 11:00（午前11時）
 *   - 理由: 朝の準備が整った時間帯に公開することが多い
 * - 終了日: 20:00（午後8時）
 *   - 理由: 営業終了時刻に合わせることが多い
 */

import type { ProductFormData } from "../../hooks/useProductForm";
import ProductPublishedField from "./ProductPublishedField";
import ProductDateInput from "./ProductDateInput";

/**
 * 商品日付フィールドのprops型定義
 *
 * @property formData - フォームの入力データ
 * @property setFormData - フォームデータの更新関数（React.useState のセッター）
 * @property hasDateRangeValue - 公開期間が設定されているか（公開状態の手動変更を制御）
 * @property fieldPrefix - input要素のid属性プレフィックス（id重複防止）。オプション、デフォルト: ""
 */
interface ProductDateFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  hasDateRangeValue: boolean;
  fieldPrefix?: string;
}

/**
 * 商品フォームの日付フィールドコンポーネント
 *
 * 公開日・終了日の入力フィールドと公開状態の選択を提供します。
 * 公開期間が設定されている場合、公開状態は自動計算され、手動変更できません。
 *
 * @param props - ProductDateFieldsProps型のプロップス
 * @returns 日付フィールドのJSX要素
 *
 * ## フィールドの構成
 * 1. ProductPublishedField: 公開状態のラジオボタン
 * 2. 公開日・終了日: 2列グリッドレイアウト（モバイルは1列）
 *
 * ## レスポンシブレイアウト
 * - grid-cols-1: モバイルは1列（縦並び）
 * - md:grid-cols-2: デスクトップは2列（横並び）
 * - gap-4: 列間にスペースを配置
 *
 * ## 公開日・終了日の onChange ハンドラー
 * - setFormData で publishedAt または endedAt を更新
 * - useProductForm のカスタム setFormData が公開状態を自動計算
 * - 理由: 日付変更時に公開状態を再計算するため
 *
 * ## React Fragment の使用
 * - <></> で複数の要素をラップ
 * - 理由: 不要な div 要素を追加しない
 */
export default function ProductDateFields({
  formData,
  setFormData,
  hasDateRangeValue,
  fieldPrefix = "",
}: ProductDateFieldsProps) {
  return (
    <>
      {/* 公開状態フィールド: 公開/非公開のラジオボタン */}
      {/* hasDateRangeValue が true の場合、手動変更が無効化される */}
      <ProductPublishedField
        formData={formData}
        setFormData={setFormData}
        hasDateRangeValue={hasDateRangeValue}
        fieldPrefix={fieldPrefix}
      />

      {/* 公開日・終了日のグリッドレイアウト */}
      {/* モバイル: 1列（縦並び）、デスクトップ: 2列（横並び） */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 公開日入力フィールド */}
        {/* defaultTime="11:00": 日付のみ入力した場合、時刻は午前11時に設定 */}
        <ProductDateInput
          id={`${fieldPrefix}publishedAt`}
          label="公開日"
          value={formData.publishedAt}
          // onChange: 日付または時刻が変更されたら publishedAt を更新
          // useProductForm のカスタム setFormData が公開状態を自動計算
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, publishedAt: value }))
          }
          // onClear: クリアボタンをクリックしたら publishedAt を空文字に設定
          onClear={() =>
            setFormData((prev) => ({ ...prev, publishedAt: "" }))
          }
          ariaLabel="公開日をクリア"
          defaultTime="11:00" // 日付のみ入力時のデフォルト時刻（午前11時）
        />

        {/* 終了日入力フィールド */}
        {/* defaultTime="20:00": 日付のみ入力した場合、時刻は午後8時に設定 */}
        <ProductDateInput
          id={`${fieldPrefix}endedAt`}
          label="終了日"
          value={formData.endedAt}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, endedAt: value }))
          }
          onClear={() => setFormData((prev) => ({ ...prev, endedAt: "" }))}
          ariaLabel="終了日をクリア"
          defaultTime="20:00" // 日付のみ入力時のデフォルト時刻（午後8時）
        />
      </div>
    </>
  );
}
