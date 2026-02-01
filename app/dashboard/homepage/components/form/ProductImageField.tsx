/**
 * @fileoverview 商品フォーム画像フィールドコンポーネント - 画像選択とプレビュー
 *
 * ## 目的
 * - 商品画像のファイル選択フィールドを提供
 * - 選択した画像のプレビュー表示
 * - 圧縮・アップロード中のローディング表示
 *
 * ## 主な機能
 * - ファイル選択（accept="image/*" で画像のみ）
 * - プレビュー表示（Next.js の Image コンポーネント）
 * - ローディング状態の表示（圧縮中、アップロード中）
 * - フィールド無効化（処理中は選択不可）
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductFormFields.tsx
 * - 商品作成・編集フォームの画像セクション
 *
 * ## 実装の特性
 * - **Client Component**: 親コンポーネントが "use client" を使用
 * - **Next.js Image**: next/image の Image コンポーネントで最適化
 * - **ローディングフィードバック**: 処理状態をユーザーに通知
 *
 * ## 画像処理の流れ
 * 1. ユーザーが画像を選択（Input file）
 * 2. onImageChange: 圧縮処理を実行（compressing: true）
 * 3. 圧縮完了: プレビューURLを生成（imagePreview）
 * 4. フォーム送信時: uploadImage でアップロード（uploading: true）
 * 5. アップロード完了: API送信（submitting: true）
 *
 * ## なぜ unoptimized を使うのか
 * - imagePreview は Object URL（blob:http://...）
 * - Next.js の画像最適化は外部URLに対応していない
 * - 理由: Object URLをそのまま表示するため unoptimized: true
 *
 * ## カスタムファイル選択ボタンのスタイル
 * - file:mr-4, file:rounded-md など: file:擬似要素でボタンをスタイリング
 * - 理由: デフォルトのファイル選択ボタンはブラウザによってデザインが異なる
 * - file:cursor-pointer: ボタンにカーソルを合わせるとポインターに変更
 */

import Image from "next/image";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";

/**
 * 商品画像フィールドのprops型定義
 *
 * @property fieldPrefix - input要素のid属性プレフィックス（id重複防止）。オプション、デフォルト: ""
 * @property submitting - 送信中フラグ（true: API送信中、フィールド無効化用）
 * @property uploading - 画像アップロード中フラグ（true: アップロード中）
 * @property compressing - 画像圧縮中フラグ（true: 圧縮中）
 * @property imagePreview - 画像プレビューURL（Object URL または HTTP URL）
 * @property onImageChange - 画像選択時の処理（圧縮とプレビュー生成）
 */
interface ProductImageFieldProps {
  fieldPrefix?: string;
  submitting: boolean;
  uploading: boolean;
  compressing: boolean;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 商品フォームの画像フィールドコンポーネント
 *
 * 商品画像のアップロードとプレビュー機能を提供します。
 * 画像選択後、自動的に圧縮処理を実行し、プレビューを表示します。
 *
 * @param props - ProductImageFieldProps型のプロップス
 * @returns 画像フィールドのJSX要素
 *
 * ## フィールドの構成
 * 1. ファイル選択input（accept="image/*"）
 * 2. ローディングメッセージ（圧縮中、アップロード中）
 * 3. プレビュー画像（選択後のみ表示）
 *
 * ## disabled の条件
 * - submitting || uploading || compressing
 * - いずれかが true の場合、ファイル選択を無効化
 * - 理由: 処理中に別の画像を選択すると、状態が不整合になる可能性
 *
 * ## プレビュー画像のサイズ
 * - relative h-32 w-32: 高さと幅を 32 * 0.25rem = 8rem（128px）に設定
 * - fill: 親要素のサイズに合わせて画像を表示
 * - object-cover: アスペクト比を保ちつつ、領域を埋める
 * - 理由: 画像のアスペクト比が異なっても、正方形でプレビュー表示
 */
export default function ProductImageField({
  fieldPrefix = "",
  submitting,
  uploading,
  compressing,
  imagePreview,
  onImageChange,
}: ProductImageFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${fieldPrefix}image`}>商品画像</Label>

      {/* ファイル選択input */}
      {/* type="file": ファイル選択ダイアログを表示 */}
      {/* accept="image/*": 画像ファイルのみを選択可能 */}
      {/* onChange: onImageChange で圧縮処理を実行 */}
      {/* disabled: 処理中はファイル選択を無効化 */}
      {/* className: file:擬似要素でファイル選択ボタンをカスタマイズ */}
      {/*   - file:mr-4: ボタンとファイル名の間にスペース */}
      {/*   - file:rounded-md: ボタンを角丸に */}
      {/*   - file:bg-blue-50, hover:file:bg-blue-100: 背景色とホバー時の色 */}
      {/*   - file:cursor-pointer: ボタンにカーソルを合わせるとポインターに */}
      <Input
        type="file"
        id={`${fieldPrefix}image`}
        accept="image/*"
        onChange={onImageChange}
        disabled={submitting || uploading || compressing}
        className="h-auto py-2 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
      />

      {/* 圧縮中のローディングメッセージ */}
      {/* compressing が true の場合のみ表示 */}
      {compressing && (
        <p className="text-sm text-gray-500">画像を圧縮中...</p>
      )}

      {/* アップロード中・送信中のローディングメッセージ */}
      {/* uploading または submitting が true の場合のみ表示 */}
      {(uploading || submitting) && (
        <p className="text-sm text-gray-500">
          {/* uploading 優先: アップロード中は「画像をアップロード中...」、それ以外は「処理中...」 */}
          {uploading ? "画像をアップロード中..." : "処理中..."}
        </p>
      )}

      {/* プレビュー画像 */}
      {/* imagePreview が存在する場合のみ表示 */}
      {imagePreview && (
        <div>
          {/* プレビュー画像のコンテナ */}
          {/* relative: Next.js Image の fill プロパティを使用するために必要 */}
          {/* h-32 w-32: 高さと幅を 128px に設定（正方形） */}
          <div className="relative h-32 w-32">
            {/* Next.js Image コンポーネント */}
            {/* src: プレビューURL（Object URL または HTTP URL） */}
            {/* alt: 画像の説明（アクセシビリティ対応） */}
            {/* fill: 親要素のサイズに合わせて画像を表示 */}
            {/* className: rounded（角丸）、object-cover（アスペクト比を保ちつつ領域を埋める） */}
            {/* unoptimized: Next.js の画像最適化を無効化 */}
            {/*   - 理由: Object URL（blob:http://...）は最適化対象外 */}
            <Image
              src={imagePreview}
              alt="プレビュー"
              fill
              className="rounded object-cover"
              unoptimized
            />
          </div>
          {/* プレビューラベル */}
          <p className="mt-1 text-xs text-gray-500">プレビュー</p>
        </div>
      )}
    </div>
  );
}
