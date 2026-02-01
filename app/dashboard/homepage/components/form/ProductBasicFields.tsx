/**
 * @fileoverview 商品フォーム基本フィールドコンポーネント - 商品名・説明・カテゴリー
 *
 * ## 目的
 * - 商品の基本情報（商品名、説明、カテゴリー）の入力フィールドを提供
 * - 必須項目のバリデーション表示
 * - カテゴリー選択のドロップダウン
 *
 * ## 主な機能
 * - 商品名入力（Textarea、2行、必須）
 * - 商品説明入力（Textarea、6行、必須）
 * - カテゴリー選択（Select、必須）
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductFormFields.tsx
 * - 商品作成・編集フォームの基本情報セクション
 *
 * ## 実装の特性
 * - **Client Component**: 親コンポーネントが "use client" を使用
 * - **必須項目**: すべてのフィールドが必須（赤いアスタリスク表示）
 * - **リアルタイム更新**: onChange で即座にフォーム状態を更新
 *
 * ## フィールドの設計
 * - **商品名 Textarea**: Input ではなく Textarea を使用
 *   - 理由: 商品名が長い場合、複数行で表示したい
 *   - rows={2}: 2行分の高さを確保
 * - **商品説明 Textarea**: 複数行の説明文を入力
 *   - rows={6}: 6行分の高さを確保
 * - **カテゴリー Select**: shadcn/ui の Select コンポーネント
 *   - 理由: ドロップダウンで選択肢を表示、アクセシビリティ対応
 *
 * ## なぜ required 属性を使うのか
 * - HTML5 の標準バリデーション機能
 * - フォーム送信時、ブラウザが自動的にバリデーション
 * - トレードオフ: カスタムバリデーションメッセージが表示されない
 */

"use client";

import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { Category } from "../../types";
import type { ProductFormData } from "../../hooks/useProductForm";

/**
 * 商品基本フィールドのprops型定義
 *
 * @property formData - フォームの入力データ
 * @property setFormData - フォームデータの更新関数（React.useState のセッター）
 * @property categories - カテゴリー一覧（ドロップダウンで使用）
 * @property fieldPrefix - input要素のid属性プレフィックス（id重複防止）。オプション、デフォルト: ""
 */
interface ProductBasicFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  fieldPrefix?: string;
}

/**
 * 商品フォームの基本フィールドコンポーネント
 *
 * 商品名、説明、カテゴリーの入力フィールドを提供します。
 * すべてのフィールドが必須項目で、赤いアスタリスク（*）で表示されます。
 *
 * @param props - ProductBasicFieldsProps型のプロップス
 * @returns 基本フィールドのJSX要素
 *
 * ## フィールドの構成
 * 1. 商品名: Textarea（2行、必須）
 * 2. 商品説明: Textarea（6行、必須）
 * 3. カテゴリー: Select（ドロップダウン、必須）
 *
 * ## onChange ハンドラーの実装
 * - setFormData((prev) => ({ ...prev, フィールド名: 新しい値 }))
 * - 理由: 既存のフォームデータを保持しつつ、特定のフィールドだけを更新
 * - スプレッド演算子 (...prev) で既存データをコピー
 *
 * ## React Fragment の使用
 * - <></> で複数の div をラップ
 * - 理由: 不要な div 要素を追加しない（余計なDOM階層を避ける）
 */
export default function ProductBasicFields({
  formData,
  setFormData,
  categories,
  fieldPrefix = "",
}: ProductBasicFieldsProps) {
  return (
    <>
      {/* 商品名フィールド */}
      {/* space-y-2: label と input の間にスペースを配置 */}
      <div className="space-y-2">
        {/* htmlFor: label をクリックすると対応する input にフォーカス */}
        {/* text-red-500: 必須項目を示す赤いアスタリスク */}
        <Label htmlFor={`${fieldPrefix}name`}>
          商品名 <span className="text-red-500">*</span>
        </Label>
        {/* Textarea を使用: 商品名が長い場合、複数行で表示 */}
        {/* id: fieldPrefix を付与して id 重複を防ぐ（作成と編集が同時に存在する場合） */}
        {/* required: HTML5 バリデーション（フォーム送信時に必須チェック） */}
        {/* rows={2}: 2行分の高さを確保 */}
        {/* value: フォームデータから商品名を取得 */}
        {/* onChange: 入力内容をリアルタイムでフォーム状態に反映 */}
        <Textarea
          id={`${fieldPrefix}name`}
          required
          rows={2}
          value={formData.name}
          onChange={(e) =>
            // スプレッド演算子で既存データを保持し、name だけを更新
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      </div>

      {/* 商品説明フィールド */}
      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}description`}>
          商品説明 <span className="text-red-500">*</span>
        </Label>
        {/* Textarea を使用: 複数行の説明文を入力 */}
        {/* rows={6}: 6行分の高さを確保（商品説明は詳細に記述） */}
        <Textarea
          id={`${fieldPrefix}description`}
          required
          rows={6}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      {/* カテゴリーフィールド */}
      <div className="space-y-2">
        <Label htmlFor={`${fieldPrefix}categoryId`}>
          カテゴリー <span className="text-red-500">*</span>
        </Label>
        {/* shadcn/ui の Select コンポーネント */}
        {/* value: 選択されたカテゴリーID（文字列形式） */}
        {/* onValueChange: カテゴリー選択時にフォーム状態を更新 */}
        {/* required: HTML5 バリデーション（未選択の場合エラー） */}
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            // カテゴリーIDを文字列形式でフォーム状態に保存
            // 理由: Select コンポーネントは文字列を扱う
            setFormData((prev) => ({ ...prev, categoryId: value }))
          }
          required
        >
          {/* SelectTrigger: ドロップダウンを開くボタン */}
          {/* SelectValue: 選択された値の表示（未選択時は placeholder） */}
          <SelectTrigger id={`${fieldPrefix}categoryId`}>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>

          {/* SelectContent: ドロップダウンの選択肢 */}
          <SelectContent>
            {/* categories 配列をループして、各カテゴリーを選択肢として表示 */}
            {/* key: React のリスト要素に必須（カテゴリーIDを使用） */}
            {/* value: 選択時に onValueChange に渡される値（文字列形式） */}
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
