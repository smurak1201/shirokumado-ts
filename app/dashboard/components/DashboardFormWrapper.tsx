"use client";

import { useRouter } from "next/navigation";
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
}

export default function DashboardFormWrapper({
  categories,
  tags,
}: DashboardFormWrapperProps) {
  const router = useRouter();

  const handleProductCreated = () => {
    // ページをリフレッシュして最新のデータを取得
    router.refresh();
  };

  return (
    <DashboardForm
      categories={categories}
      tags={tags}
      onProductCreated={handleProductCreated}
    />
  );
}
