import { ReactNode } from "react";

interface ProductFormFooterProps {
  submitting: boolean;
  uploading: boolean;
  compressing: boolean;
  onClose?: () => void;
  submitLabel: string;
  uploadingLabel: string;
  submittingLabel: string;
  formId: string;
}

/**
 * 商品フォームのフッターコンポーネント
 *
 * 商品作成・編集フォームで使用する共通のフッターUIを提供します。
 */
export default function ProductFormFooter({
  submitting,
  uploading,
  compressing,
  onClose,
  submitLabel,
  uploadingLabel,
  submittingLabel,
  formId,
}: ProductFormFooterProps): ReactNode {
  return (
    <div className="flex gap-2 pt-4">
      <button
        type="button"
        onClick={onClose}
        disabled={submitting || uploading || compressing}
        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
      >
        キャンセル
      </button>
      <button
        type="submit"
        form={formId}
        disabled={submitting || uploading || compressing}
        className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading
          ? uploadingLabel
          : submitting
          ? submittingLabel
          : submitLabel}
      </button>
    </div>
  );
}
