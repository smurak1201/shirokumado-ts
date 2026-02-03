"use client";

/**
 * ホームページラッパー
 *
 * 初回表示時に1秒間ローディング画面を表示してからコンテンツを表示する。
 * SafariのストリーミングSSR問題を回避するため、クライアント側でローディングを制御。
 */
import { useState, useEffect, type ReactNode } from "react";
import LoadingScreen from "@/app/components/LoadingScreen";

// ローディング画面の表示時間（ms）
const LOADING_DURATION_MS = 1000;

interface HomePageWrapperProps {
  children: ReactNode;
}

export default function HomePageWrapper({ children }: HomePageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
