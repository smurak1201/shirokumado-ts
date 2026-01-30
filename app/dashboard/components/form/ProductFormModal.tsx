"use client";

import { ReactNode } from "react";
import { Button } from "@/app/components/ui/button";

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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm overflow-x-hidden"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-full sm:max-w-2xl overflow-y-auto overflow-x-hidden rounded-lg bg-white p-4 sm:p-6 shadow-lg mx-2 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            aria-label="閉じる"
          >
            ✕
          </Button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}
