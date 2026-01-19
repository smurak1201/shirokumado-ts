"use client";

import { useProductForm } from "../hooks/useProductForm";
import ProductFormFields from "./ProductFormFields";
import ProductFormModal from "./ProductFormModal";
import ProductFormFooter from "./ProductFormFooter";
import {
  handleProductCreateSubmit,
  resetProductFormData,
} from "../utils/productFormHandlers";
import type { Category } from "../types";

interface DashboardFormProps {
  categories: Category[];
  onProductCreated?: () => Promise<void>;
  onClose?: () => void;
  isOpen: boolean;
}

/**
 * 新規商品登録フォームコンポーネント
 *
 * モーダル形式で新規商品を登録するためのフォームを表示します。
 * 画像の圧縮・アップロード、公開日・終了日の設定、公開状態の自動判定などの機能を提供します。
 */
export default function DashboardForm({
  categories,
  onProductCreated,
  onClose,
  isOpen,
}: DashboardFormProps) {

  const {
    formData,
    setFormData,
    submitting,
    setSubmitting,
    uploading,
    compressing,
    imagePreview,
    handleImageChange,
    uploadImage,
    hasDateRangeValue,
  } = useProductForm();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await handleProductCreateSubmit({
      formData,
      uploadImage,
      imagePreview,
      setSubmitting,
      setFormData,
      resetProductFormData,
      onProductCreated,
      onClose,
    });
  };

  return (
    <ProductFormModal
      title="新規商品登録"
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      footer={
        <ProductFormFooter
          submitting={submitting}
          uploading={uploading}
          compressing={compressing}
          onClose={onClose}
          submitLabel="商品を登録"
          uploadingLabel="画像をアップロード中..."
          submittingLabel="登録中..."
          formId="product-form"
        />
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4 min-w-0">
        <ProductFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          submitting={submitting}
          uploading={uploading}
          compressing={compressing}
          imagePreview={imagePreview}
          onImageChange={(e) => handleImageChange(e)}
          hasDateRangeValue={hasDateRangeValue}
        />
      </form>
    </ProductFormModal>
  );
}
