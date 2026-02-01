/**
 * @fileoverview 商品フォームフッターコンポーネント - 送信とキャンセルボタン
 *
 * ## 目的
 * - 商品作成・編集フォームの送信ボタンとキャンセルボタンを提供
 * - 処理状態に応じたボタンの無効化とローディング表示
 * - フォーム要素との紐付け（form属性）
 *
 * ## 主な機能
 * - キャンセルボタン（モーダルを閉じる）
 * - 送信ボタン（フォームを送信）
 * - ローディング状態の表示（圧縮中、アップロード中、送信中）
 * - 処理中のボタン無効化
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductForm.tsx
 * - ProductFormModal の footer プロパティに配置
 *
 * ## 実装の特性
 * - **Client Component**: 親コンポーネントが "use client" を使用
 * - **form属性**: form要素の外側に配置されていても送信可能
 * - **条件付きラベル**: 処理状態に応じてボタンのラベルを切り替え
 *
 * ## form属性の利点
 * - ボタンが form 要素の外側に配置されていても、form属性で紐付け可能
 * - 理由: モーダルのフッターに配置する場合、form要素の外側になる
 * - トレードオフ: form属性の指定が必要だが、レイアウトの柔軟性が向上
 *
 * ## ボタンの無効化条件
 * - submitting || uploading || compressing
 * - いずれかが true の場合、ボタンを無効化
 * - 理由: 処理中に複数回クリックされるのを防ぐ（二重送信防止）
 */

import { ReactNode } from "react";
import { Button } from "@/app/components/ui/button";

/**
 * 商品フォームフッターのprops型定義
 *
 * @property submitting - 送信中フラグ（true: API送信中）
 * @property uploading - 画像アップロード中フラグ（true: アップロード中）
 * @property compressing - 画像圧縮中フラグ（true: 圧縮中）
 * @property onClose - キャンセルボタンのコールバック（モーダルを閉じる）。オプション
 * @property submitLabel - 送信ボタンの通常時のラベル（例: "商品を登録"、"更新"）
 * @property uploadingLabel - 画像アップロード中のラベル（例: "画像をアップロード中..."）
 * @property submittingLabel - 送信中のラベル（例: "登録中..."、"更新中..."）
 * @property formId - 送信対象のform要素のid属性（form属性で紐付ける）
 */
interface ProductFormFooterProps {
  submitting: boolean;
  uploading: boolean;
  compressing: boolean;
  onClose?: () => void;
  submitLabel: string;
  uploadingLabel: string;
  submittingLabel: string;
  formId: string;
}

/**
 * 商品フォームのフッターコンポーネント
 *
 * 商品作成・編集フォームで使用する共通のフッターUIを提供します。
 * キャンセルボタンと送信ボタンを配置し、処理状態に応じてラベルを切り替えます。
 *
 * @param props - ProductFormFooterProps型のプロップス
 * @returns フッターのJSX要素
 *
 * ## フッターの構成
 * - キャンセルボタン: モーダルを閉じる
 * - 送信ボタン: フォームを送信
 *
 * ## 送信ボタンのラベル優先順位
 * 1. uploading が true: uploadingLabel（"画像をアップロード中..."）
 * 2. submitting が true: submittingLabel（"登録中..."、"更新中..."）
 * 3. いずれも false: submitLabel（"商品を登録"、"更新"）
 *
 * ## form属性の使用
 * - form={formId}: form要素の外側に配置されていても送信可能
 * - 理由: モーダルのフッターに配置する場合、form要素の外側になる
 *
 * ## なぜ ReactNode を返すのか
 * - 型定義で明示的に ReactNode を指定
 * - 理由: ProductFormModal の footer プロパティが ReactNode を期待
 */
export default function ProductFormFooter({
  submitting,
  uploading,
  compressing,
  onClose,
  submitLabel,
  uploadingLabel,
  submittingLabel,
  formId,
}: ProductFormFooterProps): ReactNode {
  return (
    // フッターのコンテナ
    // flex gap-2: ボタンを横並びで配置、間にスペース
    // pt-4: 上部にパディング（フォーム本体とフッターの間にスペース）
    <div className="flex gap-2 pt-4">
      {/* キャンセルボタン */}
      {/* type="button": フォーム送信を防ぐ（type="submit" ではない） */}
      {/* onClick: onClose を呼び出してモーダルを閉じる */}
      {/* disabled: 処理中はキャンセルできない */}
      {/*   - 理由: 処理中にモーダルを閉じると、状態が不整合になる可能性 */}
      {/* variant="outline": 枠線のみのボタンスタイル */}
      {/* className="flex-1": 利用可能なスペースを最大限使用（送信ボタンと同じ幅） */}
      <Button
        type="button"
        onClick={onClose}
        disabled={submitting || uploading || compressing}
        variant="outline"
        className="flex-1"
      >
        キャンセル
      </Button>

      {/* 送信ボタン */}
      {/* type="submit": フォームを送信（form属性で紐付けたform要素を送信） */}
      {/* form={formId}: form要素の外側に配置されていても送信可能 */}
      {/*   - 理由: モーダルのフッターに配置する場合、form要素の外側になる */}
      {/* disabled: 処理中は送信できない（二重送信防止） */}
      {/* className="flex-1": キャンセルボタンと同じ幅 */}
      <Button
        type="submit"
        form={formId}
        disabled={submitting || uploading || compressing}
        className="flex-1"
      >
        {/* ラベルの優先順位 */}
        {/* 1. uploading: 画像をアップロード中... */}
        {/* 2. submitting: 登録中...、更新中... */}
        {/* 3. デフォルト: 商品を登録、更新 */}
        {uploading
          ? uploadingLabel
          : submitting
          ? submittingLabel
          : submitLabel}
      </Button>
    </div>
  );
}
