/**
 * localStorage永続化フック
 *
 * Next.js hydrationエラー防止のため、初期状態はdefaultValueを使用し、
 * マウント後にlocalStorageから読み込む。
 */
import { useState, useEffect, useCallback } from "react";

interface UseLocalStorageStateOptions {
  /** localStorageの値が有効かどうかを検証する関数 */
  validate?: (value: string) => boolean;
}

export function useLocalStorageState<T extends string>(
  key: string,
  defaultValue: T,
  options?: UseLocalStorageStateOptions
): [T, (value: T) => void] {
  const validate = options?.validate;
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      if (validate && !validate(saved)) {
        return;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration対応のための初期化処理
      setValue(saved as T);
    }
  }, [key, validate]);

  const handleSetValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      localStorage.setItem(key, newValue);
    },
    [key]
  );

  return [value, handleSetValue];
}
