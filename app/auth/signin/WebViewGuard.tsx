'use client';

import { useState, useSyncExternalStore, type ReactNode } from 'react';

// LINE、Instagram、Facebook等のアプリ内ブラウザを検出する
// これらのWebViewではGoogleがOAuth認証をブロックするため、外部ブラウザへの誘導が必要
function isInAppBrowser(ua: string): boolean {
  return /Line|FBAN|FBAV|Instagram|Twitter|MicroMessenger/i.test(ua);
}

// useSyncExternalStoreでSSR時はfalse、クライアントではnavigator.userAgentを参照する
const subscribe = (): (() => void) => () => {};
function getSnapshot(): boolean {
  return isInAppBrowser(navigator.userAgent);
}
function getServerSnapshot(): boolean {
  return false;
}

export function WebViewGuard({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const isWebView = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [copied, setCopied] = useState(false);

  if (!isWebView) {
    return children;
  }

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
        <svg
          className="h-7 w-7 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div>
        <h2 className="mb-2 text-lg font-bold text-gray-900">
          外部ブラウザで開いてください
        </h2>
        <p className="text-sm leading-relaxed text-gray-600">
          アプリ内ブラウザではGoogleログインが利用できません。
          <br />
          Safari や Chrome などの外部ブラウザで開き直してください。
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 font-normal text-gray-700 shadow-md transition-all hover:border-blue-300 hover:shadow-lg active:scale-95 cursor-pointer"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        {copied ? 'コピーしました!' : 'URLをコピー'}
      </button>
    </div>
  );
}
