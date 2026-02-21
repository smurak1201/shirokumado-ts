"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Intersection Observerでフッターが画面に近づいたときにiframeを読み込む
 * Google Maps Embed APIのJavaScript（約150KiB）の初期読み込みを回避する
 */
export default function LazyGoogleMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      {isVisible && (
        <iframe
          src="https://www.google.com/maps?q=かき氷 白熊堂&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="白熊堂の場所"
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      )}
    </div>
  );
}
