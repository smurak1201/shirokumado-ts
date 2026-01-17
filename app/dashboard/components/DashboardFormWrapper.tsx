"use client";

import { useState } from "react";
import DashboardForm from "./DashboardForm";
import type { Category } from "../types";

interface DashboardFormWrapperProps {
  categories: Category[];
  onProductCreated?: () => Promise<void>;
  isFormOpen?: boolean;
  onFormOpenChange?: (isOpen: boolean) => void;
}

/**
 * ダッシュボードフォームのラッパーコンポーネント
 *
 * フォームの開閉状態を内部または外部から制御できるようにします。
 * 外部から `isFormOpen` と `onFormOpenChange` が渡された場合は外部制御、
 * 渡されなかった場合は内部状態で制御します（制御コンポーネント/非制御コンポーネントのパターン）。
 */
export default function DashboardFormWrapper({
  categories,
  onProductCreated,
  isFormOpen: externalIsFormOpen,
  onFormOpenChange,
}: DashboardFormWrapperProps) {
  const [internalIsFormOpen, setInternalIsFormOpen] = useState(false);

  const isFormOpen =
    externalIsFormOpen !== undefined ? externalIsFormOpen : internalIsFormOpen;
  const setIsFormOpen = onFormOpenChange || setInternalIsFormOpen;

  const handleProductCreated = async () => {
    if (onProductCreated) {
      await onProductCreated();
    }
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
