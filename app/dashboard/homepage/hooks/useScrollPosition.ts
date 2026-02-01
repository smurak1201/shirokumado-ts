/**
 * @fileoverview スクロール位置監視カスタムフック - グラデーション表示制御
 *
 * ## 目的
 * - 横スクロール可能なコンテナのスクロール位置を監視
 * - 左右の端にグラデーションを表示してスクロール可能性を示す
 * - ユーザーに「まだコンテンツがある」ことを視覚的に伝える
 *
 * ## 主な機能
 * - スクロール位置の監視（scroll イベント）
 * - ウィンドウリサイズ時の再計算（resize イベント）
 * - 左端/右端の判定
 *
 * ## 使用場所
 * - app/dashboard/homepage/components/list/ProductListTabs.tsx
 * - カテゴリータブの横スクロールグラデーション表示
 *
 * ## 実装の特性
 * - **Client Component専用**: DOM操作とイベントリスナーを使用
 * - **パフォーマンス最適化**: useCallbackでイベントハンドラーをメモ化
 * - **メモリリーク防止**: useEffectのクリーンアップでイベントリスナー解除
 *
 * ## UI/UXの理由
 * - **グラデーション**: スクロール可能性を視覚的に示す
 * - **スクロール範囲外**: グラデーションを非表示にして視覚的なノイズを軽減
 * - **レスポンシブ**: ウィンドウサイズ変更にも対応
 */

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * スクロール位置を監視するカスタムフック
 *
 * 横スクロール可能なコンテナの左右のスクロール位置を監視し、
 * グラデーション表示の制御に使用します。
 *
 * @returns スクロールコンテナのref、グラデーション表示フラグ、位置チェック関数
 *
 * ## グラデーション表示の条件
 * - **左グラデーション**: scrollLeft > 0（左にスクロール可能）
 * - **右グラデーション**: scrollLeft < scrollWidth - clientWidth（右にスクロール可能）
 *
 * ## 使用例
 * ```tsx
 * const { scrollContainerRef, showLeftGradient, showRightGradient } = useScrollPosition();
 * <div ref={scrollContainerRef}>
 *   {showLeftGradient && <div className="gradient-left" />}
 *   {// コンテンツ}
 *   {showRightGradient && <div className="gradient-right" />}
 * </div>
 * ```
 *
 * ## パフォーマンス最適化
 * - useCallbackでcheckScrollPositionをメモ化（再レンダリング時の関数再生成を防止）
 * - イベントリスナーは必要最小限（scroll, resize のみ）
 * - クリーンアップで確実にリスナーを解除（メモリリーク防止）
 */
export function useScrollPosition() {
  // スクロールコンテナへの参照
  // DOMノードにアクセスしてスクロール位置を計算するために使用
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 左側のグラデーション表示フラグ
  // true: 左にスクロール可能（左側にまだコンテンツがある）
  const [showLeftGradient, setShowLeftGradient] = useState(false);

  // 右側のグラデーション表示フラグ
  // true: 右にスクロール可能（右側にまだコンテンツがある）
  const [showRightGradient, setShowRightGradient] = useState(false);

  /**
   * スクロール位置をチェックしてグラデーション表示を更新する関数
   *
   * スクロールコンテナの現在位置を確認し、
   * 左右のグラデーション表示フラグを更新します。
   *
   * ## 計算ロジック
   * - scrollLeft: 左端からのスクロール距離（px）
   * - scrollWidth: コンテンツの全幅（px）
   * - clientWidth: 表示領域の幅（px）
   * - scrollLeft > 0: 左にスクロール済み → 左グラデーション表示
   * - scrollLeft < scrollWidth - clientWidth: 右にまだスクロール可能 → 右グラデーション表示
   *
   * ## -1のマージン
   * - scrollLeft < scrollWidth - clientWidth - 1
   * - ブラウザの丸め誤差を考慮（ピクセル未満の誤差で判定が変わるのを防ぐ）
   *
   * ## useCallbackの理由
   * - イベントリスナーに渡す関数なので、メモ化して同一参照を保つ
   * - 依存配列が空なので、関数は一度だけ生成される
   * - useEffectの依存配列に含めても再実行されない
   */
  const checkScrollPosition = useCallback(() => {
    // refがまだ割り当てられていない場合は何もしない
    if (!scrollContainerRef.current) return;

    // スクロール情報を取得
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // 左グラデーション: scrollLeft > 0 なら表示
    setShowLeftGradient(scrollLeft > 0);

    // 右グラデーション: まだ右にスクロール可能なら表示
    // -1 はブラウザの丸め誤差を考慮したマージン
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  /**
   * イベントリスナーの登録とクリーンアップ
   *
   * ## 登録するイベント
   * - scroll: スクロール時にグラデーション表示を更新
   * - resize: ウィンドウサイズ変更時にグラデーション表示を再計算
   *
   * ## 初期チェック
   * - マウント時に checkScrollPosition を呼び出して初期状態を設定
   * - 初期状態でスクロールが必要かどうかを判定
   *
   * ## クリーンアップの理由
   * - コンポーネントがアンマウントされる際にイベントリスナーを解除
   * - メモリリークを防ぐため（リスナーが残り続けるとメモリ消費）
   * - 不要なイベント処理を防ぐ
   *
   * ## 依存配列
   * - [checkScrollPosition]: checkScrollPositionが変更されたら再実行
   * - useCallbackでメモ化されているため、実質的には初回のみ実行
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    // refがまだ割り当てられていない場合は何もしない
    if (!container) return;

    // 初期状態のチェック（マウント時）
    checkScrollPosition();

    // イベントリスナーの登録
    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    // クリーンアップ関数: アンマウント時にイベントリスナーを解除
    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  return {
    scrollContainerRef, // スクロールコンテナに割り当てるref
    showLeftGradient, // 左グラデーション表示フラグ
    showRightGradient, // 右グラデーション表示フラグ
    checkScrollPosition, // 手動で位置チェックを実行する関数（必要に応じて使用）
  };
}
