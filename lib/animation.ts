/**
 * スクロールアニメーション用のクラス名を生成
 *
 * animate-on-scroll + stagger-delay-N + is-visible の組み合わせを統一
 */
export function scrollAnimationClass(
  isInView: boolean,
  staggerIndex?: number
): string {
  const base = "animate-on-scroll";
  const stagger =
    staggerIndex !== undefined
      ? ` stagger-delay-${Math.min(staggerIndex + 1, 8)}`
      : "";
  const visible = isInView ? " is-visible" : "";
  return `${base}${stagger}${visible}`;
}
