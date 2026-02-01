/**
 * @fileoverview 商品フォームフィールドコンポーネント - 入力フィールドの統合
 *
 * ## 目的
 * - 商品作成・編集フォームの入力フィールドを統合的に管理
 * - フィールドコンポーネントの配置とpropsの受け渡し
 * - 責務の分離（各フィールドの詳細は子コンポーネントで管理）
 *
 * ## 主な機能
 * - 基本情報フィールド（商品名、説明、カテゴリー）の表示
 * - 画像フィールド（画像選択、プレビュー）の表示
 * - 価格フィールド（Sサイズ、Lサイズ）の表示
 * - 日付フィールド（公開日、終了日、公開状態）の表示
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductForm.tsx
 * - 商品作成・編集フォームのフィールド集約
 *
 * ## 実装の特性
 * - **Client Component**: 親コンポーネントが "use client" を使用
 * - **コンポーネント分割**: 各フィールドグループを独立したコンポーネントに分離
 * - **props リレー**: 親から受け取ったpropsを子コンポーネントに渡す
 *
 * ## コンポーネント構成
 * - ProductBasicFields: 商品名、説明、カテゴリー
 * - ProductImageField: 画像選択とプレビュー
 * - ProductPriceFields: Sサイズ価格、Lサイズ価格
 * - ProductDateFields: 公開日、終了日、公開状態
 *
 * ## なぜフィールドを分割したのか
 * - **責務の分離**: 各フィールドグループのロジックを独立して管理
 * - **再利用性**: 特定のフィールドグループだけを他の場所で使用可能
 * - **保守性**: フィールド追加・修正時の影響範囲を限定
 * - **トレードオフ**: コンポーネント数が増えるが、各コンポーネントはシンプルになる
 */

import type { Category } from "../../types";
import type { ProductFormData } from "../../hooks/useProductForm";
import ProductDateFields from "./ProductDateFields";
import ProductImageField from "./ProductImageField";
import ProductPriceFields from "./ProductPriceFields";
import ProductBasicFields from "./ProductBasicFields";

/**
 * 商品フォームフィールドのprops型定義
 *
 * @property formData - フォームの入力データ
 * @property setFormData - フォームデータの更新関数（React.useState のセッター）
 * @property categories - カテゴリー一覧（ドロップダウンで使用）
 * @property submitting - 送信中フラグ（true: API送信中、フィールド無効化用）
 * @property uploading - 画像アップロード中フラグ（true: アップロード中）
 * @property compressing - 画像圧縮中フラグ（true: 圧縮中）
 * @property imagePreview - 画像プレビューURL（Object URL または HTTP URL）
 * @property onImageChange - 画像選択時の処理（圧縮とプレビュー生成）
 * @property hasDateRangeValue - 公開期間が設定されているか（公開状態の手動変更を制御）
 * @property fieldPrefix - input要素のid属性プレフィックス（id重複防止）。オプション、デフォルト: ""
 */
interface ProductFormFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  submitting: boolean;
  uploading: boolean;
  compressing: boolean;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasDateRangeValue: boolean;
  fieldPrefix?: string;
}

/**
 * 商品フォームフィールドコンポーネント
 *
 * 商品作成・編集フォームで使用する入力フィールドを統合的に管理します。
 * 各フィールドグループを独立したコンポーネントに分割し、propsを受け渡します。
 *
 * @param props - ProductFormFieldsProps型のプロップス
 * @returns フォームフィールドのJSX要素
 *
 * ## フィールドの配置順序
 * 1. ProductBasicFields: 商品名、説明、カテゴリー
 * 2. ProductImageField: 画像選択とプレビュー
 * 3. ProductPriceFields: Sサイズ価格、Lサイズ価格
 * 4. ProductDateFields: 公開日、終了日、公開状態
 *
 * ## フィールド順序の理由
 * - **基本情報を最初**: 商品名は必須項目で最も重要
 * - **画像を中央**: 視覚的なフィードバックを得やすい位置
 * - **価格を後半**: 数値入力は集中力が必要なため後に配置
 * - **日付を最後**: 公開設定はオプションで優先度が低い
 *
 * ## React Fragment の使用
 * - <></> で複数の子コンポーネントをラップ
 * - 理由: 不要な div 要素を追加しないため（余計なDOM階層を避ける）
 */
export default function ProductFormFields({
  formData,
  setFormData,
  categories,
  submitting,
  uploading,
  compressing,
  imagePreview,
  onImageChange,
  hasDateRangeValue,
  fieldPrefix = "",
}: ProductFormFieldsProps) {
  return (
    <>
      {/* 基本情報フィールド: 商品名、説明、カテゴリー */}
      {/* formData, setFormData: フォームの状態管理 */}
      {/* categories: カテゴリー選択ドロップダウンの選択肢 */}
      {/* fieldPrefix: input要素のid属性プレフィックス（id重複防止） */}
      <ProductBasicFields
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        fieldPrefix={fieldPrefix}
      />

      {/* 画像フィールド: 画像選択とプレビュー */}
      {/* submitting, uploading, compressing: ローディング状態（ボタン無効化用） */}
      {/* imagePreview: 選択された画像のプレビューURL */}
      {/* onImageChange: 画像選択時の処理（圧縮とプレビュー生成） */}
      <ProductImageField
        fieldPrefix={fieldPrefix}
        submitting={submitting}
        uploading={uploading}
        compressing={compressing}
        imagePreview={imagePreview}
        onImageChange={onImageChange}
      />

      {/* 価格フィールド: Sサイズ価格、Lサイズ価格 */}
      {/* formData.priceS, formData.priceL: 文字列形式の価格（入力値） */}
      {/* setFormData: 価格変更時の状態更新 */}
      <ProductPriceFields
        formData={formData}
        setFormData={setFormData}
        fieldPrefix={fieldPrefix}
      />

      {/* 日付フィールド: 公開日、終了日、公開状態 */}
      {/* formData.publishedAt, formData.endedAt: ISO 8601形式の日時文字列 */}
      {/* hasDateRangeValue: 公開期間が設定されているか（公開状態の手動変更を制御） */}
      {/* 理由: 公開期間が設定されている場合、公開状態は自動計算される */}
      <ProductDateFields
        formData={formData}
        setFormData={setFormData}
        hasDateRangeValue={hasDateRangeValue}
        fieldPrefix={fieldPrefix}
      />
    </>
  );
}
