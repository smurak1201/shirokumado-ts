/**
 * localStorage永続化フック
 *
 * Next.js hydrationエラー防止のため、初期状態はdefaultValueを使用し、
 * マウント後にlocalStorageから読み込む。
 */
import { useState, useEffect, useCallback } from "react";

interface UseLocalStorageStateOptions<T> {
  /** localStorageの値が有効かどうかを検証する関数 */
  validate?: (value: string) => boolean;
  /** localStorageから読み込んだ文字列をTに変換する関数（デフォルト: そのまま返す） */
  deserialize?: (value: string) => T;
}

export function useLocalStorageState<T extends string>(
  key: string,
  defaultValue: T,
  options?: UseLocalStorageStateOptions<T>
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      if (options?.validate && !options.validate(saved)) {
        return;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
      setValue(options?.deserialize ? options.deserialize(saved) : (saved as T));
    }
  }, [key, options?.validate, options?.deserialize]);

  const handleSetValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      localStorage.setItem(key, newValue);
    },
    [key]
  );

  return [value, handleSetValue];
}
