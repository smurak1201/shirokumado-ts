import type { ProductFormData } from "../hooks/useProductForm";
import { prepareProductSubmitData, handleProductSubmitError } from "./productFormSubmit";

interface HandleProductCreateSubmitParams {
  formData: ProductFormData;
  uploadImage: () => Promise<string | null>;
  imagePreview: string | null;
  setSubmitting: (value: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  resetProductFormData: () => ProductFormData;
  onProductCreated?: () => Promise<void>;
  onClose?: () => void;
}

/**
 * 商品作成フォームの送信処理
 */
export async function handleProductCreateSubmit({
  formData,
  uploadImage,
  imagePreview,
  setSubmitting,
  setFormData,
  resetProductFormData,
  onProductCreated,
  onClose,
}: HandleProductCreateSubmitParams): Promise<void> {
  setSubmitting(true);

  try {
    const imageUrl = await uploadImage();

    const submitData = prepareProductSubmitData(formData, imageUrl);
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "登録に失敗しました");
    }

    await response.json();

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData(resetProductFormData());

    if (onProductCreated) {
      await onProductCreated();
    }

    if (onClose) {
      onClose();
    }
  } catch (error) {
    console.error("登録エラー:", error);
    alert(handleProductSubmitError(error));
  } finally {
    setSubmitting(false);
  }
}
