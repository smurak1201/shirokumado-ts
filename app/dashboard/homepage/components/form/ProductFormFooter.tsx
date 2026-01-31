import { ReactNode } from "react";
import { Button } from "@/app/components/ui/button";

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
      <Button
        type="button"
        onClick={onClose}
        disabled={submitting || uploading || compressing}
        variant="outline"
        className="flex-1"
      >
        キャンセル
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={submitting || uploading || compressing}
        className="flex-1"
      >
        {uploading
          ? uploadingLabel
          : submitting
          ? submittingLabel
          : submitLabel}
      </Button>
    </div>
  );
}
