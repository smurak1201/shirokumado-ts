/**
 * @fileoverview 商品フォームモーダルコンポーネント - ダイアログUIの枠組み
 *
 * ## 目的
 * - 商品作成・編集フォームで使用する共通のモーダルUI
 * - shadcn/ui の Dialog コンポーネントをラップしてレイアウトを統一
 * - レスポンシブ対応とスクロール制御
 *
 * ## 主な機能
 * - モーダルダイアログの表示/非表示制御
 * - タイトル、フォーム本体、フッターの配置
 * - レスポンシブなサイズ設定（モバイル/デスクトップ）
 * - 縦スクロール対応（フォームが長い場合）
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/form/ProductForm.tsx
 * - 商品作成・編集フォームのモーダル表示
 *
 * ## 実装の特性
 * - **Client Component**: "use client" ディレクティブ使用
 * - **shadcn/ui ベース**: Dialog コンポーネントをカスタマイズ
 * - **レスポンシブデザイン**: モバイルファーストのサイズ設定
 *
 * ## レイアウト構成
 * - DialogHeader: タイトル表示
 * - children: フォーム本体（ProductFormFields を配置）
 * - DialogFooter: 送信ボタンとキャンセルボタン（ProductFormFooter を配置）
 *
 * ## なぜ独立したコンポーネントにしたのか
 * - **再利用性**: 作成と編集で同じモーダルレイアウトを使用
 * - **保守性**: モーダルのスタイルを一箇所で管理
 * - **関心の分離**: フォームロジックとUI表示を分離
 */

"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";

/**
 * 商品フォームモーダルのprops型定義
 *
 * @property title - モーダルのタイトル（例: 「商品を編集」「新規商品登録」）
 * @property isOpen - モーダルの開閉状態（true: 表示、false: 非表示）
 * @property onClose - モーダルを閉じるコールバック（オプション）
 * @property children - モーダル本体に表示する内容（通常はフォーム要素）
 * @property footer - モーダルフッターに表示する内容（通常は送信ボタン）
 */
interface ProductFormModalProps {
  title: string;
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * 商品フォームモーダルコンポーネント
 *
 * 商品作成・編集フォームで使用する共通のモーダルUIを提供します。
 * shadcn/ui の Dialog コンポーネントをベースに、レスポンシブ対応と
 * スクロール制御を追加しています。
 *
 * @param props - ProductFormModalProps型のプロップス
 * @returns モーダルダイアログのJSX要素
 *
 * ## レスポンシブ設計
 * - **モバイル**: w-[calc(100%-1rem)]（画面幅 - 1rem の余白）、padding: 1rem
 * - **デスクトップ**: w-[calc(100%-2rem)]（画面幅 - 2rem の余白）、padding: 1.5rem、max-width: 2xl
 * - 理由: 小さな画面でも適切な余白を確保し、大きな画面では最大幅を制限
 *
 * ## スクロール制御
 * - max-h-[90vh]: 最大高さを画面の90%に制限
 * - overflow-y-auto: 縦方向のスクロールを有効化
 * - overflow-x-hidden: 横方向のスクロールを無効化
 * - 理由: フォームが長い場合でも、画面内に収まるようにスクロール可能にする
 *
 * ## onOpenAutoFocus の preventDefault
 * - e.preventDefault(): モーダル表示時の自動フォーカスを無効化
 * - 理由: フォームの最初のフィールドに自動フォーカスが移るのを防ぐ
 * - トレードオフ: アクセシビリティは若干低下するが、UX的には自然な動作
 */
export default function ProductFormModal({
  title,
  isOpen,
  onClose,
  children,
  footer,
}: ProductFormModalProps) {
  return (
    // shadcn/ui の Dialog コンポーネント
    // open: モーダルの開閉状態を制御
    // onOpenChange: モーダルの開閉時のコールバック
    //   - open が false（閉じる動作）の場合のみ onClose を呼び出す
    //   - 理由: モーダルを開く処理は親コンポーネントで管理するため
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      {/* モーダルの本体 */}
      {/* レスポンシブ対応: モバイルとデスクトップでサイズとpaddingを変更 */}
      {/* max-h-[90vh]: 画面高さの90%を超えないように制限 */}
      {/* overflow-y-auto: 縦スクロールを有効化（フォームが長い場合） */}
      {/* overflow-x-hidden: 横スクロールを無効化 */}
      <DialogContent
        className="max-h-[90vh] w-[calc(100%-1rem)] max-w-2xl overflow-x-hidden overflow-y-auto p-4 sm:w-[calc(100%-2rem)] sm:p-6"
        // モーダル表示時の自動フォーカスを防ぐ
        // 理由: フォームの最初のフィールドに自動フォーカスが移るのを防ぐ
        // トレードオフ: アクセシビリティは若干低下するが、UX的には自然な動作
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* モーダルヘッダー: タイトル表示 */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* モーダル本体: フォームフィールドを表示 */}
        {/* pr-4: 右側にpaddingを追加（スクロールバーとコンテンツの間に余白） */}
        {/* 理由: スクロールバーがコンテンツに重ならないようにするため */}
        <div className="pr-4">{children}</div>

        {/* モーダルフッター: 送信ボタンとキャンセルボタン */}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
