import { useEffect, useRef } from "react";

/**
 * モーダルの開閉状態とESCキー処理を管理するカスタムフック
 *
 * モーダルが開いている時は背景のスクロールを無効化し、
 * ESCキーでモーダルを閉じることができます。
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
}
