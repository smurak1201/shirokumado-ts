"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";

interface ProductFormModalProps {
  title: string;
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * 商品フォームのモーダルコンポーネント
 *
 * 商品作成・編集フォームで使用する共通のモーダルUIを提供します。
 */
export default function ProductFormModal({
  title,
  isOpen,
  onClose,
  children,
  footer,
}: ProductFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent
        className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="pr-2">{children}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
