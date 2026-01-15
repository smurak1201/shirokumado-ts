"use client";

import { useState } from "react";
import DashboardForm from "./DashboardForm";
import type { Category } from "../types";

/**
 * DashboardFormWrapper の Props
 */
interface DashboardFormWrapperProps {
  categories: Category[]; // カテゴリー一覧
  onProductCreated?: () => Promise<void>; // 商品作成後のコールバック関数
  isFormOpen?: boolean; // フォームの開閉状態（外部制御用）
  onFormOpenChange?: (isOpen: boolean) => void; // フォームの開閉状態変更時のコールバック関数
}

/**
 * ダッシュボードフォームのラッパーコンポーネント
 * フォームの開閉状態を内部または外部から制御できるようにします
 *
 * このコンポーネントは、フォームの状態管理を柔軟に行うためのラッパーです。
 * 外部から `isFormOpen` と `onFormOpenChange` が渡された場合は外部制御、
 * 渡されなかった場合は内部状態で制御します（制御コンポーネント/非制御コンポーネントのパターン）。
 *
 * これにより、親コンポーネントからフォームの開閉を制御できる一方で、
 * 単独で使用する場合も内部状態で動作します。
 */
export default function DashboardFormWrapper({
  categories,
  onProductCreated,
  isFormOpen: externalIsFormOpen,
  onFormOpenChange,
}: DashboardFormWrapperProps) {
  // 内部状態でフォームの開閉を管理（外部制御がない場合に使用）
  const [internalIsFormOpen, setInternalIsFormOpen] = useState(false);

  // 外部から制御される場合はそれを使用、そうでない場合は内部状態を使用
  // これにより、制御コンポーネントと非制御コンポーネントの両方のパターンをサポートします
  const isFormOpen =
    externalIsFormOpen !== undefined ? externalIsFormOpen : internalIsFormOpen;
  const setIsFormOpen = onFormOpenChange || setInternalIsFormOpen;

  /**
   * 商品作成後のコールバック関数
   * 親コンポーネントに通知してからフォームを閉じます
   */
  const handleProductCreated = async () => {
    // 親コンポーネントに通知（一覧の更新を待つ）
    if (onProductCreated) {
      await onProductCreated();
    }
    // フォームを閉じる
    setIsFormOpen(false);
  };

  return (
    <DashboardForm
      categories={categories}
      onProductCreated={handleProductCreated}
      onClose={() => setIsFormOpen(false)}
      isOpen={isFormOpen}
    />
  );
}
