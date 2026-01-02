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

export default function DashboardFormWrapper({
  categories,
  onProductCreated,
  isFormOpen: externalIsFormOpen,
  onFormOpenChange,
}: DashboardFormWrapperProps) {
  const [internalIsFormOpen, setInternalIsFormOpen] = useState(false);

  // 外部から制御される場合はそれを使用、そうでない場合は内部状態を使用
  const isFormOpen =
    externalIsFormOpen !== undefined ? externalIsFormOpen : internalIsFormOpen;
  const setIsFormOpen = onFormOpenChange || setInternalIsFormOpen;

  const handleProductCreated = async () => {
    // 親コンポーネントに通知（一覧の更新を待つ）
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
