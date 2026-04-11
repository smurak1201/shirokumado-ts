"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TabsList } from "@/app/components/ui/tabs";

/** 横スクロール可能なTabsListに左右フェードを付与 */
export default function ScrollableTabsList({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  return (
    <div className="relative">
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-linear-to-r from-white to-transparent" />
      )}
      <TabsList
        ref={ref}
        className="w-full justify-start overflow-x-auto sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </TabsList>
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-linear-to-l from-white to-transparent" />
      )}
    </div>
  );
}
