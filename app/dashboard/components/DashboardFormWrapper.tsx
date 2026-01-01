"use client";

import { useState } from "react";
import DashboardForm from "./DashboardForm";

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface DashboardFormWrapperProps {
  categories: Category[];
  tags: Tag[];
  onProductCreated?: () => Promise<void>;
}

export default function DashboardFormWrapper({
  categories,
  tags,
  onProductCreated,
}: DashboardFormWrapperProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleProductCreated = async () => {
    // 親コンポーネントに通知（一覧の更新を待つ）
    if (onProductCreated) {
      await onProductCreated();
    }
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="mb-8 flex justify-end">
        <button
          onClick={() => setIsFormOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          新規商品登録
        </button>
      </div>
      <DashboardForm
        categories={categories}
        tags={tags}
        onProductCreated={handleProductCreated}
        onClose={() => setIsFormOpen(false)}
        isOpen={isFormOpen}
      />
    </>
  );
}
