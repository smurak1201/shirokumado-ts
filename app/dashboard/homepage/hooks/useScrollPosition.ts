/**
 * スクロール位置監視フック
 *
 * 横スクロールコンテナの左右端を監視し、グラデーション表示を制御する。
 */
import { useState, useEffect, useRef, useCallback } from "react";

export function useScrollPosition() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowLeftGradient(scrollLeft > 0);
    // -1 はブラウザの丸め誤差を考慮
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();

    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  return {
    scrollContainerRef,
    showLeftGradient,
    showRightGradient,
    checkScrollPosition,
  };
}
