import { useEffect, useRef } from "react";

/**
 * モーダルの開閉状態とESCキー処理を管理するカスタムフック
 *
 * モーダルが開いている時は背景のスクロールを無効化し、
 * ESCキーでモーダルを閉じることができます。
 *
 * Reactのベストプラクティスに従い、onCloseの参照をrefで保持することで、
 * 依存配列の変更による不要な再実行を防ぎます。
 *
 * @param isOpen - モーダルの開閉状態
 * @param onClose - モーダルを閉じるコールバック関数
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  // onCloseの最新の参照を保持するref
  // これにより、onCloseが変更されてもuseEffectを再実行せずに最新の関数を呼び出せる
  const onCloseRef = useRef(onClose);

  // onCloseが変更されたらrefを更新
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    /**
     * ESCキーでモーダルを閉じる処理
     */
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // refから最新のonCloseを呼び出す
        onCloseRef.current();
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
  }, [isOpen]); // onCloseを依存配列から削除（refで最新の値を保持しているため）
}
