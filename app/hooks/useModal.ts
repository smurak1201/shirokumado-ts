import { useEffect } from "react";

/**
 * モーダルの開閉状態とESCキー処理を管理するカスタムフック
 *
 * モーダルが開いている時は背景のスクロールを無効化し、
 * ESCキーでモーダルを閉じることができます。
 *
 * @param isOpen - モーダルの開閉状態
 * @param onClose - モーダルを閉じるコールバック関数
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    /**
     * ESCキーでモーダルを閉じる処理
     */
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      // ESCキーのイベントリスナーを追加
      document.addEventListener("keydown", handleEscape);
      // モーダルが開いている時は背景のスクロールを無効化
      document.body.style.overflow = "hidden";
    }

    return () => {
      // クリーンアップ: イベントリスナーを削除し、スクロールを有効化
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
}
