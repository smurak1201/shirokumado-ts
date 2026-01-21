"use client";

import { useProductForm } from "../hooks/useProductForm";
import ProductFormFields from "./ProductFormFields";
import ProductFormModal from "./ProductFormModal";
import ProductFormFooter from "./ProductFormFooter";
import { handleProductUpdateSubmit } from "../utils/productFormSubmit";
import { createInitialFormDataFromProduct } from "../utils/productFormData";
import type { Category, Product } from "../types";

interface ProductEditFormProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

/**
 * 商品編集フォームコンポーネント
 *
 * モーダル形式で既存商品を編集するためのフォームを表示します。
 * 既存の商品情報を初期値として設定し、画像の更新時は古い画像を削除してから新しい画像をアップロードします。
 */
export default function ProductEditForm({
  product,
  categories,
  onClose,
  onUpdated,
}: ProductEditFormProps) {
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
  } = useProductForm({
    initialImageUrl: product.imageUrl,
    initialFormData: createInitialFormDataFromProduct(product),
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await handleProductUpdateSubmit({
      productId: product.id,
      formData,
      uploadImage,
      imagePreview,
      originalImageUrl: product.imageUrl,
      setSubmitting,
      onUpdated,
      onClose,
    });
  };

  return (
    <ProductFormModal
      title="商品を編集"
      isOpen={true}
      onClose={onClose}
      footer={
        <ProductFormFooter
          submitting={submitting}
          uploading={uploading}
          compressing={compressing}
          onClose={onClose}
          submitLabel="更新"
          uploadingLabel="画像をアップロード中..."
          submittingLabel="更新中..."
          formId="product-edit-form"
        />
      }
    >
      <form id="product-edit-form" onSubmit={handleSubmit} className="space-y-4 min-w-0">
        <ProductFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          submitting={submitting}
          uploading={uploading}
          compressing={compressing}
          imagePreview={imagePreview}
          onImageChange={(e) => handleImageChange(e, product.imageUrl)}
          hasDateRangeValue={hasDateRangeValue}
          fieldPrefix="edit-"
        />
      </form>
    </ProductFormModal>
  );
}
