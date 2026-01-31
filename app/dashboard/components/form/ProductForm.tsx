"use client";

import { useProductForm } from "../../hooks/useProductForm";
import ProductFormFields from "./ProductFormFields";
import ProductFormModal from "./ProductFormModal";
import ProductFormFooter from "./ProductFormFooter";
import {
  handleProductCreateSubmit,
  handleProductUpdateSubmit,
} from "../../utils/productFormSubmit";
import { createInitialFormDataFromProduct } from "../../utils/productFormData";
import type { Category, Product } from "../../types";

interface ProductFormProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  mode: "create" | "edit";
  product?: Product;
}

/**
 * 商品フォームコンポーネント
 *
 * 商品の新規作成と編集の両方に対応するフォームを提供します。
 */
export default function ProductForm({
  categories,
  isOpen,
  onClose,
  onSuccess,
  mode,
  product,
}: ProductFormProps) {
  const isEditMode = mode === "edit" && product;

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
  } = useProductForm(
    isEditMode
      ? {
          initialImageUrl: product.imageUrl,
          initialFormData: createInitialFormDataFromProduct(product),
        }
      : {}
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (isEditMode) {
      await handleProductUpdateSubmit({
        productId: product.id,
        formData,
        uploadImage,
        imagePreview,
        originalImageUrl: product.imageUrl,
        setSubmitting,
        onUpdated: onSuccess,
        onClose,
      });
    } else {
      await handleProductCreateSubmit({
        formData,
        uploadImage,
        imagePreview,
        setSubmitting,
        setFormData,
        onProductCreated: onSuccess,
        onClose,
      });
    }
  };

  const title = isEditMode ? "商品を編集" : "新規商品登録";
  const formId = isEditMode ? "product-edit-form" : "product-form";
  const submitLabel = isEditMode ? "更新" : "商品を登録";
  const submittingLabel = isEditMode ? "更新中..." : "登録中...";
  const fieldPrefix = isEditMode ? "edit-" : "";

  return (
    <ProductFormModal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <ProductFormFooter
          submitting={submitting}
          uploading={uploading}
          compressing={compressing}
          onClose={onClose}
          submitLabel={submitLabel}
          uploadingLabel="画像をアップロード中..."
          submittingLabel={submittingLabel}
          formId={formId}
        />
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="min-w-0 space-y-4 pr-2">
        <ProductFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          submitting={submitting}
          uploading={uploading}
          compressing={compressing}
          imagePreview={imagePreview}
          onImageChange={(e) =>
            handleImageChange(e, isEditMode ? product.imageUrl : undefined)
          }
          hasDateRangeValue={hasDateRangeValue}
          fieldPrefix={fieldPrefix}
        />
      </form>
    </ProductFormModal>
  );
}
