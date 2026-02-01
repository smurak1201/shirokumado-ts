/**
 * 商品フォームフッターコンポーネント
 *
 * 商品作成・編集フォームの送信ボタンとキャンセルボタンを提供。
 * 処理状態に応じたボタンの無効化とローディング表示。
 */

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
